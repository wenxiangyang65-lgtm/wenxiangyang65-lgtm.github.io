import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('release', Path(__file__).parents[1] / 'deploy/release.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ReleaseIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        directory = str(self.root / 'current')
        class Handler(SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=directory, **kwargs)
            def log_message(self, *_):
                pass
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.manager = module.Releases(dict(root=str(self.root),
            local_url=f'http://127.0.0.1:{self.server.server_port}', server_name='portfolio.test', retain=3))

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temp.cleanup()

    def upload(self, name, commit='a' * 40):
        self.manager.prepare(name)
        directory = self.manager.path(name, True)
        entries = {'index.html': name, 'projects/example/index.html': 'Example',
                   'deployment-health.json': json.dumps(dict(status='ok', commit=commit))}
        for entry, text in entries.items():
            path = directory / entry
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
        files = {entry: dict(bytes=len(text.encode()), sha256=hashlib.sha256(text.encode()).hexdigest())
                 for entry, text in entries.items()}
        (directory / 'deploy-manifest.json').write_text(json.dumps(dict(schema=1, commit=commit,
            files=files, projects=['projects/example/index.html'])))
        return directory

    def test_publish_retains_three_and_rollback_restores_previous(self):
        for name in ['one', 'two', 'three', 'four']:
            self.upload(name)
            self.manager.publish(name)
        self.assertEqual((self.root / 'current/index.html').read_text(), 'four')
        self.assertEqual({p.name for p in self.manager.releases.iterdir()}, {'two', 'three', 'four'})
        self.manager.rollback()
        self.assertEqual((self.root / 'current/index.html').read_text(), 'three')

    def test_corrupt_or_incomplete_upload_cannot_change_live_site(self):
        self.upload('good')
        self.manager.publish('good')
        corrupt = self.upload('corrupt')
        (corrupt / 'index.html').write_text('corrupted')
        with self.assertRaises(ValueError):
            self.manager.publish('corrupt')
        missing = self.upload('missing')
        (missing / 'projects/example/index.html').unlink()
        with self.assertRaises(ValueError):
            self.manager.publish('missing')
        self.assertEqual((self.root / 'current/index.html').read_text(), 'good')

    def test_live_health_failure_reverts_atomically(self):
        self.upload('good')
        self.manager.publish('good')
        self.upload('broken')
        with patch.object(self.manager, 'health', side_effect=RuntimeError('Nginx unavailable')):
            with self.assertRaises(RuntimeError):
                self.manager.publish('broken')
        self.assertEqual((self.root / 'current/index.html').read_text(), 'good')
        self.assertFalse(json.loads((self.manager.path('broken') / '_release.json').read_text())['verified'])

    def test_path_escape_and_unrelated_directory_are_rejected(self):
        with self.assertRaises(ValueError):
            self.manager.prepare('../another-site')
        stage = self.upload('symlink')
        (stage / 'outside').symlink_to(self.root)
        with self.assertRaises(ValueError):
            self.manager.publish('symlink')
        (self.root / 'current').mkdir()
        (self.root / 'current/keep.txt').write_text('another site')
        self.upload('unrelated')
        with self.assertRaises(ValueError):
            self.manager.publish('unrelated')
        self.assertEqual((self.root / 'current/keep.txt').read_text(), 'another site')


if __name__ == '__main__':
    unittest.main()

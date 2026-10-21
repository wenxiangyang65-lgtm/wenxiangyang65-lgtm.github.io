"""Keep the nine story excerpts and the published artwork references consistent."""
import json
from pathlib import Path
import unittest
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'dist'
CASE = SITE / 'projects/spring-horse'


class SpringHorseMediaTests(unittest.TestCase):
    def test_story_excerpt_data_matches_the_offline_page(self):
        chapters = json.loads((CASE / 'chapters.json').read_text())
        offline = (CASE / 'offline-data.js').read_text().split('=', 1)[1].strip().rstrip(';')
        self.assertEqual(chapters, json.loads(offline)['chapters'])
        self.assertEqual(len(chapters), 9)
        self.assertEqual(len({a['clip'] for a in chapters}), 9)
        for act in chapters:
            with self.subTest(chapter=act['title']):
                self.assertGreaterEqual(act['clip_start'], act['start'])
                self.assertLessEqual(act['clip_end'], act['end'])
                self.assertGreater(act['clip_end'] - act['clip_start'], 1)
                self.assertLess(act['clip_end'] - act['clip_start'], 5)
                for field in ('clip', 'image'):
                    self.assertFalse(urlsplit(act[field]).scheme)
                    self.assertTrue((CASE / urlsplit(act[field]).path).is_file())

    def test_excluded_legacy_artwork_is_retained_and_has_no_active_reference(self):
        excluded = json.loads((ROOT / 'content/publish-exclusions.json').read_text())['paths']
        for name in excluded:
            self.assertTrue((SITE / name).is_file(), 'Original backups must remain in source')
        for page in SITE.rglob('*'):
            if page.suffix not in ('.html', '.css', '.json', '.js'):
                continue
            text = page.read_text()
            for name in excluded:
                with self.subTest(page=str(page.relative_to(SITE)), asset=name):
                    self.assertNotIn(name, text)
                    if page.parent == CASE:
                        self.assertNotIn('assets/' + Path(name).name, text)


if __name__ == '__main__':
    unittest.main()

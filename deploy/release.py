#!/usr/bin/env python3
"""Validate complete uploads, atomically activate them, and retain good versions."""
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
import time
import urllib.request
import uuid
from datetime import datetime, timezone


class Releases:
    def __init__(self, config):
        self.config = config
        self.root = Path(config['root']).resolve()
        self.releases = self.root / 'releases'
        self.incoming = self.root / '.incoming'
        self.logs = self.root / 'logs'
        for folder in [self.releases, self.incoming, self.logs]:
            if folder.is_symlink():
                raise ValueError('Deployment directories cannot be symlinks')
            folder.mkdir(exist_ok=True)

    def log(self, action, **data):
        entry = dict(time=datetime.now(timezone.utc).isoformat(), action=action, **data)
        with (self.logs / 'deploy.jsonl').open('a') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
        print(json.dumps(entry, ensure_ascii=False), flush=True)

    def path(self, release, incoming=False):
        if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,100}', release):
            raise ValueError('Invalid release ID')
        parent = self.incoming if incoming else self.releases
        path = parent / release
        if path.is_symlink() or path.resolve().parent != parent.resolve():
            raise ValueError('Release must stay in its own directory')
        return path

    def target(self, name='current'):
        link = self.root / name
        if not link.exists() and not link.is_symlink():
            return None
        if not link.is_symlink() or link.resolve().parent != self.releases.resolve():
            raise ValueError('Refusing to replace an unrelated live directory')
        if not link.resolve().is_dir():
            raise ValueError('Broken release link')
        return link.resolve()

    def link(self, target, name='current'):
        self.target(name)
        temporary = self.root / ('.link-' + uuid.uuid4().hex)
        temporary.symlink_to(target.relative_to(self.root))
        os.replace(temporary, self.root / name)

    def prepare(self, release):
        stage = self.path(release, True)
        if self.path(release).exists() or stage.exists():
            raise ValueError('Release ID already exists; use a new run attempt')
        if shutil.disk_usage(self.root).free < 1073741824:
            raise ValueError('Less than 1 GB free disk space; live version preserved')
        stage.mkdir(mode=0o755)
        self.log('prepared', release=release, upload_path=str(stage))

    def validate(self, directory):
        manifest_path = directory / 'deploy-manifest.json'
        if manifest_path.is_symlink():
            raise ValueError('Manifest cannot be a symlink')
        manifest = json.loads(manifest_path.read_text())
        if manifest.get('schema') != 1 or not re.fullmatch(r'[0-9a-f]{40}', manifest.get('commit', '')):
            raise ValueError('Invalid manifest')
        expected = manifest['files']
        if not expected or 'index.html' not in expected or 'deployment-health.json' not in expected:
            raise ValueError('Incomplete site manifest')
        actual = set()
        for path in directory.rglob('*'):
            if path.is_symlink():
                raise ValueError('Uploads cannot contain symlinks')
            if path.is_file():
                relative = path.relative_to(directory).as_posix()
                if relative not in ['deploy-manifest.json', '_release.json']:
                    actual.add(relative)
        if actual != set(expected):
            raise ValueError('File list differs from manifest')
        for name, info in expected.items():
            path = directory / name
            if path.resolve().is_relative_to(directory.resolve()) is False:
                raise ValueError('Resource outside release directory')
            if path.stat().st_size != info['bytes']:
                raise ValueError('Incomplete resource: ' + name)
            with path.open('rb') as f:
                digest = hashlib.sha256()
                for chunk in iter(lambda: f.read(1024 * 1024), b''):
                    digest.update(chunk)
            if digest.hexdigest() != info['sha256']:
                raise ValueError('Corrupt resource: ' + name)
        if any(entry not in expected for entry in manifest['projects']):
            raise ValueError('Missing project entry')
        return manifest

    def metadata(self, directory, **data):
        file = directory / '_release.json'
        temporary = directory / '.release-meta.tmp'
        temporary.write_text(json.dumps(data) + '\n')
        temporary.chmod(0o644)
        os.replace(temporary, file)

    def health(self, release, manifest):
        base = self.config['local_url'].rstrip('/')
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        def request(path):
            req = urllib.request.Request(base + '/' + path, headers={
                'Host': self.config['server_name'], 'Cache-Control': 'no-cache'})
            with opener.open(req, timeout=10) as response:
                return response.read()
        last = None
        for _ in range(5):
            try:
                metadata = json.loads(request('_release.json?probe=' + uuid.uuid4().hex))
                if metadata['release_id'] != release or metadata['commit'] != manifest['commit']:
                    raise ValueError('Nginx served a different release')
                health = json.loads(request('deployment-health.json'))
                if health['commit'] != manifest['commit'] or health['status'] != 'ok':
                    raise ValueError('Health check returned a different build')
                request('')
                for entry in manifest['projects']:
                    request(entry)
                return
            except Exception as error:
                last = error
                time.sleep(.3)
        raise RuntimeError('Live health check failed: ' + str(last))

    def prune(self):
        good = []
        for folder in self.releases.iterdir():
            if folder.is_symlink() or not folder.is_dir():
                continue
            try:
                metadata = json.loads((folder / '_release.json').read_text())
                if metadata.get('verified'):
                    good.append((metadata['published'], folder))
            except (FileNotFoundError, KeyError, ValueError):
                continue
        good.sort(key=lambda item: item[0], reverse=True)
        keep = {folder for _, folder in good[:max(3, self.config.get('retain', 3))]}
        keep.update(filter(None, [self.target(), self.target('previous')]))
        for _, folder in good:
            if folder not in keep:
                shutil.rmtree(folder)
                self.log('pruned', release=folder.name)

    def publish(self, release):
        stage, destination = self.path(release, True), self.path(release)
        previous = self.target()
        manifest = self.validate(stage)  # Never touch current until complete validation.
        if destination.exists():
            raise ValueError('Release already exists')
        published = datetime.now(timezone.utc).isoformat()
        metadata = dict(release_id=release, commit=manifest['commit'], published=published, verified=False)
        self.metadata(stage, **metadata)
        stage.rename(destination)
        self.link(destination)
        try:
            self.health(release, manifest)
        except Exception:
            if previous:
                self.link(previous)
            else:
                (self.root / 'current').unlink()
            self.log('activation_failed_reverted', release=release, restored=previous.name if previous else None)
            raise
        metadata['verified'] = True
        self.metadata(destination, **metadata)
        if previous:
            self.link(previous, 'previous')
        self.log('published', release=release, commit=manifest['commit'])
        self.prune()

    def rollback(self, release=None):
        destination = self.path(release) if release else self.target('previous')
        if not destination:
            raise ValueError('No previous successful release yet')
        metadata = json.loads((destination / '_release.json').read_text())
        if not metadata.get('verified'):
            raise ValueError('Cannot roll back to an unverified release')
        manifest = self.validate(destination)
        previous = self.target()
        self.link(destination)
        try:
            self.health(destination.name, manifest)
        except Exception:
            if previous:
                self.link(previous)
            raise
        if previous and previous != destination:
            self.link(previous, 'previous')
        self.log('rolled_back', release=destination.name, commit=manifest['commit'])

    def status(self):
        current = self.target()
        self.log('status', current=current.name if current else None,
                 releases=sorted(path.name for path in self.releases.iterdir() if path.is_dir()))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', default='/etc/portfolio-deploy.json')
    parser.add_argument('action', choices=['prepare', 'publish', 'rollback', 'status'])
    parser.add_argument('release', nargs='?')
    args = parser.parse_args()
    manager = Releases(json.loads(Path(args.config).read_text()))
    with (manager.root / '.deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        try:
            if args.action in ['prepare', 'publish'] and not args.release:
                raise ValueError('Release ID required')
            if args.action == 'status':
                manager.status()
            else:
                getattr(manager, args.action)(args.release)
        except Exception as error:
            manager.log('failed', operation=args.action, release=args.release, error=str(error))
            raise


if __name__ == '__main__':
    main()

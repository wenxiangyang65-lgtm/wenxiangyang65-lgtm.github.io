"""Ensure each operations catalogue item opens its own self-contained case."""
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit
import unittest

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'dist'


class MediaReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
        self.scripts = []

    def handle_starttag(self, tag, attributes):
        values = dict(attributes)
        if tag in ('img', 'video', 'source'):
            self.assets.extend(values[key] for key in ('src', 'poster', 'data-src') if values.get(key))
        if tag == 'script' and values.get('src'):
            self.scripts.append(urlsplit(values['src']).path)


class OperationsCaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.items = [item for project in json.loads((ROOT / 'content/projects.json').read_text())
                     for item in project.get('catalogItems', []) if item['group'] == 'operations']

    def test_each_catalogue_entry_has_a_different_case_page(self):
        self.assertTrue(self.items)
        paths = [item['entry'].split('#')[0] for item in self.items]
        self.assertEqual(len(paths), len(set(paths)), 'Operations entries must not share a long collection page')
        self.assertTrue(all('#' not in item['entry'] for item in self.items))

    def test_case_media_and_navigation_are_portable(self):
        for item in self.items:
            with self.subTest(project=item['id']):
                page = SITE / item['entry']
                parser = MediaReferences()
                parser.feed(page.read_text())
                self.assertTrue(parser.assets)
                self.assertIn('../../project-navigation.js', parser.scripts)
                self.assertIn('../../desktop-preview.js', parser.scripts)
                for raw in parser.assets:
                    self.assertFalse(urlsplit(raw).scheme, 'Artwork and motion should ship with the case')
                    target = (page.parent / unquote(urlsplit(raw).path)).resolve()
                    self.assertTrue(target.is_relative_to(page.parent.resolve()))
                    self.assertTrue(target.is_file(), raw)


if __name__ == '__main__':
    unittest.main()

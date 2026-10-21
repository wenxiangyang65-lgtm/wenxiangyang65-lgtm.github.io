"""Check excerpt mapping and retain all dynamically generated story artwork."""
from html.parser import HTMLParser
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / 'dist/projects/mr-chen'

class Videos(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.clips = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'video' and attrs.get('class') == 'concept-video':
            self.clips.append(attrs)

class MrChenMediaTests(unittest.TestCase):
    def test_five_highlights_are_local_inline_excerpts_of_the_final_film(self):
        clips = Videos((CASE / 'index.html').read_text()).clips
        self.assertEqual(len(clips), 5)
        self.assertEqual(len({c['data-src'] for c in clips}), 5)
        for clip in clips:
            with self.subTest(clip=clip['data-src']):
                self.assertTrue((CASE / clip['data-src']).is_file())
                self.assertTrue((CASE / clip['poster']).is_file())
                self.assertNotIn('src', clip, 'Only visible previews should load')
                for attribute in ['muted', 'autoplay', 'loop', 'playsinline']:
                    self.assertIn(attribute, clip)
                start, end = float(clip['data-start']), float(clip['data-end'])
                self.assertGreaterEqual(start, 0)
                self.assertLessEqual(end, 78.4)
                self.assertTrue(2 <= end - start <= 3)

    def test_dynamic_act_titles_remain_published(self):
        excluded = set(json.loads((ROOT / 'content/publish-exclusions.json').read_text())['paths'])
        for act in range(1, 5):
            for suffix in ['-clean', '-label-original']:
                path = f'projects/mr-chen/assets/titles/act{act}{suffix}.webp'
                self.assertTrue((ROOT / 'dist' / path).is_file())
                self.assertNotIn(path, excluded)
        html = (CASE / 'index.html').read_text()
        js = (CASE / 'app.js').read_text()
        for path in excluded:
            if path.startswith('projects/mr-chen/'):
                self.assertNotIn(path.split('projects/mr-chen/')[1], html + js)

if __name__ == '__main__':
    unittest.main()

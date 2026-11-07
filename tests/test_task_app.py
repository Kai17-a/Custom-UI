"""The distributed skill remains usable after copying it out of the repository."""
import re
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class TaskAppDistributionTest(unittest.TestCase):
    def test_copied_skill_resolves_task_app(self):
        with tempfile.TemporaryDirectory() as directory:
            skill = Path(directory) / 'copied-skill'
            shutil.copytree(ROOT / 'skills/kav-ui', skill)
            guide = skill / 'references/screens.md'
            links = re.findall(r'\[[^]]*\]\(([^)]+task-app\.html)\)', guide.read_text())
            self.assertTrue(links, 'The skill must advertise the app sample')
            for link in links:
                self.assertFalse(Path(link).is_absolute())
                sample = (guide.parent / link).resolve()
                self.assertTrue(sample.is_relative_to(skill))
                self.assertTrue(sample.is_file())
                html = sample.read_text()
                for href in re.findall(r'(?:href|src)="([^"]+)"', html):
                    self.assertTrue(href.startswith('#'), href)
                    self.assertIn('id="' + href[1:] + '"', html)
                self.assertNotIn('fetch(', html)
                self.assertNotIn('localStorage', html)

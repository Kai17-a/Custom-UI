"""Exercise release orchestration with a fake gh; never access GitHub."""
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'scripts/publish-release.sh'
FAKE_GH = '''#!/usr/bin/env python3
import json, os, sys
with open(os.environ['FAKE_GH_LOG'], 'a') as log:
    log.write(json.dumps(sys.argv[1:]) + '\\n')
command = sys.argv[1:3]
if command == ['release', 'view']:
    state = os.environ.get('FAKE_RELEASE_STATE', 'missing')
    if state == 'missing': sys.exit(1)
    print('true' if state == 'draft' else 'false')
if command == ['release', os.environ.get('FAKE_FAIL_COMMAND')]: sys.exit(1)
'''


class ReleasePublishTests(unittest.TestCase):
    def publish(self, directory, state='missing', tag='v1.2.3', fail=''):
        directory = Path(directory)
        (directory / 'bin').mkdir(exist_ok=True)
        gh = directory / 'bin/gh'; gh.write_text(FAKE_GH); gh.chmod(0o755)
        (directory / 'dist').mkdir(exist_ok=True)
        (directory / f'dist/kav-ui-{tag}.zip').write_bytes(b'example')
        (directory / f'dist/kav-ui-{tag}.zip.sha256').write_text('example')
        log = directory / 'calls.jsonl'
        env = {**os.environ, 'PATH':str(directory / 'bin') + os.pathsep + os.environ['PATH'],
               'RELEASE_TAG':tag, 'GH_REPO':'example/ui', 'GH_TOKEN':'test-placeholder',
               'FAKE_RELEASE_STATE':state, 'FAKE_FAIL_COMMAND':fail, 'FAKE_GH_LOG':str(log)}
        result = subprocess.run(['bash', str(SCRIPT)], cwd=directory, env=env, capture_output=True, text=True)
        calls = [json.loads(line) for line in log.read_text().splitlines()]
        return result, calls

    def test_new_release_attaches_both_assets_as_draft_before_publication(self):
        with tempfile.TemporaryDirectory() as temporary:
            result, calls = self.publish(temporary)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual([call[1] for call in calls], ['view', 'create', 'edit'])
            create, edit = calls[1:]
            self.assertIn('--verify-tag', create)
            self.assertIn('--draft', create)
            self.assertIn('dist/kav-ui-v1.2.3.zip', create)
            self.assertIn('dist/kav-ui-v1.2.3.zip.sha256', create)
            self.assertIn('--draft=false', edit)
            self.assertIn('--prerelease=false', edit)

    def test_existing_draft_resumes_with_assets_before_publish(self):
        with tempfile.TemporaryDirectory() as temporary:
            result, calls = self.publish(temporary, state='draft', tag='v2.0.0-rc.1')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual([call[1] for call in calls], ['view', 'upload', 'edit'])
            self.assertIn('--clobber', calls[1])
            self.assertIn('--prerelease=true', calls[2])

    def test_published_release_is_never_modified(self):
        with tempfile.TemporaryDirectory() as temporary:
            result, calls = self.publish(temporary, state='published')
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual([call[1] for call in calls], ['view'])

    def test_failed_upload_never_publishes_partial_assets(self):
        with tempfile.TemporaryDirectory() as temporary:
            result, calls = self.publish(temporary, state='draft', fail='upload')
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual([call[1] for call in calls], ['view', 'upload'])

    def test_failed_create_never_publishes_partial_assets(self):
        with tempfile.TemporaryDirectory() as temporary:
            result, calls = self.publish(temporary, fail='create')
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual([call[1] for call in calls], ['view', 'create'])

    def test_metadata_hyphen_does_not_mark_stable_tag_as_prerelease(self):
        with tempfile.TemporaryDirectory() as temporary:
            result, calls = self.publish(temporary, tag='v1.2.3+build-4')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('--prerelease=false', calls[-1])


if __name__ == '__main__':
    unittest.main()

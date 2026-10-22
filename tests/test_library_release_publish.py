"""Library release publication with fake gh; no real GitHub or registry writes."""
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from test_release_publish import FAKE_GH

ROOT = Path(__file__).resolve().parents[1]

class LibraryPublishTests(unittest.TestCase):
    def publish(self, directory, state='missing', version='1.2.3', fail='', tamper=False):
        root = Path(directory)
        (root / 'bin').mkdir()
        gh = root / 'bin/gh'; gh.write_text(FAKE_GH); gh.chmod(0o755)
        (root / 'scripts').mkdir()
        for name in ['library-release.mjs', 'publish-library-release.sh']:
            shutil.copyfile(ROOT / 'scripts' / name, root / 'scripts' / name)
        output = root / 'dist/packages'; output.mkdir(parents=True)
        for name in ['core', 'vue', 'astro']:
            package = root / 'packages' / name; package.mkdir(parents=True)
            manifest = {'name': '@kav-ui/' + name, 'version': version,
                        'dependencies': {} if name == 'core' else {'@kav-ui/core': version}}
            (package / 'package.json').write_text(json.dumps(manifest))
            (output / f'kav-ui-{name}-{version}.tgz').write_bytes(name.encode())
        tag = 'libraries-v' + version
        subprocess.run(['node', 'scripts/library-release.mjs', 'checksums', tag], cwd=root, check=True)
        if tamper:
            (output / f'kav-ui-core-{version}.tgz').write_bytes(b'tampered')
        log = root / 'calls.jsonl'
        env = {**os.environ, 'PATH':str(root / 'bin') + os.pathsep + os.environ['PATH'],
               'RELEASE_TAG':tag, 'GH_REPO':'example/ui', 'GH_TOKEN':'test-placeholder',
               'FAKE_RELEASE_STATE':state, 'FAKE_FAIL_COMMAND':fail, 'FAKE_GH_LOG':str(log)}
        result = subprocess.run(['bash', 'scripts/publish-library-release.sh'], cwd=root, env=env, capture_output=True, text=True)
        calls = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
        return result, calls

    def test_all_three_packages_and_checksums_are_attached_before_publication(self):
        with tempfile.TemporaryDirectory() as directory:
            result, calls = self.publish(directory)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual([call[1] for call in calls], ['view', 'create', 'edit'])
            for name in ['core','vue','astro']:
                self.assertIn(f'dist/packages/kav-ui-{name}-1.2.3.tgz', calls[1])
            self.assertIn('dist/packages/SHA256SUMS', calls[1])
            for flag in ['--draft', '--verify-tag', '--latest=false']:
                self.assertIn(flag, calls[1])
            self.assertIn('--draft=false', calls[2])
            self.assertIn('--latest=false', calls[2])

    def test_draft_can_resume_and_prerelease_flag_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            result, calls = self.publish(directory, state='draft', version='1.2.3-rc.1')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual([call[1] for call in calls], ['view', 'upload', 'edit'])
            self.assertIn('--clobber', calls[1]); self.assertIn('--prerelease=true', calls[2])

    def test_build_metadata_hyphen_does_not_make_a_prerelease(self):
        with tempfile.TemporaryDirectory() as directory:
            result, calls = self.publish(directory, version='1.2.3+build-4')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('--prerelease=false', calls[-1])

    def test_published_release_is_not_modified(self):
        with tempfile.TemporaryDirectory() as directory:
            result, calls = self.publish(directory, state='published')
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual([call[1] for call in calls], ['view'])

    def test_failed_upload_or_create_never_publishes(self):
        for command, state in [('upload','draft'), ('create','missing')]:
            with self.subTest(command=command), tempfile.TemporaryDirectory() as directory:
                result, calls = self.publish(directory, state=state, fail=command)
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn('edit', [call[1] for call in calls])

    def test_tampered_package_is_rejected_before_github_access(self):
        with tempfile.TemporaryDirectory() as directory:
            result, calls = self.publish(directory, tamper=True)
            self.assertNotEqual(result.returncode, 0); self.assertEqual(calls, [])

if __name__ == '__main__':
    unittest.main()

#!/usr/bin/env bash
# Called by release-libraries.yml only after build and tests; never publishes to npm.
set -euo pipefail
: "${RELEASE_TAG:?Set RELEASE_TAG to an existing libraries-vVERSION tag}"
: "${GH_REPO:?Set GH_REPO to owner/repository}"
: "${GH_TOKEN:?Set GH_TOKEN to a token with contents:write}"

version=$(node scripts/library-release.mjs validate "$RELEASE_TAG")
node scripts/library-release.mjs verify "$RELEASE_TAG"
assets=(
  "dist/packages/kav-ui-core-${version}.tgz"
  "dist/packages/kav-ui-vue-${version}.tgz"
  "dist/packages/kav-ui-astro-${version}.tgz"
  'dist/packages/SHA256SUMS'
)
prerelease=false
if [[ "${version%%+*}" == *-* ]]; then prerelease=true; fi

if draft=$(gh release view "$RELEASE_TAG" --repo "$GH_REPO" --json isDraft --jq '.isDraft' 2>/dev/null); then
  if [[ "$draft" != true ]]; then
    echo 'Library release is already published. Use a new version; published assets are not replaced.' >&2
    exit 1
  fi
  gh release upload "$RELEASE_TAG" "${assets[@]}" --repo "$GH_REPO" --clobber
else
  gh release create "$RELEASE_TAG" "${assets[@]}" \
    --repo "$GH_REPO" --verify-tag --draft --generate-notes \
    --title "Kav-UI libraries ${version}" --prerelease="$prerelease" --latest=false
fi
# Keep the HTML distribution's Latest designation independent of library releases.
gh release edit "$RELEASE_TAG" --repo "$GH_REPO" --prerelease="$prerelease" --latest=false --draft=false

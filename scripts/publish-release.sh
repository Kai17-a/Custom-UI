#!/usr/bin/env bash
# Called only by the release workflow after local package validation.
set -euo pipefail
: "${RELEASE_TAG:?Set RELEASE_TAG to the existing version tag}"
: "${GH_REPO:?Set GH_REPO to owner/repository}"
: "${GH_TOKEN:?Set GH_TOKEN to a token with contents:write}"

archive="dist/kav-ui-${RELEASE_TAG}.zip"
checksum="${archive}.sha256"
[[ -f "$archive" && -f "$checksum" ]] || { echo 'Release package is missing.' >&2; exit 1; }

prerelease=false
version_without_metadata="${RELEASE_TAG%%+*}"
if [[ "$version_without_metadata" == *-* ]]; then prerelease=true; fi

if draft=$(gh release view "$RELEASE_TAG" --repo "$GH_REPO" --json isDraft --jq '.isDraft' 2>/dev/null); then
  if [[ "$draft" != true ]]; then
    echo 'This release is already published. Use a new version tag; published assets are not replaced.' >&2
    exit 1
  fi
  # Only a draft may be resumed and have its generated assets replaced.
  gh release upload "$RELEASE_TAG" "$archive" "$checksum" --repo "$GH_REPO" --clobber
else
  gh release create "$RELEASE_TAG" "$archive" "$checksum" \
    --repo "$GH_REPO" --verify-tag --draft --generate-notes \
    --title "Kav-UI ${RELEASE_TAG}" --prerelease="$prerelease"
fi
# Assets are attached before publication, including with immutable releases.
gh release edit "$RELEASE_TAG" --repo "$GH_REPO" --prerelease="$prerelease" --draft=false

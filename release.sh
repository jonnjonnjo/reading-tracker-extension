#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/manifest.json"

# Read current version
CURRENT=$(grep '"version"' "$MANIFEST" | sed 's/.*"version": "\(.*\)".*/\1/')

# Bump patch version (e.g. 1.1 -> 1.2)
MAJOR=$(echo "$CURRENT" | cut -d. -f1)
MINOR=$(echo "$CURRENT" | cut -d. -f2)
NEW_VERSION="$MAJOR.$((MINOR + 1))"

echo "Current version: $CURRENT"
read -rp "New version [$NEW_VERSION]: " INPUT
NEW_VERSION="${INPUT:-$NEW_VERSION}"

# Update manifest.json
sed -i "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST"
echo "Updated manifest.json to $NEW_VERSION"

# Create output zip
OUT="$SCRIPT_DIR/../url-reading-tracker-v${NEW_VERSION}.zip"
cd "$SCRIPT_DIR"
zip -r "$OUT" . \
  --exclude "*.git*" \
  --exclude "*.sh" \
  --exclude "*.md" \
  --exclude ".claude/*"

echo "Created: $(realpath "$OUT")"

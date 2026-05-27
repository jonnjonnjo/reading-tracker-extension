#!/usr/bin/env bash
set -euo pipefail

VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
OUTDIR="dist"
OUTFILE="${OUTDIR}/url-reading-tracker-v${VERSION}.zip"

mkdir -p "$OUTDIR"

zip -r "$OUTFILE" . \
  --exclude "*.git*"    \
  --exclude "*.sh"      \
  --exclude "*.md"      \
  --exclude ".claude/*" \
  --exclude ".github/*" \
  --exclude "dist/*"

echo "Built: $OUTFILE"

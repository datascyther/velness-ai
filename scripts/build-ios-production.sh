#!/bin/bash
# =============================================================================
# Velness — iOS Production Build Script
# =============================================================================
# Prerequisites:
#   1. Place GoogleService-Info.plist in project root
#   2. Set up Apple Developer account and configure in App Store Connect
#   3. Fill in eas.json > submit > production > ios with your Apple details
#   4. Install EAS CLI: npm install -g eas-cli
#   5. Log in: eas login
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Syncing Firebase environment variables..."
cd "$PROJECT_ROOT"
node scripts/sync-firebase-env.mjs

echo "==> Setting APP_ENV=production"
export APP_ENV=production

echo "==> Building iOS production archive via EAS..."
eas build --platform ios --profile production

echo "==> Done. IPA will be available in EAS dashboard."

#!/usr/bin/env bash
set -euo pipefail
# Vercel remains the default. AWS is only available through explicitly named workflows.
command -v vercel >/dev/null || { echo 'Install Vercel CLI: npm install --global vercel@62.1.0'; exit 1; }
npm run lint
npm run type-check
npm test
# Configure server environment variables in Vercel first; see DEPLOYMENT.md.
# Existing environment variables are never removed or overwritten by this script.
vercel --prod "$@"

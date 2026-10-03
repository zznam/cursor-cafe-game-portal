#!/bin/bash
set -euo pipefail
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  chmod 600 .env.local
  echo "Created .env.local from template."
fi
echo "1. Create a free Neon project at https://console.neon.tech"
echo "2. Set DATABASE_URL, SESSION_SECRET, and SITE_URL in .env.local"
echo "3. Run npm run db:migrate and npm run db:seed"
echo "4. Run npm run dev"
echo "See DEPLOYMENT.md for database migration and Vercel configuration."

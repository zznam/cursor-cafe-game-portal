#!/bin/bash
set -euo pipefail

echo "🚀 Deploying Game Portal to Vercel"
echo "===================================="
echo ""

if ! command -v vercel >/dev/null 2>&1; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

echo "📋 Checking Vercel authentication..."
if ! vercel whoami >/dev/null 2>&1; then
    echo "⚠️  Not logged in to Vercel"
    echo "Running: vercel login"
    echo ""
    vercel login
    echo ""
fi

echo "✅ Authenticated with Vercel"
echo ""

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]; then
    read -r -p "Enter NEXT_PUBLIC_SUPABASE_URL: " NEXT_PUBLIC_SUPABASE_URL
fi

if [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
    read -r -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " NEXT_PUBLIC_SUPABASE_ANON_KEY
fi

if [ -z "${NEXT_PUBLIC_SUPABASE_URL}" ] || [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" ]; then
    echo "❌ Missing required environment values."
    exit 1
fi

echo "🔧 Setting environment variables..."
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes >/dev/null 2>&1 || true
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes >/dev/null 2>&1 || true

printf "%s\n" "${NEXT_PUBLIC_SUPABASE_URL}" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --yes >/dev/null
printf "%s\n" "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes >/dev/null

echo ""
echo "✅ Environment variables configured"
echo ""

echo "🚀 Deploying to production..."
echo ""
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "📊 Your portal is now live!"
echo "Visit your deployment URL above to see it."

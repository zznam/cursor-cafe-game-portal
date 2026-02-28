#!/bin/bash
set -euo pipefail

echo "🎮 Game Portal - Quick Deploy to Vercel"
echo "========================================"
echo ""

if ! command -v vercel >/dev/null 2>&1; then
    echo "❌ Vercel CLI not found"
    echo "Install with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

echo "Checking Vercel authentication..."
if ! vercel whoami >/dev/null 2>&1; then
    echo ""
    echo "🔐 Please log in to Vercel"
    echo "This will open your browser..."
    echo ""
    vercel login
fi

echo "✅ Logged in to Vercel"
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

echo "🔧 Syncing Vercel environment variables..."
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes >/dev/null 2>&1 || true
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes >/dev/null 2>&1 || true

printf "%s\n" "${NEXT_PUBLIC_SUPABASE_URL}" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --yes >/dev/null
printf "%s\n" "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes >/dev/null

echo ""
echo "🚀 Deploying to Vercel..."
echo "⏱️  This takes about 2-3 minutes..."
echo ""

vercel --prod

echo ""
echo "✅ Deployment successful!"
echo "🎉 Your Game Portal is now LIVE!"
echo "💡 Tip: Run 'vercel open' to view in dashboard"

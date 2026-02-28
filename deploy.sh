#!/bin/bash

echo "🚀 Deploying Game Portal to Vercel"
echo "===================================="
echo ""

# Check if logged in to Vercel
echo "📋 Checking Vercel authentication..."
vercel whoami > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "⚠️  Not logged in to Vercel"
    echo "Running: vercel login"
    echo ""
    vercel login
    echo ""
fi

echo "✅ Authenticated with Vercel"
echo ""

# Set environment variables
echo "🔧 Setting environment variables..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<EOF
https://your-project-id.supabase.co
EOF

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<EOF
your-supabase-anon-key
EOF

echo ""
echo "✅ Environment variables configured"
echo ""

# Deploy to production
echo "🚀 Deploying to production..."
echo ""
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Your portal is now live!"
echo "Visit your deployment URL above to see it."
echo ""

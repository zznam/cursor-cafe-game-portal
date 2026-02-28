#!/bin/bash

echo "🎮 Game Portal - Quick Deploy to Vercel"
echo "========================================"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "Install with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Check authentication
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo ""
    echo "🔐 Please log in to Vercel"
    echo "This will open your browser..."
    echo ""
    vercel login
    
    if [ $? -ne 0 ]; then
        echo "❌ Login failed"
        exit 1
    fi
fi

echo "✅ Logged in to Vercel"
echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
echo ""
echo "This will:"
echo "  1. Build your Next.js app"
echo "  2. Upload to Vercel"
echo "  3. Deploy to production"
echo ""
echo "⏱️  This takes about 2-3 minutes..."
echo ""

vercel --prod \
  --env NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your Game Portal is now LIVE!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Visit your production URL (shown above)"
    echo "  2. Test all features"
    echo "  3. Share with friends!"
    echo ""
    echo "💡 Tip: Run 'vercel open' to view in dashboard"
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Check the error messages above."
    echo "Common fixes:"
    echo "  - Run: vercel login"
    echo "  - Check: vercel logs"
    echo "  - Verify: Environment variables are correct"
fi

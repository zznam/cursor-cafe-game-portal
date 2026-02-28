#!/bin/bash

echo "🎮 Game Portal Setup Helper"
echo "============================"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file exists"
    echo ""
    echo "Current configuration:"
    cat .env.local | grep -v "^#" | grep "="
    echo ""
else
    echo "⚠️  .env.local file not found"
    echo ""
    echo "Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

echo "📋 Next Steps:"
echo ""
echo "1. Go to https://supabase.com and create a project"
echo "2. Run the SQL from: supabase/schema.sql"
echo "3. Run the SQL from: scripts/seed-games.sql (optional)"
echo "4. Get your Project URL and anon key from Supabase"
echo "5. Update .env.local with your credentials"
echo ""
echo "Then run: npm run dev"
echo ""
echo "Need help? Check SETUP_INSTRUCTIONS.md"

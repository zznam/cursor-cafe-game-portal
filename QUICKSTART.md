# Quick Start Guide

Get your Game Portal up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- Git

## Step 1: Clone and Install (2 minutes)

```bash
cd cursor-cafe-game-portal
npm install
```

## Step 2: Set Up Supabase (2 minutes)

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: game-portal (or whatever you like)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Wait ~2 minutes for project creation

### Run the Database Schema

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned"

### Add Sample Games (Optional)

1. Still in SQL Editor, create another new query
2. Copy contents of `scripts/seed-games.sql`
3. Paste and run
4. This adds 2 sample games with ratings, comments, and leaderboard entries

### Get Your API Keys

1. Click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## Step 3: Configure Environment (30 seconds)

Create `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run the Portal (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## What You'll See

- **Home Page**: Featured and popular games
- **All Games**: Browse by category
- **Game Pages**: Play games, view leaderboards, rate and comment
- **Contribute**: Guide for adding your own games

## Next Steps

### Add Your Own Game

1. Create a new folder in `games/your-game-name/`
2. Create `index.ts` with your Phaser game
3. Add game metadata to Supabase
4. Refresh the portal!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions.

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variables (same as .env.local)
6. Click "Deploy"

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

### "Failed to load games" error

- Check your `.env.local` file has correct values
- Verify Supabase project is active
- Make sure you ran the schema.sql file

### Games not appearing

- Run the seed script: `scripts/seed-games.sql`
- Check Supabase Table Editor to see if games exist
- Look at browser console for errors

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Need Help?

- Check the [README.md](./README.md) for full documentation
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for game development
- Open a GitHub issue for bugs or questions

## What's Included

✅ Next.js 15 with App Router
✅ Phaser 3 game engine
✅ Supabase database with full schema
✅ 2 example games (Breakout, Space Shooter)
✅ Ratings and reviews system
✅ Leaderboards
✅ Comments
✅ Analytics tracking
✅ Beautiful UI with Tailwind + shadcn/ui
✅ Vercel deployment ready

---

**Enjoy building your game portal! 🎮**

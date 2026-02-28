# Setup Instructions - Follow These Steps

## ✅ Step 1: Supabase Setup (In Progress)

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - Name: `game-portal`
   - Database Password: (create strong password)
   - Region: (choose closest)
5. Wait ~2 minutes

### 1.2 Run Database Schema

**Copy this entire SQL and run it in Supabase SQL Editor:**

```sql
-- Copy the ENTIRE contents from supabase/schema.sql
-- It's 134 lines - make sure you get everything!
```

**To run:**
1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Paste the entire schema
4. Click "Run" (bottom right)
5. You should see "Success. No rows returned"

### 1.3 Add Sample Games (Optional but Recommended)

**Copy this SQL and run it in a new query:**

```sql
-- Copy the ENTIRE contents from scripts/seed-games.sql
-- It's 170 lines - includes 2 games with ratings, comments, leaderboards
```

**To run:**
1. Still in SQL Editor, click "New Query" again
2. Paste the seed data
3. Click "Run"
4. You should see a results table with 2 games

### 1.4 Get Your API Keys

1. Click "Settings" (gear icon, left sidebar)
2. Click "API" under Project Settings
3. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: (long string under "Project API keys")

---

## ✅ Step 2: Configure Environment Variables

**Paste your Supabase credentials here when ready:**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

I'll update the .env.local file for you once you provide them.

---

## ✅ Step 3: Test Locally

Once configured, I'll run:
```bash
npm run dev
```

We'll verify:
- ✅ Home page loads
- ✅ Games appear
- ✅ Can click into game pages
- ✅ Leaderboards show
- ✅ Can add comments/ratings

---

## ✅ Step 4: Deploy to Vercel

### 4.1 Push to GitHub (if not already)
```bash
git add .
git commit -m "Initial game portal setup"
git push origin main
```

### 4.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Add environment variables (same as .env.local)
6. Click "Deploy"

---

## 📋 Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Sample games added
- [ ] API keys copied
- [ ] .env.local configured
- [ ] Local test successful
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production site working

---

## 🆘 Need Help?

**Common Issues:**

**"Failed to load games"**
- Check .env.local has correct values
- Verify Supabase project is active
- Make sure schema.sql ran successfully

**"No games showing"**
- Run seed-games.sql
- Check Supabase Table Editor
- Look for games in the "games" table

**Build errors**
- Run `npm install` again
- Clear cache: `rm -rf .next`
- Try `npm run build`

---

**Ready to start? Let me know when you've:**
1. Created your Supabase project
2. Have your Project URL and anon key ready

Then paste them here and I'll configure everything!

# 🚀 Deploy to Vercel - Step by Step

Your code is ready and pushed to GitHub! Now let's deploy to Vercel.

## ✅ Prerequisites Complete
- ✅ Code pushed to GitHub: `https://github.com/zznam/cursor-cafe-game-portal`
- ✅ Supabase configured
- ✅ Local testing successful

---

## 📋 Deployment Steps

### Step 1: Go to Vercel

1. Open: **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Import Your Repository

1. Click **"Add New..."** → **"Project"**
2. Find `cursor-cafe-game-portal` in the list
3. Click **"Import"**

### Step 3: Configure Project

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as is)

**Build Command:** `npm run build` (should be pre-filled)

**Output Directory:** `.next` (should be pre-filled)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these TWO variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-supabase-anon-key
```

**Important:** Make sure to add BOTH variables!

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. ✅ You'll see "Congratulations!" when done

---

## 🎉 After Deployment

### Your Live URLs

Vercel will give you:
- **Production URL**: `https://cursor-cafe-game-portal.vercel.app`
- **Custom domain** (optional): Add your own domain in settings

### Test Your Deployment

Visit your production URL and verify:
- ✅ Home page loads
- ✅ Games are listed
- ✅ Can click into game pages
- ✅ Leaderboards work
- ✅ Can add comments/ratings

---

## 🔧 Post-Deployment

### Add Custom Domain (Optional)

1. In Vercel project, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `games.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

### Monitor Your Site

**Vercel Dashboard:**
- View deployments
- Check analytics
- Monitor errors
- See build logs

**Supabase Dashboard:**
- Monitor database usage
- Check API requests
- View table data
- Track performance

---

## 🚨 Troubleshooting

### Build Failed

**Check:**
1. Environment variables are correct
2. Both variables are added
3. No typos in variable names
4. Build logs for specific errors

**Fix:**
- Go to **Settings** → **Environment Variables**
- Verify both variables
- Redeploy from **Deployments** tab

### Site Loads But No Games

**Likely cause:** Database not seeded

**Fix:**
1. Go to Supabase SQL Editor
2. Run `scripts/seed-games.sql` again
3. Refresh your Vercel site

### Images Not Loading

**Current status:** Using placeholder 1x1 PNGs

**To fix:**
1. Create proper 800x450 game screenshots
2. Replace files in `public/games/*/thumbnail.png`
3. Commit and push
4. Vercel auto-deploys

---

## 📊 What's Next?

### Immediate
- [ ] Test all features on production
- [ ] Share your site!
- [ ] Add more games

### Soon
- [ ] Replace placeholder thumbnails
- [ ] Add custom domain
- [ ] Customize branding
- [ ] Invite other developers

### Later
- [ ] Add user authentication
- [ ] Create developer dashboard
- [ ] Add achievements
- [ ] Enable monetization

---

## 🎮 Your Portal is Live!

**Repository:** https://github.com/zznam/cursor-cafe-game-portal

**Production URL:** (will be shown after deployment)

**Supabase:** https://your-project-id.supabase.co

---

**Ready to deploy?** Follow the steps above! 🚀

**Questions?** Check the Vercel docs or open a GitHub issue.

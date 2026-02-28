# 🚀 Deploy to Vercel via CLI - Quick Guide

## Step 1: Login to Vercel

Run this command:

```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Log you in automatically

**Or use email:**
```bash
vercel login --email your@email.com
```

---

## Step 2: Deploy with Environment Variables

I've created two deployment methods for you:

### Method A: Automatic Deploy (Recommended)

Run the automated script:

```bash
./deploy.sh
```

This will:
- ✅ Check authentication
- ✅ Set environment variables automatically
- ✅ Deploy to production
- ✅ Give you the live URL

### Method B: Manual Deploy

**Step 2a: Link to Vercel (first time only)**

```bash
vercel link
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **cursor-cafe-game-portal** (or press Enter)

**Step 2b: Add Environment Variables**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```
When prompted, paste: `https://your-project-id.supabase.co`

```bash
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```
When prompted, paste: `your-supabase-anon-key`

**Step 2c: Deploy to Production**

```bash
vercel --prod
```

Wait 2-3 minutes for build and deployment.

---

## Step 3: Get Your Live URL

After deployment completes, you'll see:

```
✅ Production: https://cursor-cafe-game-portal.vercel.app [copied to clipboard]
```

**Your portal is now LIVE!** 🎉

---

## 🧪 Test Your Deployment

Visit your URL and verify:

- ✅ Home page loads
- ✅ Games are listed (if you ran seed-games.sql)
- ✅ Can click into game pages
- ✅ Leaderboards work
- ✅ Can add comments/ratings

---

## 🔧 Useful Commands

### Check deployment status
```bash
vercel ls
```

### View logs
```bash
vercel logs
```

### Check environment variables
```bash
vercel env ls
```

### Redeploy
```bash
vercel --prod
```

### Open in browser
```bash
vercel open
```

---

## 🚨 Troubleshooting

### "No existing credentials found"
**Fix:** Run `vercel login` first

### "Build failed"
**Check:** 
```bash
vercel logs
```
Look for specific error messages

### "Games not showing"
**Cause:** Database not seeded
**Fix:** Run `scripts/seed-games.sql` in Supabase

### "Environment variables not working"
**Fix:**
```bash
vercel env ls
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod
```

---

## 📊 What Happens During Deployment

1. **Upload:** Code is uploaded to Vercel
2. **Build:** Next.js builds your app (~2 minutes)
3. **Deploy:** App is deployed to global CDN
4. **URL:** You get a production URL
5. **SSL:** Automatic HTTPS certificate

---

## 🎯 Quick Start (Copy & Paste)

```bash
# 1. Login
vercel login

# 2. Deploy (automatic)
./deploy.sh

# OR deploy manually
vercel --prod
```

That's it! Your portal will be live in ~3 minutes.

---

## 🌐 After Deployment

### Add Custom Domain (Optional)

```bash
vercel domains add yourdomain.com
```

Then follow DNS instructions.

### View Dashboard

```bash
vercel open
```

Or visit: https://vercel.com/dashboard

---

## ✅ Checklist

Before deploying:
- [x] Code pushed to GitHub
- [x] Supabase configured
- [x] Environment variables ready
- [ ] Logged in to Vercel
- [ ] Database schema deployed
- [ ] Sample games seeded (optional)

After deploying:
- [ ] Test live URL
- [ ] Verify all features work
- [ ] Share with friends!

---

## 🎉 Ready to Deploy!

**Run this now:**

```bash
vercel login
```

Then:

```bash
./deploy.sh
```

**Your portal will be live in 3 minutes!** 🚀

---

**Questions?** Check Vercel docs: https://vercel.com/docs/cli

# Deployment Guide

This guide will help you deploy Game Portal to Vercel with Supabase.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created

### 1.2 Run Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL
4. Verify tables were created in "Table Editor"

### 1.3 Get API Keys

1. Go to "Settings" → "API"
2. Copy your:
   - Project URL
   - Anon/Public key

## Step 2: Deploy to Vercel

### Option A: Deploy Button (Recommended)

1. Click the "Deploy to Vercel" button in README.md
2. Connect your GitHub account
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Click "Deploy"

### Option B: Manual Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (same as above)
6. Click "Deploy"

## Step 3: Add Sample Games

After deployment, add sample games to your database:

```sql
-- Breakout Game
INSERT INTO games (
  slug, title, description, thumbnail_url,
  category, tags, developer_name, package_name, version, featured
) VALUES (
  'breakout',
  'Breakout Classic',
  'Classic brick-breaking arcade game. Use arrow keys to move the paddle and break all the bricks!',
  '/games/breakout/thumbnail.png',
  'Arcade',
  ARRAY['classic', 'arcade', 'retro'],
  'Game Portal Team',
  'breakout',
  '1.0.0',
  true
);

-- Space Shooter Game
INSERT INTO games (
  slug, title, description, thumbnail_url,
  category, tags, developer_name, package_name, version, featured
) VALUES (
  'space-shooter',
  'Space Shooter',
  'Defend Earth from alien invaders! Use arrow keys to move and spacebar to shoot.',
  '/games/space-shooter/thumbnail.png',
  'Shooter',
  ARRAY['space', 'action', 'arcade'],
  'Game Portal Team',
  'space-shooter',
  '1.0.0',
  true
);
```

## Step 4: Configure Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 5: Enable Analytics (Optional)

Vercel provides built-in analytics:

1. Go to your project in Vercel
2. Click "Analytics" tab
3. Enable analytics

## Environment Variables

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional variables:

```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your main branch.

### Manual Deployments

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Troubleshooting

### Build Errors

**Issue**: Build fails with TypeScript errors

**Solution**: Check `tsconfig.json` and ensure all types are correct

**Issue**: Missing environment variables

**Solution**: Add variables in Vercel dashboard under Settings → Environment Variables

### Database Connection Issues

**Issue**: Can't connect to Supabase

**Solution**: 
1. Verify environment variables are correct
2. Check Supabase project is active
3. Verify API keys haven't been rotated

### Game Loading Issues

**Issue**: Games don't load

**Solution**:
1. Check game is in database
2. Verify package name matches folder name
3. Check browser console for errors

## Performance Optimization

### Image Optimization

Use Next.js Image component for thumbnails:

```typescript
import Image from 'next/image'

<Image
  src={game.thumbnailUrl}
  alt={game.title}
  width={800}
  height={450}
/>
```

### Caching

Adjust revalidation time in pages:

```typescript
export const revalidate = 60 // Revalidate every 60 seconds
```

### Database Indexes

Ensure indexes are created (already in schema.sql):
- Games by slug
- Games by category
- Leaderboards by score

## Monitoring

### Vercel Analytics

Monitor:
- Page views
- Response times
- Error rates

### Supabase Logs

Check:
- Database queries
- API usage
- Error logs

## Security

### Environment Variables

- Never commit `.env.local`
- Use Vercel environment variables
- Rotate keys regularly

### Database Security

- Row Level Security (RLS) is enabled
- Public read access only
- Validate all inputs

## Scaling

### Database

Supabase automatically scales, but consider:
- Upgrading plan for more connections
- Adding read replicas
- Optimizing queries

### Vercel

- Automatic scaling included
- Consider Pro plan for:
  - More bandwidth
  - Better analytics
  - Priority support

## Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
- Game Portal: Open a GitHub issue

---

Happy deploying! 🚀

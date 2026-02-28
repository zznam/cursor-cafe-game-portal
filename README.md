# 🎮 Game Portal

A vibrant Next.js-powered portal for hosting multiple Phaser games from developers around the world.

![Game Portal](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Phaser](https://img.shields.io/badge/Phaser-3-blue?style=for-the-badge&logo=phaser)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- 🎯 **Dynamic Game Loading** - Games loaded via dynamic imports with shared Next.js context
- 🏆 **Leaderboards** - Track high scores for each game
- ⭐ **Ratings & Reviews** - Community-driven game ratings
- 💬 **Comments** - Discuss games with other players
- ❤️ **Favorites** - Bookmark your favorite games (localStorage)
- 📊 **Analytics** - Track plays, sessions, and user behavior
- 🎨 **Gaming-Focused Design** - Vibrant, modern UI with Tailwind CSS + shadcn/ui
- 🚀 **Vercel Ready** - Optimized for Vercel deployment
- 📦 **Monorepo Structure** - Each game as a package for easy contribution

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Game Engine**: Phaser 3
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript (relaxed mode)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/cursor-cafe-game-portal.git
cd cursor-cafe-game-portal
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

- Create a new Supabase project
- Run the SQL schema from `supabase/schema.sql`
- Copy your project URL and anon key

4. **Configure environment variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the portal.

## 🎮 Adding Games

### Game Structure

Each game lives in the `games/` directory:

```
games/
  your-game-name/
    index.ts          # Main game export
    scenes/           # Phaser scenes (optional)
    assets/           # Game assets (optional)
    README.md         # Game documentation
```

### Game Template

Create `games/your-game/index.ts`:

```typescript
import Phaser from 'phaser'

class YourGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'YourGameScene' })
  }

  create() {
    // Your game logic
  }

  update() {
    // Game loop
  }
}

export default {
  metadata: {
    slug: 'your-game-slug',
    title: 'Your Game Title',
    description: 'A fun and exciting game!',
    thumbnailUrl: '/games/your-game/thumbnail.png',
    category: 'Action',
    tags: ['arcade', 'fun'],
    developerName: 'Your Name',
    packageName: 'your-game-name',
    version: '1.0.0'
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      scene: [YourGameScene]
    })
  }
}
```

### Add to Database

Insert your game into Supabase:

```sql
INSERT INTO games (
  slug, title, description, thumbnail_url,
  category, tags, developer_name, package_name, version
) VALUES (
  'your-game-slug',
  'Your Game Title',
  'A fun and exciting game!',
  '/games/your-game/thumbnail.png',
  'Action',
  ARRAY['arcade', 'fun'],
  'Your Name',
  'your-game-name',
  '1.0.0'
);
```

## 📊 Database Schema

The portal uses the following tables:

- **games** - Game metadata and statistics
- **ratings** - User ratings and reviews
- **comments** - Game comments
- **leaderboards** - High scores
- **analytics** - Play tracking and events

See `supabase/schema.sql` for the complete schema.

## 🎨 Categories

Available game categories:

- Action
- Arcade
- Puzzle
- Strategy
- Adventure
- Platformer
- Shooter
- Racing
- Sports
- Other

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your game in the `games/` directory
3. Add game metadata to Supabase
4. Test locally
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📝 License

MIT License - feel free to use this project for your own game portal!

## 🙏 Credits

- Built with [Next.js](https://nextjs.org/)
- Games powered by [Phaser](https://phaser.io/)
- Database by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cursor-cafe-game-portal)

1. Click the button above
2. Add your Supabase environment variables
3. Deploy!

## 📧 Support

For questions or issues, please open a GitHub issue or contact the maintainers.

---

Made with ❤️ by the Game Portal Team

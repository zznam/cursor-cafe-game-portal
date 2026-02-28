# Contributing to Game Portal

Thank you for your interest in contributing to Game Portal! This document provides guidelines for contributing games and improvements to the platform.

## 🎮 Contributing a Game

### Requirements

- Game must be built with Phaser 3
- All assets must be properly licensed
- Game must be appropriate for all audiences
- No copyright violations
- Optimized for web delivery

### Step-by-Step Guide

#### 1. Fork and Clone

```bash
git clone https://github.com/yourusername/cursor-cafe-game-portal.git
cd cursor-cafe-game-portal
npm install
```

#### 2. Create Your Game Package

Create a new directory in `games/`:

```bash
mkdir games/my-awesome-game
```

#### 3. Implement Your Game

Create `games/my-awesome-game/index.ts`:

```typescript
import Phaser from 'phaser'

class MyGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MyGameScene' })
  }

  preload() {
    // Load assets
  }

  create() {
    // Initialize game
  }

  update() {
    // Game loop
  }
}

export default {
  metadata: {
    slug: 'my-awesome-game',
    title: 'My Awesome Game',
    description: 'An exciting new game that will blow your mind!',
    thumbnailUrl: '/games/my-awesome-game/thumbnail.png',
    bannerUrl: '/games/my-awesome-game/banner.png', // Optional
    category: 'Action', // See available categories
    tags: ['arcade', 'fun', 'multiplayer'],
    developerName: 'Your Name',
    developerUrl: 'https://yourwebsite.com', // Optional
    packageName: 'my-awesome-game',
    version: '1.0.0'
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [MyGameScene]
    })
  }
}
```

#### 4. Add Assets

Place your game assets in the appropriate directories:

```
games/my-awesome-game/
  index.ts
  scenes/
    MenuScene.ts
    GameScene.ts
  assets/
    sprites/
    sounds/
    music/
  README.md
```

Add thumbnail and banner images to `public/games/my-awesome-game/`:

- `thumbnail.png` (required) - 800x450px recommended
- `banner.png` (optional) - 1920x400px recommended

#### 5. Create Documentation

Create `games/my-awesome-game/README.md`:

```markdown
# My Awesome Game

Brief description of your game.

## How to Play

- Controls explanation
- Objectives
- Tips and tricks

## Features

- Feature 1
- Feature 2
- Feature 3

## Credits

- Developer: Your Name
- Music: Attribution
- Assets: Attribution

## Version History

### 1.0.0
- Initial release
```

#### 6. Test Locally

```bash
npm run dev
```

Navigate to your game and test thoroughly:
- All features work correctly
- No console errors
- Responsive on different screen sizes
- Assets load properly

#### 7. Add to Database

Create a migration file or add instructions in your PR for adding the game to Supabase:

```sql
INSERT INTO games (
  slug,
  title,
  description,
  thumbnail_url,
  banner_url,
  category,
  tags,
  developer_name,
  developer_url,
  package_name,
  version
) VALUES (
  'my-awesome-game',
  'My Awesome Game',
  'An exciting new game that will blow your mind!',
  '/games/my-awesome-game/thumbnail.png',
  '/games/my-awesome-game/banner.png',
  'Action',
  ARRAY['arcade', 'fun', 'multiplayer'],
  'Your Name',
  'https://yourwebsite.com',
  'my-awesome-game',
  '1.0.0'
);
```

#### 8. Submit Pull Request

Create a pull request with:

- **Title**: `[Game] My Awesome Game`
- **Description**:
  - Game overview
  - Screenshots/GIFs
  - How to test
  - Database setup instructions
  - Asset attributions

## 🎨 Design Guidelines

### Game Canvas

- Recommended size: 800x600px
- Must be responsive
- Support different aspect ratios

### Assets

- Optimize images (use PNG/WebP)
- Compress audio files
- Keep total game size under 10MB
- Use CDN for large assets

### Performance

- Target 60 FPS
- Efficient asset loading
- Proper memory management
- No memory leaks

## 📋 Code Style

- Use TypeScript
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names
- Keep functions small and focused

## 🔍 Review Process

1. Automated checks (linting, build)
2. Code review by maintainers
3. Testing on multiple devices
4. Asset verification
5. Merge and deploy

## 🐛 Reporting Issues

Found a bug? Please open an issue with:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Browser and device information

## 💡 Feature Requests

Have an idea? Open an issue with:

- Feature description
- Use case
- Potential implementation approach
- Examples from other platforms

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution makes Game Portal better for everyone. Thank you for being part of our community!

## 📧 Questions?

- Open a GitHub issue
- Join our Discord (coming soon)
- Email: support@gameportal.example

---

Happy game development! 🎮

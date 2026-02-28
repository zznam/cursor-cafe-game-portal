const fs = require('fs');
const path = require('path');

const games = [
  { slug: 'neon-snake', title: 'Neon Snake', category: 'Action', tags: "ARRAY['arcade', 'snake']", desc: 'A modern, neon-drenched take on the classic Snake game.' },
  { slug: 'asteroid-sweeper', title: 'Asteroid Sweeper', category: 'Action', tags: "ARRAY['arcade', 'space']", desc: 'Top-down shooter where players clear asteroid fields.' },
  { slug: 'flappy-dragon', title: 'Flappy Dragon', category: 'Platformer', tags: "ARRAY['arcade', 'flying']", desc: 'Navigate a flying dragon through volcanic pillars.' },
  { slug: 'neon-pong-pvp', title: 'Neon Pong PvP', category: 'Sports', tags: "ARRAY['arcade', 'pong']", desc: 'A competitive pong game featuring dynamic paddles.' },
  { slug: 'platform-jumper', title: 'Platform Jumper', category: 'Platformer', tags: "ARRAY['arcade', 'jumping']", desc: 'Endless vertical jumping game.' },
  { slug: 'minesweeper-quantum', title: 'Minesweeper Quantum', category: 'Puzzle', tags: "ARRAY['strategy', 'logic']", desc: 'Classic minesweeper but with quantum probability.' },
  { slug: 'hexagon-match-3', title: 'Hexagon Match 3', category: 'Puzzle', tags: "ARRAY['casual', 'matching']", desc: 'A Match-3 game played on a hexagonal grid.' },
  { slug: 'word-scramble-rush', title: 'Word Scramble Rush', category: 'Puzzle', tags: "ARRAY['word', 'typing']", desc: '60-second typing and anagram puzzle.' },
  { slug: 'sudoku-zen', title: 'Sudoku Zen', category: 'Puzzle', tags: "ARRAY['logic', 'relaxing']", desc: 'A relaxing Sudoku game with minimalist graphics.' },
  { slug: 'tower-defense-lite', title: 'Tower Defense Lite', category: 'Strategy', tags: "ARRAY['defense', 'tactical']", desc: 'Build towers along a path to stop waves of enemies.' },
  { slug: 'pixel-ninja-dash', title: 'Pixel Ninja Dash', category: 'Action', tags: "ARRAY['runner', 'ninja']", desc: 'Endless auto-runner with shurikens.' },
  { slug: 'dungeon-crawler-miner', title: 'Dungeon Crawler Miner', category: 'Adventure', tags: "ARRAY['rpg', 'mining']", desc: 'Dig down into a grid-based mine.' },
  { slug: 'gravity-flip-grappler', title: 'Gravity Flip Grappler', category: 'Platformer', tags: "ARRAY['physics', 'swinging']", desc: 'Invert gravity and swing from the ceiling.' },
  { slug: 'neon-hoverboard-rider', title: 'Neon Hoverboard Rider', category: 'Racing', tags: "ARRAY['side-scroller', 'racing']", desc: 'Time your jumps to grind rails and avoid gaps.' },
  { slug: 'maze-runner-3d', title: 'Maze Runner 3D', category: 'Adventure', tags: "ARRAY['3d', 'maze']", desc: 'Navigate a pseudo-3D maze and find the exit.' },
  { slug: 'drift-king-2d', title: 'Drift King 2D', category: 'Racing', tags: "ARRAY['driving', 'drifting']", desc: 'Top-down racing game focusing heavily on drifting.' },
  { slug: 'retro-hoops', title: 'Retro Hoops', category: 'Sports', tags: "ARRAY['physics', 'basketball']", desc: 'Shoot a basketball into a moving hoop.' },
  { slug: 'mini-golf-course', title: 'Mini Golf Course', category: 'Sports', tags: "ARRAY['physics', 'golf']", desc: 'A drag-and-release physics game featuring mini-golf.' },
  { slug: 'endless-highway-rider', title: 'Endless Highway Rider', category: 'Racing', tags: "ARRAY['driving', 'retro']", desc: 'Outrun traffic on a motorcycle on an isometric highway.' },
  { slug: 'penalty-shootout-pro', title: 'Penalty Shootout Pro', category: 'Sports', tags: "ARRAY['soccer', 'sports']", desc: 'Strike a soccer ball past a dynamically moving AI goalkeeper.' }
];

const gamesDir = path.join(__dirname, '..', 'games');

const generateTemplate = (game) => `import * as Phaser from 'phaser'

class ${game.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Scene extends Phaser.Scene {
  constructor() {
    super({ key: '${game.slug}Scene' })
  }

  create() {
    this.add.text(400, 300, '${game.title}\\nComing Soon...', {
      fontSize: '48px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)
  }

  update() {
    // Game loop
  }
}

export default {
  metadata: {
    slug: '${game.slug}',
    title: '${game.title.replace(/'/g, "\\'")}',
    description: '${game.desc.replace(/'/g, "\\'")}',
    thumbnailUrl: '/games/${game.slug}/thumbnail.png',
    category: '${game.category}',
    tags: ${game.tags.replace("ARRAY", "")},
    developerName: 'Game Portal Team',
    packageName: '${game.slug}',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      scene: [${game.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Scene]
    })
  }
}
`;

let sqlImports = `-- Populate database with new 20 games\\n\\n`;

games.forEach(game => {
  const targetDir = path.join(gamesDir, game.slug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDir, 'index.ts'), generateTemplate(game));

  sqlImports += `INSERT INTO games (slug, title, description, thumbnail_url, category, tags, developer_name, package_name, version) VALUES ('${game.slug}', '${game.title.replace(/'/g, "''")}', '${game.desc.replace(/'/g, "''")}', '/games/${game.slug}/thumbnail.png', '${game.category}', ${game.tags}, 'Game Portal Team', '${game.slug}', '1.0.0') ON CONFLICT (slug) DO NOTHING;\n`;
});

fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'seed-20-games.sql'), sqlImports);
console.log('Finished scaffolding 20 games and SQL seed.');

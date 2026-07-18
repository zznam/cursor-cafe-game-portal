const fs = require('fs');
const path = require('path');

// Games that still need thumbnails
const games = [
  { slug: 'neon-snake', title: 'Neon Snake', color1: '#00ff88', color2: '#00aa55', emoji: '🐍', bg: '#0a1628' },
  { slug: 'penalty-shootout-pro', title: 'Penalty Shootout Pro', color1: '#22c55e', color2: '#16a34a', emoji: '⚽', bg: '#0a200a' },
  { slug: 'pixel-ninja-dash', title: 'Pixel Ninja Dash', color1: '#ef4444', color2: '#991b1b', emoji: '🥷', bg: '#1a0a0a' },
  { slug: 'platform-jumper', title: 'Platform Jumper', color1: '#3b82f6', color2: '#1d4ed8', emoji: '🏃', bg: '#0a0a2a' },
  { slug: 'retro-hoops', title: 'Retro Hoops', color1: '#f97316', color2: '#c2410c', emoji: '🏀', bg: '#1a100a' },
  { slug: 'snake', title: 'Snake Classic', color1: '#4ade80', color2: '#166534', emoji: '🐍', bg: '#0a1a0a' },
  { slug: 'space-shooter', title: 'Space Shooter', color1: '#8b5cf6', color2: '#5b21b6', emoji: '🚀', bg: '#0a0a2a' },
  { slug: 'sudoku-zen', title: 'Sudoku Zen', color1: '#06b6d4', color2: '#0e7490', emoji: '🧩', bg: '#0a1a1a' },
  { slug: 'tower-defense-lite', title: 'Tower Defense Lite', color1: '#eab308', color2: '#a16207', emoji: '🏰', bg: '#1a1a0a' },
  { slug: 'word-scramble-rush', title: 'Word Scramble Rush', color1: '#ec4899', color2: '#be185d', emoji: '📝', bg: '#1a0a1a' },
];

function createSVGThumbnail(game) {
  return `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${game.bg}"/>
      <stop offset="50%" style="stop-color:${game.color2}33"/>
      <stop offset="100%" style="stop-color:${game.bg}"/>
    </linearGradient>
    <linearGradient id="title" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${game.color1}"/>
      <stop offset="100%" style="stop-color:white"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="bigGlow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="450" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="200" cy="100" r="150" fill="${game.color1}" opacity="0.05" filter="url(#bigGlow)"/>
  <circle cx="600" cy="350" r="200" fill="${game.color2}" opacity="0.08" filter="url(#bigGlow)"/>
  <circle cx="400" cy="225" r="100" fill="${game.color1}" opacity="0.03" filter="url(#bigGlow)"/>
  
  <!-- Grid pattern -->
  <g opacity="0.05">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="450" stroke="${game.color1}" stroke-width="0.5"/>`).join('\n    ')}
    ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="800" y2="${i * 40}" stroke="${game.color1}" stroke-width="0.5"/>`).join('\n    ')}
  </g>
  
  <!-- Emoji icon -->
  <text x="400" y="180" font-size="100" text-anchor="middle" filter="url(#glow)">${game.emoji}</text>
  
  <!-- Title -->
  <text x="400" y="290" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="url(#title)" text-anchor="middle" filter="url(#glow)">${game.title}</text>
  
  <!-- Subtitle -->
  <text x="400" y="330" font-family="Arial, sans-serif" font-size="18" fill="white" opacity="0.5" text-anchor="middle">Cursor Café Game Portal</text>
  
  <!-- Border glow -->
  <rect x="2" y="2" width="796" height="446" rx="8" fill="none" stroke="${game.color1}" stroke-width="1" opacity="0.3"/>
</svg>`;
}

const publicDir = path.join(__dirname, '..', 'public', 'games');

for (const game of games) {
  const dir = path.join(publicDir, game.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check if a real thumbnail already exists (not the 1x1 placeholder)
  const thumbPath = path.join(dir, 'thumbnail.png');
  const existingSize = fs.existsSync(thumbPath) ? fs.statSync(thumbPath).size : 0;

  if (existingSize > 1000) {
    console.log(`⏭️  Skipping ${game.slug} (already has real thumbnail: ${existingSize} bytes)`);
    continue;
  }

  // Write SVG thumbnail
  const svgPath = path.join(dir, 'thumbnail.svg');
  fs.writeFileSync(svgPath, createSVGThumbnail(game));
  console.log(`✅ Created SVG thumbnail for ${game.slug}`);
}

console.log('\n🎨 Done! SVG thumbnails created for games without generated images.');
console.log('Note: These are high-quality SVG thumbnails that will render beautifully at any size.');

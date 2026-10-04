export const GAME_CONTROLS: Record<
  string,
  { title: string; controls: string[]; tips?: string[] }
> = {
  'coffee-connections': {
    title: 'Coffee Connections',
    controls: ['Connect the machine on the left to the cup on the right.', 'Tap a pipe to rotate it, or select with arrows and press Enter.', 'No timer. Fewer rotations gives a better result.'],
  },
  'pastry-blocks': {
    title: 'Pastry Blocks',
    controls: ['Fill complete rows or columns to clear space on the tray.', 'Drag the pastry onto the board, or tap its top-left destination.', 'Arrows + Enter also work. The round ends when the next piece cannot fit.'],
  },
  'cup-stack': {
    title: 'Cup Stack',
    controls: ['Tap or press Space to start, then again to place each layer.', 'Keep the moving layer aligned with the tower. Overhang falls away.', 'A miss ends the round. Build higher and preserve more width.'],
  },
  'sugar-orbit': {
    title: 'Sugar Orbit',
    controls: ['Tap or press Space to start orbiting the cup.', 'Tap or press Space again to reverse direction.', 'Dodge the approaching sugar cubes. A collision ends the round.'],
  },
  breakout: {
    title: 'Breakout Classic',
    controls: ['← → Arrow Keys to move paddle'],
    tips: ["Break all bricks to win!", "Don't let the ball fall!"],
  },
  'space-shooter': {
    title: 'Space Shooter',
    controls: ['← → Arrow Keys to move', 'Space to shoot'],
    tips: ['Destroy enemies before they reach you!', 'Avoid enemy collisions!'],
  },
  snake: {
    title: 'Neon Snake',
    controls: ['← → ↑ ↓ Arrow Keys to change direction'],
    tips: ['Eat food to grow longer!', "Don't crash into walls or yourself!", 'Speed increases as you eat!'],
  },
  'flappy-bird': {
    title: 'Neon Flap',
    controls: ['Space / Click / ↑ to flap'],
    tips: ['Time your flaps carefully!', 'The gap gets smaller as you score!'],
  },
  '2048': {
    title: '2048',
    controls: ['← → ↑ ↓ Arrow Keys to slide tiles'],
    tips: ['Merge matching numbers!', 'Keep your highest tile in a corner!', 'Plan moves ahead!'],
  },
  'memory-match': {
    title: 'Memory Match',
    controls: ['Click to flip cards'],
    tips: ['Remember card positions!', 'Fewer moves = higher score!', 'Watch the timer!'],
  },
  'infinite-runner': {
    title: 'Neon Run',
    controls: ['Space / ↑ to jump', 'Double-tap for double jump'],
    tips: ['Collect coins for bonus points!', 'Watch for flying obstacles!', 'Speed increases over time!'],
  },
}

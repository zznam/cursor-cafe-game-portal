export const GAME_CONTROLS: Record<
  string,
  { title: string; controls: string[]; tips?: string[] }
> = {
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

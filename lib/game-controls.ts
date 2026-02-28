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
}

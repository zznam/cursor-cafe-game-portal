# Game Integration Guide

This guide explains how to integrate your Phaser game with the Game Portal features like leaderboards, analytics, and user tracking.

## Basic Integration

Your game automatically gets:
- Play count tracking
- Session analytics
- Basic event tracking

## Using the Game API Hook

For advanced features, use the `useGameApi` hook in your game components:

```typescript
import { useGameApi } from '@/hooks/use-game-api'

function YourGameComponent({ gameId }: { gameId: string }) {
  const { submitScore, trackGameComplete, trackGameQuit } = useGameApi(gameId)

  // When player finishes the game
  const handleGameComplete = async (finalScore: number) => {
    await trackGameComplete({ score: finalScore, level: 10 })
    
    // Submit to leaderboard
    const username = prompt('Enter your name for the leaderboard:')
    if (username) {
      await submitScore(finalScore, username)
    }
  }

  // When player quits
  const handleGameQuit = async () => {
    await trackGameQuit({ reason: 'user_quit' })
  }

  return <div>Your game here</div>
}
```

## Phaser Scene Integration

You can also integrate directly in your Phaser scenes:

```typescript
import Phaser from 'phaser'
import { Analytics } from '@/lib/analytics'
import { submitScore } from '@/lib/api'
import { getUserId } from '@/lib/game-loader'

class GameScene extends Phaser.Scene {
  private gameId: string
  private score = 0

  constructor(gameId: string) {
    super({ key: 'GameScene' })
    this.gameId = gameId
  }

  create() {
    // Your game setup
  }

  gameOver() {
    // Track game completion
    Analytics.trackComplete(this.gameId, {
      score: this.score,
      duration: this.time.now
    })

    // Prompt for leaderboard submission
    this.promptLeaderboardSubmission()
  }

  async promptLeaderboardSubmission() {
    // In a real implementation, you'd use a proper UI
    const username = prompt('Enter your name:')
    if (username) {
      try {
        await submitScore(this.gameId, this.score, username, {
          timestamp: Date.now()
        })
        alert('Score submitted!')
      } catch (error) {
        console.error('Failed to submit score:', error)
      }
    }
  }
}
```

## Available Analytics Events

### Automatic Events
- `play` - Tracked when game loads
- Play count increment

### Manual Events
- `complete` - Game finished
- `quit` - Player quit early
- `score_submit` - Score submitted to leaderboard

### Custom Events

You can track custom events:

```typescript
import { Analytics } from '@/lib/analytics'

// Track any custom event
Analytics.trackEvent({
  gameId: 'your-game-id',
  eventType: 'level_complete',
  metadata: {
    level: 5,
    time: 120,
    stars: 3
  }
})
```

## Leaderboard Integration

### Submit Score

```typescript
import { submitScore } from '@/lib/api'

await submitScore(
  gameId,
  score,
  username,
  {
    // Optional metadata
    level: 10,
    difficulty: 'hard',
    timestamp: Date.now()
  }
)
```

### Get Leaderboard

```typescript
import { getLeaderboard } from '@/lib/api'

const topScores = await getLeaderboard(gameId, 10)
```

## User Identification

The portal uses anonymous user IDs stored in localStorage:

```typescript
import { getUserId } from '@/lib/game-loader'

const userId = getUserId()
// Returns: "anon-1234567890-abc123"
```

## Favorites System

Allow players to favorite your game:

```typescript
import { toggleFavorite, isFavorite } from '@/lib/game-loader'

// Check if game is favorited
const favorited = isFavorite(gameId)

// Toggle favorite status
const newState = toggleFavorite(gameId)
```

## Session Management

Sessions are automatically managed:

```typescript
import { Analytics } from '@/lib/analytics'

// Get current session ID
const sessionId = Analytics.getSessionId()
```

## Best Practices

### 1. Track Meaningful Events

Only track events that provide value:

```typescript
// Good
Analytics.trackComplete(gameId, { score, level, duration })

// Bad - too granular
Analytics.trackEvent({ eventType: 'button_click' })
```

### 2. Submit Scores at Appropriate Times

```typescript
// Good - at game end
gameOver() {
  this.promptLeaderboardSubmission()
}

// Bad - during gameplay
update() {
  if (this.score > this.lastScore) {
    submitScore(this.gameId, this.score, 'Player')
  }
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  await submitScore(gameId, score, username)
  this.showSuccessMessage()
} catch (error) {
  console.error('Failed to submit score:', error)
  this.showErrorMessage('Could not submit score. Please try again.')
}
```

### 4. Respect User Privacy

```typescript
// Don't track sensitive information
Analytics.trackComplete(gameId, {
  score: 1000,
  // Don't include: email, IP, personal data
})
```

## Example: Complete Integration

Here's a complete example of a well-integrated game:

```typescript
import Phaser from 'phaser'
import { Analytics } from '@/lib/analytics'
import { submitScore } from '@/lib/api'

class MyGameScene extends Phaser.Scene {
  private gameId: string
  private score = 0
  private startTime = 0

  constructor(gameId: string) {
    super({ key: 'MyGameScene' })
    this.gameId = gameId
  }

  create() {
    this.startTime = Date.now()
    // Game setup
  }

  update() {
    // Game loop
  }

  async gameOver() {
    const duration = Date.now() - this.startTime

    // Track completion
    await Analytics.trackComplete(this.gameId, {
      score: this.score,
      duration,
      level: this.currentLevel
    })

    // Show game over screen
    this.showGameOverScreen()

    // Prompt for leaderboard
    await this.handleLeaderboardSubmission()
  }

  async handleLeaderboardSubmission() {
    // In production, use a proper dialog
    const submit = confirm('Submit score to leaderboard?')
    if (!submit) return

    const username = prompt('Enter your name:')
    if (!username) return

    try {
      await submitScore(
        this.gameId,
        this.score,
        username,
        {
          level: this.currentLevel,
          duration: Date.now() - this.startTime
        }
      )
      alert('Score submitted successfully!')
    } catch (error) {
      console.error('Failed to submit score:', error)
      alert('Failed to submit score. Please try again.')
    }
  }

  shutdown() {
    // Track quit if game not completed
    if (!this.gameCompleted) {
      Analytics.trackQuit(this.gameId, {
        score: this.score,
        level: this.currentLevel
      })
    }
  }
}

export default {
  metadata: {
    slug: 'my-game',
    title: 'My Game',
    // ... other metadata
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      scene: [new MyGameScene('game-id-from-database')]
    })
  }
}
```

## Testing Your Integration

1. **Test locally**: Run `npm run dev` and play your game
2. **Check console**: Look for analytics events in browser console
3. **Verify database**: Check PostgreSQL for analytics and leaderboard entries
4. **Test error cases**: Try submitting with invalid data

## Troubleshooting

### Scores not appearing in leaderboard

- Check game ID matches database
- Verify server-side database connectivity and `/api/health/ready`
- Check browser console for errors

### Analytics not tracking

- Ensure environment variables are set
- Check API responses and server-side database permissions
- Verify session ID generation

### User ID issues

- Clear localStorage and test again
- Check browser privacy settings
- Verify getUserId() returns valid ID

## Support

For integration help:
- Check the examples in `games/` directory
- Open a GitHub issue
- Review the API documentation in `lib/api.ts`

---

Happy integrating! 🎮

## Café runtime (v1)

New games may accept a second, optional `GameRuntime` argument in `createGame`.
Existing one-argument factories remain supported. The runtime contains `daily`
(date, stable seed, rules version and practice status), scoped `input` actions,
`onReady`, `onInteraction`, `onResult`, and a `soundEnabled` preference getter.
Call `onInteraction` only when gameplay begins and `onResult` once per terminal
round. The player owns restarts, saving, pause, sound preferences and result sharing.
Never read React hooks inside Phaser scenes.

Results have a nonnegative numeric `score`, optional `secondary` tie-breaker and a
short readable `label`. Coffee Connections uses lower scores; the other café games
use higher scores, then higher secondary values. Arcade scenes advance in fixed
1/60-second steps. Date-based seeds must never use unseeded randomness.

Record discovery and input capabilities in `lib/game-capabilities.json`. The
catalog seeder reads static metadata without importing Phaser, and refreshes
catalog descriptions while retaining IDs, activity and editorial featured flags.
Use `npm run db:migrate` followed by `npm run db:seed` when installing this release.

Touch controls dispatch scoped key actions to existing Phaser listeners. Keep
keyboard targets attached to the player, release held inputs on blur/cancellation,
and refresh scale bounds when the canvas scrolls or resizes. Touch buttons live
outside the canvas. The player emits `INPUT_CANCEL_EVENT` on scene input plugins
before resetting pointers; games with drag or charge state must discard pending
actions on this event and on `pointerupoutside`. Minesweeper reads `touchFlag` from its game registry; dense
boards use explicit play/pan modes. Test real touch, including simultaneous inputs.

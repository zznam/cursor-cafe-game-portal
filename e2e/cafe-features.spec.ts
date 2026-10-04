import { test, expect } from '@playwright/test'
import { createPipes, rotatePipe } from '../lib/cafe-rules'
import { dailyChallenge } from '../lib/daily'

test('discovery filters persist in the URL and random selection respects the complete query', async ({
  page,
  request,
}) => {
  await page.goto('/games')
  await page.getByLabel('Mood', { exact: true }).selectOption('Relaxed')
  await page.getByLabel('Session length', { exact: true }).selectOption('quick')
  await page.getByLabel('Input support', { exact: true }).selectOption('true')
  await page.getByRole('button', { name: 'Find games', exact: true }).click()
  await expect(page).toHaveURL(/mood=Relaxed/)
  await expect(
    page.getByRole('heading', { name: 'Coffee Connections', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Mood', { exact: true })).toHaveValue('Relaxed')
  for (let i = 0; i < 3; i++) {
    const response = await request.get(
      '/api/games/random?mood=Relaxed&duration=quick&touch=true&offset=9999',
    )
    expect(response.ok()).toBe(true)
    const game = await response.json()
    expect(game.mood).toBe('Relaxed')
    expect(game.sessionMinutes).toBeLessThanOrEqual(3)
    expect(game.touch).toBe(true)
  }
  const unique = await request.get('/api/games/random?search=Sugar%20Orbit')
  expect((await unique.json()).slug).toBe('sugar-orbit')
  expect((await request.get('/api/daily?date=2099-01-01')).status()).toBe(400)
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('31 games')
})

test('a real solved daily puzzle records results and can be replayed from a dated link', async ({
  page,
  request,
  isMobile,
}) => {
  const today = await (await request.get('/api/daily')).json()
  let challenge = dailyChallenge(today.date, new Date(today.date))
  for (let n = 0; challenge.slug !== 'coffee-connections'; n++)
    challenge = dailyChallenge(
      new Date(Date.parse(today.date) - (n + 1) * 86400000)
        .toISOString()
        .slice(0, 10),
      new Date(today.date),
    )
  await page.goto(`/daily?date=${challenge.date}`)
  await page.getByRole('button', { name: '▶ Play', exact: true }).click()
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  const puzzle = createPipes(challenge.seed)
  for (let i = 0; i < 25; i++) {
    if (!puzzle.solution[i]) continue
    let value = puzzle.tiles[i]
    for (let r = 0; r < 4 && value !== puzzle.solution[i]; r++) {
      if (
        await page
          .getByRole('button', { name: 'Play again', exact: true })
          .isVisible()
      )
        break
      const box = (await canvas.boundingBox())!
      const position = {
        x: ((140 + (i % 5) * 80) / 600) * box.width,
        y: ((175 + Math.floor(i / 5) * 80) / 640) * box.height,
      }
      if (isMobile) await canvas.tap({ position })
      else await canvas.click({ position })
      value = rotatePipe(value)
    }
  }
  await expect(
    page.getByRole('heading', { name: /Coffee served in/ }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Share result', exact: true }),
  ).toBeVisible()
  await page.goto('/passport')
  await expect(
    page.getByText(
      `1 stamps collected · ${challenge.practice ? 1 : 2} of 8 badges`,
    ),
  ).toBeVisible()
  await expect(page.getByText(/Best: Coffee served/)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/Best: Coffee served/)).toBeVisible()
  await page.goto(`/daily?date=${challenge.date}`)
  await expect(page.getByText(/Your best: Coffee served/)).toBeVisible()
})

test('tabs merge independent stamps and storage failures keep the game usable', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('cafe:v1:activity:broken', '{bad json')
    localStorage.setItem('cafe:v1:activity:old', JSON.stringify({ version: 7 }))
  })
  await page.goto('/passport')
  await expect(
    page.getByText('0 stamps collected · 0 of 8 badges'),
  ).toBeVisible()
  const other = await context.newPage()
  await other.bringToFront()
  await other.goto('/games/2048')
  await other.getByRole('button', { name: '▶ Play', exact: true }).click()
  await expect(other.locator('canvas')).toBeVisible()
  // Phaser inserts its canvas before boot completes and the player takes focus.
  await expect(other.getByText('Loading game…', { exact: true })).toHaveCount(0)
  await expect(
    other.getByRole('group', { name: '2048 game', exact: true }),
  ).toBeFocused()
  await other.keyboard.press('ArrowLeft')
  await page.bringToFront()
  await expect(
    page.getByText('1 stamps collected · 1 of 8 badges'),
  ).toBeVisible()
  await other.close()
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Unavailable', 'QuotaExceededError')
    }
  })
  await page.goto('/games/cup-stack')
  await page.getByRole('button', { name: '▶ Play', exact: true }).click()
  await expect(page.locator('canvas')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(page.getByText(/Saving is unavailable/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Pause', exact: true }),
  ).toBeEnabled()
})

test('sharing falls back to selectable text when browser sharing and clipboard fail', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: async () => {
        throw new Error('Sharing unavailable')
      },
      configurable: true,
    })
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Denied')
        },
      },
      configurable: true,
    })
  })
  await page.goto('/games/cup-stack')
  await page.getByRole('button', { name: '▶ Play', exact: true }).click()
  await page.getByRole('button', { name: '🔗 Share', exact: true }).click()
  await expect(
    page.getByRole('textbox', { name: 'Copy this text to share' }),
  ).toHaveValue(/\/games\/cup-stack$/)
})

for (const slug of ['pastry-blocks', 'cup-stack', 'sugar-orbit']) {
  test(`${slug} finishes a seeded round and saves its personal best`, async ({
    page,
    request,
    isMobile,
  }) => {
    test.setTimeout(60000)
    const { canPlace, placePiece, pieceAt } = await import('../lib/cafe-rules')
    const today = await (await request.get('/api/daily')).json()
    let challenge = dailyChallenge(today.date, new Date(today.date))
    for (let n = 0; challenge.slug !== slug; n++)
      challenge = dailyChallenge(
        new Date(Date.parse(today.date) - (n + 1) * 86400000)
          .toISOString()
          .slice(0, 10),
        new Date(today.date),
      )
    await page.goto(`/daily?date=${challenge.date}`)
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    async function tap(x: number, y: number) {
      const box = (await canvas.boundingBox())!,
        position = {
          x: (x / 600) * box.width,
          y: (y / (slug === 'pastry-blocks' ? 720 : 640)) * box.height,
        }
      if (isMobile) await canvas.tap({ position })
      else await canvas.click({ position })
    }
    if (slug === 'pastry-blocks') {
      let board = Array<number>(64).fill(0),
        score = 0
      for (let i = 0; i < 30; i++) {
        const piece = pieceAt(challenge.seed, i),
          cell = board.findIndex((_, index) =>
            canPlace(board, piece, index % 8, Math.floor(index / 8)),
          )
        if (cell < 0) break
        const placed = placePiece(board, piece, cell % 8, Math.floor(cell / 8))!
        board = placed.board
        score += placed.score
        await tap(125 + (cell % 8) * 50, 145 + Math.floor(cell / 8) * 50)
      }
      await expect(
        page.getByRole('heading', { name: new RegExp(`^${score} points`) }),
      ).toBeVisible()
    } else if (slug === 'cup-stack') {
      for (let i = 0; i < 8; i++) {
        if (
          await page
            .getByRole('button', { name: 'Play again', exact: true })
            .isVisible()
        )
          break
        await tap(300, 330)
      }
      await expect(
        page.getByRole('heading', { name: /layers · .* width/ }),
      ).toBeVisible()
    } else {
      await tap(300, 330)
      await expect(
        page.getByRole('heading', { name: /seconds survived/ }),
      ).toBeVisible({ timeout: 45000 })
    }
    await expect(
      page.getByRole('button', { name: 'Play again', exact: true }),
    ).toBeVisible()
    const startsBefore = await page.evaluate(
      () =>
        Object.keys(localStorage).filter(
          (key) =>
            key.startsWith('cafe:v1:activity:') && key.endsWith(':start'),
        ).length,
    )
    await page.getByRole('button', { name: 'Play again', exact: true }).click()
    await expect(canvas).toHaveCount(1)
    // Opening a replay does not count as another attempt until gameplay starts.
    expect(
      await page.evaluate(
        () =>
          Object.keys(localStorage).filter(
            (key) =>
              key.startsWith('cafe:v1:activity:') && key.endsWith(':start'),
          ).length,
      ),
    ).toBe(startsBefore)
    await page.goto('/passport')
    await expect(page.getByText(/Best:/)).toBeVisible()
  })
}

test('midnight keeps an abandoned attempt on its date and makes a later retry practice', async ({
  page,
  request,
  isMobile,
}) => {
  const today = await (await request.get('/api/daily')).json()
  const midnight = Date.parse(`${today.date}T00:00:00Z`) + 86400000
  await page.clock.setFixedTime(new Date(midnight - 1000))
  await page.goto(`/daily?date=${today.date}`)
  await page.getByRole('button', { name: '▶ Play', exact: true }).click()
  const canvas = page.locator('canvas')
  async function interact() {
    // Phaser removes the previous canvas on its next frame after destroy().
    await expect(page.getByText('Loading game…')).not.toBeVisible()
    await expect(canvas).toHaveCount(1)
    await expect(canvas).toBeVisible()
    const box = (await canvas.boundingBox())!
    const position = {
      x: (140 / 600) * box.width,
      y: (175 / (today.slug === 'pastry-blocks' ? 720 : 640)) * box.height,
    }
    if (isMobile) await canvas.tap({ position })
    else await canvas.click({ position })
  }
  await interact()
  await page.clock.setFixedTime(new Date(midnight + 1000))
  await expect(
    page.getByRole('button', { name: 'Open the new daily' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await interact()
  const runs = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter(
        (key) => key.startsWith('cafe:v1:activity:') && key.endsWith(':start'),
      )
      .map((key) => JSON.parse(localStorage.getItem(key)!)),
  )
  expect(runs).toHaveLength(2)
  expect(runs.every((run) => run.daily.date === today.date)).toBe(true)
  expect(runs.map((run) => run.daily.practice).sort()).toEqual([false, true])
  await page.goto('/passport')
  await expect(
    page.getByText('No finished result yet · 1 attempts'),
  ).toHaveCount(2)
})

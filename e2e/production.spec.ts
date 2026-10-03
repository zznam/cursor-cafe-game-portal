import { test, expect } from '@playwright/test'
test('catalog validates pagination before hitting the database', async ({
  request,
}) => {
  for (const query of [
    'limit=-1',
    'limit=0',
    'limit=5000',
    'limit=NaN',
    'offset=-1',
  ]) {
    expect((await request.get(`/api/games?${query}`)).status()).toBe(400)
  }
})
test('health distinguishes readiness and returns no-store', async ({
  request,
}) => {
  const response = await request.get('/api/health/ready')
  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toBe('no-store')
})
test('score API accepts zero and rejects forged identity, invalid JSON, oversized bodies, and foreign origins', async ({
  request,
}) => {
  const games = await (await request.get('/api/games?limit=1')).json()
  const path = `/api/leaderboard/${games[0].id}`
  const headers = { Origin: 'http://localhost:3000' }
  const accepted = await request.post(path, {
    headers,
    data: { score: 0, username: 'API Test' },
  })
  expect(accepted.status()).toBe(201)
  expect(accepted.headers()['set-cookie']).toContain('HttpOnly')
  expect(
    (
      await request.post(path, {
        headers,
        data: { score: 1, username: 'Test', userId: 'spoofed' },
      })
    ).status(),
  ).toBe(400)
  expect(
    (
      await request.post(path, {
        headers: { Origin: 'https://evil.example' },
        data: { score: 1, username: 'Test' },
      })
    ).status(),
  ).toBe(403)
  expect(
    (
      await request.post(path, {
        headers: { ...headers, 'Content-Type': 'application/json' },
        data: '{broken',
      })
    ).status(),
  ).toBe(400)
  expect(
    (
      await request.post(path, {
        headers,
        data: {
          score: 1,
          username: 'Test',
          metadata: { huge: 'x'.repeat(20000) },
        },
      })
    ).status(),
  ).toBe(413)
})
test('search queries the full catalog and pagination exposes additional games', async ({
  page,
}) => {
  await page.goto('/games')
  const cards = page
    .locator('main a[href^="/games/"]')
    .filter({ has: page.locator('h3') })
  await expect(cards).toHaveCount(24)
  await page.getByRole('button', { name: 'Load more games' }).click()
  await expect.poll(() => cards.count()).toBeGreaterThan(24)
  const search = page
    .getByRole('combobox', { name: 'Search games' })
    .filter({ visible: true })
  await search.fill('breakout')
  await expect(page.getByRole('option').first()).toContainText(/Breakout/i)
  await search.press('ArrowDown')
  await search.press('Enter')
  await expect(page).toHaveURL(/\/games\/breakout/)
})
test('browser survives corrupted favorite storage and supports favorite buttons', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('favorites', '{broken'))
  await page.goto('/games')
  const favorite = page
    .getByRole('button', { name: /Add .* to favorites/ })
    .first()
  await favorite.click()
  await expect(
    page.getByRole('button', { name: /Remove .* from favorites/ }).first(),
  ).toHaveAttribute('aria-pressed', 'true')
})
test('a signed guest can update only its own rating while another guest gets a separate row', async ({
  playwright,
  request,
}) => {
  const [game] = await (await request.get('/api/games?limit=1')).json()
  const headers = { Origin: 'http://localhost:3000' }
  const review = `Updated-${test.info().project.name}-${Date.now()}`
  expect(
    (
      await request.post(`/api/ratings/${game.id}`, {
        headers,
        data: { rating: 2 },
      })
    ).status(),
  ).toBe(200)
  expect(
    (
      await request.post(`/api/ratings/${game.id}`, {
        headers,
        data: { rating: 5, review },
      })
    ).status(),
  ).toBe(200)
  const another = await playwright.request.newContext({
    baseURL: 'http://localhost:3000',
  })
  try {
    expect(
      (
        await another.post(`/api/ratings/${game.id}`, {
          headers,
          data: { rating: 3 },
        })
      ).status(),
    ).toBe(200)
    const ratings = await (await request.get(`/api/ratings/${game.id}`)).json()
    const updated = ratings.filter(
      (row: { review?: string }) => row.review === review,
    )
    expect(updated).toHaveLength(1)
    expect(updated[0].rating).toBe(5)
    expect(
      ratings.some(
        (row: { rating: number; userId: string }) =>
          row.rating === 3 && row.userId !== updated[0].userId,
      ),
    ).toBe(true)
  } finally {
    await another.dispose()
  }
})
test('comments persist through the UI and failed writes show an actionable message', async ({
  page,
}) => {
  await page.goto('/games/breakout')
  const comment = `Tested comment ${test.info().project.name} ${Date.now()}`
  await page
    .getByRole('textbox', { name: 'Your name', exact: true })
    .fill('Coverage player')
  await page
    .getByRole('textbox', { name: 'Write a comment', exact: true })
    .fill(comment)
  await page.getByRole('button', { name: 'Post Comment' }).click()
  await expect(
    page.locator('p').filter({ hasText: comment }),
  ).toBeVisible()
  await page.route('**/api/comments/*', async (route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Too many requests. Try again in a minute.',
        }),
      })
    else await route.continue()
  })
  await page
    .getByRole('textbox', { name: 'Write a comment', exact: true })
    .fill('Try again')
  await page.getByRole('button', { name: 'Post Comment' }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Too many requests' }),
  ).toBeVisible()
})
test('search failures are distinct from empty results and stale queries do not win', async ({
  page,
}) => {
  await page.goto('/games')
  const search = page
    .getByRole('combobox', { name: 'Search games' })
    .filter({ visible: true })
  await page.route('**/api/games?*', (route) =>
    route.fulfill({ status: 503, json: { error: 'Unavailable' } }),
  )
  await search.fill('broken')
  await expect(
    page.getByRole('alert').filter({ hasText: 'Search is unavailable' }),
  ).toBeVisible()
  await page.unroute('**/api/games?*')
  await search.fill('space')
  await search.fill('breakout')
  await expect(page.getByRole('option')).toHaveCount(1)
  await expect(page.getByRole('option')).toContainText('Breakout')
  await search.press('Escape')
  await expect(search).toHaveAttribute('aria-expanded', 'false')
})
test('invalid social inputs and game IDs never become database errors', async ({
  request,
}) => {
  const [game] = await (await request.get('/api/games?limit=1')).json()
  for (const [path, data] of [
    [`/api/ratings/${game.id}`, { rating: 6 }],
    [`/api/comments/${game.id}`, { content: ' ', username: 'Test' }],
    [
      '/api/events',
      { gameId: game.id, eventType: 'unexpected', sessionId: 'test' },
    ],
    ['/api/leaderboard/not-a-uuid', { score: 1, username: 'Test' }],
  ] as const)
    expect(
      (
        await request.post(path, {
          headers: { Origin: 'http://localhost:3000' },
          data,
        })
      ).status(),
    ).toBe(400)
  expect(
    (
      await request.post(`/api/ratings/${game.id}`, {
        headers: {
          Origin: 'http://localhost:3000',
          'Content-Type': 'text/plain',
        },
        data: 'x',
      })
    ).status(),
  ).toBe(415)
  expect(
    (await request.get(`/api/leaderboard/${game.id}?limit=1000`)).status(),
  ).toBe(400)
})
test('production pages include security headers and no service credentials', async ({
  request,
}) => {
  const response = await request.get('/')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['x-frame-options']).toBe('DENY')
  expect(response.headers()['x-powered-by']).toBeUndefined()
  expect(await response.text()).not.toContain('test-service-key')
})

test('database outages return retryable errors rather than empty results or 404s', async ({
  request,
  page,
}) => {
  const response = await request.get('/api/games?search=database-unavailable')
  expect(response.status()).toBe(503)
  const body = await response.json()
  expect(body.error).toContain('temporarily unavailable')
  expect(body.requestId).toBeTruthy()
  expect(JSON.stringify(body)).not.toContain('Simulated database outage')
  await page.goto('/games/database-unavailable')
  await expect(
    page.getByRole('heading', { name: 'The café is taking a quick break' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true }),
  ).toBeVisible()
})
test('leaderboard failure is shown rather than claiming there are no scores', async ({
  page,
}) => {
  await page.route('**/api/leaderboard/*', (route) =>
    route.fulfill({
      status: 503,
      json: { error: 'Leaderboard is temporarily unavailable' },
    }),
  )
  await page.goto('/games/breakout')
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Leaderboard is temporarily unavailable' }),
  ).toBeVisible()
  await expect(page.getByText('No scores yet. Be the first!')).not.toBeVisible()
})

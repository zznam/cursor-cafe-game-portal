import { test, expect } from '@playwright/test'

test('a finished round records a personal best and can be submitted to the leaderboard', async ({ page, isMobile }) => {
  // Writes a leaderboard row, so only run against the throwaway database fixture.
  test.skip(process.env.E2E_MOCK_DATABASE !== 'true', 'needs the seeded database fixture')
  await page.goto('/games/neon-hoverboard-rider')
  await page.getByRole('button', { name: '▶ Play' }).click()
  await page.locator('.game-canvas canvas').waitFor()
  await page.locator('.game-canvas').click()
  // The rider eventually misses a jump on its own, which ends the round.
  await expect(page.getByText(/Round finished|New personal best/)).toBeVisible({ timeout: 30000 })
  if (!isMobile) {
    await page.getByRole('button', { name: '⛶ Fullscreen', exact: true }).click()
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  }
  const name = `E2E-${Date.now() % 100000}`
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'last_username') throw new DOMException('Storage is full', 'QuotaExceededError')
      return setItem.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: /Submit score/ }).click()
  const dialog = page.getByRole('dialog')
  if (!isMobile)
    await expect.poll(() => dialog.evaluate((element) => document.fullscreenElement?.contains(element))).toBe(true)
  await expect(dialog.getByRole('textbox', { name: 'Username' })).toBeFocused()
  for (let index = 0; index < 6; index++) {
    await page.keyboard.press('Tab')
    await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button', { name: /Submit score/ })).toBeFocused()
  await page.getByRole('button', { name: /Submit score/ }).click()
  await page.locator('#username').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: /Submit/ }).click()
  await expect(page.getByRole('button', { name: '✓ On the leaderboard' })).toBeVisible()
  await expect(page.getByText(name)).toBeVisible()

  await page.goto('/passport')
  await expect(page.getByRole('heading', { name: 'Personal bests' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Neon Hoverboard Rider/ }).first()).toBeVisible()
})

test('score submission errors are retryable and pending writes cannot be duplicated or dismissed', async ({ page }) => {
  await page.goto('/games/neon-hoverboard-rider')
  await page.getByRole('button', { name: '▶ Play' }).click()
  await expect(page.getByText(/Round finished|New personal best/)).toBeVisible({ timeout: 30000 })
  await page.getByRole('button', { name: /Submit score/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox', { name: 'Username' }).fill('Retry player')
  let writes = 0
  let release: (() => void) | undefined
  await page.route('**/api/leaderboard/*', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    writes++
    if (writes === 1) {
      await route.fulfill({ status: 503, json: { error: 'Please try again shortly.' } })
    } else {
      await new Promise<void>((resolve) => { release = resolve })
      await route.fulfill({ status: 201, json: { success: true } })
    }
  })
  await dialog.getByRole('button', { name: 'Submit Score', exact: true }).click()
  await expect(dialog.getByRole('alert')).toHaveText('Please try again shortly.')
  await dialog.getByRole('button', { name: 'Submit Score', exact: true }).click()
  await expect.poll(() => writes).toBe(2)
  try {
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close score dialog' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Submitting…' })).toBeDisabled()
    await page.keyboard.press('Enter')
    expect(writes).toBe(2)
  } finally {
    release?.()
  }
  await expect(page.getByRole('button', { name: '✓ On the leaderboard' })).toBeVisible()
})

test('favorites page lists hearted games', async ({ page }) => {
  await page.goto('/favorites')
  await expect(page.getByText('No favorites yet')).toBeVisible()
  await page.goto('/games')
  await page.getByRole('button', { name: /Add 2048 to favorites/ }).click()
  await page.goto('/favorites')
  await expect(page.getByRole('heading', { name: '2048' })).toBeVisible()
})

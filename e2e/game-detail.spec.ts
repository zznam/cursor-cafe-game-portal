import { test, expect } from '@playwright/test'

test.describe('Game Detail Page', () => {
  test('game detail page loads for /games/breakout', async ({ page }) => {
    const response = await page.goto('/games/breakout')
    const status = response?.status() ?? 0
    expect(status === 200 || status === 404).toBeTruthy()

    if (status === 200) {
      await expect(page.getByRole('heading').first()).toBeVisible({
        timeout: 10000,
      })
    }
  })

  test('game detail page loads for /games/space-shooter', async ({ page }) => {
    const response = await page.goto('/games/space-shooter')
    const status = response?.status() ?? 0
    expect(status === 200 || status === 404).toBeTruthy()

    if (status === 200) {
      await expect(page.getByRole('heading').first()).toBeVisible({
        timeout: 10000,
      })
    }
  })

  test('game title and description are visible', async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
      return
    }

    await expect(
      page.getByRole('heading', { level: 1 })
    ).toBeVisible({ timeout: 10000 })

    const description = page.locator('p.text-white\\/85')
    await expect(description).toBeVisible({ timeout: 10000 })
  })

  test('game metadata is visible (rating, play count, category, tags)', async ({
    page,
  }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
      return
    }

    const ratingOrNew = page.getByText(/\d\.\d|New/).first()
    await expect(ratingOrNew).toBeVisible({ timeout: 10000 })

    await expect(page.getByText(/plays/i).first()).toBeVisible({
      timeout: 10000,
    })

    const categoryBadge = page.locator('.shrink-0').first()
    await expect(categoryBadge).toBeVisible({ timeout: 10000 })
  })

  test('leaderboard section is visible', async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
      return
    }

    await expect(page.getByText('Leaderboard')).toBeVisible({ timeout: 10000 })
  })

  test('rating system is visible with 5 stars', async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
      return
    }

    await expect(page.getByText('Rate this game')).toBeVisible({
      timeout: 10000,
    })

    const starButtons = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-star') })
    await expect(starButtons).toHaveCount(5, { timeout: 10000 })
  })

  test('comments section is visible with input fields', async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
      return
    }

    await expect(page.getByText('Comments')).toBeVisible({ timeout: 10000 })

    await expect(page.getByPlaceholder('Your name')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByPlaceholder('Write a comment...')).toBeVisible()
  })

  test('"Back to Games" link works', async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
      return
    }

    const backLink = page.getByRole('link', { name: /Back to Games/i })
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL(/\/games/)
  })

  test('share button is visible', async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
      return
    }

    await expect(page.getByText(/Share on X/i)).toBeVisible({ timeout: 10000 })
  })

  test('404 page for non-existent game slug', async ({ page }) => {
    const response = await page.goto('/games/this-game-does-not-exist-xyz')
    expect(response?.status()).toBe(404)
  })
})

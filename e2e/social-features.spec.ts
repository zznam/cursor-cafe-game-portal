import { test, expect } from '@playwright/test'

test.describe('Social Features', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
    }
  })

  test('can fill in comment form fields', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Your name')
    const commentInput = page.getByPlaceholder('Write a comment...')

    await expect(nameInput).toBeVisible({ timeout: 10000 })
    await expect(commentInput).toBeVisible()

    await nameInput.fill('Test User')
    await commentInput.fill('This is a great game!')

    await expect(nameInput).toHaveValue('Test User')
    await expect(commentInput).toHaveValue('This is a great game!')
  })

  test('comment form submit button is disabled when fields are empty', async ({
    page,
  }) => {
    const submitButton = page.getByRole('button', { name: /Post Comment/i })
    await expect(submitButton).toBeVisible({ timeout: 10000 })
    await expect(submitButton).toBeDisabled()
  })

  test('comment form submit button enables when fields are filled', async ({
    page,
  }) => {
    const nameInput = page.getByPlaceholder('Your name')
    const commentInput = page.getByPlaceholder('Write a comment...')

    await nameInput.fill('Test User')
    await commentInput.fill('Nice game!')

    const submitButton = page.getByRole('button', { name: /Post Comment/i })
    await expect(submitButton).toBeEnabled({ timeout: 5000 })
  })

  test('rating stars are interactive (can hover and click)', async ({
    page,
  }) => {
    const starButtons = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-star') })
    await expect(starButtons).toHaveCount(5, { timeout: 10000 })

    await starButtons.nth(3).click()

    const ratingLabel = page.getByText('Great')
    await expect(ratingLabel).toBeVisible()
  })

  test('rating submit button is disabled when no stars are selected', async ({
    page,
  }) => {
    const submitButton = page.getByRole('button', { name: /Submit Rating/i })
    await expect(submitButton).toBeVisible({ timeout: 10000 })
    await expect(submitButton).toBeDisabled()
  })

  test('rating submit button enables after selecting stars', async ({
    page,
  }) => {
    const starButtons = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-star') })

    await starButtons.nth(4).click()
    await expect(page.getByText('Amazing')).toBeVisible()

    const submitButton = page.getByRole('button', { name: /Submit Rating/i })
    await expect(submitButton).toBeEnabled()
  })

  test('can write an optional review with rating', async ({ page }) => {
    const reviewInput = page.getByPlaceholder('Write a review (optional)')
    await expect(reviewInput).toBeVisible({ timeout: 10000 })

    await reviewInput.fill('Absolutely love this game! Great mechanics.')
    await expect(reviewInput).toHaveValue(
      'Absolutely love this game! Great mechanics.'
    )
  })

  test('leaderboard section shows header', async ({ page }) => {
    const leaderboardHeader = page.getByText('Leaderboard')
    await expect(leaderboardHeader).toBeVisible({ timeout: 10000 })
  })

  test('leaderboard shows entries or empty state', async ({ page }) => {
    await page.waitForTimeout(2000)

    const hasEntries = await page
      .locator('.font-bold.text-lg')
      .first()
      .isVisible()
      .catch(() => false)
    const hasEmptyState = await page
      .getByText(/No scores yet/i)
      .isVisible()
      .catch(() => false)

    expect(hasEntries || hasEmptyState).toBeTruthy()
  })

  test('comments section shows entries or empty state', async ({ page }) => {
    await page.waitForTimeout(2000)

    const hasComments = await page
      .locator('p.text-sm.text-white\\/70')
      .first()
      .isVisible()
      .catch(() => false)
    const hasEmptyState = await page
      .getByText(/No comments yet/i)
      .isVisible()
      .catch(() => false)

    expect(hasComments || hasEmptyState).toBeTruthy()
  })
})

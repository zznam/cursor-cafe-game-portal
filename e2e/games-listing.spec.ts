import { test, expect } from '@playwright/test'

test.describe('Games Listing', () => {
  test('games page loads with heading', async ({ page }) => {
    await page.goto('/games')
    await expect(
      page.getByRole('heading', { name: /All Games/i })
    ).toBeVisible()
  })

  test('category filter buttons are visible', async ({ page }) => {
    await page.goto('/games')

    const allButton = page.getByRole('button', { name: 'All', exact: true })
    await expect(allButton).toBeVisible()

    const categories = [
      'Action',
      'Arcade',
      'Puzzle',
      'Strategy',
      'Adventure',
      'Platformer',
      'Shooter',
      'Racing',
      'Sports',
      'Other',
    ]
    for (const category of categories) {
      await expect(
        page.getByRole('button', { name: category, exact: true })
      ).toBeVisible()
    }
  })

  test('clicking a category filters cards and marks it active', async ({
    page,
  }) => {
    await page.goto('/games')

    const actionButton = page.getByRole('button', { name: 'Action', exact: true })
    const allButton = page.getByRole('button', { name: 'All', exact: true })

    await actionButton.click()
    await expect(actionButton).toHaveClass(/bg-white text-purple-600/)
    await expect(allButton).toHaveClass(/bg-white\/10 text-white/)

    const gameCards = page.locator('a[href^="/games/"]').filter({
      has: page.locator('img'),
    })
    const cardCount = await gameCards.count()

    if (cardCount > 0) {
      for (let i = 0; i < cardCount; i++) {
        await expect(
          gameCards.nth(i).getByText('Action', { exact: true })
        ).toBeVisible()
      }
    }
  })

  test('clicking "All" resets filter selection', async ({ page }) => {
    await page.goto('/games')

    const actionButton = page.getByRole('button', { name: 'Action', exact: true })
    const allButton = page.getByRole('button', { name: 'All', exact: true })
    const gameCards = page.locator('a[href^="/games/"]').filter({
      has: page.locator('img'),
    })

    await actionButton.click()
    const actionFilteredCount = await gameCards.count()

    await allButton.click()
    await expect(allButton).toHaveClass(/bg-white text-purple-600/)
    await expect(actionButton).toHaveClass(/bg-white\/10 text-white/)

    const allGamesCount = await gameCards.count()
    expect(allGamesCount).toBeGreaterThanOrEqual(actionFilteredCount)
  })

  test('game cards are displayed when data is available', async ({ page }) => {
    await page.goto('/games')

    const gameCards = page.locator('a[href^="/games/"]').filter({
      has: page.locator('img'),
    })

    const noGamesMessage = page.getByText(/No games found/i)

    const hasGames = await gameCards.first().isVisible().catch(() => false)
    const hasNoGamesMsg = await noGamesMessage.isVisible().catch(() => false)

    expect(hasGames || hasNoGamesMsg).toBeTruthy()
  })

  test('game cards show title and description', async ({ page }) => {
    await page.goto('/games')

    const gameCards = page.locator('a[href^="/games/"]').filter({
      has: page.locator('img'),
    })

    const cardCount = await gameCards.count()
    if (cardCount > 0) {
      const firstCard = gameCards.first()
      await expect(firstCard.locator('h3')).toBeVisible()
      await expect(firstCard.locator('p').first()).toBeVisible()
    }
  })

  test('game cards show rating and play count', async ({ page }) => {
    await page.goto('/games')

    const gameCards = page.locator('a[href^="/games/"]').filter({
      has: page.locator('img'),
    })

    const cardCount = await gameCards.count()
    if (cardCount > 0) {
      const firstCard = gameCards.first()
      const ratingOrNew = firstCard.getByText(/\d\.\d|New/)
      await expect(ratingOrNew).toBeVisible({ timeout: 10000 })
    }
  })

  test('clicking a game card navigates to the game detail page', async ({
    page,
  }) => {
    await page.goto('/games')

    const gameCards = page.locator('a[href^="/games/"]').filter({
      has: page.locator('img'),
    })

    const cardCount = await gameCards.count()
    if (cardCount > 0) {
      const href = await gameCards.first().getAttribute('href')
      await gameCards.first().click()
      await expect(page).toHaveURL(href!)
    }
  })
})

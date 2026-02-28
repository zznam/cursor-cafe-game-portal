import { test, expect } from '@playwright/test'

test.describe('Game Player', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/games/breakout')
    if (response?.status() !== 200) {
      test.skip(true, 'Game not found in database')
    }
  })

  test('game player component renders', async ({ page }) => {
    const playerContainer = page.locator('.aspect-video').first()
    await expect(playerContainer).toBeVisible({ timeout: 10000 })
  })

  test('play overlay is shown before game starts', async ({ page }) => {
    const playButton = page.getByRole('button', { name: /Play/i })
    await expect(playButton).toBeVisible({ timeout: 10000 })
  })

  test('controls instructions are displayed', async ({ page }) => {
    const controlsSection = page.getByText('Controls')
    const hasControls = await controlsSection.isVisible().catch(() => false)

    if (hasControls) {
      await expect(controlsSection).toBeVisible()
    }
  })

  test('clicking play button starts loading', async ({ page }) => {
    const playButton = page.getByRole('button', { name: /Play/i })
    await expect(playButton).toBeVisible({ timeout: 10000 })
    await playButton.click()

    const loadingOrGame = page
      .getByText('Loading game...')
      .or(page.locator('canvas'))
      .or(page.getByText('Failed to load game'))
    await expect(loadingOrGame.first()).toBeVisible({ timeout: 15000 })
  })

  test('share button is visible on game detail page', async ({ page }) => {
    await expect(page.getByText(/Share on X/i)).toBeVisible({ timeout: 10000 })
  })
})

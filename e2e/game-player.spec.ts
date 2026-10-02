import { test, expect } from '@playwright/test'

test.describe('Game Player', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/games/breakout')
    expect(response?.status()).toBe(200)
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
    await expect(page.getByText('Controls', { exact: true })).toBeVisible()
  })

  test('clicking play button starts loading', async ({ page }) => {
    const playButton = page.getByRole('button', { name: /Play/i })
    await expect(playButton).toBeVisible({ timeout: 10000 })
    await playButton.click()

    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Failed to load game')).not.toBeVisible()
  })

  test('share button is visible on game detail page', async ({ page }) => {
    await expect(page.getByText(/Share on X/i)).toBeVisible({ timeout: 10000 })
  })
})

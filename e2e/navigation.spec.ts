import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('home page loads with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Game Portal/)
  })

  test('home page displays hero section', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /Welcome to Game Portal/i })
    ).toBeVisible()
    await expect(
      page.getByText(/Discover and play amazing Phaser games/i)
    ).toBeVisible()
  })

  test('can navigate to All Games page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /All Games/i }).first().click()
    await expect(page).toHaveURL(/\/games/)
    await expect(
      page.getByRole('heading', { name: /All Games/i })
    ).toBeVisible()
  })

  test('can navigate to Contribute page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Contribute/i }).first().click()
    await expect(page).toHaveURL(/\/contribute/)
    await expect(
      page.getByRole('heading', { name: /Contribute Your Game/i })
    ).toBeVisible()
  })

  test('can navigate back to home from games page', async ({ page }) => {
    await page.goto('/games')
    await page.locator('a[href="/"]').filter({ hasText: /Game Portal/i }).click()
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { name: /Welcome to Game Portal/i })
    ).toBeVisible()
  })

  test('desktop navigation links are visible and clickable', async ({
    page,
  }) => {
    test.skip(
      test.info().project.name !== 'chromium-desktop',
      'Desktop-only test'
    )
    await page.goto('/')

    await expect(
      page.getByRole('link', { name: 'Home' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'All Games' }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Contribute' }).first()
    ).toBeVisible()
  })

  test('footer is visible with correct text', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(
      footer.getByText(/Built with Next\.js, Phaser, and Supabase/i)
    ).toBeVisible()
    await expect(footer.getByText(/2026 Game Portal/i)).toBeVisible()
  })

  test('logo links to home page', async ({ page }) => {
    await page.goto('/games')
    const logo = page.locator('header a[href="/"]').first()
    await expect(logo).toBeVisible()
    await logo.click()
    await expect(page).toHaveURL('/')
  })

  test('Browse All Games button navigates to games page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Browse All Games/i }).click()
    await expect(page).toHaveURL(/\/games/)
  })

  test('Contribute a Game button navigates to contribute page', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Contribute a Game/i }).click()
    await expect(page).toHaveURL(/\/contribute/)
  })
})

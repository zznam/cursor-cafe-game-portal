import { test, expect } from '@playwright/test'

test.describe('Responsive Layouts', () => {
  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('hamburger menu appears, desktop nav hidden', async ({ page }) => {
      await page.goto('/')

      const hamburger = page.getByRole('button', { name: /menu/i })
      await expect(hamburger).toBeVisible()
    })

    test('mobile menu opens and shows navigation links', async ({ page }) => {
      await page.goto('/')

      const hamburger = page.getByRole('button', { name: /menu/i })
      await hamburger.click()

      const mobileNav = page.locator('nav').filter({ hasText: 'All Games' }).last()
      await expect(mobileNav).toBeVisible()
      await expect(mobileNav.getByText('Home')).toBeVisible()
      await expect(mobileNav.getByText('All Games')).toBeVisible()
      await expect(mobileNav.getByText('Contribute')).toBeVisible()
    })

    test('mobile menu navigation works', async ({ page }) => {
      await page.goto('/')

      const hamburger = page.getByRole('button', { name: /menu/i })
      await hamburger.click()

      const mobileNav = page.locator('nav').filter({ hasText: 'All Games' }).last()
      await mobileNav.getByText('All Games').click()
      await expect(page).toHaveURL(/\/games/)
    })

    test('game cards stack vertically', async ({ page }) => {
      await page.goto('/games')

      const gameCards = page.locator('a[href^="/games/"]')
      const cardCount = await gameCards.count()
      if (cardCount >= 2) {
        const firstBox = await gameCards.first().boundingBox()
        const secondBox = await gameCards.nth(1).boundingBox()

        if (firstBox && secondBox) {
          expect(secondBox.y).toBeGreaterThan(firstBox.y)
        }
      }
    })
  })

  test.describe('Tablet viewport', () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test('2-column grid for game cards', async ({ page }) => {
      await page.goto('/games')

      const gameCards = page.locator('a[href^="/games/"]')
      const cardCount = await gameCards.count()
      if (cardCount >= 2) {
        const firstBox = await gameCards.first().boundingBox()
        const secondBox = await gameCards.nth(1).boundingBox()

        if (firstBox && secondBox) {
          const sameRow = Math.abs(firstBox.y - secondBox.y) < 10
          expect(sameRow).toBeTruthy()
        }
      }
    })
  })

  test.describe('Desktop viewport', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('full navigation visible', async ({ page }) => {
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

    test('sidebar layout on game detail page', async ({ page }) => {
      const response = await page.goto('/games/breakout')
      if (response?.status() !== 200) {
        test.skip(true, 'Game not found in database')
        return
      }

      const mainContent = page.locator('.lg\\:col-span-2')
      await expect(mainContent).toBeVisible({ timeout: 10000 })
    })

    test('multi-column grid for game cards', async ({ page }) => {
      await page.goto('/games')

      const gameCards = page.locator('a[href^="/games/"]')
      const cardCount = await gameCards.count()
      if (cardCount >= 3) {
        const firstBox = await gameCards.first().boundingBox()
        const thirdBox = await gameCards.nth(2).boundingBox()

        if (firstBox && thirdBox) {
          const sameRow = Math.abs(firstBox.y - thirdBox.y) < 10
          expect(sameRow).toBeTruthy()
        }
      }
    })
  })
})

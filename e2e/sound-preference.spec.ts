import { test, expect } from '@playwright/test'

test('remembered sound is restored when a game starts', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cafe:v1:sound', 'on'))
  await page.goto('/games/coffee-connections')
  await page.getByRole('button', { name: '▶ Play', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('sound survives a restart when preference storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked') }
    Storage.prototype.setItem = () => { throw new Error('Storage blocked') }
  })
  await page.goto('/games/coffee-connections')
  await page.getByRole('button', { name: '▶ Play', exact: true }).click()
  await page.getByRole('button', { name: 'Sound off', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

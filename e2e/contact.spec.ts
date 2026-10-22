import { test, expect } from '@playwright/test'

test('contact prepares a real GitHub draft and never claims delivery', async ({ page, context }) => {
  // Capture the navigation without contacting GitHub or posting a real issue.
  await context.route('https://github.com/zznam/cursor-cafe-game-portal/issues/new?*', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Review draft</h1>' }))
  await page.goto('/contact')
  await expect(page.getByText('Issues are public', { exact: false })).toBeVisible()
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Snake on a phone')
  await page.getByRole('textbox', { name: 'Details', exact: true }).fill('Steps & details: arrow controls on a small screen.')
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Review on GitHub' }).click()
  const popup = await popupPromise
  await popup.waitForLoadState()
  const url = new URL(popup.url())
  expect(url.origin + url.pathname).toBe('https://github.com/zznam/cursor-cafe-game-portal/issues/new')
  expect(url.searchParams.get('title')).toBe('Snake on a phone')
  expect(url.searchParams.get('body')).toBe('Steps & details: arrow controls on a small screen.')
  await expect(page.getByRole('textbox', { name: 'Details', exact: true })).not.toBeEmpty()
  await expect(page.getByText('Message Sent!')).not.toBeVisible()
})

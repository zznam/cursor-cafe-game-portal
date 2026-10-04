import { test, expect, type Page } from '@playwright/test'

test.describe('Game Player', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/games/breakout')
    expect(response?.status()).toBe(200)
  })

  test('game player component renders', async ({ page }) => {
    const playerContainer = page.locator('.game-shell')
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

// Read visible game objects from the rendered canvas, without production debug hooks.
async function gameObjectCenter(page: Page, color: [number, number, number]) {
  const gameCanvas = page.locator('canvas')
  await gameCanvas.evaluate((canvas) => canvas.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const png = await gameCanvas.screenshot()
  return page.evaluate(async ({ data, color }) => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob())
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0)
    image.close()
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let count = 0
    let xTotal = 0
    let yTotal = 0
    // Exclude the score/toolbar so only gameplay objects contribute.
    for (let y = Math.ceil(canvas.height * 0.15); y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const offset = (y * canvas.width + x) * 4
        if (color.every((channel, index) => Math.abs(pixels[offset + index] - channel) <= 5)) {
          count++
          xTotal += x
          yTotal += y
        }
      }
    }
    return count ? { x: xTotal / count, y: yTotal / count } : null
  }, { data: png.toString('base64'), color })
}

// Exercise real Phaser input, including games that only use raw key events.
test.describe('Game Player keyboard focus', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.style.scrollBehavior = 'auto'
      })
    })
  })

  test('scrolling keys keep the page still while the game has focus', async ({ page }) => {
    await page.goto('/games/breakout')
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    const game = page.getByRole('group', { name: 'Breakout Classic game', exact: true })
    await expect(page.locator('canvas')).toBeVisible()
    await expect(game).toBeFocused()

    await page.evaluate(() => window.scrollTo(0, 100))
    await page.waitForTimeout(200) // Let browser scroll animation settle before measuring.
    const position = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))
    expect(position.y).toBeGreaterThan(0)

    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Space', 'Shift+Space', 'PageDown', 'PageUp', 'Home', 'End']) {
      await page.keyboard.press(key)
      await page.waitForTimeout(150) // Native keyboard scrolling is animated.
      expect(await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })), key).toEqual(position)
    }
  })

  test('game controls work, release held keys on blur, and leave page forms usable', async ({ page }) => {
    await page.goto('/games/breakout')
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    const game = page.getByRole('group', { name: 'Breakout Classic game', exact: true })
    await expect(game).toBeFocused()
    const paddleX = async () => (await gameObjectCenter(page, [102, 102, 255]))?.x
    await expect.poll(paddleX).toBeDefined()
    const initialX = (await paddleX())!
    await page.keyboard.down('ArrowRight')
    await expect.poll(paddleX).toBeGreaterThan(initialX + 5)

    const comment = page.getByRole('textbox', { name: 'Write a comment' })
    await comment.focus()
    await page.waitForTimeout(100) // Allow the next game frame to stop the paddle.
    const stoppedX = (await paddleX())!
    await page.waitForTimeout(150)
    expect((await paddleX())!).toBeCloseTo(stoppedX, 0)
    await page.keyboard.up('ArrowRight')
    await page.keyboard.type('Playing is fun')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.type('!')
    await expect(comment).toHaveValue('Playing is fu!n')
    expect((await paddleX())!).toBeCloseTo(stoppedX, 0)

    await page.locator('canvas').click()
    await expect(game).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(comment).not.toBeFocused()
    await expect(page.getByRole('textbox', { name: 'Your name' })).toBeFocused()

    await page.evaluate(() => {
      (document.activeElement as HTMLElement)?.blur()
      window.scrollTo(0, 100)
    })
    await page.waitForTimeout(200)
    const outsideY = await page.evaluate(() => window.scrollY)
    await page.keyboard.press('ArrowDown')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(outsideY)
  })

  test('raw arrow handlers receive game input without scrolling', async ({ page }) => {
    await page.goto('/games/neon-snake')
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    const game = page.getByRole('group', { name: 'Neon Snake game', exact: true })
    await expect(game).toBeFocused()
    const head = () => gameObjectCenter(page, [0, 255, 255])
    await expect.poll(head).not.toBeNull()
    const initial = (await head())!
    const before = await page.evaluate(() => window.scrollY)
    await page.keyboard.press('ArrowUp')
    await expect.poll(async () => (await head())?.y).toBeLessThan(initial.y - 5)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)
  })

  test('raw space handlers still trigger gameplay without scrolling', async ({ page }) => {
    await page.goto('/games/neon-hoverboard-rider')
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    await expect(page.getByRole('group', { name: 'Neon Hoverboard Rider game', exact: true })).toBeFocused()
    const board = () => gameObjectCenter(page, [0, 255, 204])
    await expect.poll(board).not.toBeNull()
    await page.waitForTimeout(500) // Let the hoverboard land before jumping.
    const grounded = (await board())!
    const before = await page.evaluate(() => window.scrollY)
    await page.keyboard.press('Space')
    await expect.poll(async () => (await board())?.y).toBeLessThan(grounded.y - 5)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)
  })

  test('word skipping remains available while Tab leaves the game', async ({ page }) => {
    await page.goto('/games/word-scramble-rush')
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    await expect.poll(() => gameObjectCenter(page, [255, 255, 255])).not.toBeNull()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => gameObjectCenter(page, [255, 136, 0])).not.toBeNull()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Your name' })).toBeFocused()
  })
})


test.describe('Game Player lifecycle', () => {
  test('fullscreen keeps keyboard focus when entering and exiting', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Fullscreen keyboard focus is a desktop interaction')
    await page.goto('/games/breakout')
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    const game = page.getByRole('group', { name: 'Breakout Classic game', exact: true })
    await page.getByRole('button', { name: '⛶ Fullscreen', exact: true }).click()
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
    await expect(game).toBeFocused()
    await page.getByRole('button', { name: '⊡ Exit', exact: true }).click()
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false)
    await expect(game).toBeFocused()
  })

  test('leaving a running game restores ordinary page keyboard behavior', async ({ page }) => {
    await page.goto('/games/breakout')
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    await expect(page.locator('canvas')).toBeVisible()
    await page.getByRole('link', { name: 'Back to Games' }).click()
    await expect(page).toHaveURL(/\/games$/)
    await expect(page.locator('canvas')).toHaveCount(0)
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto'
      ;(document.activeElement as HTMLElement)?.blur()
      window.scrollTo(0, 100)
    })
    const before = await page.evaluate(() => window.scrollY)
    await page.keyboard.press('ArrowDown')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before)
  })
})

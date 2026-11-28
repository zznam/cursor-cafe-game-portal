import { test, expect, type Page } from '@playwright/test'
import { findHexMatches, findHexMove, type HexBoard } from '../lib/games/hex-matches'

async function readBoard(page: Page): Promise<HexBoard> {
  const png = await page.locator('.game-canvas canvas').screenshot()
  return page.evaluate(async (data) => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob())
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    image.close()
    const colors = [0xff4466, 0x44ff66, 0x4488ff, 0xffaa00, 0xaa44ff, 0x44ffff]
    return Array.from({ length: 7 }, (_, row) => Array.from({ length: 9 }, (_, column) => {
      const x = 80 + column * Math.sqrt(3) * 30 + (row % 2 ? Math.sqrt(3) * 15 : 0)
      const y = 80 + row * 45
      const pixel = ctx.getImageData(Math.round(x / 800 * canvas.width), Math.round(y / 600 * canvas.height), 1, 1).data
      const distances = colors.map((color) =>
        [color >> 16, (color >> 8) & 255, color & 255].reduce((sum, channel, i) => sum + (channel - pixel[i]) ** 2, 0))
      return distances.indexOf(Math.min(...distances))
    }))
  }, png.toString('base64'))
}

/**
 * Reads the board once it has stopped animating: two consecutive reads must agree and show
 * no matches (and differ from `before`, when given). With slow frames, a single read can land
 * mid-fall or mid-cascade and see colours that look like matches.
 */
async function readSettledBoard(page: Page, before?: string): Promise<HexBoard> {
  let previous = ''
  let board: HexBoard = []
  await expect.poll(async () => {
    board = await readBoard(page)
    const current = JSON.stringify(board)
    const settled = current === previous && findHexMatches(board).length === 0 && current !== before
    previous = current
    return settled
  }, { timeout: 20000, intervals: [250] }).toBe(true)
  return board
}

async function playMove(page: Page, isMobile: boolean, board: HexBoard): Promise<HexBoard> {
  const canvas = page.locator('.game-canvas canvas')
  expect(findHexMatches(board)).toEqual([])
  const move = findHexMove(board)
  expect(move).toBeTruthy()
  const before = JSON.stringify(board)
  for (const [row, column] of move!) {
    const box = (await canvas.boundingBox())!
    const position = {
      x: (80 + column * Math.sqrt(3) * 30 + (row % 2 ? Math.sqrt(3) * 15 : 0)) / 800 * box.width,
      y: (80 + row * 45) / 600 * box.height,
    }
    if (isMobile) await canvas.tap({ position })
    else await canvas.click({ position })
    // Phaser consumes pointer events on a frame boundary. Wait for selection
    // to render before tapping its neighbor, especially on Linux WebKit.
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    }))
  }
  return readSettledBoard(page, before)
}

test('hex matches complete a real 20-move round, save a best, and restart', async ({ page, isMobile }) => {
  test.setTimeout(120000)
  await page.goto('/games/hexagon-match-3')
  await page.getByRole('button', { name: '▶ Play' }).click()
  const canvas = page.locator('.game-canvas canvas')
  await expect(canvas).toBeVisible()
  let board = await readSettledBoard(page)
  for (let turn = 0; turn < 20; turn++) {
    board = await playMove(page, isMobile, board)
  }
  await expect(page.getByText('Round finished', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Submit score/ })).toBeVisible()
  const results = () => page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('cafe:v1:activity:') && key.endsWith(':result')).length)
  expect(await results()).toBe(1)
  await canvas.click()
  await expect(page.getByText('Round finished', { exact: true })).not.toBeVisible()
  await expect.poll(async () => findHexMatches(await readBoard(page)).length).toBe(0)
  expect(await results()).toBe(1)
  await page.goto('/passport')
  await expect(page.getByRole('heading', { name: 'Personal bests' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Hexagon Match 3/ }).first()).toBeVisible()
})

test('hex accepts the next move as soon as a slow-frame board settles', async ({ page, isMobile }) => {
  test.setTimeout(90000)
  await page.addInitScript(() => {
    const requestFrame = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (callback) => requestFrame(() => {
      setTimeout(() => callback(performance.now()), 100)
    })
  })
  await page.goto('/games/hexagon-match-3')
  await page.getByRole('button', { name: '▶ Play' }).click()
  await expect(page.locator('.game-canvas canvas')).toBeVisible()
  let board = await readSettledBoard(page)
  for (let turn = 0; turn < 3; turn++) {
    board = await playMove(page, isMobile, board)
  }
})

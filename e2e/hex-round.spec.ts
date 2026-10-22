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

test('hex matches complete a real 20-move round, save a best, and restart', async ({ page, isMobile }) => {
  test.setTimeout(120000)
  await page.goto('/games/hexagon-match-3')
  await page.getByRole('button', { name: '▶ Play' }).click()
  const canvas = page.locator('.game-canvas canvas')
  await expect(canvas).toBeVisible()
  let board = await readBoard(page)
  for (let turn = 0; turn < 20; turn++) {
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
    }
    await expect.poll(async () => {
      board = await readBoard(page)
      return JSON.stringify(board) !== before && findHexMatches(board).length === 0
    }).toBe(true)
    // The final cascade stays input-locked for 300ms after its board is drawn.
    await page.waitForTimeout(350)
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

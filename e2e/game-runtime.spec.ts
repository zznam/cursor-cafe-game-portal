import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect } from '@playwright/test'

const gamesDirectory = join(process.cwd(), 'games')
const slugs = readdirSync(gamesDirectory).filter(slug =>
  existsSync(join(gamesDirectory, slug, 'index.ts'))
).sort()

// A visible canvas alone does not prove that Phaser's scene or update loop works.
for (const slug of slugs) {
  test(`${slug} renders and runs without browser errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(`/games/${slug}`)
    expect(response?.status()).toBe(200)
    await page.getByRole('button', { name: '▶ Play', exact: true }).click()
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await expect(page.getByText('Failed to load game')).not.toBeVisible()

    // Exercise input and several seconds of update callbacks, including group cleanup.
    await page.keyboard.press('Space')
    await page.keyboard.down('ArrowRight')
    await page.waitForTimeout(250)
    await page.keyboard.up('ArrowRight')
    await page.waitForTimeout(2000)

    const png = await canvas.screenshot()
    const pixels = await page.evaluate(async data => {
      const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob())
      const snapshot = document.createElement('canvas')
      snapshot.width = image.width
      snapshot.height = image.height
      const context = snapshot.getContext('2d')!
      context.drawImage(image, 0, 0)
      image.close()
      const rgba = context.getImageData(0, 0, snapshot.width, snapshot.height).data
      const colors = new Set<string>()
      let purpleCardPixels = 0
      for (let offset = 0; offset < rgba.length; offset += 4) {
        colors.add(`${rgba[offset]},${rgba[offset + 1]},${rgba[offset + 2]},${rgba[offset + 3]}`)
        if (rgba[offset] === 106 && rgba[offset + 1] === 27 && rgba[offset + 2] === 154 && rgba[offset + 3] === 255) {
          purpleCardPixels++
        }
      }
      return { colorCount: colors.size, purpleCardPixels }
    }, png.toString('base64'))
    expect(pixels.colorCount, 'The game should draw more than a blank canvas').toBeGreaterThan(8)
    if (slug === 'memory-match') {
      // Its card backs use a RenderTexture, which Phaser 4 must render explicitly.
      expect(pixels.purpleCardPixels).toBeGreaterThan(100)
    }
    expect(errors).toEqual([])
  })
}

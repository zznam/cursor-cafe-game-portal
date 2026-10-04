import { test, expect, type Page } from '@playwright/test'
import capabilities from '../lib/game-capabilities.json'
import { inputLabel } from '../components/touch-controls'

async function touchHold(page: Page, names: string[], duration = 150) {
  for (const name of names)
    await page
      .getByRole('button', { name, exact: true })
      .scrollIntoViewIfNeeded()
  const points = await Promise.all(
    names.map(async (name, id) => {
      const box = (await page
        .getByRole('button', { name, exact: true })
        .boundingBox())!
      return { x: box.x + box.width / 2, y: box.y + box.height / 2, id }
    }),
  )
  const session = await page.context().newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: points,
  })
  await page.waitForTimeout(duration)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await session.detach()
}
for (const [slug, config] of Object.entries(capabilities)) {
  test(`${slug} accepts touch, earns a stamp, and restarts`, async ({
    page,
    browserName,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Actual touch-device verification')
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/games/${slug}`)
    await page.getByRole('button', { name: '▶ Play', exact: true }).tap()
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await expect(page.getByText('Loading game…')).not.toBeVisible()
    const starts = () =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter(
            (key) =>
              key.startsWith('cafe:v1:activity:') && key.endsWith(':start'),
          ).length,
      )
    expect(await starts()).toBe(0)
    if (config.keys.length) {
      for (const key of config.keys) {
        const label = inputLabel(key, slug)
        if (browserName === 'chromium') await touchHold(page, [label])
        else await page.getByRole('button', { name: label, exact: true }).tap()
      }
    } else {
      const box = (await canvas.boundingBox())!
      await canvas.tap({
        position: { x: box.width * 0.5, y: box.height * 0.5 },
      })
    }
    await expect.poll(starts).toBe(1)
    await page.getByRole('button', { name: 'Pause', exact: true }).tap()
    await expect(page.getByText('Paused', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Resume game', exact: true }).tap()
    await page.getByRole('button', { name: 'Restart', exact: true }).tap()
    await expect(canvas).toHaveCount(1)
    if (
      [
        'coffee-connections',
        'pastry-blocks',
        'cup-stack',
        'sugar-orbit',
      ].includes(slug)
    )
      await canvas.screenshot({ path: `/tmp/cafe-${browserName}-${slug}.png` })
    expect(errors).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  })
}
async function paddleY(page: Page, color: number[]) {
  const png = await page.locator('canvas').screenshot()
  return page.evaluate(
    async ({ data, color }) => {
      const image = await createImageBitmap(
        await (await fetch(`data:image/png;base64,${data}`)).blob(),
      )
      const copy = document.createElement('canvas')
      copy.width = image.width
      copy.height = image.height
      const ctx = copy.getContext('2d')!
      ctx.drawImage(image, 0, 0)
      image.close()
      const pixels = ctx.getImageData(0, 0, copy.width, copy.height).data
      let sum = 0,
        count = 0
      for (let i = 0; i < pixels.length; i += 4)
        if (color.every((c, n) => Math.abs(c - pixels[i + n]) < 5)) {
          sum += Math.floor(i / 4 / copy.width)
          count++
        }
      return count ? sum / count : -1
    },
    { data: png.toString('base64'), color },
  )
}
test('Pong moves both paddles at once with real multitouch and releases them', async ({
  page,
  browserName,
  isMobile,
}) => {
  test.skip(
    browserName !== 'chromium' || !isMobile,
    'Chromium touch protocol supports simultaneous contacts',
  )
  await page.goto('/games/neon-pong-pvp')
  await page.getByRole('button', { name: '▶ Play', exact: true }).tap()
  await expect(page.locator('canvas')).toBeVisible()
  await expect.poll(() => paddleY(page, [0, 255, 255])).toBeGreaterThan(0)
  const left = await paddleY(page, [0, 255, 255]),
    right = await paddleY(page, [255, 0, 255])
  await touchHold(page, ['P1 up', 'P2 down'], 250)
  await expect.poll(() => paddleY(page, [0, 255, 255])).toBeLessThan(left - 10)
  await expect
    .poll(() => paddleY(page, [255, 0, 255]))
    .toBeGreaterThan(right + 10)
  await page.waitForTimeout(100)
  const stopped = await paddleY(page, [0, 255, 255])
  await page.waitForTimeout(100)
  expect(await paddleY(page, [0, 255, 255])).toBeCloseTo(stopped, 0)
})

async function coloredPixels(page: Page, rgb: number[]) {
  const png = await page.locator('canvas').screenshot()
  return page.evaluate(
    async ({ data, rgb }) => {
      const image = await createImageBitmap(
        await (await fetch(`data:image/png;base64,${data}`)).blob(),
      )
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(image, 0, 0)
      image.close()
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let count = 0
      for (let i = 0; i < pixels.length; i += 4)
        if (rgb.every((v, n) => Math.abs(v - pixels[i + n]) < 10)) count++
      return count
    },
    { data: png.toString('base64'), rgb },
  )
}
test('special touch controls type, erase, submit and skip words', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Touch keyboard interaction')
  await page.goto('/games/word-scramble-rush')
  await page.getByRole('button', { name: '▶ Play', exact: true }).tap()
  await expect(page.locator('canvas')).toBeVisible()
  await page.getByRole('button', { name: 'Q', exact: true }).tap()
  await expect.poll(() => coloredPixels(page, [0, 255, 0])).toBeGreaterThan(3)
  await page.getByRole('button', { name: 'Delete', exact: true }).tap()
  await expect.poll(() => coloredPixels(page, [0, 255, 0])).toBe(0)
  await page.getByRole('button', { name: 'Q', exact: true }).tap()
  await page.getByRole('button', { name: 'Submit', exact: true }).tap()
  await page.getByRole('button', { name: 'Skip', exact: true }).tap()
  await expect.poll(() => coloredPixels(page, [255, 136, 0])).toBeGreaterThan(3)
})
test('special touch controls flag and reveal mines with zoom and pan available', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Touch flags')
  await page.goto('/games/minesweeper-quantum')
  await page.getByRole('button', { name: '▶ Play', exact: true }).tap()
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  const unflagged = await canvas.screenshot()
  await page.getByRole('button', { name: 'Reveal mode', exact: true }).tap()
  let box = (await canvas.boundingBox())!
  await canvas.tap({
    position: { x: (100 / 800) * box.width, y: (80 / 600) * box.height },
  })
  await expect
    .poll(async () => (await canvas.screenshot()).equals(unflagged))
    .toBe(false)
  await canvas.tap({
    position: { x: (100 / 800) * box.width, y: (80 / 600) * box.height },
  })
  await expect
    .poll(async () => (await canvas.screenshot()).equals(unflagged))
    .toBe(true)
  await page.getByRole('button', { name: 'Flag mode', exact: true }).tap()
  const before = await canvas.screenshot()
  box = (await canvas.boundingBox())!
  await canvas.tap({
    position: { x: (100 / 800) * box.width, y: (80 / 600) * box.height },
  })
  expect((await canvas.screenshot()).equals(before)).toBe(false)
  await page.getByRole('button', { name: 'Zoom 1×', exact: true }).tap()
  await expect(
    page.getByRole('button', { name: 'Zoom 2×', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Play mode · tap to pan', exact: true })
    .tap()
  await expect(
    page.getByRole('button', { name: 'Pan mode · tap to play', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('special touch controls enter and erase a Sudoku number', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Touch number pad')
  await page.goto('/games/sudoku-zen')
  await page.getByRole('button', { name: '▶ Play', exact: true }).tap()
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  const png = await canvas.screenshot()
  const cell = await page.evaluate(async (data) => {
    const image = await createImageBitmap(
      await (await fetch(`data:image/png;base64,${data}`)).blob(),
    )
    const copy = document.createElement('canvas')
    copy.width = image.width
    copy.height = image.height
    const ctx = copy.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    image.close()
    const dataPixels = ctx.getImageData(0, 0, copy.width, copy.height).data,
      sx = copy.width / 800,
      sy = copy.height / 600
    // Pick a lower cell that remains visible when the keypad scrolls into view.
    for (let r = 4; r < 9; r++)
      for (let c = 0; c < 9; c++) {
        let white = 0
        for (
          let y = Math.ceil((85 + r * 50) * sy);
          y < (115 + r * 50) * sy;
          y++
        )
          for (
            let x = Math.ceil((185 + c * 50) * sx);
            x < (215 + c * 50) * sx;
            x++
          ) {
            const i = (y * copy.width + x) * 4
            if (
              dataPixels[i] > 220 &&
              dataPixels[i + 1] > 220 &&
              dataPixels[i + 2] > 220
            )
              white++
          }
        if (white === 0) return { r, c }
      }
    return null
  }, png.toString('base64'))
  expect(cell).not.toBeNull()
  const box = (await canvas.boundingBox())!
  await canvas.tap({
    position: {
      x: ((200 + cell!.c * 50) / 800) * box.width,
      y: ((100 + cell!.r * 50) / 600) * box.height,
    },
  })
  await page.getByRole('button', { name: '1', exact: true }).tap()
  await expect
    .poll(
      async () =>
        (await coloredPixels(page, [68, 255, 136])) +
        (await coloredPixels(page, [255, 68, 68])),
    )
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Erase', exact: true }).tap()
  await expect
    .poll(
      async () =>
        (await coloredPixels(page, [68, 255, 136])) +
        (await coloredPixels(page, [255, 68, 68])),
    )
    .toBe(0)
})

test('a running game reflows between portrait and landscape without restarting', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Phone rotation')
  await page.goto('/games/2048')
  await page.getByRole('button', { name: '▶ Play', exact: true }).tap()
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await page.getByRole('button', { name: '← Left', exact: true }).tap()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(canvas).toHaveCount(1)
  await expect
    .poll(async () => (await canvas.boundingBox())!.height)
    .toBeLessThan(240)
  await page.getByRole('button', { name: 'Right →', exact: true }).tap()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(async () => (await canvas.boundingBox())!.width)
    .toBeLessThan(390)
  expect(
    await page.evaluate(
      () =>
        Object.keys(localStorage).filter(
          (key) =>
            key.startsWith('cafe:v1:activity:') && key.endsWith(':start'),
        ).length,
    ),
  ).toBe(1)
})

// Exercise real touch move, end and cancellation events, not synthetic mouse input.
for (const [slug, start, end] of [
  ['mini-golf-course', [150, 450], [80, 510]],
  ['penalty-shootout-pro', [400, 460], [460, 360]],
  ['retro-hoops', [200, 450], [200, 450]],
] as const) {
  test(`${slug} supports touch drag or charge and cancels an interrupted gesture`, async ({
    page,
    browserName,
    isMobile,
  }) => {
    test.skip(
      browserName !== 'chromium' || !isMobile,
      'Native touch move protocol',
    )
    await page.goto(`/games/${slug}`)
    await page.getByRole('button', { name: '▶ Play', exact: true }).tap()
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await canvas.scrollIntoViewIfNeeded()
    const box = (await canvas.boundingBox())!
    const session = await page.context().newCDPSession(page)
    const point = (p: readonly number[]) => ({
      x: box.x + (p[0] / 800) * box.width,
      y: box.y + (p[1] / 600) * box.height,
      id: 1,
    })
    async function boardImage() {
      const png = await canvas.screenshot()
      return page.evaluate(async (data) => {
        const image = await createImageBitmap(
          await (await fetch(`data:image/png;base64,${data}`)).blob(),
        )
        const crop = document.createElement('canvas')
        crop.width = 600
        crop.height = 170
        const ctx = crop.getContext('2d')!
        ctx.drawImage(
          image,
          (image.width * 100) / 800,
          (image.height * 370) / 600,
          (image.width * 600) / 800,
          (image.height * 170) / 600,
          0,
          0,
          600,
          170,
        )
        image.close()
        return crop.toDataURL()
      }, png.toString('base64'))
    }
    const initial = await boardImage()
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point(start)],
    })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [point(end)],
    })
    await page.waitForTimeout(150)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchCancel',
      touchPoints: [],
    })
    await expect.poll(boardImage).toBe(initial)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point(start)],
    })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [point(end)],
    })
    await page.waitForTimeout(150)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
    await expect.poll(boardImage).not.toBe(initial)
    await session.detach()
  })
}

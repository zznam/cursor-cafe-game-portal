const [base, version, region] = process.argv.slice(2)
if (!base?.startsWith('https://'))
  throw new Error('Provide an HTTPS release URL')
for (const path of ['/api/health/ready', '/api/games?limit=1', '/']) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(15000),
    headers: {
      'Cache-Control': 'no-cache',
      ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
        ? {
            'x-vercel-protection-bypass':
              process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          }
        : {}),
    },
  })
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)
  if (path.includes('health')) {
    const health = await response.json()
    if (health.version !== version || (region && health.region !== region))
      throw new Error('Wrong release or region')
  }
  if (path.includes('games')) {
    const games = await response.json()
    if (!Array.isArray(games) || games.length === 0)
      throw new Error('Catalog is empty: seed games before launch')
  }
}
console.log(`Verified ${version}${region ? ` in ${region}` : ''}`)

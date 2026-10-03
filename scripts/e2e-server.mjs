// A deterministic, local HTTP stand-in for PostgREST. Production code is unchanged.
// Every browser test runs against the actual built app without production credentials.
import http from 'node:http'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
const games = readdirSync('games', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry, index) => {
    const source = readFileSync(`games/${entry.name}/index.ts`, 'utf8')
    const field = (name, fallback) =>
      source.match(new RegExp(`${name}:\\s*['\"]([^'\"]+)['\"]`))?.[1] ||
      fallback
    return {
      id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      slug: entry.name,
      title: field('title', entry.name),
      description: field('description', 'A browser game for everyone.'),
      thumbnail_url: `/games/${entry.name}/thumbnail.${existsSync(`public/games/${entry.name}/thumbnail.svg`) ? 'svg' : 'png'}`,
      banner_url: null,
      category: field('category', 'Arcade'),
      tags: ['arcade', 'classic'],
      developer_name: 'Cursor Café',
      developer_url: null,
      package_name: entry.name,
      version: '1.0.0',
      play_count: 1000 - index,
      average_rating: 4.5,
      total_ratings: 2,
      featured: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
  })
const tables = {
  games,
  leaderboards: [],
  comments: [],
  ratings: [],
  analytics: [],
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const table = url.pathname.split('/').at(-1)
  res.setHeader('Content-Type', 'application/json')
  if (url.pathname.includes('/rpc/')) {
    res.end('true')
    return
  }
  if (
    [...url.searchParams.values()].some((value) =>
      value.includes('database-unavailable'),
    )
  ) {
    res.writeHead(503)
    res.end(
      JSON.stringify({ message: 'Simulated database outage', code: 'TEST' }),
    )
    return
  }
  if (!(table in tables)) {
    res.writeHead(404)
    res.end('{}')
    return
  }
  if (req.method === 'POST') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const value = JSON.parse(Buffer.concat(chunks).toString())
    if (req.headers.authorization !== 'Bearer test-service-key') {
      res.writeHead(403)
      res.end('{}')
      return
    }
    const existing =
      table === 'ratings'
        ? tables[table].find(
            (row) =>
              row.game_id === value.game_id && row.user_id === value.user_id,
          )
        : null
    if (existing) Object.assign(existing, value)
    else
      tables[table].push({
        id: randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...value,
      })
    res.writeHead(201)
    res.end('')
    return
  }
  let rows = tables[table].filter((row) =>
    [...url.searchParams].every(
      ([key, value]) =>
        !value.startsWith('eq.') || String(row[key]) === value.slice(3),
    ),
  )
  const search = url.searchParams
    .get('or')
    ?.match(/ilike\.%([^%]+)%/)?.[1]
    ?.toLowerCase()
  if (search)
    rows = rows.filter((row) =>
      [row.title, row.description, row.category].some((value) =>
        value?.toLowerCase().includes(search),
      ),
    )
  if (table !== 'games') rows = [...rows].reverse()
  const offset = Number(url.searchParams.get('offset') || 0)
  const limit = Number(url.searchParams.get('limit') || 100)
  rows = rows.slice(offset, offset + limit)
  if (req.headers.accept?.includes('vnd.pgrst.object'))
    res.end(JSON.stringify(rows[0] || null))
  else res.end(JSON.stringify(rows))
})
server.listen(54329, '127.0.0.1', () => {
  const app = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-p', '3000'],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        SUPABASE_URL: 'http://127.0.0.1:54329',
        SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        SESSION_SECRET: 'test-only-secret-shared-across-regions-32-chars',
        SITE_URL: 'http://localhost:3000',
      },
    },
  )
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => {
      app.kill(signal)
      server.close()
      setTimeout(() => process.exit(), 1000).unref()
    })
  app.on('exit', (code) => {
    server.close()
    process.exit(code || 0)
  })
})

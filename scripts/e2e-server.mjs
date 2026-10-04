// Run the actual app against ephemeral PostgreSQL. No production credentials.
import http from 'node:http'
import { readFileSync, readdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import { catalogRows, seedCatalog } from './catalog-seed.mjs'
const baseURL = new URL(process.env.E2E_BASE_URL || 'http://localhost:3000')
const db = await PGlite.create()
for (const name of readdirSync('database/migrations').filter(name => name.endsWith('.sql')).sort()) await db.exec(readFileSync(`database/migrations/${name}`, 'utf8'))
await seedCatalog(db)
// Deterministic ordering/IDs keep existing browser fixtures stable.
for (const [index, row] of catalogRows().entries()) {
  await db.query('UPDATE games SET id=$1, play_count=$2, featured=true WHERE slug=$3',
    [`a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, 1000-index, row.slug])
}
let server
async function startDatabase() {
  server = new PGLiteSocketServer({ db, port: 54329, host: '127.0.0.1', maxConnections: 20 })
  await server.start()
}
await startDatabase()
// Only the fixture exposes outage control, bound to loopback.
const control = http.createServer(async (req, res) => {
  try {
    if (req.url === '/stop') await server.stop()
    else if (req.url === '/start') await startDatabase()
    else { res.writeHead(404); res.end(); return }
    res.end('ok')
  } catch { res.writeHead(500); res.end('Fixture control failed') }
})
control.listen(54330, '127.0.0.1')
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', baseURL.port || '3000'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54329/postgres?sslmode=disable',
    DATABASE_READ_URL: '',
    SESSION_SECRET: 'test-only-secret-shared-across-regions-32-chars',
    SITE_URL: baseURL.origin,
  },
})
let stopping = false
async function stop(code = 0) {
  if (stopping) return
  stopping = true
  app.kill('SIGTERM')
  control.close()
  await server.stop()
  await db.close()
  process.exit(code)
}
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => void stop())
app.on('exit', (code) => void stop(code || 0))

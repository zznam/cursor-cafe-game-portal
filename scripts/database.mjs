import { readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import pg from 'pg'
import nextEnv from '@next/env'
import { seedCatalog } from './catalog-seed.mjs'

nextEnv.loadEnvConfig(process.cwd())
const action = process.argv[2]
if (!['migrate', 'seed'].includes(action)) throw new Error('Use database.mjs migrate or seed')
const connectionString = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL
if (!connectionString) throw new Error('Set DATABASE_URL or DATABASE_MIGRATION_URL')
const url = new URL(connectionString)
if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Use a PostgreSQL connection string')
if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !['require', 'verify-ca', 'verify-full'].includes(url.searchParams.get('sslmode') || ''))
  throw new Error('Remote database connections must require TLS')
const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10000, statement_timeout: 60000 })
try {
  await client.connect()
  await client.query('BEGIN')
  // Serialize concurrent migrations/seeds, and keep schema changes transactional.
  await client.query('SELECT pg_advisory_xact_lock(73489231)')
  if (action === 'migrate') {
    await client.query(`CREATE TABLE IF NOT EXISTS public.cafe_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`)
    for (const name of (await readdir('database/migrations')).filter((name) => name.endsWith('.sql')).sort()) {
      const sql = await readFile(`database/migrations/${name}`, 'utf8')
      const checksum = createHash('sha256').update(sql).digest('hex')
      const { rows } = await client.query('SELECT checksum FROM public.cafe_migrations WHERE name=$1', [name])
      if (rows.length) {
        if (rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${name}`)
        console.log(`Already applied ${name}`)
        continue
      }
      await client.query(sql)
      await client.query('INSERT INTO public.cafe_migrations(name,checksum) VALUES($1,$2)', [name, checksum])
      console.log(`Applied ${name}`)
    }
  } else {
    console.log(`Seeded catalog from ${await seedCatalog(client)} game modules; existing rows retained`)
  }
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK').catch(() => {})
  // Never print a connection string or credentials on failure.
  console.error('Database setup failed:', error.message)
  process.exitCode = 1
} finally {
  await client.end()
}

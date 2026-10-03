import 'server-only'
import { Pool, types, type QueryResultRow } from 'pg'
import { attachDatabasePool } from '@vercel/functions'
import { databaseUrl } from './config'

const pools = new Map<string, Pool>()

// Use Neon's pooled URL. Keep pools small and close idle connections before
// Vercel suspends a function. Database credentials remain on the server.
export function database({ readOnly = false } = {}) {
  const connectionString = databaseUrl(readOnly)
  let pool = pools.get(connectionString)
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 2,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 10000,
      types: {
        getTypeParser: (oid, format) => oid === 1184 && format !== 'binary'
          ? (value: string) => new Date(value).toISOString()
          : types.getTypeParser(oid, format),
      },
    })
    pool.on('error', (error) => console.error('database_pool_error', {
      code: (error as Error & { code?: string }).code,
    }))
    attachDatabasePool(pool)
    pools.set(connectionString, pool)
  }
  return pool
}

export async function query<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
  options: { readOnly?: boolean } = {},
): Promise<Row[]> {
  return (await database(options).query<Row>(text, values)).rows
}

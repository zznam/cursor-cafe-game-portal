import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { databaseUrl, requiredEnv } from './config'

// No cookies, session persistence, or process-local user state. Each operation is bounded.
export function database({ write = false, primary = false } = {}) {
  const key = write
    ? requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    : process.env.SUPABASE_ANON_KEY ||
      requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient<Database>(databaseUrl(!write && !primary), key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        }),
    },
  })
}

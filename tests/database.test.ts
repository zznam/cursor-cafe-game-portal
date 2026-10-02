import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

// Execute the real production migration against PostgreSQL in WASM. Only the
// existing Supabase-managed schemas/roles and baseline UUID extension are stubbed.
test('production migration enforces roles, atomic quotas and rating/play aggregates', async () => {
  const db = new PGlite()
  try {
    await db.exec(`
      CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      CREATE SCHEMA auth; CREATE SCHEMA storage;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';
      CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS 'SELECT current_user::text';
      CREATE TABLE storage.buckets(id text PRIMARY KEY, name text, public boolean);
      CREATE TABLE storage.objects(id uuid, bucket_id text, owner uuid);
      CREATE FUNCTION public.uuid_generate_v4() RETURNS uuid LANGUAGE sql AS 'SELECT gen_random_uuid()';
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    `)
    const baseline = (
      await readFile('supabase/migrations/20261002000100_baseline.sql', 'utf8')
    ).replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '')
    await db.exec(baseline)
    await db.exec(
      await readFile(
        'supabase/migrations/20261002000200_production_hardening.sql',
        'utf8',
      ),
    )
    await db.exec(
      `INSERT INTO games(id, slug, title, description, thumbnail_url, category, developer_name, package_name, version) VALUES ('a0000000-0000-4000-8000-000000000001','test','Test','Test','/test.svg','Arcade','Test','test','1');`,
    )
    await db.exec('SET ROLE anon')
    assert.equal((await db.query('SELECT * FROM games')).rows.length, 1)
    await assert.rejects(
      db.exec(
        "INSERT INTO ratings(game_id,user_id,rating) VALUES('a0000000-0000-4000-8000-000000000001','forged',5)",
      ),
      /permission denied/,
    )
    await assert.rejects(
      db.exec("SELECT consume_rate_limit('forged', 10)"),
      /permission denied/,
    )
    await assert.rejects(
      db.exec("SELECT increment_play_count('test')"),
      /permission denied/,
    )
    await assert.rejects(
      db.exec('SELECT production_ready()'),
      /permission denied/,
    )
    await db.exec('RESET ROLE; SET ROLE authenticated')
    await assert.rejects(
      db.exec('UPDATE ratings SET rating=1'),
      /permission denied/,
    )
    await assert.rejects(
      db.exec(
        "INSERT INTO comments(game_id,user_id,username,content) VALUES ('a0000000-0000-4000-8000-000000000001','forged','Test','Forged')",
      ),
      /permission denied/,
    )
    await db.exec('RESET ROLE; SET ROLE service_role')
    assert.equal(
      (await db.query<{ ready: boolean }>('SELECT production_ready() AS ready'))
        .rows[0].ready,
      true,
    )
    await assert.rejects(
      db.exec("SELECT consume_rate_limit('invalid', 0)"),
      /Invalid rate limit/,
    )
    await assert.rejects(
      db.exec("SELECT consume_rate_limit('invalid', 1001)"),
      /Invalid rate limit/,
    )
    const quota = async () =>
      (
        await db.query<{ allowed: boolean }>(
          "SELECT consume_rate_limit('guest:test', 2) AS allowed",
        )
      ).rows[0].allowed
    assert.equal(await quota(), true)
    assert.equal(await quota(), true)
    assert.equal(await quota(), false)
    await db.exec(
      "INSERT INTO ratings(game_id,user_id,rating) VALUES ('a0000000-0000-4000-8000-000000000001','one',5),('a0000000-0000-4000-8000-000000000001','two',3)",
    )
    const rating = async () =>
      (
        await db.query<{ average_rating: string; total_ratings: number }>(
          'SELECT average_rating,total_ratings FROM games',
        )
      ).rows[0]
    assert.deepEqual(await rating(), {
      average_rating: '4.00',
      total_ratings: 2,
    })
    await db.exec("UPDATE ratings SET rating=1 WHERE user_id='one'")
    assert.deepEqual(await rating(), {
      average_rating: '2.00',
      total_ratings: 2,
    })
    await db.exec("DELETE FROM ratings WHERE user_id='two'")
    assert.deepEqual(await rating(), {
      average_rating: '1.00',
      total_ratings: 1,
    })
    await db.exec('DELETE FROM ratings')
    assert.deepEqual(await rating(), {
      average_rating: '0.00',
      total_ratings: 0,
    })
    await db.exec(
      "INSERT INTO analytics(game_id,user_id,event_type,session_id) VALUES ('a0000000-0000-4000-8000-000000000001','one','play','session')",
    )
    assert.equal(
      (await db.query<{ play_count: number }>('SELECT play_count FROM games'))
        .rows[0].play_count,
      1,
    )
    await assert.rejects(
      db.exec(
        "INSERT INTO leaderboards(game_id,user_id,username,score) VALUES ('a0000000-0000-4000-8000-000000000001','one','Test',-1)",
      ),
      /valid_score/,
    )
    await db.exec('RESET ROLE')
    await db.exec(
      "UPDATE request_limits SET window_start=now()-interval '5 minutes'",
    )
    assert.equal(await quota(), true)
  } finally {
    await db.close()
  }
})

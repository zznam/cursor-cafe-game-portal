import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

// Execute the new, portable PostgreSQL schema with no Supabase-managed objects.
test('Neon schema enforces foreign keys, atomic quotas, rating upserts and play counts', async () => {
  const db = await PGlite.create()
  try {
    for (const name of (await readdir('database/migrations')).filter(name => name.endsWith('.sql')).sort()) await db.exec(await readFile(`database/migrations/${name}`, 'utf8'))
    assert.equal((await db.query<{ ready: boolean }>('SELECT production_ready() AS ready')).rows[0].ready, true)
    await db.exec(`INSERT INTO games(id,slug,title,description,thumbnail_url,category,developer_name,package_name,version)
      VALUES ('a0000000-0000-4000-8000-000000000001','test','Test','Test','/test.svg','Arcade','Test','test','1')`)
    const id = 'a0000000-0000-4000-8000-000000000001'
    const rate = async (user: string, rating: number) => db.query(`INSERT INTO ratings(game_id,user_id,rating)
      VALUES($1,$2,$3) ON CONFLICT(game_id,user_id) DO UPDATE SET rating=EXCLUDED.rating`, [id, user, rating])
    await rate('one', 2)
    await rate('one', 5)
    await rate('two', 3)
    const aggregate = async () => (await db.query<{ rating_sum: number; total_ratings: number; average_rating: string }>(
      'SELECT rating_sum::integer,total_ratings,average_rating FROM games')).rows[0]
    assert.deepEqual(await aggregate(), { rating_sum: 8, total_ratings: 2, average_rating: '4.00' })
    await db.exec("DELETE FROM ratings WHERE user_id='two'")
    assert.deepEqual(await aggregate(), { rating_sum: 5, total_ratings: 1, average_rating: '5.00' })
    await db.exec('DELETE FROM ratings')
    assert.deepEqual(await aggregate(), { rating_sum: 0, total_ratings: 0, average_rating: '0.00' })
    await db.query('INSERT INTO analytics(game_id,event_type,session_id) VALUES($1,$2,$3)', [id,'play','test'])
    await db.query('INSERT INTO analytics(game_id,event_type,session_id) VALUES($1,$2,$3)', [id,'complete','test'])
    assert.equal((await db.query<{ count: number }>('SELECT play_count AS count FROM games')).rows[0].count, 1)
    const quota = async () => (await db.query<{ allowed: boolean }>('SELECT consume_rate_limit($1,$2) AS allowed', ['guest:one',2])).rows[0].allowed
    assert.deepEqual([await quota(), await quota(), await quota()], [true,true,false])
    await db.exec("UPDATE request_limits SET window_start=now()-interval '5 minutes'")
    assert.equal(await quota(), true)
    await assert.rejects(db.query('SELECT consume_rate_limit($1,$2)', ['invalid',0]), /Invalid rate limit/)
    await assert.rejects(db.query('INSERT INTO comments(game_id,user_id,username,content) VALUES($1,$2,$3,$4)', [id,'one','Player',' ']), /valid_comment/)
    await assert.rejects(db.query('INSERT INTO leaderboards(game_id,user_id,username,score) VALUES($1,$2,$3,$4)', [id,'one','Player',-1]), /valid_score/)
    await assert.rejects(db.query('INSERT INTO comments(game_id,user_id,username,content) VALUES($1,$2,$3,$4)', ['a0000000-0000-4000-8000-000000000002','one','Player','Test']), /foreign key/)
    // Readiness must fail if an aggregate trigger is disabled.
    await db.exec('ALTER TABLE ratings DISABLE TRIGGER trigger_update_game_rating')
    assert.equal((await db.query<{ ready: boolean }>('SELECT production_ready() AS ready')).rows[0].ready, false)
  } finally { await db.close() }
})

test('catalog reseeding refreshes metadata without deleting user activity', async () => {
  const { seedCatalog, catalogRows } = await import('../scripts/catalog-seed.mjs')
  const db = await PGlite.create()
  try {
    for (const name of (await readdir('database/migrations')).filter(name => name.endsWith('.sql')).sort()) await db.exec(await readFile(`database/migrations/${name}`, 'utf8'))
    await seedCatalog(db)
    assert.equal(catalogRows().length, 31)
    const row = (await db.query<{id:string}>("SELECT id FROM games WHERE slug='cup-stack'")).rows[0]
    await db.query("UPDATE games SET play_count=42, title='Old title' WHERE id=$1",[row.id])
    await db.query("INSERT INTO ratings(game_id,user_id,rating) VALUES($1,'guest',5)",[row.id])
    await db.query("INSERT INTO comments(game_id,user_id,username,content) VALUES($1,'guest','Player','Lovely')",[row.id])
    await db.query("INSERT INTO leaderboards(game_id,user_id,username,score) VALUES($1,'guest','Player',123)",[row.id])
    await seedCatalog(db)
    assert.equal((await db.query<{score:number}>("SELECT score::integer AS score FROM leaderboards WHERE game_id=$1",[row.id])).rows[0].score,123)
    assert.deepEqual((await db.query("SELECT id,title,play_count,total_ratings,mood,touch FROM games WHERE id=$1",[row.id])).rows[0],{id:row.id,title:'Cup Stack',play_count:42,total_ratings:1,mood:'Focused',touch:true})
    assert.equal((await db.query<{count:number}>("SELECT count(*)::integer AS count FROM comments")).rows[0].count,1)
    assert.equal((await db.query<{count:number}>("SELECT count(*)::integer AS count FROM games WHERE touch=true AND mood IS NOT NULL AND session_minutes>0")).rows[0].count,31)
  } finally {await db.close()}
})

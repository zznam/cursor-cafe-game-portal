// Read static game metadata without importing Phaser into a server process.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import ts from 'typescript'
const capabilities = JSON.parse(readFileSync(new URL('../lib/game-capabilities.json', import.meta.url), 'utf8'))

export function catalogRows() {
  return readdirSync('games', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const file = ts.createSourceFile('game.ts', readFileSync(`games/${entry.name}/index.ts`, 'utf8'), ts.ScriptTarget.Latest, true)
      let metadata
      const visit = (node) => {
        if (ts.isPropertyAssignment(node) && node.name.getText(file) === 'metadata' && ts.isObjectLiteralExpression(node.initializer))
          metadata = node.initializer
        ts.forEachChild(node, visit)
      }
      visit(file)
      const values = {}
      for (const prop of metadata?.properties || []) {
        if (!ts.isPropertyAssignment(prop)) continue
        if (ts.isStringLiteralLike(prop.initializer)) values[prop.name.getText(file)] = prop.initializer.text
        if (ts.isArrayLiteralExpression(prop.initializer)) values[prop.name.getText(file)] = prop.initializer.elements.filter(ts.isStringLiteralLike).map((item) => item.text)
      }
      if (!values.title || !values.description || !values.category)
        throw new Error(`Missing catalog metadata for ${entry.name}`)
      const thumbnail = ['svg', 'png'].find((ext) => existsSync(`public/games/${entry.name}/thumbnail.${ext}`))
      return {
        slug: entry.name,
        title: values.title,
        description: values.description,
        thumbnail_url: thumbnail ? `/games/${entry.name}/thumbnail.${thumbnail}` : '/games/placeholder.svg',
        category: values.category,
        tags: values.tags || [],
        developer_name: values.developerName || 'Cursor Café',
        package_name: entry.name,
        version: values.version || '1.0.0',
        mood: capabilities[entry.name]?.mood ?? null,
        session_minutes: capabilities[entry.name]?.sessionMinutes ?? null,
        touch: capabilities[entry.name]?.touch ?? false,
        featured: ['coffee-connections', 'pastry-blocks', 'cup-stack', 'sugar-orbit', 'breakout', 'space-shooter', 'neon-snake', 'tower-defense-lite', 'flappy-dragon', 'hexagon-match-3'].includes(entry.name),
      }
    })
}

export async function seedCatalog(client) {
  const rows = catalogRows()
  for (const row of rows) {
    await client.query(
      `INSERT INTO public.games(slug, title, description, thumbnail_url, category, tags, developer_name, package_name, version, mood, session_minutes, touch, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (slug) DO UPDATE SET
        title=EXCLUDED.title, description=EXCLUDED.description, thumbnail_url=EXCLUDED.thumbnail_url,
        category=EXCLUDED.category, tags=EXCLUDED.tags, developer_name=EXCLUDED.developer_name,
        package_name=EXCLUDED.package_name, version=EXCLUDED.version, mood=EXCLUDED.mood,
        session_minutes=EXCLUDED.session_minutes, touch=EXCLUDED.touch, updated_at=now()`,
      Object.values(row),
    )
  }
  return rows.length
}

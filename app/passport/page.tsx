import { getGames } from '@/lib/server/catalog'
import { Passport } from '@/components/passport'
export const dynamic = 'force-dynamic'
export default async function PassportPage() {
  const games = await getGames({ limit: 100 })
  return (
    <div className="container mx-auto px-4 py-10">
      <Passport games={games} />
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code, GitBranch, FileCode, Rocket } from 'lucide-react'

export default function ContributePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Contribute Your Game</h1>
          <p className="text-xl text-white/90">
            Share your Phaser game with the community and reach thousands of players
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GitBranch className="w-6 h-6" />
                1. Fork the Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              <p className="mb-4">
                Fork the Game Portal repository on GitHub and clone it to your local machine.
              </p>
              <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                <code>git clone https://github.com/yourusername/cursor-cafe-game-portal.git</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileCode className="w-6 h-6" />
                2. Create Your Game Package
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90 space-y-4">
              <p>Create a new folder in the <code className="bg-black/30 px-2 py-1 rounded">games/</code> directory:</p>
              <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                <code>{`games/
  your-game-name/
    index.ts          # Main game export
    scenes/           # Phaser scenes
    assets/           # Game assets
    README.md         # Game documentation`}</code>
              </pre>
              <p>Your <code className="bg-black/30 px-2 py-1 rounded">index.ts</code> should export:</p>
              <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                <code>{`import Phaser from 'phaser'

export default {
  metadata: {
    slug: 'your-game-slug',
    title: 'Your Game Title',
    description: 'Game description',
    thumbnailUrl: '/games/your-game/thumbnail.png',
    category: 'Action',
    tags: ['arcade', 'fun'],
    developerName: 'Your Name',
    packageName: 'your-game-name',
    version: '1.0.0'
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      scene: [/* your scenes */]
    })
  }
}`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Code className="w-6 h-6" />
                3. Add Game to Database
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              <p className="mb-4">
                Create a migration script or manually add your game to Supabase:
              </p>
              <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`INSERT INTO games (
  slug, title, description, thumbnail_url,
  category, tags, developer_name, package_name, version
) VALUES (
  'your-game-slug',
  'Your Game Title',
  'Game description',
  '/games/your-game/thumbnail.png',
  'Action',
  ARRAY['arcade', 'fun'],
  'Your Name',
  'your-game-name',
  '1.0.0'
);`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Rocket className="w-6 h-6" />
                4. Submit Pull Request
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              <p className="mb-4">
                Test your game locally, then submit a pull request with:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Your game package in the games/ directory</li>
                <li>All required assets and documentation</li>
                <li>Database migration or setup instructions</li>
                <li>Screenshots and gameplay description</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Guidelines</h2>
          <ul className="space-y-3 text-white/90">
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Games must be built with Phaser 3</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Include proper attribution for assets</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Optimize assets for web delivery</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Test on multiple screen sizes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Follow the code style of the project</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400">✗</span>
              <span>No offensive or inappropriate content</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400">✗</span>
              <span>No copyright violations</span>
            </li>
          </ul>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="gap-2">
            <GitBranch className="w-5 h-5" />
            View on GitHub
          </Button>
        </div>
      </div>
    </div>
  )
}

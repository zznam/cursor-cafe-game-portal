import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code, GitBranch, FileCode, Rocket, CheckCircle2, XCircle } from 'lucide-react'

export default function ContributePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Code className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/70 font-medium">Developer Portal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-linear-to-r from-amber-200 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Contribute Your Game
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Share your Phaser game with the Cursor Café community
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GitBranch className="w-6 h-6 text-purple-400" />
                1. Fork the Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
              <p className="mb-4">
                Fork the Game Portal repository on GitHub and clone it to your local machine.
              </p>
              <pre className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto text-sm text-purple-200 font-mono">
                <code>git clone https://github.com/yourusername/cursor-cafe-game-portal.git</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileCode className="w-6 h-6 text-pink-400" />
                2. Create Your Game Package
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80 space-y-4">
              <p>Create a new folder in the <code className="bg-white/10 px-2 py-0.5 rounded text-white font-mono text-xs">games/</code> directory:</p>
              <pre className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto text-sm text-purple-200 font-mono">
                <code>{`games/
  your-game-name/
    index.ts          # Main game export
    scenes/           # Phaser scenes
    assets/           # Game assets
    README.md         # Game documentation`}</code>
              </pre>
              <p>Your <code className="bg-white/10 px-2 py-0.5 rounded text-white font-mono text-xs">index.ts</code> should export:</p>
              <pre className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto text-sm text-purple-200 font-mono">
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

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Code className="w-6 h-6 text-amber-400" />
                3. Add Game to Database
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
              <p className="mb-4">
                Add metadata to your game module, then seed your local PostgreSQL catalog:
              </p>
              <pre className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto text-sm text-purple-200 font-mono">
                <code>{`npm run db:migrate
npm run db:seed`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Rocket className="w-6 h-6 text-emerald-400" />
                4. Submit Pull Request
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
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

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Guidelines</h2>
          <ul className="space-y-3.5 text-white/80">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Games must be built with Phaser 3</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Include proper attribution for assets</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Optimize assets for web delivery</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Test on multiple screen sizes</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Follow the code style of the project</span>
            </li>
            <li className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>No offensive or inappropriate content</span>
            </li>
            <li className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>No copyright violations</span>
            </li>
          </ul>
        </div>

        <div className="text-center mt-12">
          <a
            href="https://github.com/zznam/cursor-cafe-game-portal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 cursor-pointer"
            >
              <GitBranch className="w-5 h-5" />
              View on GitHub
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

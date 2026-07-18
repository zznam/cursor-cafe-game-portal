import {
  Coffee,
  Gamepad2,
  Code,
  Heart,
  Zap,
  Globe,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "About — Cursor Café",
  description:
    "Learn about Cursor Café, the cozy corner for amazing browser games. Our mission, tech stack, and story.",
};

const STATS = [
  {icon: Gamepad2, label: "Games", value: "27+", color: "text-purple-400"},
  {icon: Star, label: "Categories", value: "10", color: "text-yellow-400"},
  {icon: Trophy, label: "Leaderboards", value: "Live", color: "text-amber-400"},
  {icon: Users, label: "Open Source", value: "Yes", color: "text-pink-400"},
];

const TECH_STACK = [
  {
    name: "Next.js",
    desc: "React framework for production",
    color: "from-white/20 to-white/5",
  },
  {
    name: "Phaser 3",
    desc: "HTML5 game framework",
    color: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    name: "Supabase",
    desc: "Backend & real-time database",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    name: "TypeScript",
    desc: "Type-safe development",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    name: "Tailwind CSS",
    desc: "Utility-first styling",
    color: "from-sky-500/20 to-sky-500/5",
  },
  {
    name: "Vercel",
    desc: "Edge deployment platform",
    color: "from-white/20 to-white/5",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Coffee className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/70 font-medium">Our Story</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-linear-to-r from-amber-200 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            About Cursor Café
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            We believe gaming should be instant, accessible, and fun. No
            downloads, no sign-ups — just click and play. That's the Cursor Café
            way.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Heart className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              Cursor Café was born from a simple idea:{" "}
              <strong className="text-white">
                what if you could play great games right in your browser,
                without any hassle?
              </strong>{" "}
              No app stores, no installers, no waiting — just pure gaming joy.
            </p>
            <p>
              We curate and host a growing library of handcrafted browser games
              built with Phaser 3, one of the most powerful HTML5 game
              frameworks. Every game features live leaderboards, community
              ratings, and commenting — because gaming is better together.
            </p>
            <p>
              Best of all, Cursor Café is open source. Developers can contribute
              their own games and join our growing community of creators and
              players.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Code className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Built With</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className={`bg-linear-to-br ${tech.color} border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors`}
              >
                <h3 className="text-white font-semibold mb-1">{tech.name}</h3>
                <p className="text-sm text-white/50">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">What We Value</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <Globe className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Accessibility</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Games should be playable by anyone, anywhere, on any device with
                a browser.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <Code className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Open Source</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Our entire platform is open source. Fork it, learn from it,
                contribute to it.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <Heart className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Community</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Ratings, comments, leaderboards — everything is designed to
                foster community.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-linear-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-white/10 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Play?</h2>
          <p className="text-white/60 mb-6">
            Jump into our collection of 27+ browser games — no download
            required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/games">
              <Button size="lg" className="gap-2">
                <Gamepad2 className="w-5 h-5" />
                Browse Games
              </Button>
            </Link>
            <Link href="/contribute">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 text-white border-white/20 hover:bg-white/10"
              >
                Contribute
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

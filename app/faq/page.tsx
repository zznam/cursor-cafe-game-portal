"use client";

import {useState} from "react";
import {
  HelpCircle,
  ChevronDown,
  Gamepad2,
  Code,
  Users,
  Shield,
} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: "Playing Games",
    question: "Are the games free to play?",
    answer:
      "Yes! All games on Cursor Café are completely free to play. No sign-ups, no downloads — just click and play directly in your browser.",
  },
  {
    category: "Playing Games",
    question: "What devices can I play on?",
    answer:
      "Our games work on any device with a modern web browser — desktop, laptop, tablet, or mobile. For the best experience, we recommend playing on a desktop or laptop with a keyboard.",
  },
  {
    category: "Playing Games",
    question: "How do leaderboards work?",
    answer:
      "When you finish a game or achieve a high score, you can submit your score with a display name. Your score will appear on the game's leaderboard for everyone to see. Compete with players worldwide!",
  },
  {
    category: "Playing Games",
    question: "Can I save my progress?",
    answer:
      "Currently, game progress is session-based. Your recently played games are saved locally in your browser. We're working on adding user accounts for persistent progress saving in the future.",
  },
  {
    category: "Playing Games",
    question: "How do ratings and reviews work?",
    answer:
      "You can rate any game from 1 to 5 stars and optionally leave a written review. Ratings help other players discover the best games and help developers improve their creations.",
  },
  {
    category: "Contributing",
    question: "How can I submit my own game?",
    answer:
      "Fork our GitHub repository, create your game using Phaser 3 in the games/ directory, add the game metadata to the database, and submit a pull request. Check our Contribute page for detailed steps.",
  },
  {
    category: "Contributing",
    question: "What game engine should I use?",
    answer:
      "All games on Cursor Café are built with Phaser 3, a powerful open-source HTML5 game framework. Check out phaser.io for documentation, tutorials, and examples to get started.",
  },
  {
    category: "Contributing",
    question: "Are there any content guidelines?",
    answer:
      "Yes. Games must be family-friendly with no offensive content. All assets must be properly licensed (original or open-source). Games should be optimized for web delivery and tested on multiple screen sizes.",
  },
  {
    category: "Technical",
    question: "What technology stack is used?",
    answer:
      "Cursor Café is built with Next.js (React), Phaser 3 for games, Supabase for the backend database, TypeScript for type safety, and Tailwind CSS for styling. The entire project is deployed on Vercel.",
  },
  {
    category: "Technical",
    question: "Is the project open source?",
    answer:
      "Yes! Cursor Café is fully open source under the MIT license. You can find the complete source code on our GitHub repository at github.com/zznam/cursor-cafe-game-portal.",
  },
  {
    category: "Community",
    question: "How can I report a bug or suggest a feature?",
    answer:
      "Open an issue on our GitHub repository. For bugs, please include steps to reproduce, your browser/device info, and any error messages. For feature suggestions, describe your idea and how it would improve the platform.",
  },
  {
    category: "Community",
    question: "Can I get involved beyond contributing games?",
    answer:
      "Absolutely! You can help by reviewing pull requests, improving documentation, fixing bugs, helping with UI/UX design, or simply spreading the word about Cursor Café. Every contribution matters!",
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Playing Games": <Gamepad2 className="w-5 h-5" />,
  Contributing: <Code className="w-5 h-5" />,
  Technical: <Shield className="w-5 h-5" />,
  Community: <Users className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Playing Games": "text-purple-400 bg-purple-500/20",
  Contributing: "text-emerald-400 bg-emerald-500/20",
  Technical: "text-blue-400 bg-blue-500/20",
  Community: "text-pink-400 bg-pink-500/20",
};

function FAQAccordion({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="text-white font-medium">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-white/50 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-5 pb-5 text-white/60 leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const categories = [...new Set(FAQ_DATA.map((item) => item.category))];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white/70 font-medium">
              Help Center
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/60">
            Everything you need to know about Cursor Café
          </p>
        </div>

        {/* FAQ by category */}
        {categories.map((category) => {
          const categoryItems = FAQ_DATA.filter(
            (item) => item.category === category,
          );
          const iconColor =
            CATEGORY_COLORS[category] || "text-white/50 bg-white/10";

          return (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2 rounded-lg ${iconColor}`}>
                  {CATEGORY_ICONS[category]}
                </div>
                <h2 className="text-xl font-bold text-white">{category}</h2>
              </div>
              <div className="space-y-3">
                {categoryItems.map((item) => {
                  const globalIndex = FAQ_DATA.indexOf(item);
                  return (
                    <FAQAccordion
                      key={globalIndex}
                      item={item}
                      isOpen={openIndex === globalIndex}
                      onToggle={() =>
                        setOpenIndex(
                          openIndex === globalIndex ? null : globalIndex,
                        )
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-8 mt-12">
          <h2 className="text-xl font-bold text-white mb-2">
            Still have questions?
          </h2>
          <p className="text-white/60 mb-6">We&apos;d love to hear from you</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="gap-2">
                Get in Touch
              </Button>
            </Link>
            <a
              href="https://github.com/zznam/cursor-cafe-game-portal/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 text-white border-white/20 hover:bg-white/10"
              >
                Open GitHub Issue
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const categories = [
  {
    id: "alphabet",
    name: "Alphabet",
    subtitle: "A to Z Fun!",
    emoji: "🔤",
    gradient: "from-pink-400 to-rose-500",
    href: "/category/alphabet",
  },
  {
    id: "numbers",
    name: "Numbers",
    subtitle: "Count & Learn!",
    emoji: "🔢",
    gradient: "from-blue-400 to-blue-600",
    href: "/category/numbers",
  },
  {
    id: "shapes",
    name: "Shapes",
    subtitle: "Draw & Match!",
    emoji: "🔺",
    gradient: "from-emerald-400 to-green-500",
    href: "/category/shapes",
  },
  {
    id: "colors",
    name: "Colors",
    subtitle: "Paint & Play!",
    emoji: "🎨",
    gradient: "from-purple-400 to-pink-400",
    href: "/category/colors",
  },
  {
    id: "languages",
    name: "Languages",
    subtitle: "World Words!",
    emoji: "🌍",
    gradient: "from-orange-400 to-orange-500",
    href: "/category/languages",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🦊</div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">
            AI Kids Tutor
          </h1>
          <p className="text-xl text-gray-600">Learn, Play & Grow! 🌟</p>
        </div>

        {/* Progress Section */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Your Progress</span>
            <span className="text-gray-500">0 ⭐</span>
          </div>
          <Progress value={0} className="h-3" />
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={`
                block p-6 rounded-2xl bg-gradient-to-br ${category.gradient}
                transform transition-all duration-200
                hover:scale-105 hover:shadow-lg
                active:scale-95
                cursor-pointer
              `}
            >
              <div className="text-center text-white">
                <div className="text-4xl mb-3">{category.emoji}</div>
                <h2 className="text-xl font-bold mb-1">{category.name}</h2>
                <p className="text-sm opacity-90">{category.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryData: Record<string, {
  name: string;
  emoji: string;
  gradient: string;
  activities: { id: string; name: string; description: string; emoji: string }[];
}> = {
  alphabet: {
    name: "Alphabet",
    emoji: "🔤",
    gradient: "from-pink-400 to-rose-500",
    activities: [
      { id: "learn-letters", name: "Learn Letters", description: "Discover A to Z!", emoji: "📖" },
      { id: "letter-sounds", name: "Letter Sounds", description: "Hear how letters sound", emoji: "🔊" },
      { id: "match-letters", name: "Match Letters", description: "Match uppercase & lowercase", emoji: "🎯" },
      { id: "spell-words", name: "Spell Words", description: "Build simple words", emoji: "✨" },
    ],
  },
  numbers: {
    name: "Numbers",
    emoji: "🔢",
    gradient: "from-blue-400 to-blue-600",
    activities: [
      { id: "count-objects", name: "Count Objects", description: "Learn to count 1-20", emoji: "🔢" },
      { id: "number-order", name: "Number Order", description: "Put numbers in order", emoji: "📊" },
      { id: "addition", name: "Simple Addition", description: "Add numbers together", emoji: "➕" },
      { id: "subtraction", name: "Simple Subtraction", description: "Take numbers away", emoji: "➖" },
    ],
  },
  shapes: {
    name: "Shapes",
    emoji: "🔺",
    gradient: "from-emerald-400 to-green-500",
    activities: [
      { id: "learn-shapes", name: "Learn Shapes", description: "Circles, squares & more!", emoji: "⭕" },
      { id: "find-shapes", name: "Find Shapes", description: "Spot shapes around you", emoji: "🔍" },
      { id: "draw-shapes", name: "Draw Shapes", description: "Trace and draw shapes", emoji: "✏️" },
      { id: "match-shapes", name: "Match Shapes", description: "Match similar shapes", emoji: "🎯" },
    ],
  },
  colors: {
    name: "Colors",
    emoji: "🎨",
    gradient: "from-purple-400 to-pink-400",
    activities: [
      { id: "learn-colors", name: "Learn Colors", description: "Red, blue, yellow & more!", emoji: "🌈" },
      { id: "color-match", name: "Color Match", description: "Match colors together", emoji: "🎯" },
      { id: "mix-colors", name: "Mix Colors", description: "See what colors make!", emoji: "🧪" },
      { id: "color-objects", name: "Color Objects", description: "Paint and color fun!", emoji: "🖌️" },
    ],
  },
  languages: {
    name: "Languages",
    emoji: "🌍",
    gradient: "from-orange-400 to-orange-500",
    activities: [
      { id: "spanish-basics", name: "Spanish Basics", description: "Hola! Learn Spanish", emoji: "🇪🇸" },
      { id: "french-basics", name: "French Basics", description: "Bonjour! Learn French", emoji: "🇫🇷" },
      { id: "greetings", name: "World Greetings", description: "Say hello worldwide", emoji: "👋" },
      { id: "animal-names", name: "Animal Names", description: "Animals in many languages", emoji: "🐾" },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const category = categoryData[categoryId];

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Category not found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Category Header */}
        <div className={`rounded-3xl bg-gradient-to-br ${category.gradient} p-8 mb-8 text-white text-center`}>
          <div className="text-6xl mb-4">{category.emoji}</div>
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-xl opacity-90">Choose an activity to start learning!</p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {category.activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/category/${categoryId}/activity/${activity.id}`}
              className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{activity.emoji}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{activity.name}</h3>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

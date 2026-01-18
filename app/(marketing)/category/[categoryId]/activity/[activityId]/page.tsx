"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ============ ALPHABET ACTIVITIES ============

function LearnLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const letterWords: Record<string, { word: string; emoji: string }> = {
    A: { word: "Apple", emoji: "🍎" },
    B: { word: "Ball", emoji: "⚽" },
    C: { word: "Cat", emoji: "🐱" },
    D: { word: "Dog", emoji: "🐕" },
    E: { word: "Elephant", emoji: "🐘" },
    F: { word: "Fish", emoji: "🐟" },
    G: { word: "Grapes", emoji: "🍇" },
    H: { word: "House", emoji: "🏠" },
    I: { word: "Ice cream", emoji: "🍦" },
    J: { word: "Juice", emoji: "🧃" },
    K: { word: "Kite", emoji: "🪁" },
    L: { word: "Lion", emoji: "🦁" },
    M: { word: "Moon", emoji: "🌙" },
    N: { word: "Nest", emoji: "🪺" },
    O: { word: "Orange", emoji: "🍊" },
    P: { word: "Penguin", emoji: "🐧" },
    Q: { word: "Queen", emoji: "👸" },
    R: { word: "Rainbow", emoji: "🌈" },
    S: { word: "Star", emoji: "⭐" },
    T: { word: "Tree", emoji: "🌳" },
    U: { word: "Umbrella", emoji: "☂️" },
    V: { word: "Violin", emoji: "🎻" },
    W: { word: "Whale", emoji: "🐋" },
    X: { word: "Xylophone", emoji: "🎹" },
    Y: { word: "Yarn", emoji: "🧶" },
    Z: { word: "Zebra", emoji: "🦓" },
  };

  const current = letters[currentIndex];
  const info = letterWords[current];

  return (
    <div className="text-center">
      <div className="text-9xl font-bold text-blue-500 mb-4">{current}</div>
      <div className="text-8xl mb-4">{info.emoji}</div>
      <p className="text-2xl text-gray-700 mb-6">
        <span className="font-bold text-blue-500">{current}</span> is for {info.word}
      </p>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentIndex((i) => (i - 1 + 26) % 26)}
        >
          ← Previous
        </Button>
        <Button
          size="lg"
          onClick={() => setCurrentIndex((i) => (i + 1) % 26)}
        >
          Next →
        </Button>
      </div>
      <p className="text-gray-500 mt-4">Letter {currentIndex + 1} of 26</p>
    </div>
  );
}

function MatchLetters() {
  const pairs = [
    { upper: "A", lower: "a" },
    { upper: "B", lower: "b" },
    { upper: "C", lower: "c" },
    { upper: "D", lower: "d" },
    { upper: "E", lower: "e" },
    { upper: "F", lower: "f" },
  ];
  const [currentPair, setCurrentPair] = useState(0);
  const [options, setOptions] = useState(["a", "c", "b", "d"]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const checkAnswer = (answer: string) => {
    setSelected(answer);
    if (answer === pairs[currentPair].lower) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      setSelected(null);
      setCurrentPair((p) => (p + 1) % pairs.length);
      const correct = pairs[(currentPair + 1) % pairs.length].lower;
      const others = ["a", "b", "c", "d", "e", "f"].filter((l) => l !== correct);
      const shuffled = [correct, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
      setOptions(shuffled);
    }, 1000);
  };

  return (
    <div className="text-center">
      <p className="text-xl text-gray-600 mb-4">Match the uppercase letter with lowercase!</p>
      <div className="text-9xl font-bold text-purple-500 mb-8">{pairs[currentPair].upper}</div>
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => !selected && checkAnswer(opt)}
            className={`text-4xl p-6 rounded-2xl font-bold transition-all ${
              selected === opt
                ? opt === pairs[currentPair].lower
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <p className="text-xl text-gray-600">Score: {score} ⭐</p>
    </div>
  );
}

// ============ NUMBERS ACTIVITIES ============

function CountObjects() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(5);
  const [items, setItems] = useState<number[]>([1, 2, 3, 4, 5]);
  const [clicked, setClicked] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const emojis = ["🍎", "⭐", "🌸", "🎈", "🐱"];
  const emoji = emojis[target % emojis.length];

  const handleClick = (index: number) => {
    if (clicked.includes(index)) return;
    setClicked([...clicked, index]);
    const newCount = count + 1;
    setCount(newCount);
    if (newCount === target) {
      setMessage("🎉 Great job! You counted them all!");
    }
  };

  const reset = () => {
    const newTarget = Math.floor(Math.random() * 8) + 3;
    setTarget(newTarget);
    setItems(Array.from({ length: newTarget }, (_, i) => i));
    setCount(0);
    setClicked([]);
    setMessage("");
  };

  return (
    <div className="text-center">
      <p className="text-xl text-gray-600 mb-4">Tap each {emoji} to count them!</p>
      <div className="flex flex-wrap justify-center gap-4 mb-6 min-h-[120px]">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`text-5xl p-2 transition-transform ${
              clicked.includes(index) ? "scale-75 opacity-50" : "hover:scale-110"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="text-6xl font-bold text-blue-500 mb-4">{count}</div>
      {message && <p className="text-2xl text-green-600 mb-4">{message}</p>}
      <Button onClick={reset} size="lg">
        <RefreshCw className="w-5 h-5 mr-2" /> New Game
      </Button>
    </div>
  );
}

function SimpleAddition() {
  const [num1, setNum1] = useState(3);
  const [num2, setNum2] = useState(2);
  const [options, setOptions] = useState([5, 4, 6, 3]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const correct = num1 + num2;

  const newProblem = () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    setNum1(a);
    setNum2(b);
    const answer = a + b;
    const opts = [answer];
    while (opts.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 5) - 2;
      if (wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    setSelected(null);
  };

  const checkAnswer = (answer: number) => {
    setSelected(answer);
    if (answer === correct) setScore((s) => s + 1);
    setTimeout(newProblem, 1000);
  };

  return (
    <div className="text-center">
      <p className="text-xl text-gray-600 mb-6">What is the answer?</p>
      <div className="text-6xl font-bold mb-8">
        <span className="text-blue-500">{num1}</span>
        <span className="text-gray-400 mx-4">+</span>
        <span className="text-green-500">{num2}</span>
        <span className="text-gray-400 mx-4">=</span>
        <span className="text-purple-500">?</span>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => !selected && checkAnswer(opt)}
            className={`text-3xl p-6 rounded-2xl font-bold transition-all ${
              selected === opt
                ? opt === correct
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-blue-100 hover:bg-blue-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <p className="text-xl text-gray-600">Score: {score} ⭐</p>
    </div>
  );
}

// ============ SHAPES ACTIVITIES ============

function LearnShapes() {
  const shapes = [
    { name: "Circle", emoji: "⭕", color: "text-red-500" },
    { name: "Square", emoji: "🟦", color: "text-blue-500" },
    { name: "Triangle", emoji: "🔺", color: "text-yellow-500" },
    { name: "Star", emoji: "⭐", color: "text-yellow-400" },
    { name: "Heart", emoji: "❤️", color: "text-red-500" },
    { name: "Diamond", emoji: "🔷", color: "text-blue-400" },
  ];
  const [current, setCurrent] = useState(0);

  return (
    <div className="text-center">
      <div className="text-9xl mb-6">{shapes[current].emoji}</div>
      <p className={`text-4xl font-bold mb-6 ${shapes[current].color}`}>
        {shapes[current].name}
      </p>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrent((c) => (c - 1 + shapes.length) % shapes.length)}
        >
          ← Previous
        </Button>
        <Button
          size="lg"
          onClick={() => setCurrent((c) => (c + 1) % shapes.length)}
        >
          Next →
        </Button>
      </div>
      <p className="text-gray-500 mt-4">Shape {current + 1} of {shapes.length}</p>
    </div>
  );
}

function MatchShapes() {
  const shapes = ["⭕", "🟦", "🔺", "⭐", "❤️", "🔷"];
  const [target, setTarget] = useState("⭕");
  const [options, setOptions] = useState(["⭕", "🟦", "🔺", "⭐"]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const newRound = () => {
    const newTarget = shapes[Math.floor(Math.random() * shapes.length)];
    setTarget(newTarget);
    const opts = [newTarget];
    while (opts.length < 4) {
      const other = shapes[Math.floor(Math.random() * shapes.length)];
      if (!opts.includes(other)) opts.push(other);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    setSelected(null);
  };

  const checkAnswer = (answer: string) => {
    setSelected(answer);
    if (answer === target) setScore((s) => s + 1);
    setTimeout(newRound, 1000);
  };

  return (
    <div className="text-center">
      <p className="text-xl text-gray-600 mb-4">Find the matching shape!</p>
      <div className="text-8xl mb-8">{target}</div>
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !selected && checkAnswer(opt)}
            className={`text-5xl p-6 rounded-2xl transition-all ${
              selected === opt
                ? opt === target
                  ? "bg-green-500"
                  : "bg-red-500"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <p className="text-xl text-gray-600">Score: {score} ⭐</p>
    </div>
  );
}

// ============ COLORS ACTIVITIES ============

function LearnColors() {
  const colors = [
    { name: "Red", bg: "bg-red-500", emoji: "🔴" },
    { name: "Blue", bg: "bg-blue-500", emoji: "🔵" },
    { name: "Yellow", bg: "bg-yellow-400", emoji: "🟡" },
    { name: "Green", bg: "bg-green-500", emoji: "🟢" },
    { name: "Purple", bg: "bg-purple-500", emoji: "🟣" },
    { name: "Orange", bg: "bg-orange-500", emoji: "🟠" },
  ];
  const [current, setCurrent] = useState(0);

  return (
    <div className="text-center">
      <div className={`w-40 h-40 rounded-full ${colors[current].bg} mx-auto mb-6 shadow-lg`} />
      <p className="text-4xl font-bold text-gray-800 mb-2">{colors[current].name}</p>
      <p className="text-6xl mb-6">{colors[current].emoji}</p>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrent((c) => (c - 1 + colors.length) % colors.length)}
        >
          ← Previous
        </Button>
        <Button
          size="lg"
          onClick={() => setCurrent((c) => (c + 1) % colors.length)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

function ColorMatch() {
  const colors = [
    { name: "Red", bg: "bg-red-500" },
    { name: "Blue", bg: "bg-blue-500" },
    { name: "Yellow", bg: "bg-yellow-400" },
    { name: "Green", bg: "bg-green-500" },
  ];
  const [target, setTarget] = useState(colors[0]);
  const [options, setOptions] = useState(colors);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const newRound = () => {
    const newTarget = colors[Math.floor(Math.random() * colors.length)];
    setTarget(newTarget);
    setOptions([...colors].sort(() => Math.random() - 0.5));
    setSelected(null);
  };

  const checkAnswer = (name: string) => {
    setSelected(name);
    if (name === target.name) setScore((s) => s + 1);
    setTimeout(newRound, 1000);
  };

  return (
    <div className="text-center">
      <p className="text-xl text-gray-600 mb-4">Find the color: <strong>{target.name}</strong></p>
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
        {options.map((color) => (
          <button
            key={color.name}
            onClick={() => !selected && checkAnswer(color.name)}
            className={`w-full h-24 rounded-2xl ${color.bg} transition-all ${
              selected === color.name
                ? color.name === target.name
                  ? "ring-4 ring-green-400"
                  : "ring-4 ring-red-400 opacity-50"
                : "hover:scale-105"
            }`}
          />
        ))}
      </div>
      <p className="text-xl text-gray-600">Score: {score} ⭐</p>
    </div>
  );
}

function MixColors() {
  const mixes = [
    { color1: "🔴 Red", color2: "🔵 Blue", result: "🟣 Purple", emoji: "🟣" },
    { color1: "🔴 Red", color2: "🟡 Yellow", result: "🟠 Orange", emoji: "🟠" },
    { color1: "🔵 Blue", color2: "🟡 Yellow", result: "🟢 Green", emoji: "🟢" },
    { color1: "🔴 Red", color2: "⚪ White", result: "🩷 Pink", emoji: "🩷" },
  ];
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const mix = () => {
    setShowResult(true);
    setTimeout(() => {
      setShowResult(false);
      setCurrent((c) => (c + 1) % mixes.length);
    }, 2000);
  };

  return (
    <div className="text-center">
      <p className="text-xl text-gray-600 mb-6">See what colors make when mixed!</p>
      <div className="text-3xl mb-6">
        <span>{mixes[current].color1}</span>
        <span className="mx-4">+</span>
        <span>{mixes[current].color2}</span>
      </div>
      {showResult ? (
        <div className="text-6xl mb-6 animate-bounce">
          = {mixes[current].emoji} {mixes[current].result}
        </div>
      ) : (
        <Button size="lg" onClick={mix}>
          Mix Colors! 🎨
        </Button>
      )}
    </div>
  );
}

// ============ LANGUAGES ACTIVITIES ============

function SpanishBasics() {
  const words = [
    { english: "Hello", spanish: "Hola", emoji: "👋" },
    { english: "Goodbye", spanish: "Adiós", emoji: "👋" },
    { english: "Thank you", spanish: "Gracias", emoji: "🙏" },
    { english: "Please", spanish: "Por favor", emoji: "😊" },
    { english: "Yes", spanish: "Sí", emoji: "✅" },
    { english: "No", spanish: "No", emoji: "❌" },
    { english: "Water", spanish: "Agua", emoji: "💧" },
    { english: "Food", spanish: "Comida", emoji: "🍽️" },
  ];
  const [current, setCurrent] = useState(0);

  return (
    <div className="text-center">
      <p className="text-6xl mb-4">{words[current].emoji}</p>
      <p className="text-2xl text-gray-600 mb-2">English: <strong>{words[current].english}</strong></p>
      <p className="text-4xl font-bold text-green-600 mb-6">Spanish: {words[current].spanish}</p>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrent((c) => (c - 1 + words.length) % words.length)}
        >
          ← Previous
        </Button>
        <Button
          size="lg"
          onClick={() => setCurrent((c) => (c + 1) % words.length)}
        >
          Next →
        </Button>
      </div>
      <p className="text-gray-500 mt-4">Word {current + 1} of {words.length}</p>
    </div>
  );
}

function FrenchBasics() {
  const words = [
    { english: "Hello", french: "Bonjour", emoji: "👋" },
    { english: "Goodbye", french: "Au revoir", emoji: "👋" },
    { english: "Thank you", french: "Merci", emoji: "🙏" },
    { english: "Please", french: "S'il vous plaît", emoji: "😊" },
    { english: "Yes", french: "Oui", emoji: "✅" },
    { english: "No", french: "Non", emoji: "❌" },
    { english: "Water", french: "Eau", emoji: "💧" },
    { english: "Food", french: "Nourriture", emoji: "🍽️" },
  ];
  const [current, setCurrent] = useState(0);

  return (
    <div className="text-center">
      <p className="text-6xl mb-4">{words[current].emoji}</p>
      <p className="text-2xl text-gray-600 mb-2">English: <strong>{words[current].english}</strong></p>
      <p className="text-4xl font-bold text-blue-600 mb-6">French: {words[current].french}</p>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrent((c) => (c - 1 + words.length) % words.length)}
        >
          ← Previous
        </Button>
        <Button
          size="lg"
          onClick={() => setCurrent((c) => (c + 1) % words.length)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

function WorldGreetings() {
  const greetings = [
    { language: "Spanish", word: "¡Hola!", flag: "🇪🇸" },
    { language: "French", word: "Bonjour!", flag: "🇫🇷" },
    { language: "German", word: "Hallo!", flag: "🇩🇪" },
    { language: "Italian", word: "Ciao!", flag: "🇮🇹" },
    { language: "Japanese", word: "こんにちは!", flag: "🇯🇵" },
    { language: "Chinese", word: "你好!", flag: "🇨🇳" },
    { language: "Korean", word: "안녕하세요!", flag: "🇰🇷" },
    { language: "Portuguese", word: "Olá!", flag: "🇵🇹" },
  ];
  const [current, setCurrent] = useState(0);

  return (
    <div className="text-center">
      <p className="text-8xl mb-4">{greetings[current].flag}</p>
      <p className="text-2xl text-gray-600 mb-2">{greetings[current].language}</p>
      <p className="text-4xl font-bold text-purple-600 mb-6">{greetings[current].word}</p>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrent((c) => (c - 1 + greetings.length) % greetings.length)}
        >
          ← Previous
        </Button>
        <Button
          size="lg"
          onClick={() => setCurrent((c) => (c + 1) % greetings.length)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

function AnimalNames() {
  const animals = [
    { english: "Dog", spanish: "Perro", french: "Chien", emoji: "🐕" },
    { english: "Cat", spanish: "Gato", french: "Chat", emoji: "🐱" },
    { english: "Bird", spanish: "Pájaro", french: "Oiseau", emoji: "🐦" },
    { english: "Fish", spanish: "Pez", french: "Poisson", emoji: "🐟" },
    { english: "Horse", spanish: "Caballo", french: "Cheval", emoji: "🐴" },
    { english: "Cow", spanish: "Vaca", french: "Vache", emoji: "🐄" },
  ];
  const [current, setCurrent] = useState(0);

  return (
    <div className="text-center">
      <p className="text-8xl mb-4">{animals[current].emoji}</p>
      <p className="text-2xl font-bold text-gray-800 mb-4">{animals[current].english}</p>
      <div className="space-y-2 mb-6">
        <p className="text-xl">🇪🇸 Spanish: <strong className="text-green-600">{animals[current].spanish}</strong></p>
        <p className="text-xl">🇫🇷 French: <strong className="text-blue-600">{animals[current].french}</strong></p>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrent((c) => (c - 1 + animals.length) % animals.length)}
        >
          ← Previous
        </Button>
        <Button
          size="lg"
          onClick={() => setCurrent((c) => (c + 1) % animals.length)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

// ============ ACTIVITY ROUTER ============

const activities: Record<string, Record<string, () => JSX.Element>> = {
  alphabet: {
    "learn-letters": LearnLetters,
    "letter-sounds": LearnLetters, // Reuse for now
    "match-letters": MatchLetters,
    "spell-words": MatchLetters, // Reuse for now
  },
  numbers: {
    "count-objects": CountObjects,
    "number-order": CountObjects, // Reuse for now
    addition: SimpleAddition,
    subtraction: SimpleAddition, // Reuse for now
  },
  shapes: {
    "learn-shapes": LearnShapes,
    "find-shapes": MatchShapes,
    "draw-shapes": LearnShapes, // Reuse for now
    "match-shapes": MatchShapes,
  },
  colors: {
    "learn-colors": LearnColors,
    "color-match": ColorMatch,
    "mix-colors": MixColors,
    "color-objects": ColorMatch, // Reuse for now
  },
  languages: {
    "spanish-basics": SpanishBasics,
    "french-basics": FrenchBasics,
    greetings: WorldGreetings,
    "animal-names": AnimalNames,
  },
};

export default function ActivityPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const activityId = params.activityId as string;

  const activityName = activityId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const ActivityComponent = activities[categoryId]?.[activityId];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        <Link
          href={`/category/${categoryId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Category
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{activityName}</h1>

            {ActivityComponent ? (
              <ActivityComponent />
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-600">Activity not found</p>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
              <Link href={`/category/${categoryId}`}>
                <Button variant="outline">Try Another Activity</Button>
              </Link>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

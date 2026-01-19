// Alphabet Module for AI Kids Tutor

window.modules = window.modules || {};

window.modules.alphabet = {
  currentLetter: 0,
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),

  render(container) {
    const letter = this.letters[this.currentLetter];
    const words = this.getWordsForLetter(letter);

    container.innerHTML = `
      <div class="text-center">
        <!-- Letter Display -->
        <div class="bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl p-8 mb-6 inline-block shadow-xl">
          <div class="text-9xl font-bold text-white animate-bounce-slow">${letter}</div>
          <div class="text-4xl text-white/80 mt-2">${letter.toLowerCase()}</div>
        </div>

        <!-- Words with this letter -->
        <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          ${words.map(word => `
            <div class="bg-white rounded-2xl p-4 shadow-lg card-hover cursor-pointer" onclick="window.modules.alphabet.speakWord('${word.text}')">
              <div class="text-4xl mb-2">${word.emoji}</div>
              <div class="text-lg font-bold text-gray-700">${word.text}</div>
            </div>
          `).join('')}
        </div>

        <!-- Navigation -->
        <div class="flex justify-center gap-4">
          <button onclick="window.modules.alphabet.prevLetter()"
                  class="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all ${this.currentLetter === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
            ← Previous
          </button>
          <button onclick="window.modules.alphabet.nextLetter()"
                  class="bg-kid-pink hover:bg-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
            Next →
          </button>
        </div>

        <!-- Letter Progress -->
        <div class="mt-6 flex justify-center gap-1 flex-wrap max-w-xl mx-auto">
          ${this.letters.map((l, i) => `
            <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition-all
                  ${i === this.currentLetter ? 'bg-kid-pink text-white scale-125' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}"
                  onclick="window.modules.alphabet.goToLetter(${i})">
              ${l}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  },

  getWordsForLetter(letter) {
    const wordBank = {
      A: [{ emoji: '🍎', text: 'Apple' }, { emoji: '✈️', text: 'Airplane' }, { emoji: '🐜', text: 'Ant' }],
      B: [{ emoji: '🎈', text: 'Balloon' }, { emoji: '🐻', text: 'Bear' }, { emoji: '🍌', text: 'Banana' }],
      C: [{ emoji: '🐱', text: 'Cat' }, { emoji: '🚗', text: 'Car' }, { emoji: '🍪', text: 'Cookie' }],
      D: [{ emoji: '🐕', text: 'Dog' }, { emoji: '🦆', text: 'Duck' }, { emoji: '🍩', text: 'Donut' }],
      E: [{ emoji: '🐘', text: 'Elephant' }, { emoji: '🥚', text: 'Egg' }, { emoji: '👁️', text: 'Eye' }],
      F: [{ emoji: '🐸', text: 'Frog' }, { emoji: '🐟', text: 'Fish' }, { emoji: '🌸', text: 'Flower' }],
      G: [{ emoji: '🍇', text: 'Grapes' }, { emoji: '🦒', text: 'Giraffe' }, { emoji: '🎸', text: 'Guitar' }],
      H: [{ emoji: '🏠', text: 'House' }, { emoji: '🐴', text: 'Horse' }, { emoji: '❤️', text: 'Heart' }],
      I: [{ emoji: '🍦', text: 'Ice Cream' }, { emoji: '🦎', text: 'Iguana' }, { emoji: '🏝️', text: 'Island' }],
      J: [{ emoji: '🃏', text: 'Joker' }, { emoji: '🧃', text: 'Juice' }, { emoji: '👖', text: 'Jeans' }],
      K: [{ emoji: '🪁', text: 'Kite' }, { emoji: '🔑', text: 'Key' }, { emoji: '🦘', text: 'Kangaroo' }],
      L: [{ emoji: '🦁', text: 'Lion' }, { emoji: '🍋', text: 'Lemon' }, { emoji: '🍃', text: 'Leaf' }],
      M: [{ emoji: '🐵', text: 'Monkey' }, { emoji: '🌙', text: 'Moon' }, { emoji: '🍄', text: 'Mushroom' }],
      N: [{ emoji: '👃', text: 'Nose' }, { emoji: '🌙', text: 'Night' }, { emoji: '📰', text: 'Newspaper' }],
      O: [{ emoji: '🍊', text: 'Orange' }, { emoji: '🦉', text: 'Owl' }, { emoji: '🐙', text: 'Octopus' }],
      P: [{ emoji: '🐷', text: 'Pig' }, { emoji: '🍕', text: 'Pizza' }, { emoji: '🐧', text: 'Penguin' }],
      Q: [{ emoji: '👑', text: 'Queen' }, { emoji: '❓', text: 'Question' }, { emoji: '🦆', text: 'Quack' }],
      R: [{ emoji: '🐰', text: 'Rabbit' }, { emoji: '🌈', text: 'Rainbow' }, { emoji: '🤖', text: 'Robot' }],
      S: [{ emoji: '☀️', text: 'Sun' }, { emoji: '⭐', text: 'Star' }, { emoji: '🐍', text: 'Snake' }],
      T: [{ emoji: '🐯', text: 'Tiger' }, { emoji: '🌳', text: 'Tree' }, { emoji: '🐢', text: 'Turtle' }],
      U: [{ emoji: '☂️', text: 'Umbrella' }, { emoji: '🦄', text: 'Unicorn' }, { emoji: '⬆️', text: 'Up' }],
      V: [{ emoji: '🎻', text: 'Violin' }, { emoji: '🌋', text: 'Volcano' }, { emoji: '💜', text: 'Violet' }],
      W: [{ emoji: '🐋', text: 'Whale' }, { emoji: '🌊', text: 'Wave' }, { emoji: '⌚', text: 'Watch' }],
      X: [{ emoji: '🎸', text: 'Xylophone' }, { emoji: '❌', text: 'X-mark' }, { emoji: '🩻', text: 'X-ray' }],
      Y: [{ emoji: '💛', text: 'Yellow' }, { emoji: '🪀', text: 'Yo-yo' }, { emoji: '🥱', text: 'Yawn' }],
      Z: [{ emoji: '🦓', text: 'Zebra' }, { emoji: '⚡', text: 'Zap' }, { emoji: '🤐', text: 'Zipper' }]
    };
    return wordBank[letter] || [{ emoji: '❓', text: 'Unknown' }];
  },

  nextLetter() {
    if (this.currentLetter < this.letters.length - 1) {
      this.currentLetter++;
      if (this.currentLetter % 5 === 0) {
        window.addStars('alphabet', 1);
      }
      this.render(document.getElementById('module-body'));
      window.playSound('click');
    }
  },

  prevLetter() {
    if (this.currentLetter > 0) {
      this.currentLetter--;
      this.render(document.getElementById('module-body'));
      window.playSound('click');
    }
  },

  goToLetter(index) {
    this.currentLetter = index;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  },

  speakWord(word) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
    window.playSound('correct');
  }
};

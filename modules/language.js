// Language Module for AI Kids Tutor

window.modules = window.modules || {};

window.modules.language = {
  currentWord: 0,
  words: [
    { english: 'Hello', spanish: 'Hola', french: 'Bonjour', emoji: '👋' },
    { english: 'Goodbye', spanish: 'Adiós', french: 'Au revoir', emoji: '👋' },
    { english: 'Please', spanish: 'Por favor', french: 'S\'il vous plaît', emoji: '🙏' },
    { english: 'Thank you', spanish: 'Gracias', french: 'Merci', emoji: '🙏' },
    { english: 'Yes', spanish: 'Sí', french: 'Oui', emoji: '✅' },
    { english: 'No', spanish: 'No', french: 'Non', emoji: '❌' },
    { english: 'Friend', spanish: 'Amigo', french: 'Ami', emoji: '🤝' },
    { english: 'Family', spanish: 'Familia', french: 'Famille', emoji: '👨‍👩‍👧‍👦' },
    { english: 'Love', spanish: 'Amor', french: 'Amour', emoji: '❤️' },
    { english: 'Happy', spanish: 'Feliz', french: 'Heureux', emoji: '😊' },
    { english: 'Cat', spanish: 'Gato', french: 'Chat', emoji: '🐱' },
    { english: 'Dog', spanish: 'Perro', french: 'Chien', emoji: '🐕' },
    { english: 'Water', spanish: 'Agua', french: 'Eau', emoji: '💧' },
    { english: 'Food', spanish: 'Comida', french: 'Nourriture', emoji: '🍽️' },
    { english: 'Sun', spanish: 'Sol', french: 'Soleil', emoji: '☀️' },
    { english: 'Moon', spanish: 'Luna', french: 'Lune', emoji: '🌙' },
    { english: 'Star', spanish: 'Estrella', french: 'Étoile', emoji: '⭐' },
    { english: 'Book', spanish: 'Libro', french: 'Livre', emoji: '📚' },
    { english: 'School', spanish: 'Escuela', french: 'École', emoji: '🏫' },
    { english: 'Home', spanish: 'Casa', french: 'Maison', emoji: '🏠' }
  ],

  render(container) {
    const word = this.words[this.currentWord];

    container.innerHTML = `
      <div class="text-center">
        <!-- Word Display -->
        <div class="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 mb-6 inline-block shadow-xl">
          <div class="text-8xl mb-4">${word.emoji}</div>
          <div class="text-4xl font-bold text-white">${word.english}</div>
        </div>

        <!-- Translations -->
        <div class="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-6">
          <!-- Spanish -->
          <div class="bg-white rounded-3xl p-6 shadow-lg card-hover cursor-pointer" onclick="window.modules.language.speak('${word.spanish}', 'es-ES')">
            <div class="flex items-center justify-between mb-2">
              <span class="text-3xl">🇪🇸</span>
              <span class="text-sm font-bold text-gray-500">Spanish</span>
            </div>
            <div class="text-3xl font-bold text-orange-500">${word.spanish}</div>
            <p class="text-sm text-gray-400 mt-2">Tap to hear!</p>
          </div>

          <!-- French -->
          <div class="bg-white rounded-3xl p-6 shadow-lg card-hover cursor-pointer" onclick="window.modules.language.speak('${word.french}', 'fr-FR')">
            <div class="flex items-center justify-between mb-2">
              <span class="text-3xl">🇫🇷</span>
              <span class="text-sm font-bold text-gray-500">French</span>
            </div>
            <div class="text-3xl font-bold text-blue-500">${word.french}</div>
            <p class="text-sm text-gray-400 mt-2">Tap to hear!</p>
          </div>
        </div>

        <!-- English pronunciation -->
        <button onclick="window.modules.language.speak('${word.english}', 'en-US')"
                class="bg-kid-blue text-white px-6 py-3 rounded-full font-bold shadow-lg mb-6 hover:scale-105 transition-all">
          🔊 Hear in English
        </button>

        <!-- Quiz Section -->
        <div class="bg-yellow-50 rounded-3xl p-6 mb-6 max-w-md mx-auto">
          <p class="text-lg font-bold text-gray-700 mb-4">What is "${word.spanish}" in English?</p>
          <div class="flex flex-wrap justify-center gap-3">
            ${this.generateQuiz(word).map(w => `
              <button onclick="window.modules.language.checkAnswer('${w}', '${word.english}')"
                      class="bg-white hover:bg-orange-100 text-lg font-bold px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105">
                ${w}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-center gap-4">
          <button onclick="window.modules.language.prevWord()"
                  class="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
            ← Previous
          </button>
          <button onclick="window.modules.language.nextWord()"
                  class="bg-kid-orange hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
            Next →
          </button>
        </div>

        <!-- Word Progress -->
        <div class="mt-6 text-center">
          <span class="text-gray-600">Word ${this.currentWord + 1} of ${this.words.length}</span>
          <div class="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-kid-orange h-2 rounded-full transition-all" style="width: ${((this.currentWord + 1) / this.words.length) * 100}%"></div>
          </div>
        </div>
      </div>
    `;
  },

  speak(text, lang) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
    window.playSound('click');
  },

  generateQuiz(correct) {
    const options = [correct.english];
    const otherWords = this.words.filter(w => w.english !== correct.english);
    while (options.length < 3 && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      options.push(otherWords.splice(randomIndex, 1)[0].english);
    }
    return options.sort(() => Math.random() - 0.5);
  },

  checkAnswer(selected, correct) {
    if (selected === correct) {
      window.addStars('language', 1);
      alert('🎉 Excellent! You\'re learning so fast!');
    } else {
      window.playSound('wrong');
      alert('Not quite! The answer is "' + correct + '". Keep practicing!');
    }
  },

  nextWord() {
    this.currentWord = (this.currentWord + 1) % this.words.length;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  },

  prevWord() {
    this.currentWord = (this.currentWord - 1 + this.words.length) % this.words.length;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  }
};

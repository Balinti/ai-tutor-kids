// Numbers Module for AI Kids Tutor

window.modules = window.modules || {};

window.modules.numbers = {
  currentNumber: 1,
  maxNumber: 20,

  render(container) {
    const num = this.currentNumber;
    const items = this.getItemsForNumber(num);

    container.innerHTML = `
      <div class="text-center">
        <!-- Number Display -->
        <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-8 mb-6 inline-block shadow-xl">
          <div class="text-9xl font-bold text-white animate-bounce-slow">${num}</div>
          <div class="text-2xl text-white/80 mt-2">${this.numberToWord(num)}</div>
        </div>

        <!-- Counting Items -->
        <div class="bg-white rounded-3xl p-6 mb-6 max-w-xl mx-auto shadow-lg">
          <p class="text-lg text-gray-600 mb-4">Count the ${items.name}!</p>
          <div class="flex flex-wrap justify-center gap-2">
            ${Array(num).fill(items.emoji).map((emoji, i) => `
              <span class="text-4xl animate-bounce-slow" style="animation-delay: ${i * 0.1}s">${emoji}</span>
            `).join('')}
          </div>
        </div>

        <!-- Mini Quiz -->
        <div class="bg-yellow-50 rounded-3xl p-6 mb-6 max-w-md mx-auto">
          <p class="text-lg font-bold text-gray-700 mb-4">How many ${items.name} are there?</p>
          <div class="flex justify-center gap-3">
            ${this.generateQuizOptions(num).map(opt => `
              <button onclick="window.modules.numbers.checkAnswer(${opt}, ${num})"
                      class="bg-white hover:bg-blue-100 text-2xl font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:scale-110">
                ${opt}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-center gap-4">
          <button onclick="window.modules.numbers.prevNumber()"
                  class="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all ${this.currentNumber === 1 ? 'opacity-50' : ''}">
            ← Previous
          </button>
          <button onclick="window.modules.numbers.nextNumber()"
                  class="bg-kid-blue hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all ${this.currentNumber === this.maxNumber ? 'opacity-50' : ''}">
            Next →
          </button>
        </div>

        <!-- Number Progress -->
        <div class="mt-6 flex justify-center gap-1 flex-wrap max-w-xl mx-auto">
          ${Array.from({length: this.maxNumber}, (_, i) => i + 1).map(n => `
            <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition-all
                  ${n === this.currentNumber ? 'bg-kid-blue text-white scale-125' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}"
                  onclick="window.modules.numbers.goToNumber(${n})">
              ${n}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  },

  getItemsForNumber(num) {
    const items = [
      { emoji: '⭐', name: 'stars' },
      { emoji: '🍎', name: 'apples' },
      { emoji: '🐱', name: 'cats' },
      { emoji: '🌸', name: 'flowers' },
      { emoji: '🐟', name: 'fish' },
      { emoji: '🦋', name: 'butterflies' },
      { emoji: '🍪', name: 'cookies' },
      { emoji: '🎈', name: 'balloons' }
    ];
    return items[num % items.length];
  },

  numberToWord(num) {
    const words = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
                   'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
    return words[num] || num.toString();
  },

  generateQuizOptions(correct) {
    const options = new Set([correct]);
    while (options.size < 3) {
      const rand = Math.max(1, Math.min(this.maxNumber, correct + Math.floor(Math.random() * 5) - 2));
      options.add(rand);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  },

  checkAnswer(selected, correct) {
    if (selected === correct) {
      window.addStars('numbers', 1);
      alert('🎉 Correct! Great counting!');
    } else {
      window.playSound('wrong');
      alert(`Not quite! The answer is ${correct}. Try again!`);
    }
  },

  nextNumber() {
    if (this.currentNumber < this.maxNumber) {
      this.currentNumber++;
      this.render(document.getElementById('module-body'));
      window.playSound('click');
    }
  },

  prevNumber() {
    if (this.currentNumber > 1) {
      this.currentNumber--;
      this.render(document.getElementById('module-body'));
      window.playSound('click');
    }
  },

  goToNumber(num) {
    this.currentNumber = num;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  }
};

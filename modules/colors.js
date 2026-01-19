// Colors Module for AI Kids Tutor

window.modules = window.modules || {};

window.modules.colors = {
  currentColor: 0,
  colors: [
    { name: 'Red', hex: '#EF4444', emoji: '🔴', items: ['🍎', '🍓', '❤️', '🌹'] },
    { name: 'Orange', hex: '#F97316', emoji: '🟠', items: ['🍊', '🥕', '🎃', '🧡'] },
    { name: 'Yellow', hex: '#EAB308', emoji: '🟡', items: ['🌻', '🍋', '⭐', '🌙'] },
    { name: 'Green', hex: '#22C55E', emoji: '🟢', items: ['🌲', '🥒', '🐸', '💚'] },
    { name: 'Blue', hex: '#3B82F6', emoji: '🔵', items: ['🐟', '💎', '🌊', '💙'] },
    { name: 'Purple', hex: '#A855F7', emoji: '🟣', items: ['🍇', '🔮', '🦄', '💜'] },
    { name: 'Pink', hex: '#EC4899', emoji: '💗', items: ['🌸', '🎀', '🦩', '💕'] },
    { name: 'Brown', hex: '#A16207', emoji: '🟤', items: ['🐻', '🍫', '🌰', '🥜'] },
    { name: 'Black', hex: '#1F2937', emoji: '⚫', items: ['🐈‍⬛', '🎱', '🖤', '🕶️'] },
    { name: 'White', hex: '#F9FAFB', emoji: '⚪', items: ['☁️', '⛄', '🤍', '🦢'] }
  ],

  render(container) {
    const color = this.colors[this.currentColor];

    container.innerHTML = `
      <div class="text-center">
        <!-- Color Display -->
        <div class="rounded-3xl p-8 mb-6 inline-block shadow-xl" style="background: linear-gradient(135deg, ${color.hex}, ${this.adjustBrightness(color.hex, -20)})">
          <div class="text-9xl mb-4">${color.emoji}</div>
          <div class="text-4xl font-bold text-white drop-shadow-lg">${color.name}</div>
        </div>

        <!-- Things with this color -->
        <div class="bg-white rounded-3xl p-6 mb-6 max-w-md mx-auto shadow-lg">
          <h3 class="text-xl font-bold text-gray-700 mb-4">Things that are ${color.name}!</h3>
          <div class="flex justify-center gap-4">
            ${color.items.map(item => `
              <span class="text-5xl animate-bounce-slow">${item}</span>
            `).join('')}
          </div>
        </div>

        <!-- Color Mixing (for some colors) -->
        ${this.getColorMixInfo(color.name)}

        <!-- Color Match Game -->
        <div class="bg-yellow-50 rounded-3xl p-6 mb-6 max-w-xl mx-auto">
          <p class="text-lg font-bold text-gray-700 mb-4">Which one is ${color.name}?</p>
          <div class="flex flex-wrap justify-center gap-4">
            ${this.generateColorQuiz(color).map(c => `
              <button onclick="window.modules.colors.checkColor('${c.name}', '${color.name}')"
                      class="w-16 h-16 rounded-full shadow-lg transition-all hover:scale-110 border-4 border-white"
                      style="background-color: ${c.hex}">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-center gap-4">
          <button onclick="window.modules.colors.prevColor()"
                  class="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
            ← Previous
          </button>
          <button onclick="window.modules.colors.nextColor()"
                  class="bg-kid-purple hover:bg-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
            Next →
          </button>
        </div>

        <!-- Color Progress -->
        <div class="mt-6 flex justify-center gap-2 flex-wrap">
          ${this.colors.map((c, i) => `
            <span class="text-3xl cursor-pointer transition-all hover:scale-125 ${i === this.currentColor ? 'scale-125 animate-bounce-slow' : 'opacity-60'}"
                  onclick="window.modules.colors.goToColor(${i})">
              ${c.emoji}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  },

  adjustBrightness(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  },

  getColorMixInfo(colorName) {
    const mixes = {
      Orange: { colors: ['Red', 'Yellow'], emojis: ['🔴', '🟡'] },
      Green: { colors: ['Blue', 'Yellow'], emojis: ['🔵', '🟡'] },
      Purple: { colors: ['Red', 'Blue'], emojis: ['🔴', '🔵'] },
      Pink: { colors: ['Red', 'White'], emojis: ['🔴', '⚪'] }
    };

    const mix = mixes[colorName];
    if (!mix) return '';

    return `
      <div class="bg-blue-50 rounded-3xl p-6 mb-6 max-w-md mx-auto">
        <h3 class="text-xl font-bold text-gray-700 mb-4">Color Magic! 🎨</h3>
        <div class="flex items-center justify-center gap-2 text-3xl">
          <span>${mix.emojis[0]}</span>
          <span class="text-gray-500">+</span>
          <span>${mix.emojis[1]}</span>
          <span class="text-gray-500">=</span>
          <span>${this.colors.find(c => c.name === colorName).emoji}</span>
        </div>
        <p class="text-gray-600 mt-2">${mix.colors[0]} + ${mix.colors[1]} = ${colorName}!</p>
      </div>
    `;
  },

  generateColorQuiz(correct) {
    const options = [correct];
    const otherColors = this.colors.filter(c => c.name !== correct.name);
    while (options.length < 4 && otherColors.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherColors.length);
      options.push(otherColors.splice(randomIndex, 1)[0]);
    }
    return options.sort(() => Math.random() - 0.5);
  },

  checkColor(selected, correct) {
    if (selected === correct) {
      window.addStars('colors', 1);
      alert('🎉 Wonderful! That\'s ' + correct + '!');
    } else {
      window.playSound('wrong');
      alert('Not quite! Look for ' + correct + '. Try again!');
    }
  },

  nextColor() {
    this.currentColor = (this.currentColor + 1) % this.colors.length;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  },

  prevColor() {
    this.currentColor = (this.currentColor - 1 + this.colors.length) % this.colors.length;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  },

  goToColor(index) {
    this.currentColor = index;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  }
};

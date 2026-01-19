// Shapes Module for AI Kids Tutor

window.modules = window.modules || {};

window.modules.shapes = {
  currentShape: 0,
  shapes: [
    { name: 'Circle', emoji: '⭕', color: 'red', sides: 0, svg: '<circle cx="50" cy="50" r="40" fill="currentColor"/>' },
    { name: 'Square', emoji: '⬜', color: 'blue', sides: 4, svg: '<rect x="10" y="10" width="80" height="80" fill="currentColor"/>' },
    { name: 'Triangle', emoji: '🔺', color: 'green', sides: 3, svg: '<polygon points="50,10 90,90 10,90" fill="currentColor"/>' },
    { name: 'Rectangle', emoji: '▬', color: 'purple', sides: 4, svg: '<rect x="10" y="25" width="80" height="50" fill="currentColor"/>' },
    { name: 'Star', emoji: '⭐', color: 'yellow', sides: 10, svg: '<polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="currentColor"/>' },
    { name: 'Heart', emoji: '❤️', color: 'pink', sides: 0, svg: '<path d="M50,88 C20,60 5,40 20,25 C35,10 50,25 50,25 C50,25 65,10 80,25 C95,40 80,60 50,88" fill="currentColor"/>' },
    { name: 'Diamond', emoji: '💎', color: 'cyan', sides: 4, svg: '<polygon points="50,5 95,50 50,95 5,50" fill="currentColor"/>' },
    { name: 'Oval', emoji: '⬭', color: 'orange', sides: 0, svg: '<ellipse cx="50" cy="50" rx="45" ry="30" fill="currentColor"/>' }
  ],

  render(container) {
    const shape = this.shapes[this.currentShape];
    const colorClass = this.getColorClass(shape.color);

    container.innerHTML = `
      <div class="text-center">
        <!-- Shape Display -->
        <div class="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-8 mb-6 inline-block shadow-xl">
          <svg viewBox="0 0 100 100" class="w-32 h-32 ${colorClass} mx-auto">
            ${shape.svg}
          </svg>
          <div class="text-3xl font-bold text-white mt-4">${shape.name}</div>
          <div class="text-lg text-white/80">${shape.sides > 0 ? shape.sides + ' sides' : 'No corners!'}</div>
        </div>

        <!-- Shape Info -->
        <div class="bg-white rounded-3xl p-6 mb-6 max-w-md mx-auto shadow-lg">
          <h3 class="text-xl font-bold text-gray-700 mb-2">Fun Facts!</h3>
          <p class="text-gray-600">${this.getShapeFact(shape.name)}</p>
        </div>

        <!-- Find the Shape Game -->
        <div class="bg-yellow-50 rounded-3xl p-6 mb-6 max-w-xl mx-auto">
          <p class="text-lg font-bold text-gray-700 mb-4">Find the ${shape.name}!</p>
          <div class="flex flex-wrap justify-center gap-4">
            ${this.generateShapeQuiz(shape).map((s, i) => `
              <button onclick="window.modules.shapes.checkShape('${s.name}', '${shape.name}')"
                      class="bg-white hover:bg-green-100 p-4 rounded-2xl shadow-lg transition-all hover:scale-110">
                <span class="text-5xl">${s.emoji}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-center gap-4">
          <button onclick="window.modules.shapes.prevShape()"
                  class="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
            ← Previous
          </button>
          <button onclick="window.modules.shapes.nextShape()"
                  class="bg-kid-green hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
            Next →
          </button>
        </div>

        <!-- Shape Progress -->
        <div class="mt-6 flex justify-center gap-2 flex-wrap">
          ${this.shapes.map((s, i) => `
            <span class="text-3xl cursor-pointer transition-all hover:scale-125 ${i === this.currentShape ? 'scale-125 animate-bounce-slow' : 'opacity-60'}"
                  onclick="window.modules.shapes.goToShape(${i})">
              ${s.emoji}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  },

  getColorClass(color) {
    const colors = {
      red: 'text-red-500',
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      yellow: 'text-yellow-400',
      pink: 'text-pink-500',
      cyan: 'text-cyan-500',
      orange: 'text-orange-500'
    };
    return colors[color] || 'text-gray-500';
  },

  getShapeFact(shapeName) {
    const facts = {
      Circle: 'A circle has no corners! Wheels are circles so they roll smoothly.',
      Square: 'All four sides of a square are the same length. Windows are often squares!',
      Triangle: 'Triangles are super strong! Bridges use triangles to stay up.',
      Rectangle: 'Rectangles have 2 long sides and 2 short sides. Doors are rectangles!',
      Star: 'Stars twinkle in the night sky. You\'re a star too! ⭐',
      Heart: 'Hearts remind us of love and kindness. Share your heart with others!',
      Diamond: 'Diamonds sparkle and shine. They\'re the hardest thing on Earth!',
      Oval: 'Ovals are like stretched circles. Eggs are oval shaped!'
    };
    return facts[shapeName] || 'Every shape is special!';
  },

  generateShapeQuiz(correct) {
    const options = [correct];
    const otherShapes = this.shapes.filter(s => s.name !== correct.name);
    while (options.length < 4 && otherShapes.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherShapes.length);
      options.push(otherShapes.splice(randomIndex, 1)[0]);
    }
    return options.sort(() => Math.random() - 0.5);
  },

  checkShape(selected, correct) {
    if (selected === correct) {
      window.addStars('shapes', 1);
      alert('🎉 Amazing! You found the ' + correct + '!');
    } else {
      window.playSound('wrong');
      alert('Oops! That\'s not a ' + correct + '. Try again!');
    }
  },

  nextShape() {
    this.currentShape = (this.currentShape + 1) % this.shapes.length;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  },

  prevShape() {
    this.currentShape = (this.currentShape - 1 + this.shapes.length) % this.shapes.length;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  },

  goToShape(index) {
    this.currentShape = index;
    this.render(document.getElementById('module-body'));
    window.playSound('click');
  }
};

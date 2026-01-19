// AI Kids Tutor - Main JavaScript

// State management
let soundEnabled = true;
let totalStars = 0;
let moduleStars = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  updateProgressDisplay();
});

// Show a specific module
function showModule(moduleName) {
  const mainMenu = document.getElementById('main-menu');
  const moduleContent = document.getElementById('module-content');
  const moduleTitle = document.getElementById('module-title');
  const moduleBody = document.getElementById('module-body');

  // Hide menu, show module content
  mainMenu.classList.add('hidden');
  moduleContent.classList.remove('hidden');

  // Set title based on module
  const titles = {
    alphabet: '🔤 Alphabet Fun',
    numbers: '🔢 Number Magic',
    shapes: '🔺 Shape Explorer',
    colors: '🎨 Color World',
    language: '🌍 World Languages'
  };
  moduleTitle.textContent = titles[moduleName] || moduleName;

  // Update stars display
  updateModuleStars(moduleName);

  // Load module content
  if (window.modules && window.modules[moduleName]) {
    window.modules[moduleName].render(moduleBody);
  } else {
    moduleBody.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🚧</div>
        <h3 class="text-2xl font-bold text-gray-700 mb-2">Coming Soon!</h3>
        <p class="text-gray-500">This module is being prepared just for you!</p>
      </div>
    `;
  }

  playSound('click');
}

// Go back to main menu
function backToMenu() {
  const mainMenu = document.getElementById('main-menu');
  const moduleContent = document.getElementById('module-content');

  moduleContent.classList.add('hidden');
  mainMenu.classList.remove('hidden');

  playSound('click');
}

// Toggle sound on/off
function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundToggle = document.getElementById('sound-toggle');
  const soundStatus = document.getElementById('sound-status');

  if (soundEnabled) {
    soundToggle.textContent = '🔊';
    soundStatus.textContent = 'Sound On';
  } else {
    soundToggle.textContent = '🔇';
    soundStatus.textContent = 'Sound Off';
  }
}

// Play sound effect
function playSound(type) {
  if (!soundEnabled) return;

  // Create audio context for simple beeps
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const sounds = {
      click: { freq: 600, duration: 0.1 },
      correct: { freq: 800, duration: 0.2 },
      wrong: { freq: 300, duration: 0.3 },
      star: { freq: 1000, duration: 0.15 }
    };

    const sound = sounds[type] || sounds.click;
    oscillator.frequency.value = sound.freq;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  } catch (e) {
    // Audio not supported, fail silently
  }
}

// Add stars (reward system)
function addStars(moduleName, count) {
  moduleStars[moduleName] = (moduleStars[moduleName] || 0) + count;
  totalStars += count;
  updateProgressDisplay();
  updateModuleStars(moduleName);
  saveProgress();
  playSound('star');
  triggerConfetti();
}

// Update progress display
function updateProgressDisplay() {
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');

  progressText.textContent = `${totalStars} ⭐`;

  // Progress bar fills up to 100 stars max
  const percentage = Math.min((totalStars / 100) * 100, 100);
  progressBar.style.width = `${percentage}%`;
}

// Update module stars display
function updateModuleStars(moduleName) {
  const moduleStarsEl = document.getElementById('module-stars');
  const stars = moduleStars[moduleName] || 0;
  moduleStarsEl.textContent = `⭐ ${stars}`;
}

// Save progress to localStorage
function saveProgress() {
  localStorage.setItem('aiKidsTutor_totalStars', totalStars);
  localStorage.setItem('aiKidsTutor_moduleStars', JSON.stringify(moduleStars));
}

// Load progress from localStorage
function loadProgress() {
  const savedTotal = localStorage.getItem('aiKidsTutor_totalStars');
  const savedModule = localStorage.getItem('aiKidsTutor_moduleStars');

  if (savedTotal) totalStars = parseInt(savedTotal, 10);
  if (savedModule) moduleStars = JSON.parse(savedModule);
}

// Trigger confetti animation
function triggerConfetti() {
  const colors = ['#f0f', '#0ff', '#ff0', '#f00', '#0f0', '#00f'];

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }, i * 50);
  }
}

// Global modules registry
window.modules = window.modules || {};

// Expose functions globally
window.showModule = showModule;
window.backToMenu = backToMenu;
window.toggleSound = toggleSound;
window.addStars = addStars;
window.playSound = playSound;

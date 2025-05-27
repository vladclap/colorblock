const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("startBtn");

const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const pauseOverlay = document.getElementById("pauseOverlay");

const colors = ["red", "teal", "orange"];

const shapes = [
  { width: 90, height: 30 },
  { width: 60, height: 60 },
  { width: 30, height: 90 },
  { width: 40, height: 40 },
  { width: 70, height: 40 },
  { width: 50, height: 80 },
];

let block = null;
let blockX = 0;
let blockY = 0;
let blockHeight = 20;
let fastFall = false;
let score = 0;
let lives = 3;
let interval;
let paused = false;

// Швидкість
let fallSpeedBase = 2;
let fallSpeed = fallSpeedBase;
const speedIncrement = 0.5;
const scorePerLevel = 5;

startBtn.addEventListener("click", () => {
  mainMenu.style.display = "none";
  gameScreen.style.display = "block";
  startGame();
});

restartBtn.addEventListener("click", () => {
  clearInterval(interval);
  startGame();
});

pauseBtn.addEventListener("click", () => {
  burgerDropdown.style.display = "none"; // ховаємо меню
  paused = !paused;
  if (paused) {
    pauseGame();
  } else {
    resumeGame();
  }
});

function startGame() {
  score = 0;
  lives = 3;
  paused = false;
  fallSpeed = fallSpeedBase;
  updateScore();

  if (block) {
    game.removeChild(block);
    block = null;
  }

  pauseOverlay.style.display = "none";
  pauseBtn.textContent = "Пауза";

  spawnBlock();

  interval = setInterval(() => {
    if (!paused && block) updateBlock();
  }, 30);
}

function spawnBlock() {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  block = document.createElement("div");
  block.classList.add("block", color);
  block.style.width = shape.width + "px";
  block.style.height = shape.height + "px";

  blockHeight = shape.height;

  const column = Math.floor(Math.random() * 3);
  blockX =
    column * (game.clientWidth / 3) + (game.clientWidth / 3 - shape.width) / 2;
  blockY = 0;
  block.style.left = blockX + "px";
  block.style.top = blockY + "px";
  game.appendChild(block);
}

function updateBlock() {
  const speed = fastFall ? fallSpeed * 4 : fallSpeed;
  blockY += speed;
  block.style.top = blockY + "px";

  if (blockY + blockHeight >= game.clientHeight - 60) {
    const zoneWidth = game.clientWidth / 3;
    const zoneX = Math.round(blockX / zoneWidth) * zoneWidth;
    const correctZone = colors.indexOf(block.classList[1]) * zoneWidth;

    if (zoneX === correctZone) {
      score++;
    } else {
      lives--;
    }

    game.removeChild(block);
    block = null;
    updateScore();

    if (lives <= 0) {
      endGame();
    } else {
      spawnBlock();
    }
  }
}

function updateScore() {
  scoreEl.textContent = `Очки: ${score} | Життя: ${lives}`;

  // Збільшення швидкості лише при переході рівня
  if (
    score > 0 &&
    score % scorePerLevel === 0 &&
    fallSpeed === fallSpeedBase + speedIncrement * (score / scorePerLevel - 1)
  ) {
    fallSpeed += speedIncrement;
    if (fallSpeed > 10) fallSpeed = 10;
  }
}

function endGame() {
  clearInterval(interval);
  paused = false;
  pauseOverlay.style.display = "none";
  pauseBtn.textContent = "Пауза";

  alert("🎮 Гру завершено!\nОчки: " + score);
  gameScreen.style.display = "none";
  mainMenu.style.display = "flex";
}

function moveBlock(direction) {
  if (!block) return;
  const zoneW = game.clientWidth / 3;
  if (direction === "left" && blockX - zoneW >= 0) blockX -= zoneW;
  if (
    direction === "right" &&
    blockX + zoneW <= game.clientWidth - block.offsetWidth
  )
    blockX += zoneW;
  block.style.left = blockX + "px";
}

function pauseGame() {
  clearInterval(interval);
  pauseOverlay.style.display = "flex";
  pauseBtn.textContent = "Продовжити";
}

function resumeGame() {
  pauseOverlay.style.display = "none";
  pauseBtn.textContent = "Пауза";
  clearInterval(interval);
  interval = setInterval(() => {
    if (!paused && block) updateBlock();
  }, 30);
}

// Клавіатура
document.addEventListener("keydown", (e) => {
  if (paused) return;
  if (e.key === "ArrowLeft") moveBlock("left");
  if (e.key === "ArrowRight") moveBlock("right");
  if (e.key === "ArrowDown") fastFall = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowDown") fastFall = false;
});

// Touch
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;
let fastFallTimeout; // для збереження таймера

game.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isTouching = true;

  // Запускаємо таймер для включення швидкого падіння через 0.5 секунди
  fastFallTimeout = setTimeout(() => {
    if (isTouching) {
      fastFall = true;
    }
  }, 500);
});

game.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  isTouching = false;
  clearTimeout(fastFallTimeout); // Скасування таймера
  fastFall = false; // Вимикаємо швидке падіння після відпускання

  // Обробка свайпів
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20) moveBlock("right");
    if (dx < -20) moveBlock("left");
  }
});

game.addEventListener("touchmove", (e) => {
  e.preventDefault();
});

// Змінні бургер-меню
const burgerToggle = document.querySelector(".burger-btn");
const burgerDropdown = document.querySelector(".burger-dropdown");

// Кнопка рестарту
restartBtn.addEventListener("click", () => {
  burgerDropdown.style.display = "none";
  clearInterval(interval);
  startGame();
  paused = false;
});

// Логіка бургер-кнопки
burgerToggle.addEventListener("click", () => {
  const isOpen = burgerDropdown.style.display === "flex";

  if (isOpen) {
    burgerDropdown.style.display = "none";
    if (paused) {
      paused = false;
      resumeGame();
    }
  } else {
    burgerDropdown.style.display = "flex";
    if (!paused) {
      paused = true;
      pauseGame();
    }
  }
});

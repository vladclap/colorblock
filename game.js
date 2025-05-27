const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("startBtn");

const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const pauseOverlay = document.getElementById("pauseOverlay");

const colors = ["red", "yellow", "blue"];
const shapes = [
  { width: 90, height: 30 }, // горизонтальний прямокутник
  { width: 60, height: 60 }, // квадрат
  { width: 30, height: 90 }, // вертикальний прямокутник
  { width: 40, height: 40 }, // менший квадрат
  { width: 70, height: 40 }, // прямокутник середнього розміру
  { width: 50, height: 80 }, // асиметрична фігура
];

let block = null;
let blockX = 0;
let blockY = 0;
let blockHeight = 30;
let fallSpeedBase = 2;
let fallSpeed = fallSpeedBase;
const speedIncrement = 0.5;
const scorePerLevel = 5;
let score = 0;
let lives = 3;
let interval;
let paused = false;

startBtn.addEventListener("click", () => {
  mainMenu.style.display = "none";
  gameScreen.style.display = "block";
  startGame();
});

restartBtn.addEventListener("click", () => {
  clearInterval(interval);
  fallSpeed = fallSpeedBase; // Скидання при рестарті
  startGame();
});

pauseBtn.addEventListener("click", () => {
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
  fallSpeed = fallSpeedBase; // Скидання швидкості
  updateScore();

  // Очистити старий блок, якщо є
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

  // Збільшення швидкості кожні 5 очок
  if (score > 0 && score % scorePerLevel === 0) {
    fallSpeed =
      fallSpeedBase + Math.floor(score / scorePerLevel) * speedIncrement;

    // Можна обмежити максимум
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
  if (direction === "left" && blockX >= zoneW) blockX -= zoneW;
  if (
    direction === "right" &&
    blockX + block.offsetWidth <= game.clientWidth - zoneW
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
  interval = setInterval(() => {
    if (!paused && block) updateBlock();
  }, 30);
}

// Керування клавішами
document.addEventListener("keydown", (e) => {
  if (paused) return;
  if (e.key === "ArrowLeft") moveBlock("left");
  if (e.key === "ArrowRight") moveBlock("right");
  if (e.key === "ArrowDown") fastFall = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowDown") fastFall = false;
});

// Сенсорне керування
let touchStartX = 0;
let touchStartY = 0;
game.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

game.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20) moveBlock("right");
    if (dx < -20) moveBlock("left");
  } else {
    if (dy > 20) fastFall = true;
  }
});
game.addEventListener("touchmove", (e) => {
  e.preventDefault();
});

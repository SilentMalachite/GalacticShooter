import { gameConfig, player, enemies, bullets } from './shared.js';
import { audioManager } from './audio.js';
import { spawnWave, updatePlayer, updateEnemies, updateBullets, checkCollisions, updateParticles } from './entities.js';
import { updateUI, updateMuteDisplay } from './ui.js';
import { render } from './render.js';

function init() {
  gameConfig.canvas = document.getElementById("gameCanvas");
  gameConfig.ctx = gameConfig.canvas.getContext("2d");

  // Load high score from localStorage (if available)
  try {
    const saved = localStorage.getItem("highScore");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed)) gameConfig.highScore = parsed;
    }
  } catch (_e) {
    // ignore storage errors
  }

  // Set up event listeners
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.getElementById("startBtn").addEventListener("click", (_e) => {
    // Resume audio context on user interaction (required by browser autoplay policies)
    if (audioManager.audioContext && audioManager.audioContext.state === "suspended") {
      audioManager.audioContext.resume();
    }
    audioManager.playMenuConfirm();
    startGame();
  });
  document.getElementById("restartBtn").addEventListener("click", (_e) => {
    if (audioManager.audioContext && audioManager.audioContext.state === "suspended") {
      audioManager.audioContext.resume();
    }
    audioManager.playMenuConfirm();
    restartGame();
  });

  // Mute toggle
  document.addEventListener("keydown", (e) => {
    if (e.key === "m" || e.key === "M") {
      const isMuted = audioManager.toggleMute();
      updateMuteDisplay(isMuted);
    }
  });
}

function handleKeyDown(e) {
  gameConfig.keys[e.key] = true;

  if (gameConfig.gameState === "gameOver" && e.key === "r") {
    restartGame();
  }
}

function handleKeyUp(e) {
  gameConfig.keys[e.key] = false;
}

function startGame() {
  gameConfig.gameState = "playing";
  gameConfig.score = 0;
  gameConfig.lives = 3;
  gameConfig.level = 1;
  player.x = gameConfig.width / 2 - player.width / 2;
  player.y = gameConfig.height - 50;
  player.bulletType = "normal";
  bullets.length = 0;
  gameConfig.particles.length = 0;
  gameConfig.powerUps.length = 0;

  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameOverScreen").classList.add("hidden");

  spawnWave();

  audioManager.startBackgroundMusic();
  audioManager.playLevelComplete(); // Play start sound

  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameConfig.gameState = "playing";
  gameConfig.score = 0;
  gameConfig.lives = 3;
  gameConfig.level = 1;
  player.x = gameConfig.width / 2 - player.width / 2;
  player.y = gameConfig.height - 50;
  player.bulletType = "normal";
  bullets.length = 0;
  enemies.length = 0;
  gameConfig.particles.length = 0;
  gameConfig.powerUps.length = 0;

  document.getElementById("gameOverScreen").classList.add("hidden");

  spawnWave();

  audioManager.startBackgroundMusic();
}

function gameOver() {
  gameConfig.gameState = "gameOver";
  document.getElementById("finalScore").textContent = gameConfig.score;
  document.getElementById("finalLevel").textContent = gameConfig.level;
  document.getElementById("gameOverScreen").classList.remove("hidden");

  audioManager.stopBackgroundMusic();
  audioManager.playGameOver();

  // Save high score
  try {
    localStorage.setItem("highScore", Math.max(gameConfig.highScore, gameConfig.score).toString());
  } catch (_e) {
    // ignore
  }
}

function update(deltaTime) {
  if (gameConfig.gameState !== "playing") return;

  updatePlayer(deltaTime);
  updateEnemies(deltaTime);
  updateBullets(deltaTime);
  checkCollisions();
  updateParticles(deltaTime);

  if (gameConfig.lives <= 0) {
    gameOver();
    return;
  }

  // Check if level complete
  if (enemies.list.length === 0) {
    gameConfig.level++;
    spawnWave();
    audioManager.playLevelComplete();
  }

  updateUI();
}

function gameLoop(currentTime) {
  const deltaTime = (currentTime - gameConfig.lastTime) / 1000;
  gameConfig.lastTime = currentTime;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", init);
import { gameConfig, player, enemies, bullets } from "./shared.js";
function spawnWave() {
  enemies.list = [];
  enemies.waveComplete = false;

  // Play wave spawn sound
  audioManager.playEnemySpawn();

  const waveSize = 8 + gameConfig.level * 3;
  const rows = Math.min(3 + Math.floor(gameConfig.level / 2), 6);
  const cols = Math.ceil(waveSize / rows);

  // Enemy type distribution based on level
  const enemyTypes = ["basic"];

  if (gameConfig.level >= 2) {
    enemyTypes.push("fast", "scout");
  }
  if (gameConfig.level >= 3) {
    enemyTypes.push("heavy", "bomber");
  }
  if (gameConfig.level >= 4) {
    enemyTypes.push("sniper");
  }
  if (gameConfig.level >= 5) {
    enemyTypes.push("boss");
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (enemies.list.length >= waveSize) break;

      const x = 100 + col * 70;
      const y = 30 + row * 50;

      // Determine enemy type with weighted probability
      let type = "basic";
      const rand = Math.random();

      if (gameConfig.level >= 5 && rand < 0.05) {
        type = "boss";
      } else if (gameConfig.level >= 4 && rand < 0.1) {
        type = "sniper";
      } else if (gameConfig.level >= 3 && rand < 0.15) {
        type = rand < 0.08 ? "heavy" : "bomber";
      } else if (gameConfig.level >= 2 && rand < 0.25) {
        type = rand < 0.15 ? "fast" : "scout";
      }

      // Special formations for specific types
      if (row === 0 && gameConfig.level >= 2) {
        // Front row more likely to be scouts or fast
        if (Math.random() < 0.4) {
          type = Math.random() < 0.5 ? "scout" : "fast";
        }
      }

      if (row === rows - 1 && gameConfig.level >= 3) {
        // Back row more likely to be snipers or bombers
        if (Math.random() < 0.3) {
          type = Math.random() < 0.6 ? "sniper" : "bomber";
        }
      }

      const enemy = new Enemy(x, y, type);
      enemy.formationIndex = enemies.list.length;
      enemies.list.push(enemy);
    }
  }

  // Ensure at least one boss per wave at higher levels
  if (gameConfig.level >= 6 && !enemies.list.some((e) => e.type === "boss")) {
    const randomIndex = Math.floor(Math.random() * enemies.list.length);
    enemies.list[randomIndex] = new Enemy(
      enemies.list[randomIndex].x,
      enemies.list[randomIndex].y,
      "boss",
    );
    enemies.list[randomIndex].formationIndex = randomIndex;

    // Play boss spawn sound
    audioManager.playBossSpawn();
  }
}

// Update functions
function updatePlayer(deltaTime) {
  // Player movement
  if (gameConfig.keys["ArrowLeft"] || gameConfig.keys["KeyA"]) {
    player.x = Math.max(0, player.x - player.speed);
  }
  if (gameConfig.keys["ArrowRight"] || gameConfig.keys["KeyD"]) {
    player.x = Math.min(gameConfig.width - player.width, player.x + player.speed);
  }
  if (gameConfig.keys["ArrowUp"] || gameConfig.keys["KeyW"]) {
    player.y = Math.max(gameConfig.height * 0.6, player.y - player.speed);
  }
  if (gameConfig.keys["ArrowDown"] || gameConfig.keys["KeyS"]) {
    player.y = Math.min(gameConfig.height - player.height, player.y + player.speed);
  }

  // Shooting
  if (gameConfig.keys["Space"] && player.shootCooldown <= 0) {
    shootPlayerBullet();
    player.shootCooldown = 200; // 200ms cooldown
  }

  if (player.shootCooldown > 0) {
    player.shootCooldown -= deltaTime * 1000;
  }

  if (player.invulnerable > 0) {
    player.invulnerable -= deltaTime * 1000;
  }
}

function updateEnemies(deltaTime) {
  enemies.list.forEach((enemy) => enemy.update(deltaTime));
}

function updateBullets(deltaTime) {
  // Update player bullets
  player.bullets = player.bullets.filter((bullet) => {
    bullet.y -= bullet.speed;
    return bullet.y > -bullet.height;
  });

  // Update enemy bullets with type-specific behavior
  enemies.bullets = enemies.bullets.filter((bullet) => {
    // Update position based on bullet type
    if (bullet.vx !== undefined && bullet.vy !== undefined) {
      // Directional bullets (sniper, bomber spread)
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
    } else {
      bullet.y += bullet.speed;
    }

    // Special bullet behaviors
    switch (bullet.type) {
      case "homing":
        updateHomingBullet(bullet, deltaTime);
        break;
      case "bomb":
        updateBombBullet(bullet, deltaTime);
        break;
    }

    // Remove bullets that are off-screen
    return (
      bullet.x > -50 &&
      bullet.x < gameConfig.width + 50 &&
      bullet.y > -50 &&
      bullet.y < gameConfig.height + 50
    );
  });
}

function updateHomingBullet(bullet, _deltaTime) {
  // Homing bullets track the player
  const dx = player.x + player.width / 2 - bullet.x;
  const dy = player.y + player.height / 2 - bullet.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0) {
    const homingForce = bullet.homingStrength;
    bullet.vx = bullet.vx || 0;
    bullet.vy = bullet.vy || bullet.speed;

    bullet.vx += (dx / dist) * homingForce;
    bullet.vy += (dy / dist) * homingForce;

    // Limit maximum speed
    const currentSpeed = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);
    if (currentSpeed > bullet.speed * 2) {
      bullet.vx = (bullet.vx / currentSpeed) * bullet.speed * 2;
      bullet.vy = (bullet.vy / currentSpeed) * bullet.speed * 2;
    }

    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  }
}

function updateBombBullet(bullet, _deltaTime) {
  // Bombs fall with gravity
  bullet.vy = bullet.vy || bullet.speed;
  bullet.vy += bullet.gravity;
  bullet.y += bullet.vy;
}

function shootPlayerBullet() {
  const bullet = {
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 8,
    speed: 8,
    color: "#00ff00",
  };
  player.bullets.push(bullet);

  // Play shooting sound
  audioManager.playShoot();
}

// Collision detection
function checkCollisions() {
  // Player bullets vs enemies
  for (let bulletIndex = player.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    const bullet = player.bullets[bulletIndex];
    for (let enemyIndex = enemies.list.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemy = enemies.list[enemyIndex];
      if (isColliding(bullet, enemy)) {
        // Remove bullet
        player.bullets.splice(bulletIndex, 1);

        // Damage enemy
        if (enemy.takeDamage()) {
          // Enemy destroyed
          enemies.list.splice(enemyIndex, 1);

          // Score based on enemy type
          const scores = {
            boss: 200,
            heavy: 100,
            sniper: 80,
            bomber: 75,
            fast: 50,
            scout: 40,
            basic: 25,
          };
          gameConfig.score += scores[enemy.type] || 25;

          // Play explosion sound
          audioManager.playExplosion();

          // Create explosion effect
          const particleCount = enemy.type === "boss" ? 20 : 10;
          for (let i = 0; i < particleCount; i++) {
            createParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#ffff00");
          }
        }

        updateUI();
        break;
      }
    }
  }

  // Enemy bullets vs player
  if (player.invulnerable <= 0) {
    for (let bulletIndex = enemies.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = enemies.bullets[bulletIndex];

      // Special handling for bomb bullets
      if (bullet.type === "bomb" && bullet.y > gameConfig.height - 50) {
        // Bomb explodes near ground
        createBombExplosion(bullet.x, bullet.y);
        enemies.bullets.splice(bulletIndex, 1);
        continue;
      }

      if (isColliding(bullet, player)) {
        // Handle bomb explosion damage
        if (bullet.type === "bomb") {
          createBombExplosion(bullet.x, bullet.y);
        } else {
          // Regular bullet hit
          gameConfig.lives--;
          player.invulnerable = 2000;

          // Create hit effect
          for (let i = 0; i < 8; i++) {
            createParticle(player.x + player.width / 2, player.y + player.height / 2, "#ff4444");
          }
        }

        enemies.bullets.splice(bulletIndex, 1);

        // Play player hit sound
        audioManager.playPlayerHit();

        if (gameConfig.lives <= 0) {
          gameOver();
        }

        updateUI();
      }
    }
  }

  // Enemies vs player collision
  if (player.invulnerable <= 0) {
    for (let enemyIndex = enemies.list.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemy = enemies.list[enemyIndex];
      if (isColliding(enemy, player)) {
        enemies.list.splice(enemyIndex, 1);
        gameConfig.lives--;
        player.invulnerable = 2000;

        // Play player hit sound
        audioManager.playPlayerHit();

        // Create collision effect
        for (let i = 0; i < 15; i++) {
          createParticle(player.x + player.width / 2, player.y + player.height / 2, "#ff8844");
        }

        if (gameConfig.lives <= 0) {
          gameOver();
        }

        updateUI();
        break;
      }
    }
  }
}

function createBombExplosion(x, y) {
  const explosionRadius = 40;

  // Play bomb explosion sound
  audioManager.playBombExplosion();

  // Visual explosion effect
  for (let i = 0; i < 25; i++) {
    const angle = (i / 25) * Math.PI * 2;
    const distance = Math.random() * explosionRadius;
    const px = x + Math.cos(angle) * distance;
    const py = y + Math.sin(angle) * distance;
    createParticle(px, py, "#ff6600");
  }

  // Check if player is in explosion radius
  if (player.invulnerable <= 0) {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const distanceToPlayer = Math.sqrt(
      Math.pow(playerCenterX - x, 2) + Math.pow(playerCenterY - y, 2),
    );

    if (distanceToPlayer <= explosionRadius) {
      gameConfig.lives--;
      player.invulnerable = 2000;

      // Create additional explosion particles around player
      for (let i = 0; i < 12; i++) {
        createParticle(playerCenterX, playerCenterY, "#ff3300");
      }

      if (gameConfig.lives <= 0) {
        gameOver();
      }
      updateUI();
    }
  }
}

function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function createParticle(x, y, color) {
  const particle = {
    x,
    y,
    color,
    radius: Math.random() * 2 + 1,
    vx: Math.random() * 3 - 1.5,
    vy: Math.random() * 3 - 1.5,
    life: Math.random() * 20 + 10,
  };
  gameConfig.particles.push(particle);
}

export { spawnWave, updatePlayer, updateEnemies, updateBullets, shootPlayerBullet, checkCollisions, createBombExplosion, isColliding, createParticle };



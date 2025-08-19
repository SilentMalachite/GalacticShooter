// Game state and configuration
const gameConfig = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,
    gameState: 'start', // 'start', 'playing', 'gameOver'
    score: 0,
    lives: 3,
    level: 1,
    keys: {},
    lastTime: 0,
    particles: [],
    powerUps: [],
    audioContext: null,
    isMuted: false
};

// Audio system for 8-bit style sounds
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.backgroundMusic = null;
        this.musicGain = null;
        this.isMuted = false;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            // Create background music gain node
            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = 0.3; // Lower volume for background music
            
            gameConfig.audioContext = this.audioContext;
        } catch (_e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Create 8-bit style oscillator sound
    createSound(frequency, duration, type = 'square', volume = 0.1) {
        if (!this.audioContext || this.isMuted) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Player shoot sound
    playShoot() {
        this.createSound(800, 0.1, 'square', 0.05);
        setTimeout(() => this.createSound(600, 0.05, 'square', 0.03), 50);
    }

    // Enemy hit/explosion sound
    playExplosion() {
        // Multi-layered explosion sound
        this.createSound(150, 0.3, 'sawtooth', 0.1);
        setTimeout(() => this.createSound(100, 0.2, 'square', 0.08), 50);
        setTimeout(() => this.createSound(80, 0.15, 'triangle', 0.06), 100);
    }

    // Player hit sound
    playPlayerHit() {
        this.createSound(300, 0.4, 'sawtooth', 0.08);
        setTimeout(() => this.createSound(200, 0.3, 'square', 0.06), 100);
        setTimeout(() => this.createSound(150, 0.2, 'triangle', 0.04), 200);
    }

    // Level complete sound
    playLevelComplete() {
        const melody = [523, 587, 659, 698, 784, 880, 988, 1047]; // C major scale
        melody.forEach((freq, index) => {
            setTimeout(() => this.createSound(freq, 0.2, 'square', 0.06), index * 100);
        });
    }

    // Game over sound
    playGameOver() {
        const melody = [440, 415, 392, 370, 349, 330, 311, 294]; // Descending notes
        melody.forEach((freq, index) => {
            setTimeout(() => this.createSound(freq, 0.4, 'triangle', 0.08), index * 150);
        });
    }

    // Enemy-specific sound effects
    playEnemySpawn() {
        // Rising tone for enemy wave spawn
        const frequencies = [200, 250, 300, 350, 400];
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.createSound(freq, 0.1, 'square', 0.03), index * 50);
        });
    }

    playBossSpawn() {
        // Dramatic bass tone for boss appearance
        this.createSound(80, 0.8, 'sawtooth', 0.12);
        setTimeout(() => this.createSound(120, 0.6, 'square', 0.08), 200);
        setTimeout(() => this.createSound(160, 0.4, 'triangle', 0.06), 400);
    }

    playShieldActivate() {
        // Protective shield sound
        this.createSound(600, 0.3, 'sine', 0.04);
        setTimeout(() => this.createSound(800, 0.2, 'sine', 0.03), 100);
        setTimeout(() => this.createSound(1000, 0.1, 'sine', 0.02), 200);
    }

    playHomingLock() {
        // Targeting lock-on sound
        this.createSound(1200, 0.05, 'square', 0.03);
        setTimeout(() => this.createSound(1400, 0.05, 'square', 0.03), 100);
        setTimeout(() => this.createSound(1600, 0.1, 'square', 0.04), 200);
    }

    playBombDrop() {
        // Falling bomb whistle
        let freq = 800;
        const dropDuration = 600;
        const steps = 20;
        for (let i = 0; i < steps; i++) {
            setTimeout(() => {
                this.createSound(freq - (i * 30), 0.05, 'sine', 0.02);
            }, (i * dropDuration) / steps);
        }
    }

    playBombExplosion() {
        // Large explosion with multiple layers
        this.createSound(60, 0.8, 'sawtooth', 0.15);
        setTimeout(() => this.createSound(40, 0.6, 'square', 0.12), 100);
        setTimeout(() => this.createSound(80, 0.4, 'triangle', 0.08), 200);
        setTimeout(() => this.createSound(120, 0.3, 'sine', 0.06), 400);
    }

    playSniperCharge() {
        // Charging up sound for sniper
        let freq = 400;
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createSound(freq + (i * 50), 0.1, 'triangle', 0.03);
            }, i * 100);
        }
    }

    playSniperShoot() {
        // High-pitched precision shot
        this.createSound(2000, 0.15, 'square', 0.06);
        setTimeout(() => this.createSound(1800, 0.1, 'triangle', 0.04), 50);
    }

    playPowerUp() {
        // Positive power-up sound
        const notes = [523, 659, 784, 1047]; // C major chord going up
        notes.forEach((freq, index) => {
            setTimeout(() => this.createSound(freq, 0.2, 'square', 0.05), index * 100);
        });
    }

    playMenuSelect() {
        // UI menu selection sound
        this.createSound(800, 0.1, 'square', 0.03);
    }

    playMenuConfirm() {
        // UI confirmation sound
        this.createSound(600, 0.15, 'square', 0.04);
        setTimeout(() => this.createSound(800, 0.1, 'square', 0.03), 75);
    }

    // Background music - continuous 8-bit style loop
    startBackgroundMusic() {
        if (!this.audioContext || this.isMuted || this.backgroundMusic) return;
        
        this.playBackgroundLoop();
    }

    playBackgroundLoop() {
        if (!this.audioContext || this.isMuted) return;

        // Select music pattern based on game level for variety
        const musicPatterns = this.getMusicPattern();
        const melody = musicPatterns.melody;
        const bassLine = musicPatterns.bass;
        const harmony = musicPatterns.harmony;

        let currentTime = this.audioContext.currentTime;
        
        // Play melody
        melody.forEach(note => {
            if (note.freq > 0) {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.frequency.setValueAtTime(note.freq, currentTime);
                osc.type = 'square';
                
                gain.gain.setValueAtTime(0.08, currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration);
                
                osc.start(currentTime);
                osc.stop(currentTime + note.duration);
            }
            currentTime += note.duration;
        });

        // Play bass line
        currentTime = this.audioContext.currentTime;
        bassLine.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.frequency.setValueAtTime(note.freq, currentTime);
            osc.type = 'triangle';
            
            gain.gain.setValueAtTime(0.04, currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration);
            
            osc.start(currentTime);
            osc.stop(currentTime + note.duration);
            
            currentTime += note.duration;
        });

        // Play harmony line
        if (harmony && harmony.length > 0) {
            currentTime = this.audioContext.currentTime;
            harmony.forEach(note => {
                if (note.freq > 0) {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(this.musicGain);
                    
                    osc.frequency.setValueAtTime(note.freq, currentTime);
                    osc.type = 'sine';
                    
                    gain.gain.setValueAtTime(0.03, currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration);
                    
                    osc.start(currentTime);
                    osc.stop(currentTime + note.duration);
                }
                currentTime += note.duration;
            });
        }

        // Schedule next loop
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
        this.backgroundMusic = setTimeout(() => {
            if (gameConfig.gameState === 'playing' && !this.isMuted) {
                this.playBackgroundLoop();
            }
        }, totalDuration * 1000);
    }

    getMusicPattern() {
        const level = gameConfig.level || 1;
        const patternIndex = (level - 1) % 4; // Cycle through 4 different patterns
        
        const patterns = [
            // Pattern 1: Classic arcade style
            {
                melody: [
                    {freq: 262, duration: 0.4}, // C
                    {freq: 330, duration: 0.4}, // E
                    {freq: 392, duration: 0.4}, // G
                    {freq: 330, duration: 0.4}, // E
                    {freq: 294, duration: 0.4}, // D
                    {freq: 330, duration: 0.4}, // E
                    {freq: 262, duration: 0.8}, // C
                    {freq: 0, duration: 0.2},   // Rest
                ],
                bass: [
                    {freq: 131, duration: 0.8}, // C bass
                    {freq: 147, duration: 0.8}, // D bass
                    {freq: 165, duration: 0.8}, // E bass
                    {freq: 131, duration: 0.8}, // C bass
                ],
                harmony: []
            },
            
            // Pattern 2: More intense for higher levels
            {
                melody: [
                    {freq: 440, duration: 0.3}, // A
                    {freq: 523, duration: 0.3}, // C
                    {freq: 659, duration: 0.3}, // E
                    {freq: 523, duration: 0.3}, // C
                    {freq: 440, duration: 0.3}, // A
                    {freq: 392, duration: 0.3}, // G
                    {freq: 440, duration: 0.6}, // A
                    {freq: 0, duration: 0.3},   // Rest
                ],
                bass: [
                    {freq: 110, duration: 0.6}, // A bass
                    {freq: 98, duration: 0.6},  // G bass
                    {freq: 131, duration: 0.6}, // C bass
                    {freq: 110, duration: 0.6}, // A bass
                ],
                harmony: [
                    {freq: 659, duration: 0.6}, // E harmony
                    {freq: 587, duration: 0.6}, // D harmony
                    {freq: 523, duration: 0.6}, // C harmony
                    {freq: 659, duration: 0.6}, // E harmony
                ]
            },
            
            // Pattern 3: Dramatic boss theme
            {
                melody: [
                    {freq: 196, duration: 0.5}, // G low
                    {freq: 220, duration: 0.5}, // A
                    {freq: 247, duration: 0.5}, // B
                    {freq: 262, duration: 0.5}, // C
                    {freq: 294, duration: 0.5}, // D
                    {freq: 262, duration: 0.5}, // C
                    {freq: 220, duration: 1.0}, // A
                    {freq: 0, duration: 0.5},   // Rest
                ],
                bass: [
                    {freq: 98, duration: 1.0},  // G bass
                    {freq: 110, duration: 1.0}, // A bass
                    {freq: 131, duration: 1.0}, // C bass
                    {freq: 98, duration: 1.0},  // G bass
                ],
                harmony: [
                    {freq: 392, duration: 1.0}, // G harmony
                    {freq: 440, duration: 1.0}, // A harmony
                    {freq: 523, duration: 1.0}, // C harmony
                    {freq: 392, duration: 1.0}, // G harmony
                ]
            },
            
            // Pattern 4: Victory/celebration theme
            {
                melody: [
                    {freq: 523, duration: 0.25}, // C
                    {freq: 659, duration: 0.25}, // E
                    {freq: 784, duration: 0.25}, // G
                    {freq: 1047, duration: 0.25}, // C high
                    {freq: 784, duration: 0.25}, // G
                    {freq: 659, duration: 0.25}, // E
                    {freq: 523, duration: 0.5},  // C
                    {freq: 659, duration: 0.5},  // E
                    {freq: 0, duration: 0.25},   // Rest
                ],
                bass: [
                    {freq: 131, duration: 0.5}, // C bass
                    {freq: 165, duration: 0.5}, // E bass
                    {freq: 196, duration: 0.5}, // G bass
                    {freq: 131, duration: 0.75}, // C bass
                ],
                harmony: [
                    {freq: 392, duration: 0.5}, // G harmony
                    {freq: 523, duration: 0.5}, // C harmony
                    {freq: 659, duration: 0.5}, // E harmony
                    {freq: 392, duration: 0.75}, // G harmony
                ]
            }
        ];
        
        return patterns[patternIndex];
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            clearTimeout(this.backgroundMusic);
            this.backgroundMusic = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
            if (this.masterGain) {
                this.masterGain.gain.value = 0;
            }
        } else {
            if (this.masterGain) {
                this.masterGain.gain.value = 1;
            }
            if (gameConfig.gameState === 'playing') {
                this.startBackgroundMusic();
            }
        }
        return this.isMuted;
    }
}

// Initialize audio manager
const audioManager = new AudioManager();

// Player object
const player = {
    x: 400,
    y: 550,
    width: 30,
    height: 20,
    speed: 5,
    bullets: [],
    shootCooldown: 0,
    invulnerable: 0
};

// Enemy management
const enemies = {
    list: [],
    bullets: [],
    formations: [],
    spawnTimer: 0,
    waveComplete: false
};

// Particle system for visual effects
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 1;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime * 60;
        this.y += this.vy * deltaTime * 60;
        this.life -= deltaTime;
        this.vy += 0.1; // Gravity effect
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Enemy types configuration
const EnemyTypes = {
    basic: {
        health: 1,
        speed: 1,
        size: { width: 25, height: 20 },
        color: '#44ff44',
        points: 25,
        shootCooldown: 3000,
        attackChance: 0.1
    },
    fast: {
        health: 1,
        speed: 2,
        size: { width: 20, height: 18 },
        color: '#ff44ff',
        points: 50,
        shootCooldown: 2000,
        attackChance: 0.2
    },
    heavy: {
        health: 2,
        speed: 0.5,
        size: { width: 30, height: 25 },
        color: '#ffaa00',
        points: 75,
        shootCooldown: 4000,
        attackChance: 0.05
    },
    boss: {
        health: 4,
        speed: 0.8,
        size: { width: 40, height: 30 },
        color: '#ff6600',
        points: 150,
        shootCooldown: 1500,
        attackChance: 0.3
    },
    scout: {
        health: 1,
        speed: 3,
        size: { width: 18, height: 15 },
        color: '#00ffff',
        points: 40,
        shootCooldown: 2500,
        attackChance: 0.4
    },
    bomber: {
        health: 1,
        speed: 1.2,
        size: { width: 28, height: 22 },
        color: '#ff8844',
        points: 60,
        shootCooldown: 1800,
        attackChance: 0.15
    },
    sniper: {
        health: 1,
        speed: 0.8,
        size: { width: 22, height: 24 },
        color: '#8844ff',
        points: 80,
        shootCooldown: 2800,
        attackChance: 0.08
    }
};

// Enemy class with diverse behaviors
class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        const config = EnemyTypes[type];
        this.width = config.size.width;
        this.height = config.size.height;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = this.health;
        this.color = config.color;
        this.points = config.points;
        this.baseShootCooldown = config.shootCooldown;
        this.attackChance = config.attackChance;
        
        this.shootTimer = 0;
        this.shootCooldown = this.baseShootCooldown + Math.random() * 1000;
        this.formationIndex = 0;
        this.phase = 'entering'; // 'entering', 'formation', 'attacking', 'special'
        this.targetX = x;
        this.targetY = y;
        this.attackTimer = 0;
        this.specialTimer = 0;
        this.entryPath = this.generateEntryPath();
        this.pathIndex = 0;
        this.lastDamageTime = 0;
        
        // Type-specific properties
        this.initializeTypeSpecific();
    }
    
    initializeTypeSpecific() {
        switch (this.type) {
            case 'scout':
                this.zigzagAmplitude = 30;
                this.zigzagFrequency = 0.02;
                break;
            case 'bomber':
                this.bombDropTimer = 0;
                this.bombDropCooldown = 3000;
                break;
            case 'sniper':
                this.aimingTime = 0;
                this.isAiming = false;
                break;
            case 'heavy':
                this.shieldActive = false;
                this.shieldTimer = 0;
                break;
            case 'boss':
                this.bossPhase = 1;
                this.specialAttackTimer = 0;
                break;
        }
    }

    generateEntryPath() {
        // Create curved entry path similar to Galaga
        const path = [];
        const startX = this.x < gameConfig.width / 2 ? -50 : gameConfig.width + 50;
        const startY = -50;
        const steps = 60;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = Math.PI * t;
            const x = startX + (this.targetX - startX) * t + Math.sin(angle * 2) * 100;
            const y = startY + (this.targetY - startY) * t;
            path.push({ x, y });
        }
        
        return path;
    }

    update(deltaTime) {
        this.shootTimer += deltaTime * 1000;
        this.specialTimer += deltaTime * 1000;

        // Type-specific behavior updates
        this.updateTypeSpecific(deltaTime);

        switch (this.phase) {
            case 'entering':
                this.updateEntering();
                break;

            case 'formation':
                this.updateFormation(deltaTime);
                break;

            case 'attacking':
                this.updateAttacking(deltaTime);
                break;

            case 'special':
                this.updateSpecialBehavior(deltaTime);
                break;
        }

        // Type-specific shooting behavior
        this.updateShooting();
    }

    updateEntering() {
        if (this.pathIndex < this.entryPath.length - 1) {
            this.pathIndex += this.type === 'fast' || this.type === 'scout' ? 3 : 2;
            const point = this.entryPath[Math.min(this.pathIndex, this.entryPath.length - 1)];
            this.x = point.x;
            this.y = point.y;
        } else {
            this.phase = 'formation';
        }
    }

    updateFormation(deltaTime) {
        // Base formation movement with type variations
        const baseMovement = Math.sin(Date.now() * 0.002 + this.formationIndex) * 0.5;
        
        switch (this.type) {
            case 'scout':
                // Zigzag movement
                this.x += Math.sin(Date.now() * this.zigzagFrequency) * this.zigzagAmplitude * deltaTime;
                this.y += baseMovement * 2;
                break;
                
            case 'heavy':
                // Slower, more stable movement
                this.y += baseMovement * 0.3;
                break;
                
            case 'fast':
                // Quick, jittery movement
                this.y += baseMovement * 1.5;
                this.x += (Math.random() - 0.5) * 0.5;
                break;
                
            default:
                this.y += baseMovement;
        }

        // Attack decision based on type
        this.attackTimer += deltaTime * 1000;
        const attackDelay = this.type === 'scout' ? 3000 : 
                           this.type === 'fast' ? 4000 :
                           this.type === 'heavy' ? 8000 : 6000;
        
        if (this.attackTimer > attackDelay + Math.random() * 5000 && Math.random() < this.attackChance) {
            this.phase = this.type === 'sniper' || this.type === 'bomber' ? 'special' : 'attacking';
            this.attackTimer = 0;
        }
    }

    updateAttacking(_deltaTime) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
            const attackSpeed = this.type === 'scout' ? this.speed * 3 :
                               this.type === 'fast' ? this.speed * 2.5 :
                               this.speed * 2;
            
            this.x += (dx / dist) * attackSpeed;
            this.y += (dy / dist) * attackSpeed;
        } else {
            this.phase = 'formation';
            this.attackTimer = -2000; // Cooldown before next attack
        }
    }

    updateSpecialBehavior(deltaTime) {
        switch (this.type) {
            case 'sniper':
                this.updateSniperBehavior(deltaTime);
                break;
            case 'bomber':
                this.updateBomberBehavior(deltaTime);
                break;
            case 'boss':
                this.updateBossBehavior(deltaTime);
                break;
            default:
                this.phase = 'formation';
        }
    }

    updateSniperBehavior(deltaTime) {
        if (!this.isAiming) {
            this.isAiming = true;
            this.aimingTime = 0;
            audioManager.playSniperCharge(); // Play charging sound
        }
        
        this.aimingTime += deltaTime * 1000;
        
        if (this.aimingTime > 1500) { // 1.5 second aim time
            this.shootSniper();
            this.phase = 'formation';
            this.isAiming = false;
            this.attackTimer = -3000; // Longer cooldown
        }
    }

    updateBomberBehavior(deltaTime) {
        this.bombDropTimer += deltaTime * 1000;
        
        // Drop multiple bombs
        if (this.bombDropTimer > 0 && this.bombDropTimer < 2000) {
            if (this.bombDropTimer % 400 < deltaTime * 1000) { // Every 400ms
                this.dropBomb();
                audioManager.playBombDrop(); // Play bomb drop sound
            }
        } else if (this.bombDropTimer > 2000) {
            this.phase = 'formation';
            this.bombDropTimer = 0;
            this.attackTimer = -4000;
        }
    }

    updateBossBehavior(deltaTime) {
        this.specialAttackTimer += deltaTime * 1000;
        
        // Boss has multiple attack patterns
        if (this.specialAttackTimer > 3000) {
            if (this.bossPhase === 1) {
                this.shootSpread();
                this.bossPhase = 2;
            } else {
                this.shootHoming();
                this.bossPhase = 1;
            }
            this.phase = 'formation';
            this.specialAttackTimer = 0;
            this.attackTimer = -2000;
        }
    }

    updateTypeSpecific(deltaTime) {
        switch (this.type) {
            case 'heavy':
                // Shield mechanics
                this.shieldTimer += deltaTime * 1000;
                if (this.health < this.maxHealth && !this.shieldActive && this.shieldTimer > 5000) {
                    this.shieldActive = true;
                    this.shieldTimer = 0;
                    audioManager.playShieldActivate(); // Play shield activation sound
                }
                if (this.shieldActive && this.shieldTimer > 3000) {
                    this.shieldActive = false;
                    this.shieldTimer = 0;
                }
                break;
        }
    }

    updateShooting() {
        if (this.shootTimer > this.shootCooldown && this.phase !== 'entering') {
            this.shoot();
            this.shootTimer = 0;
            this.shootCooldown = this.baseShootCooldown + Math.random() * 1000;
        }
    }

    shoot() {
        switch (this.type) {
            case 'fast':
                this.shootFast();
                break;
            case 'bomber':
                this.shootBomber();
                break;
            case 'heavy':
                this.shootHeavy();
                break;
            default:
                this.shootBasic();
        }
    }

    shootBasic() {
        const bullet = {
            x: this.x + this.width / 2,
            y: this.y + this.height,
            width: 4,
            height: 8,
            speed: 3,
            color: '#ff4444',
            type: 'basic'
        };
        enemies.bullets.push(bullet);
    }

    shootFast() {
        // Fast enemies shoot 2 bullets
        for (let i = 0; i < 2; i++) {
            const bullet = {
                x: this.x + this.width / 2 + (i - 0.5) * 8,
                y: this.y + this.height,
                width: 3,
                height: 6,
                speed: 4,
                color: '#ff44ff',
                type: 'fast'
            };
            enemies.bullets.push(bullet);
        }
    }

    shootHeavy() {
        // Heavy enemies shoot slower but larger bullets
        const bullet = {
            x: this.x + this.width / 2,
            y: this.y + this.height,
            width: 6,
            height: 10,
            speed: 2,
            color: '#ffaa00',
            type: 'heavy'
        };
        enemies.bullets.push(bullet);
    }

    shootBomber() {
        // Bomber shoots in a slight spread
        for (let i = -1; i <= 1; i++) {
            const bullet = {
                x: this.x + this.width / 2,
                y: this.y + this.height,
                width: 4,
                height: 8,
                speed: 3,
                color: '#ff8844',
                type: 'bomber',
                vx: i * 0.5, // Horizontal velocity for spread
                vy: 3
            };
            enemies.bullets.push(bullet);
        }
    }

    shootSniper() {
        // Aimed shot at player
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const bullet = {
            x: this.x + this.width / 2,
            y: this.y + this.height,
            width: 5,
            height: 12,
            speed: 5,
            color: '#8844ff',
            type: 'sniper',
            vx: (dx / dist) * 5,
            vy: (dy / dist) * 5
        };
        enemies.bullets.push(bullet);
        audioManager.playSniperShoot(); // Play sniper shot sound
    }

    dropBomb() {
        const bomb = {
            x: this.x + this.width / 2,
            y: this.y + this.height,
            width: 8,
            height: 8,
            speed: 2,
            color: '#ff6600',
            type: 'bomb',
            gravity: 0.1
        };
        enemies.bullets.push(bomb);
    }

    shootSpread() {
        // Boss spread attack
        for (let i = 0; i < 5; i++) {
            const angle = (i - 2) * 0.3;
            const bullet = {
                x: this.x + this.width / 2,
                y: this.y + this.height,
                width: 5,
                height: 8,
                speed: 4,
                color: '#ff0000',
                type: 'boss',
                vx: Math.sin(angle) * 4,
                vy: Math.cos(angle) * 4
            };
            enemies.bullets.push(bullet);
        }
    }

    shootHoming() {
        // Boss homing missile
        const bullet = {
            x: this.x + this.width / 2,
            y: this.y + this.height,
            width: 6,
            height: 10,
            speed: 2,
            color: '#ff3300',
            type: 'homing',
            homingStrength: 0.05
        };
        enemies.bullets.push(bullet);
        audioManager.playHomingLock(); // Play homing lock sound
    }

    draw(ctx) {
        ctx.save();
        
        // Flash white when recently damaged
        const currentTime = Date.now();
        if (currentTime - this.lastDamageTime < 200) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }

        // Draw enemy shape based on type
        this.drawEnemyShape(ctx);
        
        // Draw type-specific visual effects
        this.drawTypeEffects(ctx);

        // Health bar for multi-hit enemies
        if (this.maxHealth > 1) {
            this.drawHealthBar(ctx);
        }

        // Aiming indicator for sniper
        if (this.type === 'sniper' && this.isAiming) {
            this.drawAimingLine(ctx);
        }

        ctx.restore();
    }

    drawEnemyShape(ctx) {
        switch (this.type) {
            case 'scout':
                this.drawScout(ctx);
                break;
            case 'heavy':
                this.drawHeavy(ctx);
                break;
            case 'bomber':
                this.drawBomber(ctx);
                break;
            case 'sniper':
                this.drawSniper(ctx);
                break;
            case 'boss':
                this.drawBoss(ctx);
                break;
            case 'fast':
                this.drawFast(ctx);
                break;
            default:
                this.drawBasic(ctx);
        }
    }

    drawBasic(ctx) {
        // Standard enemy shape
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 8, this.y + 6, 3, 3);
        ctx.fillRect(this.x + 14, this.y + 6, 3, 3);
        ctx.fillRect(this.x + 9, this.y + 12, 7, 2);
    }

    drawFast(ctx) {
        // Sleek, angular design
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 6, this.y + 8, 2, 2);
        ctx.fillRect(this.x + 12, this.y + 8, 2, 2);
    }

    drawScout(ctx) {
        // Small, diamond-shaped
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/2 - 1, this.y + this.height/2 - 1, 2, 2);
    }

    drawHeavy(ctx) {
        // Large, armored appearance
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Armor plating
        ctx.fillStyle = this.shieldActive ? '#00ffff' : '#666666';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 3);
        ctx.fillRect(this.x + 2, this.y + this.height - 5, this.width - 4, 3);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 10, this.y + 8, 4, 4);
        ctx.fillRect(this.x + 16, this.y + 8, 4, 4);
    }

    drawBomber(ctx) {
        // Wider design with bomb bay
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bomb bay doors
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x + 8, this.y + this.height - 6, 12, 4);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 6, this.y + 4, 3, 3);
        ctx.fillRect(this.x + 19, this.y + 4, 3, 3);
    }

    drawSniper(ctx) {
        // Long, rifle-like design
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Scope/barrel
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/2 - 1, this.y - 3, 2, 8);
        ctx.fillRect(this.x + 6, this.y + 8, 3, 3);
        ctx.fillRect(this.x + 13, this.y + 8, 3, 3);
    }

    drawBoss(ctx) {
        // Complex, intimidating design
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Multiple sections
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 8);
        ctx.fillRect(this.x + 8, this.y + 15, this.width - 16, 6);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 12, this.y + 8, 4, 4);
        ctx.fillRect(this.x + 24, this.y + 8, 4, 4);
        
        // Weapon ports
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 6, this.y + this.height - 4, 3, 3);
        ctx.fillRect(this.x + this.width - 9, this.y + this.height - 4, 3, 3);
    }

    drawTypeEffects(ctx) {
        switch (this.type) {
            case 'heavy':
                if (this.shieldActive) {
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
                }
                break;
                
            case 'scout':
                // Motion trail effect
                if (this.phase === 'attacking') {
                    ctx.fillStyle = this.color + '44';
                    ctx.fillRect(this.x - 5, this.y, 3, this.height);
                }
                break;
        }
    }

    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 3;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y - 6, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                       healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(this.x, this.y - 6, barWidth * healthPercent, barHeight);
    }

    drawAimingLine(ctx) {
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(
                this.x + this.width / 2 + (dx / dist) * 100,
                this.y + this.height + (dy / dist) * 100
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    takeDamage() {
        this.health--;
        this.lastDamageTime = Date.now();
        
        // Heavy enemy shield mechanics
        if (this.type === 'heavy' && this.shieldActive) {
            this.shieldActive = false;
            this.shieldTimer = 0;
            return false; // Shield absorbs damage
        }
        
        return this.health <= 0;
    }
}

// Initialize game
function init() {
    gameConfig.canvas = document.getElementById('gameCanvas');
    gameConfig.ctx = gameConfig.canvas.getContext('2d');
    
    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('startBtn').addEventListener('click', (_e) => {
        // Resume audio context on user interaction (required by browser autoplay policies)
        if (audioManager.audioContext && audioManager.audioContext.state === 'suspended') {
            audioManager.audioContext.resume();
        }
        audioManager.playMenuConfirm();
        startGame();
    });
    document.getElementById('restartBtn').addEventListener('click', (_e) => {
        if (audioManager.audioContext && audioManager.audioContext.state === 'suspended') {
            audioManager.audioContext.resume();
        }
        audioManager.playMenuConfirm();
        restartGame();
    });
    
    // Initialize mute display
    updateMuteDisplay(audioManager.isMuted);
    
    // Start game loop
    gameLoop(0);
}

// Input handling
function handleKeyDown(e) {
    gameConfig.keys[e.code] = true;
    
    if (gameConfig.gameState === 'gameOver' && e.code === 'KeyR') {
        audioManager.playMenuConfirm();
        restartGame();
    }
    
    // Toggle mute with M key
    if (e.code === 'KeyM') {
        audioManager.playMenuSelect();
        const isMuted = audioManager.toggleMute();
        updateMuteDisplay(isMuted);
    }
    
    e.preventDefault();
}

function handleKeyUp(e) {
    gameConfig.keys[e.code] = false;
}

// Game state management
function startGame() {
    gameConfig.gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    
    // Start background music
    audioManager.startBackgroundMusic();
    
    spawnWave();
}

function restartGame() {
    gameConfig.score = 0;
    gameConfig.lives = 3;
    gameConfig.level = 1;
    gameConfig.gameState = 'playing';
    
    // Reset player
    player.x = 400;
    player.y = 550;
    player.bullets = [];
    player.invulnerable = 0;
    
    // Clear enemies and particles
    enemies.list = [];
    enemies.bullets = [];
    gameConfig.particles = [];
    
    // Restart background music
    audioManager.stopBackgroundMusic();
    audioManager.startBackgroundMusic();
    
    document.getElementById('gameOverScreen').classList.add('hidden');
    updateUI();
    spawnWave();
}

function gameOver() {
    gameConfig.gameState = 'gameOver';
    document.getElementById('finalScore').textContent = gameConfig.score;
    document.getElementById('finalLevel').textContent = gameConfig.level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    
    // Stop background music and play game over sound
    audioManager.stopBackgroundMusic();
    audioManager.playGameOver();
    
    // Add explosion effect
    for (let i = 0; i < 20; i++) {
        createParticle(player.x + player.width/2, player.y + player.height/2, '#ff4444');
    }
}

// Wave spawning system
function spawnWave() {
    enemies.list = [];
    enemies.waveComplete = false;
    
    // Play wave spawn sound
    audioManager.playEnemySpawn();
    
    const waveSize = 8 + gameConfig.level * 3;
    const rows = Math.min(3 + Math.floor(gameConfig.level / 2), 6);
    const cols = Math.ceil(waveSize / rows);
    
    // Enemy type distribution based on level
    const enemyTypes = ['basic'];
    
    if (gameConfig.level >= 2) {
        enemyTypes.push('fast', 'scout');
    }
    if (gameConfig.level >= 3) {
        enemyTypes.push('heavy', 'bomber');
    }
    if (gameConfig.level >= 4) {
        enemyTypes.push('sniper');
    }
    if (gameConfig.level >= 5) {
        enemyTypes.push('boss');
    }
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (enemies.list.length >= waveSize) break;
            
            const x = 100 + col * 70;
            const y = 30 + row * 50;
            
            // Determine enemy type with weighted probability
            let type = 'basic';
            const rand = Math.random();
            
            if (gameConfig.level >= 5 && rand < 0.05) {
                type = 'boss';
            } else if (gameConfig.level >= 4 && rand < 0.1) {
                type = 'sniper';
            } else if (gameConfig.level >= 3 && rand < 0.15) {
                type = rand < 0.08 ? 'heavy' : 'bomber';
            } else if (gameConfig.level >= 2 && rand < 0.25) {
                type = rand < 0.15 ? 'fast' : 'scout';
            }
            
            // Special formations for specific types
            if (row === 0 && gameConfig.level >= 2) {
                // Front row more likely to be scouts or fast
                if (Math.random() < 0.4) {
                    type = Math.random() < 0.5 ? 'scout' : 'fast';
                }
            }
            
            if (row === rows - 1 && gameConfig.level >= 3) {
                // Back row more likely to be snipers or bombers
                if (Math.random() < 0.3) {
                    type = Math.random() < 0.6 ? 'sniper' : 'bomber';
                }
            }
            
            const enemy = new Enemy(x, y, type);
            enemy.formationIndex = enemies.list.length;
            enemies.list.push(enemy);
        }
    }
    
    // Ensure at least one boss per wave at higher levels
    if (gameConfig.level >= 6 && !enemies.list.some(e => e.type === 'boss')) {
        const randomIndex = Math.floor(Math.random() * enemies.list.length);
        enemies.list[randomIndex] = new Enemy(
            enemies.list[randomIndex].x,
            enemies.list[randomIndex].y,
            'boss'
        );
        enemies.list[randomIndex].formationIndex = randomIndex;
        
        // Play boss spawn sound
        audioManager.playBossSpawn();
    }
}

// Update functions
function update(deltaTime) {
    if (gameConfig.gameState !== 'playing') return;
    
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateBullets(deltaTime);
    updateParticles(deltaTime);
    checkCollisions();
    
    // Check wave completion
    if (enemies.list.length === 0 && !enemies.waveComplete) {
        enemies.waveComplete = true;
        gameConfig.level++;
        
        // Play level complete sound
        audioManager.playLevelComplete();
        
        setTimeout(() => spawnWave(), 2000);
    }
}

function updatePlayer(deltaTime) {
    // Player movement
    if (gameConfig.keys['ArrowLeft'] || gameConfig.keys['KeyA']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (gameConfig.keys['ArrowRight'] || gameConfig.keys['KeyD']) {
        player.x = Math.min(gameConfig.width - player.width, player.x + player.speed);
    }
    if (gameConfig.keys['ArrowUp'] || gameConfig.keys['KeyW']) {
        player.y = Math.max(gameConfig.height * 0.6, player.y - player.speed);
    }
    if (gameConfig.keys['ArrowDown'] || gameConfig.keys['KeyS']) {
        player.y = Math.min(gameConfig.height - player.height, player.y + player.speed);
    }
    
    // Shooting
    if (gameConfig.keys['Space'] && player.shootCooldown <= 0) {
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
    enemies.list.forEach(enemy => enemy.update(deltaTime));
}

function updateBullets(deltaTime) {
    // Update player bullets
    player.bullets = player.bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > -bullet.height;
    });
    
    // Update enemy bullets with type-specific behavior
    enemies.bullets = enemies.bullets.filter(bullet => {
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
            case 'homing':
                updateHomingBullet(bullet, deltaTime);
                break;
            case 'bomb':
                updateBombBullet(bullet, deltaTime);
                break;
        }
        
        // Remove bullets that are off-screen
        return bullet.x > -50 && bullet.x < gameConfig.width + 50 && 
               bullet.y > -50 && bullet.y < gameConfig.height + 50;
    });
}

function updateHomingBullet(bullet, _deltaTime) {
    // Homing bullets track the player
    const dx = (player.x + player.width / 2) - bullet.x;
    const dy = (player.y + player.height / 2) - bullet.y;
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

function updateParticles(deltaTime) {
    gameConfig.particles = gameConfig.particles.filter(particle => {
        particle.update(deltaTime);
        return !particle.isDead();
    });
}

function shootPlayerBullet() {
    const bullet = {
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 8,
        speed: 8,
        color: '#00ff00'
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
                        'boss': 200,
                        'heavy': 100,
                        'sniper': 80,
                        'bomber': 75,
                        'fast': 50,
                        'scout': 40,
                        'basic': 25
                    };
                    gameConfig.score += scores[enemy.type] || 25;
                    
                    // Play explosion sound
                    audioManager.playExplosion();
                    
                    // Create explosion effect
                    const particleCount = enemy.type === 'boss' ? 20 : 10;
                    for (let i = 0; i < particleCount; i++) {
                        createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ffff00');
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
            if (bullet.type === 'bomb' && bullet.y > gameConfig.height - 50) {
                // Bomb explodes near ground
                createBombExplosion(bullet.x, bullet.y);
                enemies.bullets.splice(bulletIndex, 1);
                continue;
            }
            
            if (isColliding(bullet, player)) {
                // Handle bomb explosion damage
                if (bullet.type === 'bomb') {
                    createBombExplosion(bullet.x, bullet.y);
                } else {
                    // Regular bullet hit
                    gameConfig.lives--;
                    player.invulnerable = 2000;
                    
                    // Create hit effect
                    for (let i = 0; i < 8; i++) {
                        createParticle(player.x + player.width/2, player.y + player.height/2, '#ff4444');
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
                    createParticle(player.x + player.width/2, player.y + player.height/2, '#ff8844');
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
        createParticle(px, py, '#ff6600');
    }
    
    // Check if player is in explosion radius
    if (player.invulnerable <= 0) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const distanceToPlayer = Math.sqrt(
            Math.pow(playerCenterX - x, 2) + Math.pow(playerCenterY - y, 2)
        );
        
        if (distanceToPlayer <= explosionRadius) {
            gameConfig.lives--;
            player.invulnerable = 2000;
            
            // Create additional explosion particles around player
            for (let i = 0; i < 12; i++) {
                createParticle(playerCenterX, playerCenterY, '#ff3300');
            }
            
            if (gameConfig.lives <= 0) {
                gameOver();
            }
            updateUI();
        }
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function createParticle(x, y, color) {
    const count = 3 + Math.random() * 5;
    for (let i = 0; i < count; i++) {
        const vx = (Math.random() - 0.5) * 4;
        const vy = (Math.random() - 0.5) * 4 - 1;
        const life = 0.5 + Math.random() * 1;
        gameConfig.particles.push(new Particle(x, y, vx, vy, color, life));
    }
}

// Rendering
function render() {
    const ctx = gameConfig.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, gameConfig.width, gameConfig.height);
    
    // Draw starfield background
    drawStarfield(ctx);
    
    if (gameConfig.gameState === 'playing') {
        // Draw player
        drawPlayer(ctx);
        
        // Draw enemies
        enemies.list.forEach(enemy => enemy.draw(ctx));
        
        // Draw bullets
        drawBullets(ctx);
        
        // Draw particles
        gameConfig.particles.forEach(particle => particle.draw(ctx));
        
        // Draw UI overlays
        if (enemies.waveComplete) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '32px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`Level ${gameConfig.level} Complete!`, gameConfig.width/2, gameConfig.height/2);
            ctx.fillText('Next wave incoming...', gameConfig.width/2, gameConfig.height/2 + 40);
        }
    }
}

function drawStarfield(ctx) {
    // Simple animated starfield
    const time = Date.now() * 0.001;
    ctx.fillStyle = '#ffffff';
    
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % gameConfig.width;
        const y = ((i * 41 + time * 20) % gameConfig.height);
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
}

function drawPlayer(ctx) {
    ctx.save();
    
    // Flash effect when invulnerable
    if (player.invulnerable > 0 && Math.floor(Date.now() / 100) % 2) {
        ctx.globalAlpha = 0.5;
    }
    
    // Player ship
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Ship details
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 12, player.y + 2, 6, 4);
    ctx.fillRect(player.x + 5, player.y + 8, 4, 8);
    ctx.fillRect(player.x + 21, player.y + 8, 4, 8);
    
    ctx.restore();
}

function drawBullets(ctx) {
    // Player bullets
    ctx.fillStyle = '#00ff00';
    player.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Add glow effect for player bullets
        ctx.fillStyle = '#88ff88';
        ctx.fillRect(bullet.x + 1, bullet.y + 1, bullet.width - 2, bullet.height - 2);
        ctx.fillStyle = '#00ff00';
    });
    
    // Enemy bullets with type-specific visuals
    enemies.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        
        switch (bullet.type) {
            case 'homing': {
                // Pulsing homing missile
                const pulseSize = Math.sin(Date.now() * 0.01) * 2;
                ctx.fillRect(bullet.x - pulseSize, bullet.y - pulseSize, 
                           bullet.width + pulseSize * 2, bullet.height + pulseSize * 2);
                
                // Trail effect
                ctx.fillStyle = bullet.color + '66';
                ctx.fillRect(bullet.x - 10, bullet.y + bullet.height, 3, 8);
                ctx.fillRect(bullet.x + bullet.width + 7, bullet.y + bullet.height, 3, 8);
                break;
            }
                
            case 'bomb':
                // Spinning bomb visual
                ctx.save();
                ctx.translate(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
                ctx.rotate(Date.now() * 0.005);
                ctx.fillRect(-bullet.width/2, -bullet.height/2, bullet.width, bullet.height);
                
                // Fuse spark
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(-1, -bullet.height/2 - 2, 2, 2);
                ctx.restore();
                break;
                
            case 'sniper':
                // Long, sleek bullet
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Energy trail
                ctx.fillStyle = bullet.color + '88';
                ctx.fillRect(bullet.x + 1, bullet.y + bullet.height, bullet.width - 2, 6);
                break;
                
            case 'heavy':
                // Large, thick bullet
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Core glow
                ctx.fillStyle = '#ffdd00';
                ctx.fillRect(bullet.x + 1, bullet.y + 1, bullet.width - 2, bullet.height - 2);
                break;
                
            case 'fast':
                // Twin bullets
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Speed lines
                ctx.fillStyle = bullet.color + '44';
                ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 4);
                break;
                
            case 'boss':
                // Spread shot bullets
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Energy aura
                ctx.fillStyle = bullet.color + '33';
                ctx.fillRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                break;
                
            default:
                // Basic bullet
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
}

function updateUI() {
    document.getElementById('score').textContent = gameConfig.score;
    document.getElementById('lives').textContent = gameConfig.lives;
    document.getElementById('level').textContent = gameConfig.level;
}

function updateMuteDisplay(isMuted) {
    const muteIndicator = document.getElementById('muteIndicator');
    if (muteIndicator) {
        muteIndicator.textContent = isMuted ? '🔇 MUTED' : '🔊 AUDIO ON';
        muteIndicator.style.color = isMuted ? '#ff4444' : '#00ff00';
    }
}

// Main game loop
function gameLoop(currentTime) {
    const deltaTime = (currentTime - gameConfig.lastTime) / 1000;
    gameConfig.lastTime = currentTime;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

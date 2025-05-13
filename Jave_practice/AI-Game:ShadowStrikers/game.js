// ===== GLOBAL SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game state variables
let keys = {};
let frameCount = 0;
let levelTimer = 0;
let levelIndex = 0;
let currentLevelConfig;
let gameOver = false;

// Player, enemies, boss, hazards, and projectiles arrays
let player;
let enemies = [];
let enemyBullets = [];
let boss = null;
let bossBullets = [];
let powerUps = [];
let backgroundLayers = [];
let destructibleWalls = [];
let poisonZone = null;
let gravityShiftActive = false; // for hazard "gravityShift"

// ===== LEVEL CONFIGURATIONS =====
const levels = [
  {
    // Level 1: Steel Haven (Cyberpunk City)
    name: "Steel Haven",
    objective: "Survive waves of rogue drones in the neon-lit streets.",
    boss: { name: "Overlord Sentinel", health: 200, color: "orange", attackPattern: "laser" },
    enemyTypes: ["drone"],
    background: [
      { speed: 0.5, color: "#222" },
      { speed: 1, color: "#444" }
    ],
    hazards: [] // no hazards here
  },
  {
    // Level 2: Toxic Ravine (Underground Facility)
    name: "Toxic Ravine",
    objective: "Navigate hazardous tunnels filled with mutated creatures.",
    boss: { name: "Venom Fang", health: 220, color: "green", attackPattern: "venom" },
    enemyTypes: ["drone", "melee"],
    background: [
      { speed: 0.5, color: "#333" },
      { speed: 1, color: "#555" }
    ],
    hazards: ["poisonGas"]
  },
  {
    // Level 3: Frozen Bastion (Icy Military Base)
    name: "Frozen Bastion",
    objective: "Disable enemy satellite before airstrikes destroy the base.",
    boss: { name: "Frost Reaper", health: 250, color: "lightblue", attackPattern: "freeze" },
    enemyTypes: ["drone", "ranged"],
    background: [
      { speed: 0.5, color: "#5599ff" },
      { speed: 1, color: "#77bbff" }
    ],
    hazards: ["destructibleWalls"]
  },
  {
    // Level 4: The Void (Alien Dimension)
    name: "The Void",
    objective: "Escape before time runs out—aliens distort reality!",
    boss: { name: "Void Tyrant", health: 300, color: "purple", attackPattern: "teleport" },
    enemyTypes: ["drone", "teleport"],
    background: [
      { speed: 0.5, color: "#551a8b" },
      { speed: 1, color: "#9933cc" }
    ],
    hazards: ["gravityShift"]
  }
];

// ===== UTILITY FUNCTIONS =====
function rectsCollide(r1, r2) {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}

// ===== BACKGROUND LAYER CLASS =====
class BackgroundLayer {
  constructor(speed, color) {
    this.speed = speed;
    this.color = color;
    this.x = 0;
  }
  update() {
    this.x -= this.speed;
    if (this.x <= -canvas.width) {
      this.x = 0;
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    // Draw two rectangles side by side for continuous scrolling
    ctx.fillRect(this.x, 0, canvas.width, canvas.height);
    ctx.fillRect(this.x + canvas.width, 0, canvas.width, canvas.height);
  }
}

// ===== PLAYER CLASS =====
class Player {
  constructor() {
    this.x = 50;
    this.y = canvas.height / 2;
    this.width = 40;
    this.height = 40;
    this.speed = 5;
    this.health = 100;
    this.bullets = [];
  }
  move(dir) {
    // If gravity shift is active, invert up/down controls
    if (gravityShiftActive) {
      if (dir === "up" && this.y < canvas.height - this.height) this.y += this.speed;
      if (dir === "down" && this.y > 0) this.y -= this.speed;
    } else {
      if (dir === "up" && this.y > 0) this.y -= this.speed;
      if (dir === "down" && this.y < canvas.height - this.height) this.y += this.speed;
    }
  }
  shoot() {
    // A new bullet starting at the player's right side.
    this.bullets.push({ x: this.x + this.width, y: this.y + this.height / 2, speed: 8 });
  }
  updateBullets() {
    // Remove off-screen bullets and move each bullet
    this.bullets = this.bullets.filter((b) => b.x < canvas.width);
    this.bullets.forEach((b) => (b.x += b.speed));
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Draw player bullets
    ctx.fillStyle = "yellow";
    this.bullets.forEach((b) => ctx.fillRect(b.x, b.y, 10, 5));
  }
}

// ===== ENEMY CLASSES =====
class Enemy {
  constructor(type) {
    this.type = type;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - 40);
    this.width = 40;
    this.height = 40;
    this.baseSpeed = 2;
    this.speed = this.baseSpeed;
    this.health = 30;
    this.cooldown = 0;
  }
  update() {
    // Adjust speed or behavior based on enemy type
    if (this.type === "drone") {
      this.speed = this.baseSpeed;
    } else if (this.type === "melee") {
      this.speed = this.baseSpeed + 2;
    } else if (this.type === "ranged") {
      this.speed = this.baseSpeed;
      if (this.cooldown <= 0) {
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.height / 2));
        this.cooldown = 150;
      } else {
        this.cooldown--;
      }
    } else if (this.type === "teleport") {
      // Random teleportation on occasion
      if (Math.random() < 0.01) {
        this.y = Math.random() * (canvas.height - this.height);
      }
    }
    // Basic dodge: if any player bullet is near horizontally, shift vertically
    for (let bullet of player.bullets) {
      if (Math.abs(bullet.x - this.x) < 50) {
        if (this.y > player.y) {
          this.y += 2;
        } else {
          this.y -= 2;
        }
      }
    }
    this.x -= this.speed;
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class EnemyBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 4;
  }
  update() {
    this.x -= this.speed;
  }
  draw() {
    ctx.fillStyle = "orange";
    ctx.fillRect(this.x, this.y, 8, 4);
  }
}

// ===== Boss & Boss Bullets =====
class Boss {
  constructor(config) {
    this.name = config.name;
    this.health = config.health;
    this.maxHealth = config.health;
    this.x = canvas.width - 150;
    this.y = canvas.height / 2 - 50;
    this.width = 100;
    this.height = 100;
    this.color = config.color;
    this.attackPattern = config.attackPattern;
    this.cooldown = 0;
  }
  update() {
    // Different attack patterns for each boss type
    if (this.attackPattern === "laser") {
      if (this.cooldown <= 0) {
        bossBullets.push(new EnemyBullet(this.x, this.y + this.height / 2));
        this.cooldown = 100;
      } else {
        this.cooldown--;
      }
    } else if (this.attackPattern === "venom") {
      if (this.cooldown <= 0) {
        bossBullets.push(new VenomBullet(this.x, this.y + this.height / 2));
        this.cooldown = 120;
      } else {
        this.cooldown--;
      }
    } else if (this.attackPattern === "freeze") {
      if (this.cooldown <= 0) {
        bossBullets.push(new FreezeBullet(this.x, this.y + this.height / 2));
        this.cooldown = 130;
      } else {
        this.cooldown--;
      }
    } else if (this.attackPattern === "teleport") {
      if (this.cooldown <= 0) {
        // Teleport randomly vertically and then shoot
        this.y = Math.random() * (canvas.height - this.height);
        bossBullets.push(new EnemyBullet(this.x, this.y + this.height / 2));
        this.cooldown = 150;
      } else {
        this.cooldown--;
      }
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Draw boss health bar above the boss
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y - 20, this.width, 10);
    ctx.fillStyle = "green";
    let healthWidth = (this.health / this.maxHealth) * this.width;
    ctx.fillRect(this.x, this.y - 20, healthWidth, 10);
  }
}

class VenomBullet extends EnemyBullet {
  constructor(x, y) {
    super(x, y);
    this.speed = 2;
  }
  draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, 8, 4);
  }
}

class FreezeBullet extends EnemyBullet {
  constructor(x, y) {
    super(x, y);
    this.speed = 3;
  }
  draw() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.x, this.y, 8, 4);
  }
}

// ===== HAZARDS =====
class PoisonGasZone {
  constructor() {
    this.x = canvas.width / 2 - 100;
    this.y = canvas.height - 100;
    this.width = 200;
    this.height = 100;
  }
  draw() {
    ctx.fillStyle = "rgba(0,255,0,0.3)";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  checkCollision(p) {
    return rectsCollide(this, p);
  }
}

class DestructibleWall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 100;
    this.health = 50;
  }
  draw() {
    ctx.fillStyle = "gray";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  hit(damage) {
    this.health -= damage;
  }
}

// ===== LEVEL SETUP =====
function setupLevel() {
  // Reset timing, enemies, bullets, hazards, etc.
  levelTimer = 0;
  enemies = [];
  enemyBullets = [];
  bossBullets = [];
  powerUps = [];
  destructibleWalls = [];
  boss = null;
  gravityShiftActive = false;
  // Set up player (you could also persist player stats across levels)
  player = new Player();
  // Create background layers based on the current level config
  backgroundLayers = [];
  currentLevelConfig = levels[levelIndex];
  currentLevelConfig.background.forEach((layer) => {
    backgroundLayers.push(new BackgroundLayer(layer.speed, layer.color));
  });
  // Set hazards
  if (currentLevelConfig.hazards.includes("poisonGas")) {
    poisonZone = new PoisonGasZone();
  } else {
    poisonZone = null;
  }
  if (currentLevelConfig.hazards.includes("destructibleWalls")) {
    // Create a few walls at fixed positions
    destructibleWalls.push(new DestructibleWall(300, canvas.height - 150));
    destructibleWalls.push(new DestructibleWall(500, canvas.height - 150));
  }
  if (currentLevelConfig.hazards.includes("gravityShift")) {
    gravityShiftActive = false;
    // Toggle gravity shift every 10 seconds (roughly 600 frames)
    setInterval(() => {
      gravityShiftActive = !gravityShiftActive;
    }, 10000);
  }
}

// ===== INPUT HANDLING =====
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    player.shoot();
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// ===== ENEMY SPAWNING =====
function spawnEnemy() {
  // Choose a random enemy type from current level's enemyTypes
  let types = currentLevelConfig.enemyTypes;
  let type = types[Math.floor(Math.random() * types.length)];
  enemies.push(new Enemy(type));
}

// ===== LEVEL PROGRESSION & BOSS SPAWN =====
const bossSpawnTime = 600; // frames (roughly 10 seconds)
function updateLevelProgression() {
  // Increase the level timer as frames progress
  levelTimer++;
  // Spawn enemies periodically if boss not yet active
  if (!boss && frameCount % 120 === 0) {
    spawnEnemy();
  }
  // When levelTimer exceeds bossSpawnTime, spawn boss if not already spawned
  if (levelTimer > bossSpawnTime && !boss) {
    boss = new Boss(currentLevelConfig.boss);
  }
  // If boss exists and is defeated, move to the next level (if any)
  if (boss && boss.health <= 0) {
    levelIndex++;
    if (levelIndex >= levels.length) {
      // End game if no more levels
      alert("Congratulations! You have completed Shadow Assault!");
      gameOver = true;
    } else {
      setupLevel();
    }
  }
}

// ===== COLLISION HANDLING =====
function checkCollisions() {
  // Player bullets vs. enemies
  player.bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + 10 > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + 5 > enemy.y
      ) {
        // Remove enemy (for simplicity; you could deduct enemy health)
        enemies.splice(eIndex, 1);
        player.bullets.splice(bIndex, 1);
      }
    });
    // Player bullets vs. boss
    if (boss && 
        bullet.x < boss.x + boss.width &&
        bullet.x + 10 > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + 5 > boss.y) {
      boss.health -= 10;
      player.bullets.splice(bIndex, 1);
    }
    // Player bullets vs. destructible walls
    destructibleWalls.forEach((wall, wIndex) => {
      if (
        bullet.x < wall.x + wall.width &&
        bullet.x + 10 > wall.x &&
        bullet.y < wall.y + wall.height &&
        bullet.y + 5 > wall.y
      ) {
        wall.hit(10);
        player.bullets.splice(bIndex, 1);
        if (wall.health <= 0) {
          destructibleWalls.splice(wIndex, 1);
        }
      }
    });
  });
  // Enemy bullets & boss bullets vs. player
  [...enemyBullets, ...bossBullets].forEach((bullet, index, arr) => {
    if (
      bullet.x < player.x + player.width &&
      bullet.x + 8 > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + 4 > player.y
    ) {
      player.health -= 5;
      arr.splice(index, 1);
    }
  });
  // Check player collision with poison gas hazard
  if (poisonZone && poisonZone.checkCollision(player)) {
    player.health -= 0.1; // gradual health loss
  }
}

// ===== MAIN GAME LOOP =====
function gameLoop() {
  if (gameOver) return;
  frameCount++;

  // Update background layers (parallax effect)
  backgroundLayers.forEach((layer) => {
    layer.update();
    layer.draw();
  });

  // Draw hazards
  if (poisonZone) poisonZone.draw();
  destructibleWalls.forEach((wall) => wall.draw());

  // Update player
  if (keys["ArrowUp"]) player.move("up");
  if (keys["ArrowDown"]) player.move("down");
  player.updateBullets();
  player.draw();

  // Update and draw enemies
  enemies = enemies.filter((enemy) => enemy.x + enemy.width > 0);
  enemies.forEach((enemy) => {
    enemy.update();
    enemy.draw();
  });

  // Update enemy bullets
  enemyBullets.forEach((bullet) => {
    bullet.update();
    bullet.draw();
  });

  // Update boss if present
  if (boss) {
    boss.update();
    boss.draw();
  }

  // Update boss bullets
  bossBullets.forEach((bullet) => {
    bullet.update();
    bullet.draw();
  });

  // Check collisions
  checkCollisions();

  // Update level progression (spawn boss, spawn enemies, etc.)
  updateLevelProgression();

  // Draw player health bar on screen
  ctx.fillStyle = "white";
  ctx.fillRect(10, 10, 100, 10);
  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, (player.health / 100) * 100, 10);
  document.getElementById("ui").innerText = `${currentLevelConfig.name}: ${currentLevelConfig.objective}`;

  // End game if player's health drops to 0
  if (player.health <= 0) {
    alert("Game Over! You have been defeated.");
    gameOver = true;
  }

  requestAnimationFrame(gameLoop);
}

// ===== INITIALIZE GAME =====
setupLevel();
gameLoop();

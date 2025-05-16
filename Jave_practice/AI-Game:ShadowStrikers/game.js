// ==========================
// Scene Setup & Global Variables
// ==========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(100, 200, 500);  
camera.lookAt(100, 200, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Global game objects and state
let player, levelIndex = 0, levelTimer = 0, boss = null;
const bullets = [];
const enemyBullets = [];
const bossBullets = [];
const enemies = [];
const powerUps = [];
const destructibleWalls = [];
const backgroundLayers = [];
let poisonZone = null;
let gravityShiftActive = false;
const keys = {};
const clock = new THREE.Clock();

// ==========================
// Level Configurations
// ==========================
const levels = [
  {
    // Level 1: Steel Haven (Cyberpunk City)
    name: "Steel Haven",
    objective: "Survive waves of rogue drones in the neon-lit streets.",
    boss: { name: "Overlord Sentinel", health: 200, color: 0xffa500, attackPattern: "laser" },
    enemyTypes: ["drone"],
    background: [
      { speed: 0.2, color: 0x222222 },
      { speed: 0.4, color: 0x444444 }
    ],
    hazards: [] // no hazards
  },
  {
    // Level 2: Toxic Ravine (Underground Facility)
    name: "Toxic Ravine",
    objective: "Navigate hazardous tunnels filled with mutated creatures.",
    boss: { name: "Venom Fang", health: 220, color: 0x00ff00, attackPattern: "venom" },
    enemyTypes: ["drone", "melee"],
    background: [
      { speed: 0.2, color: 0x333333 },
      { speed: 0.4, color: 0x555555 }
    ],
    hazards: ["poisonGas"]
  },
  {
    // Level 3: Frozen Bastion (Icy Military Base)
    name: "Frozen Bastion",
    objective: "Disable enemy satellite before airstrikes destroy the base.",
    boss: { name: "Frost Reaper", health: 250, color: 0xadd8e6, attackPattern: "freeze" },
    enemyTypes: ["drone", "ranged"],
    background: [
      { speed: 0.2, color: 0x5599ff },
      { speed: 0.4, color: 0x77bbff }
    ],
    hazards: ["destructibleWalls"]
  },
  {
    // Level 4: The Void (Alien Dimension)
    name: "The Void",
    objective: "Escape before time runs out—aliens distort reality!",
    boss: { name: "Void Tyrant", health: 300, color: 0x800080, attackPattern: "teleport" },
    enemyTypes: ["drone", "teleport"],
    background: [
      { speed: 0.2, color: 0x551a8b },
      { speed: 0.4, color: 0x9933cc }
    ],
    hazards: ["gravityShift"]
  }
];

// ==========================
// Utility Function: Collision Detection
// ==========================
function checkIntersection(obj1, obj2) {
  const box1 = new THREE.Box3().setFromObject(obj1);
  const box2 = new THREE.Box3().setFromObject(obj2);
  return box1.intersectsBox(box2);
}

// ==========================
// BackgroundLayer3D for Parallax Scrolling
// ==========================
class BackgroundLayer3D {
  constructor(speed, color, zPosition) {
    this.speed = speed;
    this.zPosition = zPosition;
    const geometry = new THREE.PlaneGeometry(2000, 1000);
    const material = new THREE.MeshBasicMaterial({ color: color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 500, zPosition);
  }
  update(delta) {
    this.mesh.position.x -= this.speed * delta * 50;
    if (this.mesh.position.x < -1000) {
      this.mesh.position.x = 0;
    }
  }
}

// ==========================
// Player3D Class
// ==========================
class Player3D {
  constructor() {
    const geometry = new THREE.BoxGeometry(40, 40, 40);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(50, 200, 0);
    this.speed = 5;
    this.health = 100;
  }
  move(dir, delta) {
    let amount = this.speed * delta * 60;
    // Invert vertical movement if gravity shift is active
    if (gravityShiftActive) amount = -amount;
    if (dir === "up") this.mesh.position.y += amount;
    if (dir === "down") this.mesh.position.y -= amount;
    if (dir === "left") this.mesh.position.x -= amount;
    if (dir === "right") this.mesh.position.x += amount;
  }
  shoot() {
    const bullet = new Bullet3D(
      this.mesh.position.x + 20,
      this.mesh.position.y,
      this.mesh.position.z
    );
    bullets.push(bullet);
    scene.add(bullet.mesh);
  }
}

// ==========================
// Bullet3D Class (Player Bullets)
// ==========================
class Bullet3D {
  constructor(x, y, z) {
    const geometry = new THREE.SphereGeometry(5, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    this.speed = 10;
  }
  update(delta) {
    this.mesh.position.x += this.speed * delta * 60;
  }
}

// ==========================
// Enemy3D Class & Enemy AI Tactics
// ==========================
class Enemy3D {
  constructor(type) {
    this.type = type;
    const geometry = new THREE.BoxGeometry(40, 40, 40);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(800, Math.random() * 400 + 100, 0);
    this.baseSpeed = 2;
    this.speed = this.baseSpeed;
    this.health = 30;
    this.cooldown = 0;
  }
  update(delta) {
    if (this.type === "drone") {
      this.speed = this.baseSpeed;
    } else if (this.type === "melee") {
      this.speed = this.baseSpeed + 2;
    } else if (this.type === "ranged") {
      this.speed = this.baseSpeed;
      if (this.cooldown <= 0) {
        const enemyBullet = new EnemyBullet3D(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z
        );
        enemyBullets.push(enemyBullet);
        scene.add(enemyBullet.mesh);
        this.cooldown = 150;
      } else {
        this.cooldown--;
      }
    } else if (this.type === "teleport") {
      if (Math.random() < 0.01) {
        this.mesh.position.y = Math.random() * 400 + 100;
      }
    }
    // Basic "dodge" behavior when close to a player bullet
    for (let bullet of bullets) {
      if (Math.abs(bullet.mesh.position.x - this.mesh.position.x) < 50) {
        if (this.mesh.position.y > player.mesh.position.y) {
          this.mesh.position.y += 2;
        } else {
          this.mesh.position.y -= 2;
        }
      }
    }
    this.mesh.position.x -= this.speed * delta * 60;
  }
}

// ==========================
// EnemyBullet3D Class
// ==========================
class EnemyBullet3D {
  constructor(x, y, z) {
    const geometry = new THREE.SphereGeometry(4, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    this.speed = 6;
  }
  update(delta) {
    this.mesh.position.x -= this.speed * delta * 60;
  }
}

// ==========================
// Boss3D Class with Special Attacks & Health Bar
// ==========================
class Boss3D {
  constructor(config) {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshPhongMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(800, 200, 0);
    this.health = config.health;
    this.maxHealth = config.health;
    this.attackPattern = config.attackPattern;
    this.cooldown = 0;
  }
  update(delta) {
    if (this.attackPattern === "laser") {
      if (this.cooldown <= 0) {
        const bossBullet = new EnemyBullet3D(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z
        );
        bossBullets.push(bossBullet);
        scene.add(bossBullet.mesh);
        this.cooldown = 100;
      } else {
        this.cooldown--;
      }
    } else if (this.attackPattern === "venom") {
      if (this.cooldown <= 0) {
        const bossBullet = new VenomBullet3D(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z
        );
        bossBullets.push(bossBullet);
        scene.add(bossBullet.mesh);
        this.cooldown = 120;
      } else {
        this.cooldown--;
      }
    } else if (this.attackPattern === "freeze") {
      if (this.cooldown <= 0) {
        const bossBullet = new FreezeBullet3D(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z
        );
        bossBullets.push(bossBullet);
        scene.add(bossBullet.mesh);
        this.cooldown = 130;
      } else {
        this.cooldown--;
      }
    } else if (this.attackPattern === "teleport") {
      if (this.cooldown <= 0) {
        this.mesh.position.y = Math.random() * 400 + 100;
        const bossBullet = new EnemyBullet3D(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z
        );
        bossBullets.push(bossBullet);
        scene.add(bossBullet.mesh);
        this.cooldown = 150;
      } else {
        this.cooldown--;
      }
    }
  }
  drawHealthBar() {
    // For this prototype, update the UI element with boss health.
    document.getElementById("ui").innerText =
      `${levels[levelIndex].name}: ${levels[levelIndex].objective} | Boss Health: ${this.health}`;
  }
}

class VenomBullet3D extends EnemyBullet3D {
  constructor(x, y, z) {
    super(x, y, z);
    this.speed = 3;
    this.mesh.material.color.set(0x00ff00);
  }
}

class FreezeBullet3D extends EnemyBullet3D {
  constructor(x, y, z) {
    super(x, y, z);
    this.speed = 4;
    this.mesh.material.color.set(0x00ffff);
  }
}

// ==========================
// Hazards
// ==========================

// Poison Gas Zone: a semi-transparent green plane
class PoisonGasZone3D {
  constructor() {
    const geometry = new THREE.PlaneGeometry(300, 200);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(400, 150, -50);
    this.mesh.rotation.x = -Math.PI / 2;
  }
}

// Destructible Wall: breaks after taking enough hits
class DestructibleWall3D {
  constructor(x, y) {
    const geometry = new THREE.BoxGeometry(50, 100, 50);
    const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(x, y, 0);
    this.health = 50;
  }
  hit(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      scene.remove(this.mesh);
    }
  }
}

// ==========================
// Level Setup & Progression
// ==========================
function setupLevel() {
  levelTimer = 0;
  // Remove previous objects as needed
  bullets.length = 0;
  enemyBullets.length = 0;
  bossBullets.length = 0;
  enemies.length = 0;
  powerUps.length = 0;
  destructibleWalls.length = 0;
  if (boss) {
    scene.remove(boss.mesh);
    boss = null;
  }
  // Setup dynamic backgrounds
  backgroundLayers.length = 0;
  const currentLevel = levels[levelIndex];
  currentLevel.background.forEach((layer, i) => {
    const bgLayer = new BackgroundLayer3D(layer.speed, layer.color, -200 - i * 100);
    backgroundLayers.push(bgLayer);
    scene.add(bgLayer.mesh);
  });
  // Setup hazards based on level
  if (currentLevel.hazards.includes("poisonGas")) {
    poisonZone = new PoisonGasZone3D();
    scene.add(poisonZone.mesh);
  } else {
    poisonZone = null;
  }
  if (currentLevel.hazards.includes("destructibleWalls")) {
    const wall1 = new DestructibleWall3D(300, 150);
    const wall2 = new DestructibleWall3D(500, 150);
    destructibleWalls.push(wall1, wall2);
    scene.add(wall1.mesh, wall2.mesh);
  }
  if (currentLevel.hazards.includes("gravityShift")) {
    gravityShiftActive = false;
    setInterval(() => {
      gravityShiftActive = !gravityShiftActive;
    }, 10000);
  }
  // (Re)create the player
  if (player) scene.remove(player.mesh);
  player = new Player3D();
  scene.add(player.mesh);
}

// ==========================
// Input Handling
// ==========================
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    player.shoot();
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// ==========================
// Enemy Spawning & Level Progression
// ==========================
function spawnEnemy() {
  const currentLevel = levels[levelIndex];
  let type = currentLevel.enemyTypes[Math.floor(Math.random() * currentLevel.enemyTypes.length)];
  let enemy = new Enemy3D(type);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}

const bossSpawnTime = 30; // seconds until boss appearance
function updateLevelProgression(delta) {
  levelTimer += delta;
  if (!boss && levelTimer > bossSpawnTime) {
    const currentLevel = levels[levelIndex];
    boss = new Boss3D(currentLevel.boss);
    scene.add(boss.mesh);
  }
  if (boss && boss.health <= 0) {
    levelIndex++;
    if (levelIndex >= levels.length) {
      alert("Congratulations! You have completed Shadow Assault 3D!");
      levelIndex = 0;
    }
    setupLevel();
  }
}

// ==========================
// Collision Handling
// ==========================
function checkCollisions() {
  // Player bullets vs. enemies, boss, destructible walls
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (checkIntersection(bullet.mesh, enemy.mesh)) {
        scene.remove(enemy.mesh);
        enemies.splice(eIndex, 1);
        scene.remove(bullet.mesh);
        bullets.splice(bIndex, 1);
      }
    });
    if (boss && checkIntersection(bullet.mesh, boss.mesh)) {
      boss.health -= 10;
      scene.remove(bullet.mesh);
      bullets.splice(bIndex, 1);
    }
    destructibleWalls.forEach((wall, wIndex) => {
      if (checkIntersection(bullet.mesh, wall.mesh)) {
        wall.hit(10);
        scene.remove(bullet.mesh);
        bullets.splice(bIndex, 1);
      }
    });
  });
  // Enemy and boss bullets vs. player
  enemyBullets.concat(bossBullets).forEach((bullet, index, arr) => {
    if (checkIntersection(bullet.mesh, player.mesh)) {
      player.health -= 5;
      scene.remove(bullet.mesh);
      arr.splice(index, 1);
    }
  });
  // Poison gas damage, etc.
  if (poisonZone && checkIntersection(player.mesh, poisonZone.mesh)) {
    player.health -= 0.1;
  }
}

// ==========================
// Lights & Ground
// ==========================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(300, 400, 200);
directionalLight.castShadow = true;
scene.add(directionalLight);

const groundGeo = new THREE.PlaneGeometry(2000, 2000);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.2 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// ==========================
// Main Game Loop
// ==========================
function animate() {
  const delta = clock.getDelta();
  
  // Update backgrounds with parallax effect
  backgroundLayers.forEach(layer => layer.update(delta));
  
  // Handle player movement based on keys
  if(keys["ArrowUp"]) player.move("up", delta);
  if(keys["ArrowDown"]) player.move("down", delta);
  if(keys["ArrowLeft"]) player.move("left", delta);
  if(keys["ArrowRight"]) player.move("right", delta);
  
  // Update player bullets
  bullets.forEach(bullet => bullet.update(delta));
  
  // Update enemies and enemy bullets
  enemies.forEach(enemy => enemy.update(delta));
  enemyBullets.forEach(bullet => bullet.update(delta));
  
  // Update boss and its bullets, if present
  if(boss) {
    boss.update(delta);
    boss.drawHealthBar();
  }
  bossBullets.forEach(bullet => bullet.update(delta));
  
  // Handle collisions
  checkCollisions();
  
  // Update level progression (boss spawn, enemy spawning)
  updateLevelProgression(delta);
  
  // Spawn enemies periodically if no boss is active
  if(Math.floor(clock.elapsedTime) % 3 === 0 && !boss) {
    if(Math.random() < 0.02) spawnEnemy();
  }
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

setupLevel();
animate();

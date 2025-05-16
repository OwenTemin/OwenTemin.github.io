"use strict";

/* ============================================================================
   Global variables and state management
   ============================================================================ */

let gameState = "menu"; // possible values: "menu", "tuning", "race"
const menuDiv = document.getElementById('menu');
const gameContainerDiv = document.getElementById('gameContainer');
const tuningScreenDiv = document.getElementById('tuningScreen');

const careerModeBtn = document.getElementById('careerModeBtn');
const timeAttackBtn = document.getElementById('timeAttackBtn');
const multiplayerBtn = document.getElementById('multiplayerBtn');
const tuningBtn = document.getElementById('tuningBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

careerModeBtn.addEventListener('click', startCareerMode);
timeAttackBtn.addEventListener('click', startTimeAttack);
multiplayerBtn.addEventListener('click', startMultiplayer);
tuningBtn.addEventListener('click', showTuningScreen);
backToMenuBtn.addEventListener('click', backToMenu);

// Canvas and HUD references
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hudTrack = document.getElementById("hudTrack");
const hudSpeed = document.getElementById("hudSpeed");
const hudDrift = document.getElementById("hudDrift");

// Default car tuning parameters (modifiable via the tuning screen)
let carConfig = {
  acceleration: 0.2,
  maxSpeed: 6,
  friction: 0.98,
  steering: 0.05,
  driftMultiplier: 0.9
};

// Tuning UI elements & default values
const accRange = document.getElementById('accelerationRange');
const maxSpeedRange = document.getElementById('maxSpeedRange');
const steeringRange = document.getElementById('steeringRange');
accRange.value = carConfig.acceleration;
maxSpeedRange.value = carConfig.maxSpeed;
steeringRange.value = carConfig.steering;
accRange.addEventListener('input', function(){
    carConfig.acceleration = parseFloat(this.value);
});
maxSpeedRange.addEventListener('input', function(){
  carConfig.maxSpeed = parseFloat(this.value);
});
steeringRange.addEventListener('input', function(){
  carConfig.steering = parseFloat(this.value);
});

// Input handling for race simulation
let keysPressed = {};
document.addEventListener('keydown', (e) => {
  keysPressed[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  keysPressed[e.key] = false;
});

/* ============================================================================
   Car Class: manages the player's car and drifting physics.
   ============================================================================ */
class Car {
  constructor(x, y, angle, config) {
    this.x = x;
    this.y = y;
    this.angle = angle; // in radians
    this.vx = 0;
    this.vy = 0;
    this.config = Object.assign({
      acceleration: 0.2,
      maxSpeed: 6,
      friction: 0.98,
      steering: 0.05,
      driftMultiplier: 0.9
    }, config);
  }
  
  update() {
    // Acceleration: ArrowUp for forward, ArrowDown for reverse (half power)
    if(keysPressed["ArrowUp"]) {
      let ax = Math.cos(this.angle) * this.config.acceleration;
      let ay = Math.sin(this.angle) * this.config.acceleration;
      this.vx += ax;
      this.vy += ay;
    }
    if(keysPressed["ArrowDown"]) {
      let ax = -Math.cos(this.angle) * (this.config.acceleration * 0.5);
      let ay = -Math.sin(this.angle) * (this.config.acceleration * 0.5);
      this.vx += ax;
      this.vy += ay;
    }
    // Steering: turning the car with left/right arrows.
    if(keysPressed["ArrowLeft"]) {
      this.angle -= this.config.steering;
    }
    if(keysPressed["ArrowRight"]) {
      this.angle += this.config.steering;
    }
    
    // Drifting physics
    let forwardVel = Math.cos(this.angle) * this.vx + Math.sin(this.angle) * this.vy;
    let sideVel = -Math.sin(this.angle) * this.vx + Math.cos(this.angle) * this.vy;
    forwardVel *= this.config.friction;
    sideVel *= this.config.friction * this.config.driftMultiplier;
    this.vx = Math.cos(this.angle) * forwardVel - Math.sin(this.angle) * sideVel;
    this.vy = Math.sin(this.angle) * forwardVel + Math.cos(this.angle) * sideVel;
    
    // Limit speed
    let speed = Math.hypot(this.vx, this.vy);
    if (speed > this.config.maxSpeed) {
      let scale = this.config.maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Wrap-around screen edges
    if(this.x > canvas.width) this.x = 0;
    if(this.x < 0) this.x = canvas.width;
    if(this.y > canvas.height) this.y = 0;
    if(this.y < 0) this.y = canvas.height;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // Car body (a simple rectangle; in a full game, different sprites or models can be used)
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(-10, -5, 20, 10);
    // Front indicator so the player knows which way the car is facing.
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(5, -3, 4, 6);
    ctx.restore();
  }
}

/* ============================================================================
   Track Definitions: five different tracks with distinct visuals.
   ============================================================================ */
const tracks = [
  { 
    name: "City Circuit", 
    draw: function(ctx) {
      ctx.fillStyle = "#555";
      ctx.fillRect(100, 100, 600, 400);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.strokeRect(100, 100, 600, 400);
      // Dashed center line
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(400, 100);
      ctx.lineTo(400, 500);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
  { 
    name: "Coastal Highway", 
    draw: function(ctx) {
      ctx.fillStyle = "#007acc";
      ctx.fillRect(50, 150, 700, 300);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 150, 700, 300);
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10]);
      ctx.beginPath();
      ctx.moveTo(400, 150);
      ctx.lineTo(400, 450);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
  { 
    name: "Mountain Loop", 
    draw: function(ctx) {
      ctx.fillStyle = "#3e3e3e";
      ctx.fillRect(150, 50, 500, 500);
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 4;
      ctx.strokeRect(150, 50, 500, 500);
      // Diagonal dashed mid-line to simulate curves
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(150, 50);
      ctx.lineTo(650, 550);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
  { 
    name: "Industrial Ruins", 
    draw: function(ctx) {
      ctx.fillStyle = "#666";
      ctx.fillRect(50, 50, 700, 500);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, 700, 500);
      // Draw some obstacles
      ctx.fillStyle = "#222";
      for (let i = 0; i < 5; i++) {
         ctx.fillRect(100 + i * 120, 100, 30, 30);
         ctx.fillRect(120 + i * 120, 400, 30, 30);
      }
    }
  },
  { 
    name: "Desert Mirage", 
    draw: function(ctx) {
      ctx.fillStyle = "#d2b48c";
      ctx.fillRect(100, 120, 600, 360);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.strokeRect(100, 120, 600, 360);
      // Simulate sand dunes with ellipses
      ctx.fillStyle = "#c2a080";
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.ellipse(150 + i * 80, 300, 40, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
];

let currentTrack = tracks[0]; // default track for race mode
let playerCar = null;

/* ============================================================================
   Game Loop and Race Simulation
   ============================================================================ */
let lastTime = 0;
function gameLoop(timestamp) {
  if (lastTime === 0) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  updateRace(deltaTime);
  drawRace();
  
  if (gameState === "race") {
    requestAnimationFrame(gameLoop);
  }
}

// Update the race simulation each frame.
function updateRace(deltaTime) {
  if (playerCar) {
    playerCar.update();
    // Update HUD values: speed and drift gauge.
    let speed = Math.hypot(playerCar.vx, playerCar.vy);
    let forwardVel = Math.cos(playerCar.angle) * playerCar.vx + Math.sin(playerCar.angle) * playerCar.vy;
    let driftValue = Math.abs(speed - Math.abs(forwardVel));
    hudTrack.textContent = currentTrack.name;
    hudSpeed.textContent = speed.toFixed(2);
    hudDrift.textContent = driftValue.toFixed(2);
  }
}

// Draw the current track and player's car.
function drawRace() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentTrack.draw(ctx);
  if (playerCar) playerCar.draw(ctx);
}

/* ============================================================================
   State Management Functions (Menu, Tuning, Race)
   ============================================================================ */
function showMenu() {
  gameState = "menu";
  menuDiv.style.display = "flex";
  gameContainerDiv.style.display = "none";
  tuningScreenDiv.style.display = "none";
}
function showGameContainer() {
  gameState = "race";
  menuDiv.style.display = "none";
  tuningScreenDiv.style.display = "none";
  gameContainerDiv.style.display = "block";
}
function showTuningScreen() {
  gameState = "tuning";
  menuDiv.style.display = "none";
  gameContainerDiv.style.display = "none";
  tuningScreenDiv.style.display = "flex";
}
function backToMenu() {
  showMenu();
}

/* ============================================================================
   Game Mode Starters
   ============================================================================ */
// Career Mode – In a full version this would include narrative sequences and rivalries.
function startCareerMode() {
  // Pick a random track from the available options.
  currentTrack = tracks[Math.floor(Math.random() * tracks.length)];
  playerCar = new Car(canvas.width / 2, canvas.height / 2, -Math.PI / 2, carConfig);
  showGameContainer();
  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

// Time Attack – For now similar to career mode but could later include lap timers and leaderboards.
function startTimeAttack() {
  currentTrack = tracks[Math.floor(Math.random() * tracks.length)];
  playerCar = new Car(canvas.width / 2, canvas.height / 2, -Math.PI / 2, carConfig);
  showGameContainer();
  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

// Multiplayer – Not implemented yet; placeholder to indicate future expansion.
function startMultiplayer() {
  alert("Multiplayer is coming soon!");
}

/* ============================================================================
   Initialization: start at the main menu.
   ============================================================================ */
showMenu();

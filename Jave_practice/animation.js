const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let x = 50;
let xv = 10;
let yv = 5;
let y = 25;
let gameRunning = true;
let score = 0;

//this is an object
//we access values in an object like this:
//player.x

const player = {
    //key:Value Pair
    x : 0,
    y : 0,
    color : "green",
    speed : 3
};

const keys = {};

//define functions
function drawRect(x,y) {
    //console.log("drawing rect");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(x,y,50,50);
    ctx.fill();
}

function drawPlayer() {
    ctx.fillstyle = player.color;
    ctx.beginPath();
    ctx.arc(
	player.x,
	player.y,
	20,
	0,
	2*Math.PI
    );

}

function movePlayer(){
    //player.x += player.speed;
    if (keys["ArrowDown"] && player.y <400){
	player.y += player.speed;
    }
    if (keys["ArrowUp"] && player.y >0){
        player.y +=  -1 * player.speed;
    }
    if (keys["ArrowRight"] && player.x <400){
        player.x += player.speed;
    }
    if (keys["ArrowLeft"] && player.x > 0){
        player.x += -1 * player.speed;
    }
}

function drawScore(){
    ctx.font = "10px Arial";
    ctx.fillText(score, 10, 10)
}

function animate() {
    if (gameRunning){

	score++;

        y += 1 * yv;
	x += 1 * xv;

	drawRect(x,y);
        drawPlayer();
	movePlayer();
        drawScore();
	checkCollision();

	if ((x > 350) || (x == 0)) {
	    xv = xv * -1;
	}
	if ((y > 350) || (y == 0)) {                                                                                                                                               
	    yv = yv * -1;
	}
    }
    requestAnimationFrame(animate);
}

function handleKeyPress(e){
   console.log(e.key);
    keys[e.key] = true;
}

function checkCollision(){
    let box_min_x = x;
    let box_max_x = x + 50;
    let box_min_y = y;
    let box_max_y = y + 50;

    let player_min_x = player.x - 20;
    let player_max_x = player.x + 20;
    let player_min_y = player.y - 20;
    let player_max_y = player.y + 20;

    if (box_min_y < player_max_y && box_max_y > player_min_y && box_min_x < player_max_x && box_max_x > player_min_x){
	gameRunning = false;
    }
}

document.addEventListener('keydown', handleKeyPress);
document.addEventListener('keyup', (e) => {
    //console.log(e.key + " up");
    keys[e.key] = false;
});

//call our function
animate();

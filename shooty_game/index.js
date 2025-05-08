const canvas = document.getElementById("myCanvas");                                                                                                                                                     
const ctx = canvas.getContext("2d");

let check = [];
let active = [];
let frame = 0;
let cords = [];


function background(x, y) {
    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(x,y,35,0,2*Math.PI);
    ctx.fill();
}

function drawTarget(x, y) {                                                                                                                                                              
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, 2*Math.PI);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2*Math.PI);
    ctx.fill();

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2*Math.PI);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2*Math.PI);
    ctx.fill();
}

function rand(){
    
    let targ = 8;

    for (let i = 0; i < targ; i ++){
	    check.push(Math.floor(Math.random() * 10));
    }
        check.forEach((item, index) => {
	if (item == 1 || item == 2 || item == 3){
	    active.push(index);
	}
    })
}

function getCords(item){
    let x = 0;
    x = item * 100;
    if ((item % 2) == 1){
    y = 350;
    }
    if ((item % 2) == 0){
    y = 300;
    }
    x += 50;
    console.log(x + " : " + y)
    return { x, y };
}

function drawBackground() {
    background(50, 300);
    background(150, 350);
    background(250, 300);
    background(350, 350);
    background(450, 300);
    background(550, 350);
    background(650, 300);
    background(750, 350);
}

function animate(){
    frame ++;
    if (frame == 50){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBackground();
        active = [];
        check = [];
	frame = 0;
	rand();
	console.log(active);
	active.forEach(item => {
        cords.push(getCords(item));
    });
    }

 //   drawBoard();
    requestAnimationFrame(animate);
}

animate();

/*
// Create an empty list to store coordinates
let coordinates = [];

// Function to generate a random x, y coordinate
function getRandomCoordinate() {
    let x = Math.floor(Math.random() * 500); // Random x (0 to 499)
    let y = Math.floor(Math.random() * 500); // Random y (0 to 499)
    return { x, y }; // Return as an object
}

// Function to add a random coordinate to the list
function addRandomCoordinate() {
    let newCoord = getRandomCoordinate();
    coordinates.push(newCoord); // Add to the list
    console.log("Added:", newCoord);
}

// Example: Add 5 random coordinates to the list
for (let i = 0; i < 5; i++) {
    addRandomCoordinate();
}

console.log("Final coordinates list:", coordinates);
*/
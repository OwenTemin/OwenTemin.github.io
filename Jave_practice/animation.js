const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let x = 50;
let xv = 10;
let yv = 5;
let y = 25;

//define functions
function drawRect(x,y) {
    console.log("drawing rect");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(x,y,50,50);
    ctx.fill();
}

function animate() {
    y += 1 * yv;
    x += 1 * xv;
    drawRect(x,y);

    // TODO: Add some code here 
    //  that will change the rectangle's position
if ((x > 350) || (x == 0)) {

	xv = xv * -1;
    }
if ((y > 350) || (y == 0)) {                                                                                                                                               
    yv = yv * -1;
}
requestAnimationFrame(animate);
}

//call our function
animate();

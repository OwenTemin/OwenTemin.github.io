const canvas = document.getElementById("myCanvas");                                                                                                                                                     
const ctx = canvas.getContext("2d");

let check = [];
let active = [];
let frame = 0;
let cords = [];
let score = 0;
let gameRunning = false;
let time = 30;

function background(x, y) {
    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(x,y,35,0,2*Math.PI);
    ctx.fill();
}

function start(){
    gameRunning = true;
}

function pause(){
    gameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function restart(){
    gameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    check = [];
    active = [];
    frame = 0;
    cords = [];
    score = 0;
    time = 30;

}

function gameOver(){
    gameRunning = false;
    //ctx.clearRect(0,0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,800,400);
    ctx.fill();

    ctx.font = "bold 100px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 60);

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
    let x1 = 0;
    x1 = item * 100;
    if ((item % 2) == 1){
    y1 = 350;
    }
    if ((item % 2) == 0){
    y1 = 300;
    }
    x1 += 50;
    return { x: x1, y: y1};
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
    if (gameRunning){

        //counts Frames    
        frame ++;
        //time --;

        //counts to 60, finds new locations
    
    //clears board
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draws Board
    drawBackground();

    //checks Socre
    document.getElementById("score").innerHTML = "Score: " + score;
    document.getElementById("time").innerHTML = "Time: " + time;
    
    //Draws Targets
    cords.forEach(cord => {
        drawTarget(cord.x, cord.y);
    });
    if (frame == 60){
        time --;
        cords = [];
        active = [];
        check = [];
        frame = 0;
        rand();
        //console.log(active);
        active.forEach(item => {
        cords.push(getCords(item));
        });
        if (time == 0){
            gameOver();
            time = 30;
        }
    }
    }
    requestAnimationFrame(animate);
}
animate();

document.addEventListener("mousedown", function(checkClick){
    const rect = canvas.getBoundingClientRect();
    mouseX = checkClick.clientX - rect.left;
    mouseY = checkClick.clientY - rect.top;
    //console.log(mouseX + " : " + mouseY);

    cords.forEach((item, index) => {
        //console.log(item.x + (" : ") + item.y);
        let xdiff = mouseX - item.x;
        let ydiff = mouseY - item.y;
        let diff = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
        //console.log(diff);
        //console.log(index);
        if (diff <= 35){
            console.log(`You hit a target # ${index}: ${item} `);
            cords.splice(index, 1);
            console.log(index);
            score ++;
        }
    });
});

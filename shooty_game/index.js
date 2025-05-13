const canvas = document.getElementById("myCanvas");                                                                                                                                                     
const ctx = canvas.getContext("2d");

let check = [];
let active = [];
let frame = 0;
let cords = [];
let score = 0;

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
    let x1 = 0;
    x1 = item * 100;
    if ((item % 2) == 1){
    y1 = 350;
    }
    if ((item % 2) == 0){
    y1 = 300;
    }
    x1 += 50;
    //console.log(x + " : " + y)
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
    frame ++;
    if (frame == 60){
        cords = [];
        active = [];
        check = [];
	    frame = 0;
	rand();
	//console.log(active);
    active.forEach(item => {
        cords.push(getCords(item));
    });
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    document.getElementById("Score").innerHTML = "Score: " + score;
    //console.log(cords);
    cords.forEach(cord => {
        drawTarget(cord.x, cord.y);
    });
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

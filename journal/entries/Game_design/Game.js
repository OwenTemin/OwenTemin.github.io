const canvas = document.getElementById("myCanvas");                                                                                                                                                     
const ctx = canvas.getContext("2d");

function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
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
function drawMiss(x, y){
    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, 2*Math.PI);
    ctx.fill();
}

function drawBoard() {

    drawRect(0,0,700,100, "#523a28")

    drawMiss(50, 350);
    drawTarget(150, 300);
    drawMiss(250, 350);
    drawTarget(350, 300);
    drawTarget(450, 350);
    drawMiss(550, 300);
    drawTarget(650, 350);
    drawTarget(210, 200);
    drawMiss(645, 150);
}

drawBoard();


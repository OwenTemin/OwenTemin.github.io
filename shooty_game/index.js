const canvas = document.getElementById("myCanvas");                                                                                                                                                     
const ctx = canvas.getContext("2d");


function drawTarget(x, y) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2*Math.PI);
    ctx.fill();
    console.log("Ts is also being called")

}

function drawBoard() {
    drawTarget(50, 50);
    console.log("Ts is being called")
}

drawBoard();

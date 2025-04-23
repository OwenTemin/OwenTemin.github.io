const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Draw the tree trunk
ctx.fillStyle = 'brown';
ctx.fillRect(220, 300, 60, 150);

// Draw triangular leaves
ctx.fillStyle = 'green';

// Top triangle
ctx.beginPath();
ctx.moveTo(250, 150); // Top vertex
ctx.lineTo(200, 250); // Bottom left vertex
ctx.lineTo(300, 250); // Bottom right vertex
ctx.closePath();
ctx.fill();

// Middle triangle
ctx.beginPath();
ctx.moveTo(250, 200); // Top vertex
ctx.lineTo(210, 300); // Bottom left vertex
ctx.lineTo(290, 300); // Bottom right vertex
ctx.closePath();
ctx.fill();

// Bottom triangle
ctx.beginPath();
ctx.moveTo(250, 250); // Top vertex
ctx.lineTo(220, 350); // Bottom left vertex
ctx.lineTo(280, 350); // Bottom right vertex
ctx.closePath();
ctx.fill();

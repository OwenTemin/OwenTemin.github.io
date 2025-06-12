const board = document.getElementById("chessboard");
const pieces = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

// Basic FEN layout for starting position
const layout = [
  "rnbqkbnr", "pppppppp", "", "", "", "", "PPPPPPPP", "RNBQKBNR"
];

function createBoard() {
  board.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    const isEvenRow = row % 2 === 0;
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((isEvenRow ? col : col + 1) % 2 === 0 ? "white" : "black");
      square.dataset.row = row;
      square.dataset.col = col;

      const pieceChar = layout[row][col];
      if (pieceChar) {
        const piece = document.createElement("div");
        piece.textContent = pieces[pieceChar];
        piece.classList.add("piece");
        piece.draggable = true;

        piece.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", pieceChar);
          e.dataTransfer.setData("from-row", row);
          e.dataTransfer.setData("from-col", col);
        });

        square.appendChild(piece);
      }

      square.addEventListener("dragover", (e) => e.preventDefault());
      square.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedPiece = e.dataTransfer.getData("text/plain");
        const fromRow = e.dataTransfer.getData("from-row");
        const fromCol = e.dataTransfer.getData("from-col");
        layout[fromRow] = replaceAt(layout[fromRow], fromCol, "");
        layout[row] = replaceAt(layout[row], col, draggedPiece);
        createBoard();
      });

      board.appendChild(square);
    }
  }
}

function replaceAt(str, index, replacement) {
  return str.substring(0, index) + replacement + str.substring(index + 1);
}

createBoard();

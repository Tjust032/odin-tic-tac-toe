function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const addToken = (row, col, player) => {
        const cell = board[row][col];
        if (cell.getValue() === '') {
            cell.writeToken(player);
            return true;
        } else {
            console.log('Cell already taken!');
            return false;
        }
    };

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    };

    return { getBoard, addToken, printBoard };
}

function Cell() {
    let value = '';

    const writeToken = (player) => {
        value = player;
    };

    const getValue = () => value;

    return { writeToken, getValue };
}

function GameController(playerOneName, playerTwoName) {
    const board = Gameboard();

    const players = [
        { name: playerOneName, token: 'O' },
        { name: playerTwoName, token: 'X' }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (row, column) => {
        if (![row, column].every(n => n >= 0 && n <= 2)) {
            console.log("Invalid input: out of bounds");
            printNewRound();
            return;
        }

        const success = board.addToken(row, column, getActivePlayer().token);
        if (!success) {
            console.log("Invalid input: Cell already taken");
            printNewRound();
            return;
        }

        const isWinningLine = (a, b, c) => {
            return a !== '' && a === b && b === c;
        };

        const checkWinner = (board) => {
            const values = board.map(row => row.map(cell => cell.getValue()));
            for (let i = 0; i < 3; i++) {
                if (isWinningLine(values[i][0], values[i][1], values[i][2])) {
                    return values[i][0];
                }
            }
            for (let j = 0; j < 3; j++) {
                if (isWinningLine(values[0][j], values[1][j], values[2][j])) {
                    return values[0][j];
                }
            }
            if (isWinningLine(values[0][0], values[1][1], values[2][2])) {
                return values[0][0];
            }
            if (isWinningLine(values[0][2], values[1][1], values[2][0])) {
                return values[0][2];
            }
        };

        const winner = checkWinner(board.getBoard());
        if (winner) {
            const winningPlayer = winner === players[0].token ? playerOneName : playerTwoName;
            document.getElementById("result-text").textContent = `${winningPlayer} wins!`;
            document.getElementById("result-modal").classList.remove("hidden");
            console.log(`${winningPlayer} has won the game!`);
            board.printBoard();
            // Stop music when game ends
            const audio = document.getElementById("background-music");
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        const isDraw = board.getBoard().flat().every(cell => cell.getValue() !== '');
        if (isDraw && !winner) {
            document.getElementById("result-text").textContent = `It's a draw!`;
            document.getElementById("result-modal").classList.remove("hidden");
            // Stop music when game ends
            const audio = document.getElementById("background-music");
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        switchPlayerTurn();
        printNewRound();
    };

    printNewRound();

    return { playRound, getActivePlayer, getBoard: board.getBoard };
}

function ScreenController(game) {
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const newBoardDiv = boardDiv.cloneNode(true);
    boardDiv.parentNode.replaceChild(newBoardDiv, boardDiv);

    const updateScreen = () => {
        newBoardDiv.textContent = "";
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer().name;

        playerTurnDiv.textContent = `${activePlayer}'s Turn...`;

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.col = colIndex;
                cellButton.textContent = cell.getValue();
                if (cellButton.textContent === 'O') {
                    cellButton.classList.add("player-one");
                } else if (cellButton.textContent === 'X') {
                    cellButton.classList.add("player-two");
                }
                newBoardDiv.appendChild(cellButton);
            });
        });
    };

    function clickHandlerBoard(e) {
        const selectedRow = e.target.dataset.row;
        const selectedCol = e.target.dataset.col;

        if (!(selectedRow && selectedCol)) return;
        game.playRound(Number(selectedRow), Number(selectedCol));
        updateScreen();
    }

    newBoardDiv.addEventListener("click", clickHandlerBoard);

    let restartBtn = document.getElementById("restart-button");
    if (restartBtn) {
        restartBtn.remove();
    }

    restartBtn = document.createElement("button");
    restartBtn.id = "restart-button";
    restartBtn.classList.add("restart-btn");
    restartBtn.textContent = "Restart Game";

    restartBtn.addEventListener("click", () => {
        document.getElementById("player-one").value = '';
        document.getElementById("player-two").value = '';
        document.getElementById("start-game-modal").style.display = "flex";
        document.getElementById("result-modal").classList.add("hidden");
        playerTurnDiv.textContent = '';
        newBoardDiv.textContent = '';
        restartBtn.remove();
        // Reset music
        const audio = document.getElementById("background-music");
        audio.pause();
        audio.currentTime = 0;
    });

    document.querySelector(".container").appendChild(restartBtn);

    updateScreen();
}

// Music tracks (replace with your own MP3 files)
const musicTracks = [
    "audio/tumba.mp3"
];

function getRandomTrack() {
    const randomIndex = Math.floor(Math.random() * musicTracks.length);
    return musicTracks[randomIndex];
}

const form = document.getElementById("start-form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const playerOne = document.getElementById("player-one").value.trim();
    const playerTwo = document.getElementById("player-two").value.trim();

    if (playerOne && playerTwo) {
        document.getElementById("start-game-modal").style.display = "none";
        document.getElementById("result-modal").classList.add("hidden");

        const game = GameController(playerOne, playerTwo);
        ScreenController(game);

        // Start music with a random track
        const audio = document.getElementById("background-music");
        audio.src = getRandomTrack();
        audio.play().catch(error => console.log("Audio play failed:", error));
    }
});

document.getElementById("close-result").addEventListener("click", () => {
    document.getElementById("player-one").value = '';
    document.getElementById("player-two").value = '';
    document.getElementById("result-modal").classList.add("hidden");
    document.getElementById("start-game-modal").style.display = "flex";
    document.querySelector(".turn").textContent = '';
    document.querySelector(".board").textContent = '';
    const restartBtn = document.getElementById("restart-button");
    if (restartBtn) restartBtn.remove();
    // Reset music
    const audio = document.getElementById("background-music");
    audio.pause();
    audio.currentTime = 0;
});
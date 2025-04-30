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
    }

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    }

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

function GameController (
    playerOneName = "Player One",
    playerTwoname = "Player Two",
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 'O'
        },
        {
            name: playerTwoname,
            token: 'X'
        }
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

        const success = board.addToken(row, column, getActivePlayer().token)

        if (!success) {
            console.log("Invalid input: Cell already taken");
            printNewRound();
            return;
        }
        /* Check for a winner and handle the logic */
        /* Helper method to check if a row, column, or diagonal is a valid winning line */
        const isWinningLine = (a, b, c) => {
            return a !== '' && a === b && b === c;
        };
        
        //Method to check winner using helper method, isWinningLine
        const checkWinner = (board) => {
            const values = board.map(row => row.map(cell => cell.getValue()));

            // Check rows
            for (let i = 0; i < 3; i++) {
                if (isWinningLine(values[i][0], values[i][1], values[i][2])) {
                    return values[i][0];
                }
            }

            //Check columns
            for (let j = 0; j < 3; i++) {
                if (isWinningLine(values[0][j], values[1][j], values[2][j])) {
                    return values[0][j];
                }
            }

            //Check diagonals 
            if (isWinningLine(values[0][0], values[1][1], values[2][2])) {
                return values[0][0];
            }
            if (isWinningLine(values[0][2], values[1][1], values[2][0])) {
                return values[0][2];
            }
        }

        //Sets the token of the winning player, if someone has won
        const winner = checkWinner(board.getBoard());
        //If someone has won, find out which player the token belongs to and declare them the winner
        if (winner) {
            const winningPlayer = winner === players[0].token ? playerOneName : playerTwoName;
            console.log()
        }

        


        switchPlayerTurn();
        printNewRound();
    };

    printNewRound();

    return { playRound, getActivePlayer, getBoard: board.getBoard};
}

const game = GameController();
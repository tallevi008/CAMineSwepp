'use strict';

const MINE = '💣';
const FLAG = '🚩';
const CELL_COVER = '🪐';


var gLevel;
var gGame;
var gBoard;
var gCountFlags;
var gMinesLocations;
var gIntervalTimer;
var gStartTime;

// cells in gBoard


// Start the game when page is loads
function initGame() {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    gLevel = {
        SIZE: 4,
        MINES: 2,
        FLAGS: 2
    }
    gCountFlags = 0;

    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);


}


//build Board in the modal and set mines at rndom
function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }

    }

    board = placeMinesOnBoard(board);
    return board;
}

//Place mines on gBoard
function placeMinesOnBoard(board) {
    var countBombs = 0;
    gMinesLocations = [];
    while (countBombs < gLevel.MINES) {

        var i = getRandomInt(0, gLevel.SIZE - 1);
        var j = getRandomInt(0, gLevel.SIZE - 1);

        if (!board[i][j].isMine) {
            board[i][j].isMine = true;
            gMinesLocations.push({ i: i, j: j })
            countBombs++;
        }
    }
    return board;
}

//Count mines around cells and show it in the cell itself
function setMinesNegsCount(board) {
    var cellsToCheck = getNoMinesCellsIdx(board);
    if (!cellsToCheck) {
        console.log('Somthimg went wrong Check your board');
        return;
    }
    while (cellsToCheck.length) {

        var checkCell = cellsToCheck.shift();
        var count = 0;
        for (var i = checkCell.i - 1; i <= checkCell.i + 1; i++) {

            if (i < 0 || i > board.length - 1) continue


            for (var j = checkCell.j - 1; j <= checkCell.j + 1; j++) {
                if (j < 0 || j > board.length - 1) continue
                if (i === checkCell.i && j === checkCell.j) continue

                var currCell = board[i][j]
                if (currCell.isMine) count++;
            }
            //Updating the model
            gBoard[checkCell.i][checkCell.j].minesAroundCount = (count) ? count : 0;

        }
    }


}

// show the board in the DOM(table in HTML)
function renderBoard(board) {

    var elTable = document.querySelector('.table-container');
    var htmlStr = `<table><tbody>`;

    for (var i = 0; i < board.length; i++) {
        htmlStr += `<tr>`

        for (var j = 0; j < board.length; j++) {

            htmlStr += `<td data-i="${i}" data-j="${j}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this)">${CELL_COVER}</td>`
        }
        htmlStr += `</tr>`
    }
    htmlStr += ` </tbody></table>`
    elTable.innerHTML = htmlStr;
}

// when cell(td) in DOM is clicked
function cellClicked(elCell, i, j) {

    if (elCell.innerText === CELL_COVER) {
        //Updating model
        gBoard[i][j].isShown = true;
        //Updating the DOM
        if (gBoard[i][j].isMine) elCell.innerText = MINE;
        else elCell.innerText = gBoard[i][j].minesAroundCount;
    }
    chcekGameOver(elCell);
}

//when rightclickin on a cell (td) add/remove flag
function cellMarked(elCell) {
    var i = elCell.dataset.i;
    var j = elCell.dataset.j;
    if (gBoard[i][j].isShown) return;


    // elCell.classList.toggle('marked')
    if (!gBoard[i][j].isMarked && gCountFlags < gLevel.FLAGS) {

        gBoard[i][j].isMarked = true;
        elCell.classList.add('marked')
        gCountFlags++;
        //update DOM
        elCell.innerText = FLAG;

    } else if (gBoard[i][j].isMarked && gCountFlags === gLevel.FLAGS) {

        //Update modal
        gBoard[i][j].isMarked = false;
        elCell.classList.remove('marked')
        gCountFlags--;
        //update DOM
        elCell.innerText = CELL_COVER;
    }
}

// Win: put flags in right places and all other cells are shown Lose: encounter a mine
function chcekGameOver(cellClicked) {
    if (cellClicked.innerText === MINE) {
        console.log('LOSER!!!');

        for (var i = 0; i < gMinesLocations.length; i++) {
            var currMine = gMinesLocations[i];
            //Updatind DOM
            var elTd = document.querySelector(`[data-i="${currMine.i}"][data-j="${currMine.j}"]`);
            elTd.innerText = MINE;
        }
    }


    clearInterval(gIntervalTimer)
    gIntervalTimer = null
}


//when clickin on cll without mindes around show imidate nehibors. BONUS; expend until other numbers are met.
function expandShown(board, elCell,
    i, j) { }


//Timer of the game
function getTimer() {
    gIntervalTimer = setInterval(updateTimer, 1);
    gStartTime = Date.now();
}





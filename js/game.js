'use strict';

const MINE = '💣';
const FLAG = '🚩';
const CELL_COVER = '🪐';
const NORMAL = '😎';
const WIN = '🥳';
const LOSE = '😭';
const HINT = '💡';
const SAFE = '😇';


var gLevel;
var gGame;
var gBoard;
var gFirstClick
var gMinesLocations;
var gHintCellsShown;
var gIntervalTimer;
var gHintTime;

// cells in gBoard


// Start the game when page is loads
function initGame(level) {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isHintOn: false,
        LIVES: 3,
        HINTS: 3,
        SAFE: 3
    }

    gLevel = {
        SIZE: 0,
        MINES: 0,
    }
    //reseting first click
    gFirstClick = false;

    clearAllIntervals();

    //Select game level and reveling Board and Timer
    var elTable = document.querySelector('.table-container');
    var elTimer = document.querySelector('.timer');
    var elTimerSpan = elTimer.querySelector('span');
    var elLives = document.querySelector('.lives');
    var elLivesSpan = elLives.querySelector('span');
    var elSmiley = document.querySelector('#reset');

    switch (level) {
        case "Beginner":
            gLevel.SIZE = 4; gLevel.MINES = 2;
            gGame.markedCount = gLevel.MINES;

            break;
        case "Medium":
            gLevel.SIZE = 8; gLevel.MINES = 12;
            gGame.markedCount = gLevel.MINES;

            break;
        case "Expert":
            gLevel.SIZE = 12; gLevel.MINES = 30;
            gGame.markedCount = gLevel.MINES;

            break;
    }
    gBoard = buildBoard();
    renderBoard(gBoard);
    renderHints();
    renderSafeBtn();

    //Reveling timer and table
    elTable.hidden = false;
    elTimer.hidden = false;

    //reseting Time
    gGame.secsPassed = 0;
    elTimerSpan.innerText = 0;

    //reseting and rveling life DOM
    elLives.hidden = false;
    elLivesSpan.innerText = gGame.LIVES;

    //reset smiley DOM
    elSmiley.innerText = NORMAL;
}



//Place mines on gBoard
function placeMinesOnBoard(board) {
    var countBombs = 0;
    gMinesLocations = [];
    while (countBombs < gLevel.MINES) {

        var i = getRandomInt(0, gLevel.SIZE - 1);
        var j = getRandomInt(0, gLevel.SIZE - 1);

        if (!board[i][j].isMine && !board[i][j].isShown) {
            board[i][j].isMine = true;
            countBombs++;
            gMinesLocations.push({ i: i, j: j })


        }
    }

    return board;
}

//Count mines around cells and show it in the cell itself
function setMinesNegsCount(board) {
    var cellsToCheck = getNoMinesCellsIdx(board);
    if (!cellsToCheck) {
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

            htmlStr += `<td data-i="${i}" data-j="${j}" onclick="cellClicked(this,event, ${i}, ${j})" onmousedown="cellMarked(this,event)">${CELL_COVER}</td>`
        }
        htmlStr += `</tr>`
    }
    htmlStr += ` </tbody></table>`
    elTable.innerHTML = htmlStr;
}

// when cell(td) in DOM is clicked
function cellClicked(elCell, event, i, j) {
    if (event.button !== 0) return;
    if (gBoard[i][j].isMarked) return;
    if (!gBoard[i][j].isShown) {

        //Updating model
        gBoard[i][j].isShown = true;
        gGame.shownCount++;

        //Start Timer
        if (!gFirstClick) {
            getTimer();
            //Set mines after first Click
            placeMinesOnBoard(gBoard);
            setMinesNegsCount(gBoard);
            gFirstClick = true;
        }
        //Pressing a hint
        if (gGame.isHintOn) {
            gHintCellsShown = [];
            gHintCellsShown.push({ i: i, j: j });
            expandShown(gBoard, i, j);
            gHintTime = setTimeout(expandHidden, 1000);
        }
    }

    //Updating the DOM
    if (gBoard[i][j].isMine) elCell.innerText = MINE;
    else {
        elCell.innerText = gBoard[i][j].minesAroundCount;
        if (!gBoard[i][j].minesAroundCount) expandShown(gBoard, i, j);

    }

    chcekGameOver(i, j, gBoard);
}

//when rightclickin on a cell (td) add/remove flag
function cellMarked(elCell, event) {
    if (event.button !== 2) return;
    var i = elCell.dataset.i;
    var j = elCell.dataset.j;

    if (!gFirstClick) {
        getTimer();
        gFirstClick = true;
    }

    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        elCell.innerText = CELL_COVER;
        gGame.markedCount++;

    } else {
        if (gGame.markedCount === 0) return;
        else {
            gBoard[i][j].isMarked = true;
            elCell.innerText = FLAG;
            gGame.markedCount--;
        }
    }
    chcekGameOver(i, j, gBoard);
}

// Win: put flags in right places and all other cells are shown Lose: encounter a mine
function chcekGameOver(rowIdx, colIdx, board) {
    var cellClicked = board[rowIdx][colIdx];
    var elLives = document.querySelector('.lives');
    var elLivesSpan = elLives.querySelector('span');
    ;
    if (cellClicked.isMine && !cellClicked.isMarked) {
        //Hint will not reduce lives
        if (gGame.isHintOn) return;

        //to support the lives fetures we need to 'mark' the mines thet were exposed.
        if (gGame.LIVES > 1) {

            --gGame.LIVES;
            cellClicked.isMarked = true;

            elLivesSpan.innerText = gGame.LIVES;
            gGame.isOn = chcekWin();

        } else if (gGame.LIVES === 1) {
            --gGame.LIVES;
            elLivesSpan.innerText = gGame.LIVES;
            gGame.isOn = false;

            initiateLose();
            clearAllIntervals();
        }


    } else {
        gGame.isOn = chcekWin();

    }


}

function initiateLose() {
    var elSmiley = document.querySelector('#reset');
    elSmiley.innerText = LOSE;

    for (var i = 0; i < gMinesLocations.length; i++) {
        var currMine = gMinesLocations[i];
        //Updatind DOM
        var elTd = document.querySelector(`[data-i="${currMine.i}"][data-j="${currMine.j}"]`);
        elTd.innerText = MINE;
    }

}
function chcekWin() {
    var elSmiley = document.querySelector('#reset');


    for (var i = 0; i < gMinesLocations.length; i++) {
        var currMine = gMinesLocations[i];
        var MineOnBoard = gBoard[currMine.i][currMine.j]

        if (!MineOnBoard.isMarked) return;
    }
    //full lives 3
    if (gGame.LIVES === 3) {

        if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) elSmiley.innerText = WIN;
        clearAllIntervals();

    } else if (gGame.LIVES === 2) {

        if (gGame.shownCount - 1 === gLevel.SIZE ** 2 - gLevel.MINES) elSmiley.innerText = WIN;
        clearAllIntervals();

    } else if (gGame.LIVES === 1) {

        if (gGame.shownCount - 2 === gLevel.SIZE ** 2 - gLevel.MINES) elSmiley.innerText = WIN;
        clearAllIntervals();

    } else return false;

}

//when clickin on cell without mindes around show imidate nehibors. BONUS; expend until other numbers are met.
function expandShown(board,
    rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board.length - 1) continue
            if (i === rowIdx && j == colIdx) continue
            var currCell = board[i][j];

            if (currCell.isShown) continue;
            else {
                if (gGame.isHintOn) {
                    gHintCellsShown.push({ i: i, j: j })
                }
                //model
                currCell.isShown = true;
                gGame.shownCount++;
                //dom
                var elTd = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                elTd.innerText = currCell.minesAroundCount;

            }
        }
    }
}

//When hint time period finish 
function expandHidden() {
    for (var i = 0; i < gHintCellsShown.length; i++) {
        var currCell = gBoard[gHintCellsShown[i].i][gHintCellsShown[i].j];

        //Upadating Model
        currCell.isShown = false;
        gGame.shownCount--;

        //dom
        var elTd = document.querySelector(`[data-i="${gHintCellsShown[i].i}"][data-j="${gHintCellsShown[i].j}"]`);
        elTd.innerText = CELL_COVER;
    }
    gHintCellsShown = [];
    gGame.isHintOn = false;

}

//Game Timer
function getTimer() {
    gIntervalTimer = setInterval(function () {
        gGame.secsPassed++
        var elTimer = document.querySelector('.timer');
        var elTimerSpan = elTimer.querySelector('span');
        elTimerSpan.innerText = gGame.secsPassed;
    }, 1000);
}
//adding hints to DOM
function renderHints() {
    //<button id="hint1">💡</button>
    var elHints = document.querySelector('.hints')
    var htmlStr = '';
    for (var i = 0; i < 3; i++) {
        htmlStr += `<button id="hint${i + 1}" onclick="getHint(this)">💡</button>`
    }
    elHints.innerHTML = htmlStr;
}
//activating hint
function getHint(hint) {
    if (hint.id === 'activated') return;
    gGame.isHintOn = true;
    hint.innerText = 'x';
    hint.id = 'activated';



}
//adding safe botton to DOM
function renderSafeBtn() {
    var elSafe = document.querySelector('#safe')
    var htmlStr = '';
    htmlStr += `<button id="safe" onclick="getSafeClick(this)">Safe clicks remaining:<span>${gGame.SAFE}</span></button>`

    elSafe.innerHTML = htmlStr;
}

//activating safe click
function getSafeClick(safe) {
    if (!gGame.SAFE) return;

    //Want make sure that we make one cell safe
    var count = 0;
    while (!count) {

        var i = getRandomInt(0, gLevel.SIZE - 1);
        var j = getRandomInt(0, gLevel.SIZE - 1);

        if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) {
            count++;
            //dom
            var elTd = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            elTd.innerText = SAFE;

        }
    }
    // updating model
    gGame.SAFE--;
    // updating DOM
    var elSafe = document.querySelector('#safe span');
    elSafe.innerText = gGame.SAFE;

}

//reseting current game
function reset(smiley) {
    clearAllIntervals();

    smiley.innerText = NORMAL;
    gGame.isOn = true;
    var elTimer = document.querySelector('.timer');
    var elTimerSpan = elTimer.querySelector('span');
    var elLives = document.querySelector('.lives');
    var elLivesSpan = elLives.querySelector('span');

    //reseting Time
    gGame.secsPassed = 0;
    elTimerSpan.innerText = 0;

    //reseting and rveling life DON
    elLivesSpan.innerText = 3;
    gGame.LIVES = 3;
    //reseting shown count and marked count DOM
    gGame.shownCount = 0;
    gGame.markedCount = gLevel.MINES,
        //reseting first click
        gFirstClick = false;

    //reseting hints
    renderHints();

    //reseting safe clicks
    gGame.SAFE = 3;
    //DOM
    renderSafeBtn();


    gBoard = buildBoard();
    renderBoard(gBoard);



}
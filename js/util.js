'use strict';

//build Board in the modal and set mines at random
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

    return board;
}

//Get random number
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}


function getNoMinesCellsIdx(board) {
    var cellsIdx = [];


    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            if (!currCell.isMine)
                cellsIdx.push({ i: i, j: j }).push
        }

    }
    return (cellsIdx.length) ? cellsIdx : null;

}

//Clear all intervals in the game
function clearAllIntervals() {
    clearInterval(gIntervalTimer)
    gIntervalTimer = null;
    clearTimeout(gHintTime);
    gHintTime = null;
}


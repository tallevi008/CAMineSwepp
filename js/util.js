'use strict';

//Updating timer
function updateTimer() {
    var now = Date.now()
    var time = (((now - gStartTime) / 1000) / 60).toFixed(1);
    var elTimer = document.querySelector(' h2 span');
    elTimer.innerText = time;
}



// Get randomcolor

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//Get random number
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

// Shufle numbers
function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
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

// if (cellClicked.innerText === MINE) {
//     console.log('LOSER!!!');

//     for (var i = 0; i < gMinesLocations.length; i++) {
//         var currMine = gMinesLocations[i];
//         //Updatind DOM
//         var elTd = document.querySelector(`[data-i="${currMine.i}"][data-j="${currMine.j}"]`);
//         elTd.innerText = MINE;
//     }
// }



// for (var i = 0; i < gBoard.length; i++) {
//     for (var j = 0; j < gLevel.length; j++) {
//         var elTd;
//         var currCell = gBoard[i][j];

//         if (cellClicked.innerText === MINE) {
//             var elTd = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
//             elTd.innerText = MINE;
//         }
//         else (currCell.isMine && currCell.isMarked || currCell.isShown)

//     }
class Tile{
    constructor() {
        this.mine = false;
        this.number = 9;
        this.status = "concealed";
    }
}

let tileGrid;
let xSize;
let ySize;
let mineCount;
let minesLeft;
let gameOver;
let timerValue;
let initialized = false;

function setup(){

    initialized = !gameOver && initialized;
    timerValue = 0;
    tileGrid = [];
    xSize = document.getElementById("xSize").value;
    ySize = document.getElementById("ySize").value;
    mineCount = document.getElementById("mineCount").value;
    gameOver = false;
    minesLeft = mineCount;

    if (mineCount < (xSize*ySize)) {
        if (xSize <= 40) {
            for (let x = 0; x < xSize; x++) {
                tileGrid[x] = [];
                for (let y = 0; y < ySize; y++) {
                    tileGrid[x][y] = new Tile();
                }
            }
            tileGrid[xSize - 1][0].mine = true;
            mineRandomizer();
            tileGrid[xSize - 1][0].mine = false;
            updateMineCount();
            numberCalculator();
            gridViewer();
            if (!initialized)
                startTimer();
            showSnackbarAlert("Game started");
            initialized = true;
        }
        else{
            showSnackbarAlert("Width can be at most 40");
        }
    }else{
        showSnackbarAlert("Amount of mines too large");
    }

}

function mineRandomizer(){
    for (let m = 0; m <mineCount ; m++){
        while(true){
            let mineXValue = Math.floor(Math.random()*xSize);
            let mineYValue = Math.floor(Math.random()*ySize);
            if (!tileGrid[mineXValue][mineYValue].mine){
                tileGrid[mineXValue][mineYValue].mine = true;
                break;
            }
        }
    }
}

function numberCalculator(){
    for (let x=0; x<tileGrid.length; x++){
        for (let y=0; y<tileGrid[x].length; y++){
            if (!tileGrid[x][y].mine){
                tileGrid[x][y].number = countSurroundingMines(x, y);
            }
        }
    }
}

function countSurroundingMines(tileX, tileY){
    let count = 0;
    for (let x = tileX-1; x <= tileX+1; x++){
        for (let y = tileY-1; y <= tileY+1; y++){
            if (x<xSize && y<ySize && x>=0 && y>=0){
                if (tileGrid[x][y].mine){
                    count ++;
                }
            }
        }
    }
    return count;
}

function logGrid(){

    for (let x=0; x<tileGrid.length; x++){
        let yString = x.toString();
        for (let y=0; y<tileGrid[x].length; y++){
            yString = yString + " - " + tileGrid[x][y].mine + tileGrid[x][y].number;
        }
        console.log(yString);
    }
}

function gridViewer(){

    let tileGridContainer = document.getElementById('tileGridContainer');
    tileGridContainer.innerText = "";
    for (let y=0; y< ySize; y++){
        let row = document.createElement("div");
        row.className = "row";
        for (let x=0; x<xSize; x++){
            let field = document.createElement("div");
            if (tileGrid[x][y].mine){
                field.innerText = "M";

            }else{
                if (tileGrid[x][y].number !== 0)
                    field.innerText = tileGrid[x][y].number;
                else
                    field.innerText = ".";
            }
            field.className = tileGrid[x][y].status;

            field.addEventListener("mousedown", (event)=>{
                if (!gameOver) {
                    if (event.button === 0) {
                        if (tileGrid[x][y].status === "concealed" && tileGrid[x][y].number === 0 && !tileGrid[x][y].mine) {
                            revealAllAdjacent(x, y);
                        } else if (tileGrid[x][y].status === "concealed" && tileGrid[x][y].mine) {
                            field.className = "exploded";
                            tileGrid[x][y].status = "exploded";
                            gameOver = true;
                            tagAllMines("exploded");
                            showSnackbarAlert("You Lost");
                            // setup();
                        } else if (tileGrid[x][y].status === "concealed") {
                            field.className = "";
                            tileGrid[x][y].status = "revealed";
                        } else if (tileGrid[x][y].status === "flagged") {
                            minesLeft ++;
                            updateMineCount();
                            tileGrid[x][y].status = "concealed";
                            field.className = "concealed";
                        }

                        if (checkWinCondition()) {
                            tagAllMines("saved");
                            gameOver = true;
                            showSnackbarAlert("You Won");
                            // setup();
                        }
                    } else {
                        if (tileGrid[x][y].status === "concealed") {
                            minesLeft --;
                            updateMineCount();
                            tileGrid[x][y].status = "flagged";
                            field.className = "flagged";
                        } else if (tileGrid[x][y].status === "flagged") {
                            minesLeft ++;
                            updateMineCount();
                            tileGrid[x][y].status = "concealed";
                            field.className = "concealed";
                        }
                    }
                }
            });
            row.appendChild(field);
        }
        tileGridContainer.appendChild(row);
    }
}

function tagAllMines(tag) {

    for (let x=0; x<xSize ; x++){
        for (let y=0; y<ySize ; y++){
            if (tileGrid[x][y].mine){
                tileGrid[x][y].status = tag;
            }
        }
    }
    gridViewer();

}

function revealAllAdjacent(tileX, tileY) {
    for (let x = tileX-1; x <= tileX+1; x++){
        for (let y = tileY-1; y <= tileY+1; y++){
            if (x<xSize && y<ySize && x>=0 && y>=0){
                if (!tileGrid[x][y].mine && tileGrid[x][y].number === 0 && tileGrid[x][y].status === "concealed"){
                    tileGrid[x][y].status = "revealed";
                    revealAllAdjacent(x, y);
                }
                if (!tileGrid[x][y].mine && tileGrid[x][y].status === "concealed"){
                    tileGrid[x][y].status = "revealed";
                }

            }
        }
    }
    gridViewer();
}

function checkWinCondition() {
    let concealed = document.getElementsByClassName("concealed");
    let field;
    for (field of concealed){
        if (field.innerText !== "M" && field.className !== "flagged")
            return false;
    }
    return true;
}

function updateMineCount() {
    document.getElementById("remainingMineCount").innerText = "Mines Remaining : " + minesLeft;
}

function showSnackbarAlert(message){
    let snackBar = document.getElementById("snackbar");
    snackBar.innerText = message;
    snackBar.className = "show";

    setTimeout(function(){
            snackBar.className = snackBar.className.replace("show", "");
        }, 3000
    );
}

function startTimer(){
    if (!gameOver){
        let timerString = "";
        if (Math.floor(timerValue/3600) >= 1){
            timerString =  Math.floor(timerValue / 3600) + "h "
                + Math.floor((timerValue/60)%60) + "m "
                + (timerValue % 60)% 60 + "s";
        }
        else if (Math.floor(timerValue/60) >= 1)
            timerString =  Math.floor(timerValue/60) + "m " + timerValue % 60 + "s";
        else{
            timerString = timerValue + "s";
        }

        document.getElementById("timer").innerText = "Time passed : " + timerString;
        timerValue ++;
        setTimeout(startTimer, 1000);
    }
}

setup();






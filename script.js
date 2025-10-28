let backgroundMusic;

let highscore = 0;
const HIGHSCORE_KEY = "unicornFlapHighscore";

let debugMode = false;

let lastTime = 0;

let board;
let boardWidth = 360;
let boardHeight = 640;
let context;


let birdWidth = 50;
let birdHeight = 40;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight,

    hitboxOffsetX: 9,
    hitboxOffsetY: 8,
    hitboxWidth: 35,
    hitboxHeight: 25,
};

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -5.2;
let velocityY = 0; 
let gravity = 0.35;

let gameOver = false;
let score = 0;

let minPipeSpacing =270;
let lastPipeX = boardWidth;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); 

    backgroundMusic = document.getElementById("background-music");
    
    document.addEventListener("keydown", function(e) {
    // console.log(e); // for debugging key events
    if (e.shiftKey && e.code === "KeyD") {
        debugMode = !debugMode;
        console.log("Debug mode:", debugMode ? "ON" : "OFF");
    }
});

    birdImg = new Image();
    birdImg.src = "Unicorn.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "topHorn.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottomHorn.png";
    
    const savedHighscore = localStorage.getItem(HIGHSCORE_KEY);
    if (savedHighscore !== null) {
        highscore = parseInt(savedHighscore);
    }

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveBird);
    document.addEventListener("mousedown", moveBird);
    document.addEventListener("touchstart", moveBird);
};

function update(currentTime) {

    if (lastTime === 0) {
        lastTime = currentTime;
    }
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    const timeScale = deltaTime / 1000;
    
    const FPS_ADJUSTMENT = 60;
    
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    
    if (pipeArray.length === 0 || boardWidth - pipeArray[pipeArray.length - 1].x >= minPipeSpacing) {
        placePipes();
    }
    
    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity * timeScale * FPS_ADJUSTMENT;
    
    bird.y = Math.max(bird.y + velocityY * timeScale * FPS_ADJUSTMENT, 0);

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    
    if (debugMode) {
    context.strokeStyle = "red";
    context.strokeRect(
        bird.x + bird.hitboxOffsetX,
        bird.y + bird.hitboxOffsetY,
        bird.hitboxWidth,
        bird.hitboxHeight
    );
}

    if (bird.y > board.height) {
        gameOver = true;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX * timeScale * FPS_ADJUSTMENT;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; 
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); 
    }

    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(Math.floor(score), 5, 45);
    
    context.font="25px sans-serif";
    context.fillText("HI: " + highscore, 5, 75);
    
    if (gameOver) {
        if (score > highscore) {
            highscore = Math.floor(score);
            localStorage.setItem(HIGHSCORE_KEY, highscore.toString());
        }
        context.font="45px sans-serif";
        context.fillText("GAME OVER", boardWidth / 2 - 120, boardHeight / 2);
        
        return;
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/3.5;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {

    const code = e.code || "";

    if (
        e.type === "mousedown" ||
        e.type === "touchstart" ||
        code === "Space" ||
        code === "ArrowUp" ||
        code === "KeyX"
    ) {
        velocityY = -6.0;
        
        if (backgroundMusic && backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.log("Klarte ikke starte bakgrunnsmusikken automatisk.", error);
            });
        }

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return (
        a.x + a.hitboxOffsetX < b.x + b.width &&
        a.x + a.hitboxOffsetX + a.hitboxWidth > b.x &&
        a.y + a.hitboxOffsetY < b.y + b.height &&
        a.y + a.hitboxOffsetY + a.hitboxHeight > b.y
    );
}
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

let snake = [{x: 200, y: 200}];
let food = {x: 100, y: 100};
let dx = scale;
let dy = 0;
let score = 0;
let gameRunning = false;
let gamePaused = false;

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById("startBtn").disabled = true;
        document.getElementById("pauseBtn").disabled = false;
        generateFood();
        main();
    }
}

function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById("pauseBtn").textContent = gamePaused ? "Resume" : "Pause";
    if (!gamePaused) {
        main();
    }
}

function endGame() {
    gameRunning = false;
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
    alert(`Game Over! Final Score: ${score}`);
}

function main() {
    if (!gameRunning || gamePaused) return;

    if (gameOver()) {
        endGame();
        return;
    }

    setTimeout(() => {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        main();
    }, 100);
}

function clearCanvas() {
    ctx.fillStyle = "#c7d1b3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFood() {
    ctx.fillStyle = "#4a5343";
    ctx.beginPath();
    ctx.arc(food.x + scale / 2, food.y + scale / 2, scale / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = "#4a5343";
        ctx.beginPath();
        ctx.arc(part.x + scale / 2, part.y + scale / 2, scale / 2 - 1, 0, 2 * Math.PI);
        ctx.fill();

        // Draw eye on head
        if (index === 0) {
            ctx.fillStyle = "#c7d1b3";
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 3, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
    if (hasEatenFood) {
        score += 10;
        document.getElementById("score").textContent = `Score: ${score}`;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / scale)) * scale;
    food.y = Math.floor(Math.random() * (canvas.height / scale)) * scale;
}

function gameOver() {
    // Check if snake hits itself
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }

    // Check if snake hits walls
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

window.addEventListener("keydown", (e) => {
    if (!gameRunning || gamePaused) return;

    switch (e.key) {
        case "ArrowUp":
            if (dy === 0) {
                dx = 0;
                dy = -scale;
            }
            break;
        case "ArrowDown":
            if (dy === 0) {
                dx = 0;
                dy = scale;
            }
            break;
        case "ArrowLeft":
            if (dx === 0) {
                dx = -scale;
                dy = 0;
            }
            break;
        case "ArrowRight":
            if (dx === 0) {
                dx = scale;
                dy = 0;
            }
            break;
    }
});

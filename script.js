const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;
let snake = [{x: 200, y: 200}];
let food = {x: 100, y: 100};
let dx = scale, dy = 0;
let score = 0;

function main() {
    if (gameOver()) return alert("Game Over! Score: " + score);
    setTimeout(() => {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        main();
    }, 100);
}

function clearCanvas() {
    ctx.fillStyle = "#161625";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.fillStyle = "#c7d1b3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#4a5343";
    ctx.beginPath();
    ctx.arc(food.x + box/2, food.y + box/2, box/2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = "#4a5343"; 
        ctx.beginPath();
        ctx.arc(snake[i].x + box/2, snake[i].y + box/2, box/2 - 1, 0, 2 * Math.PI);
        ctx.fill();

        if (i === 0) {
            ctx.fillStyle = "#c7d1b3"; 
            ctx.beginPath();
            ctx.arc(snake[i].x + box/2, snake[i].y + box/3, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").innerText = "Score: " + score;
        resetFood();
    } else {
        snake.pop();
    }
}

function drawFood() {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(food.x, food.y, scale, scale);
}

function resetFood() {
    food.x = Math.floor(Math.random() * 20) * scale;
    food.y = Math.floor(Math.random() * 20) * scale;
}

function gameOver() {
    const hitLeft = snake[0].x < 0;
    const hitRight = snake[0].x >= canvas.width;
    const hitTop = snake[0].y < 0;
    const hitBottom = snake[0].y >= canvas.height;
    return hitLeft || hitRight || hitTop || hitBottom;
}

window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && dx === 0) { dx = -scale; dy = 0; }
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -scale; }
    if (e.key === "ArrowRight" && dx === 0) { dx = scale; dy = 0; }
    if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = scale; }
});

main();

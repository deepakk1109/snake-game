const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

// Enhanced Snake Structure with metadata
const snake = {
    segments: [{x: 200, y: 200}],  // Array of segment positions
    color: "#4a5343",               // Body color
    headColor: "#00d4ff",            // Head color
    length: 1,                       // Current length
    
    // Get head position
    getHead() {
        return this.segments[0];
    },
    
    // Get tail position
    getTail() {
        return this.segments[this.segments.length - 1];
    },
    
    // Add new head
    addHead(x, y) {
        this.segments.unshift({x, y});
        this.length++;
    },
    
    // Remove tail
    removeTail() {
        if (this.segments.length > 1) {
            this.segments.pop();
            this.length--;
        }
    },
    
    // Grow (eat food)
    grow(x, y) {
        this.addHead(x, y);
    },
    
    // Move (add head and remove tail)
    move(x, y) {
        this.addHead(x, y);
        this.removeTail();
    },
    
    // Check self collision
    checkSelfCollision() {
        const head = this.getHead();
        for (let i = 4; i < this.segments.length; i++) {
            if (this.segments[i].x === head.x && this.segments[i].y === head.y) {
                return true;
            }
        }
        return false;
    },
    
    // Reset snake
    reset() {
        this.segments = [{x: 200, y: 200}];
        this.length = 1;
    }
};

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

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    dx = scale;
    dy = 0;
    score = 0;
    snake.reset();
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
    document.getElementById("score").textContent = `Score: ${score}`;
}

function endGame() {
    gameRunning = false;
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
    alert(`Game Over! Final Score: ${score}\nSnake Length: ${snake.length}`);
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
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(food.x + scale / 2, food.y + scale / 2, scale / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Food outline
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawSnake() {
    snake.segments.forEach((part, index) => {
        if (index === 0) {
            // Draw head
            ctx.fillStyle = snake.headColor;
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 2, scale / 2 - 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Head outline
            ctx.strokeStyle = "#0099cc";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw eye
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 3, 2, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Draw body segments with gradient effect
            ctx.fillStyle = snake.color;
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 2, scale / 2 - 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Body outline
            ctx.strokeStyle = "#2a3a33";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

function moveSnake() {
    const head = snake.getHead();
    const newHeadX = head.x + dx;
    const newHeadY = head.y + dy;
    
    const hasEatenFood = newHeadX === food.x && newHeadY === food.y;
    
    if (hasEatenFood) {
        snake.grow(newHeadX, newHeadY);
        score += 10;
        document.getElementById("score").textContent = `Score: ${score} | Length: ${snake.length}`;
        generateFood();
    } else {
        snake.move(newHeadX, newHeadY);
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / scale)) * scale;
    food.y = Math.floor(Math.random() * (canvas.height / scale)) * scale;
}

function gameOver() {
    const head = snake.getHead();
    
    // Check self collision
    if (snake.checkSelfCollision()) {
        return true;
    }

    // Check wall collision
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= canvas.width;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= canvas.height;

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

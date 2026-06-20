const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

// Enhanced Snake Structure with animation
const snake = {
    segments: [{x: 200, y: 200}],
    color: "#4a5343",
    headColor: "#00d4ff",
    segmentColors: ["#00d4ff", "#00a8cc", "#008899"],
    length: 1,
    
    getHead() {
        return this.segments[0];
    },
    
    getTail() {
        return this.segments[this.segments.length - 1];
    },
    
    addHead(x, y) {
        this.segments.unshift({x, y});
        this.length++;
    },
    
    removeTail() {
        if (this.segments.length > 1) {
            this.segments.pop();
            this.length--;
        }
    },
    
    grow(x, y) {
        this.addHead(x, y);
    },
    
    move(x, y) {
        this.addHead(x, y);
        this.removeTail();
    },
    
    checkSelfCollision() {
        const head = this.getHead();
        for (let i = 4; i < this.segments.length; i++) {
            if (this.segments[i].x === head.x && this.segments[i].y === head.y) {
                return true;
            }
        }
        return false;
    },
    
    reset() {
        this.segments = [{x: 200, y: 200}];
        this.length = 1;
    }
};

let food = {x: 100, y: 100, pulseSize: 0};
let nextDx = scale;
let nextDy = 0;
let dx = scale;
let dy = 0;
let score = 0;
let gameRunning = false;
let gamePaused = false;
let animationFrame = 0;

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById("startBtn").textContent = "Playing...";
        document.getElementById("startBtn").disabled = true;
        document.getElementById("pauseBtn").disabled = false;
        document.getElementById("pauseBtn").textContent = "Pause";
        document.getElementById("resetBtn").disabled = false;
        generateFood();
        main();
    }
}

function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        document.getElementById("pauseBtn").textContent = "Resume";
    } else {
        document.getElementById("pauseBtn").textContent = "Pause";
        main();
    }
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    nextDx = scale;
    nextDy = 0;
    dx = scale;
    dy = 0;
    score = 0;
    animationFrame = 0;
    snake.reset();
    document.getElementById("startBtn").disabled = false;
    document.getElementById("startBtn").textContent = "Start Game";
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
    document.getElementById("score").textContent = `Score: ${score} | Length: ${snake.length}`;
    clearCanvas();
    drawFood();
    drawSnake();
}

function endGame() {
    gameRunning = false;
    gamePaused = false;
    document.getElementById("startBtn").disabled = false;
    document.getElementById("startBtn").textContent = "Play Again";
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
    
    showGameOverModal();
}

function showGameOverModal() {
    const modal = document.createElement('div');
    modal.className = 'game-over-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🎮 Game Over! 🎮</h2>
            <p>Final Score: <span class="score-value">${score}</span></p>
            <p>Snake Length: <span class="length-value">${snake.length}</span></p>
            <button class="play-again-btn" onclick="location.reload()">🔄 Play Again</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

function main() {
    if (!gameRunning || gamePaused) return;

    if (gameOver()) {
        endGame();
        return;
    }

    setTimeout(() => {
        // Update direction
        dx = nextDx;
        dy = nextDy;
        
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        animationFrame++;
        main();
    }, 100);
}

function clearCanvas() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0f0f1e");
    gradient.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += scale) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function drawFood() {
    // Pulsing animation
    const pulse = Math.sin(animationFrame * 0.1) * 2 + 3;
    
    // Food glow
    const glowGradient = ctx.createRadialGradient(
        food.x + scale / 2, food.y + scale / 2, 0,
        food.x + scale / 2, food.y + scale / 2, scale / 2 + pulse
    );
    glowGradient.addColorStop(0, "rgba(255, 107, 107, 0.5)");
    glowGradient.addColorStop(1, "rgba(255, 107, 107, 0)");
    ctx.fillStyle = glowGradient;
    ctx.fillRect(
        food.x - scale / 2, food.y - scale / 2,
        scale * 2, scale * 2
    );
    
    // Food body with gradient
    const foodGradient = ctx.createRadialGradient(
        food.x + scale / 2, food.y + scale / 2, 0,
        food.x + scale / 2, food.y + scale / 2, scale / 2
    );
    foodGradient.addColorStop(0, "#ff8888");
    foodGradient.addColorStop(1, "#ff6b6b");
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(food.x + scale / 2, food.y + scale / 2, scale / 2 - 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Food outline
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Shiny effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(food.x + scale / 2 - 3, food.y + scale / 2 - 3, 2, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSnake() {
    snake.segments.forEach((part, index) => {
        // Smooth shadow effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(part.x + scale / 2 + 2, part.y + scale / 2 + 2, scale / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        if (index === 0) {
            // Head - Bright color with glow
            const headGlow = ctx.createRadialGradient(
                part.x + scale / 2, part.y + scale / 2, 0,
                part.x + scale / 2, part.y + scale / 2, scale / 2 + 3
            );
            headGlow.addColorStop(0, "rgba(0, 212, 255, 0.6)");
            headGlow.addColorStop(1, "rgba(0, 212, 255, 0)");
            ctx.fillStyle = headGlow;
            ctx.fillRect(
                part.x - scale / 2, part.y - scale / 2,
                scale * 2, scale * 2
            );
            
            // Head body with gradient
            const headGradient = ctx.createRadialGradient(
                part.x + scale / 2, part.y + scale / 2, 0,
                part.x + scale / 2, part.y + scale / 2, scale / 2
            );
            headGradient.addColorStop(0, "#00d4ff");
            headGradient.addColorStop(1, "#0099cc");
            ctx.fillStyle = headGradient;
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 2, scale / 2 - 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Head outline
            ctx.strokeStyle = "#0066aa";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Eye
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 3, 2.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eye shine
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(part.x + scale / 2 + 1, part.y + scale / 3 - 1, 1, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Body segments with gradient color
            const colorIndex = Math.min(index, snake.segmentColors.length - 1);
            const segmentColor = snake.segmentColors[colorIndex];
            
            const bodyGradient = ctx.createRadialGradient(
                part.x + scale / 2, part.y + scale / 2, 0,
                part.x + scale / 2, part.y + scale / 2, scale / 2
            );
            bodyGradient.addColorStop(0, segmentColor);
            bodyGradient.addColorStop(1, "#004466");
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 2, scale / 2 - 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Body outline
            ctx.strokeStyle = "#003344";
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

// Keyboard controls with buffer for smooth movement
window.addEventListener("keydown", (e) => {
    if (!gameRunning || gamePaused) return;

    switch (e.key) {
        case "ArrowUp":
            if (dy === 0) {
                nextDx = 0;
                nextDy = -scale;
            }
            e.preventDefault();
            break;
        case "ArrowDown":
            if (dy === 0) {
                nextDx = 0;
                nextDy = scale;
            }
            e.preventDefault();
            break;
        case "ArrowLeft":
            if (dx === 0) {
                nextDx = -scale;
                nextDy = 0;
            }
            e.preventDefault();
            break;
        case "ArrowRight":
            if (dx === 0) {
                nextDx = scale;
                nextDy = 0;
            }
            e.preventDefault();
            break;
    }
});

// Initialize game display
resetGame();

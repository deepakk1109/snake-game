const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

// Enhanced Snake Structure with smooth animation
const snake = {
    segments: [{x: 200, y: 200}],
    headColor: "#00ff00",
    bodyColor: "#00cc00",
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

let food = {x: 100, y: 100};
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
        document.getElementById("resetBtn").textContent = "Pause Game";
        generateFood();
        main();
    }
}

function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        document.getElementById("pauseBtn").textContent = "Resume";
        document.getElementById("resetBtn").textContent = "New Game";
    } else {
        document.getElementById("pauseBtn").textContent = "Pause";
        document.getElementById("resetBtn").textContent = "Pause Game";
        main();
    }
}

function resetGame() {
    if (gameRunning) {
        // If game is running, pause it
        gameRunning = false;
        gamePaused = true;
        document.getElementById("pauseBtn").textContent = "Resume";
        document.getElementById("resetBtn").textContent = "New Game";
    } else if (gamePaused) {
        // If game is paused, start new game
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
        document.getElementById("resetBtn").disabled = true;
        document.getElementById("resetBtn").textContent = "Pause Game";
        document.getElementById("score").textContent = `Score: ${score} | Length: ${snake.length}`;
        clearCanvas();
        drawFood();
        drawSnake();
    }
}

function playAgain() {
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
    document.getElementById("resetBtn").disabled = true;
    document.getElementById("resetBtn").textContent = "Pause Game";
    document.getElementById("score").textContent = `Score: ${score} | Length: ${snake.length}`;
    clearCanvas();
    drawFood();
    drawSnake();
    
    // Remove any existing modal
    const existingModal = document.querySelector('.game-over-modal');
    if (existingModal) {
        existingModal.remove();
    }
}

function endGame() {
    gameRunning = false;
    gamePaused = false;
    document.getElementById("startBtn").disabled = false;
    document.getElementById("startBtn").textContent = "Play Again";
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
    document.getElementById("resetBtn").disabled = true;
    document.getElementById("resetBtn").textContent = "Pause Game";
    
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
            <div class="modal-buttons">
                <button class="play-again-btn" onclick="playAgain()">🔄 Play Again</button>
                <button class="menu-btn" onclick="location.reload()">🏠 Main Menu</button>
            </div>
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
    // Dark background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = "rgba(0, 255, 0, 0.05)";
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
    const pulse = Math.sin(animationFrame * 0.15) * 3 + 5;
    
    // Red food glow
    const glowGradient = ctx.createRadialGradient(
        food.x + scale / 2, food.y + scale / 2, 0,
        food.x + scale / 2, food.y + scale / 2, scale / 2 + pulse
    );
    glowGradient.addColorStop(0, "rgba(255, 0, 0, 0.6)");
    glowGradient.addColorStop(0.7, "rgba(255, 0, 0, 0.3)");
    glowGradient.addColorStop(1, "rgba(255, 0, 0, 0)");
    ctx.fillStyle = glowGradient;
    ctx.fillRect(
        food.x - scale / 2 - pulse, food.y - scale / 2 - pulse,
        scale * 2 + pulse * 2, scale * 2 + pulse * 2
    );
    
    // Red food body with gradient
    const foodGradient = ctx.createRadialGradient(
        food.x + scale / 2 - 2, food.y + scale / 2 - 2, 0,
        food.x + scale / 2, food.y + scale / 2, scale / 2
    );
    foodGradient.addColorStop(0, "#ff3333");
    foodGradient.addColorStop(1, "#cc0000");
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(food.x + scale / 2, food.y + scale / 2, scale / 2 - 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Food shine
    ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
    ctx.beginPath();
    ctx.arc(food.x + scale / 2 - 4, food.y + scale / 2 - 4, 2.5, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSnake() {
    snake.segments.forEach((part, index) => {
        if (index === 0) {
            // HEAD - Bright green with larger size
            ctx.fillStyle = "#00ff00";
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 2, scale / 2 + 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Head glow effect
            ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Eyes based on direction
            ctx.fillStyle = "#000";
            if (dx > 0) { // Moving right
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 + 3, part.y + scale / 2 - 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 + 3, part.y + scale / 2 + 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            } else if (dx < 0) { // Moving left
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 - 3, part.y + scale / 2 - 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 - 3, part.y + scale / 2 + 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            } else if (dy > 0) { // Moving down
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 - 3, part.y + scale / 2 + 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 + 3, part.y + scale / 2 + 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            } else if (dy < 0) { // Moving up
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 - 3, part.y + scale / 2 - 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(part.x + scale / 2 + 3, part.y + scale / 2 - 3, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            }
        } else {
            // BODY - Gradient from bright to dark green based on position
            const colorIntensity = Math.max(0.3, 1 - (index / snake.segments.length) * 0.7);
            const greenValue = Math.floor(200 * colorIntensity);
            
            // Body with gradient
            const bodyGradient = ctx.createRadialGradient(
                part.x + scale / 2 - 1, part.y + scale / 2 - 1, 1,
                part.x + scale / 2, part.y + scale / 2, scale / 2
            );
            bodyGradient.addColorStop(0, `rgb(100, ${greenValue}, 50)`);
            bodyGradient.addColorStop(1, `rgb(20, ${Math.floor(greenValue * 0.6)}, 10)`);
            ctx.fillStyle = bodyGradient;
            
            ctx.beginPath();
            ctx.arc(part.x + scale / 2, part.y + scale / 2, scale / 2 - 0.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Body outline
            ctx.strokeStyle = `rgba(0, 255, 0, ${0.3 * colorIntensity})`;
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

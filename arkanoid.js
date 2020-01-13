var canvasGame = document.getElementById("myCanvas");
var ctxGame = canvasGame.getContext("2d");
var canvasMenu = document.getElementById("menuCanvas");
var ctxMenu = canvasMenu.getContext("2d");

var score = 0;
var lives = 3;


//boolean
var rightPressed = false;
var leftPressed = false;
var isPaused = false;

//ball
var ballRadius = 5;
// var x = canvasGame.width / 2;
// var y = canvasGame.height - 30;
// var dx = 4;
// var dy = -4;
// var tdx = dx;
// var tdy = -dy;
var balls = [{x: canvasGame.width / 2, y: canvasGame.height - 30, dx: 4, dy: -4, tdx: 4, tdy: -4}];

//paddle
var paddleSpeed = 7;
var tPaddleSpeed = paddleSpeed;
var paddleHeight = 10;
var paddleWidth = 100;
var paddleX = (canvasGame.width - paddleWidth) / 2;
var normalDirection = true;

//bricks
var brickRowCount = 10;
var brickColumnCount = 6;
var brickWidth = 90;
var brickHeight = 20;
var brickPadding = 5;
var brickOffsetTop = 30;
var brickOffsetLeft = 7;

//bonuses
var bonusFallingSpeed = 3;
var bonusesDesc = [
    {
        image: new Image(),
        imageSrc: "assets/additional_life.png",
        bonus: "Additional life",
        bonusFunction: function () {
            lives++;
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/change_direction_paddle.png",
        bonus: "Change direction",
        bonusFunction: function () {
            normalDirection = !normalDirection;
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/shrink_paddle.png",
        bonus: "Shrink paddle",
        bonusFunction: function () {
            if(paddleWidth > 50) paddleWidth -= 25;
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/stretch_paddle.png",
        bonus: "Stretch paddle",
        bonusFunction: function () {
            if(paddleWidth < 150) paddleWidth += 25;
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/slow_down_ball.png",
        bonus: "Slower ball",
        bonusFunction: function () {
            balls.forEach(ball => {
                if(ball.dx > 0) {
                    if(ball.dx > 2) ball.dx -= 2;
                } else {
                    if(ball.dx < -2) ball.dx += 2;
                }
                if(ball.dy > 0) {
                    if(ball.dy > 2) ball.dy -= 2;
                } else {
                    if(ball.dy < -2) ball.dy += 2;
                }
            });
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/speed_up_ball.png",
        bonus: "Faster ball",
        bonusFunction: function () {
            balls.forEach(ball => {
                if(ball.dx > 0) {
                    if(ball.dx < 8) ball.dx += 2;
                } else {
                    if(ball.dx > -8) ball.dx -= 2;
                }
                if(ball.dy > 0) {
                    if(ball.dy < 8) ball.dy += 2;
                } else {
                    if(ball.dy > -8) ball.dy -= 2;
                }
            });
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/slow_down_paddle.png",
        bonus: "Slower paddle",
        bonusFunction: function () {
            if(paddleSpeed > 3) paddleSpeed -= 4;
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/speed_up_paddle.png",
        bonus: "Faster paddle",
        bonusFunction: function () {
            if(paddleSpeed < 11) paddleSpeed += 4;
        }
    },
    {
        image: new Image(),
        imageSrc: "assets/split_ball.png",
        bonus: "Split ball",
        bonusFunction: function () {
            var ball = balls[0];
            balls.push({x: ball.x, y: ball.y, dx: -ball.dx, dy: -ball.dy, tdx: -ball.tdx, tdy: -ball.tdx})
            balls.push({x: ball.x, y: ball.y, dx: ball.dx, dy: -ball.dy, tdx: -ball.tdx, tdy: -ball.tdx})
        }
    }
];


var colors = ["#689F38", "#FBC02D", "#F57C00", "#D32F2F", "#616161", "#000000"];
var bricks = [];
var bonuses = [];
var stats = 7;
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    stats--;
    for (var r = 0; r < brickRowCount; r++) {
        bricks[c][r] = {x: 0, y: 0, status: stats, bonus: true};
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function drawMenu() {
    var xPos = 20;
    var yPos = 20;
    var hits = 1;
    colors.forEach(color => {
        ctxMenu.beginPath();
        ctxMenu.font = "16px Arial";
        ctxMenu.fillStyle = "#0095DD";
        ctxMenu.fillText("x" + hits++ + " hits", 2 * xPos + brickWidth, yPos + 15);
        ctxMenu.rect(xPos, yPos, brickWidth, brickHeight);
        ctxMenu.fillStyle = color;
        ctxMenu.fill();
        ctxMenu.closePath();
        yPos += 20 + brickHeight;
    });
    bonusesDesc.forEach(bonus => {
        ctxMenu.beginPath();
        ctxMenu.font = "16px Arial";
        ctxMenu.fillStyle = "#0095DD";
        ctxMenu.fillText(bonus.bonus, 2 * xPos + 15, yPos + 15);
        var image = bonus.image;
        image.src = bonus.imageSrc;
        ctxMenu.drawImage(image, xPos, yPos);
        ctxMenu.fillStyle = bonus.color;
        ctxMenu.fill();
        ctxMenu.closePath();
        yPos += 20 + 15;
    });
    ctxMenu.font = "16px Arial";
    ctxMenu.fillStyle = "#0095DD";
    ctxMenu.fillText("Press P to pause game", xPos, yPos + 20);
}


function resetBonuses() {
    paddleX = (canvasGame.width - paddleWidth) / 2;
    paddleWidth = 100;
    paddleSpeed = 7;
    balls.push({x: canvasGame.width / 2, y: canvasGame.height - 30, dx: 4, dy: -4, tdx: 4, tdy: -4});
}

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        if(normalDirection) {
            rightPressed = true;
        } else {
            leftPressed = true;
        }
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        if(normalDirection) {
            leftPressed = true;
        } else {
            rightPressed = true;
        }
    } else if (e.key == "p") {
        if (!isPaused) {
            tPaddleSpeed = paddleSpeed;
            paddleSpeed = 0;
            balls.forEach(ball => {
                ball.tdx = ball.dx;
                ball.tdy = ball.dy;
                ball.dx = 0;
                ball.dy = 0;
            });

            bonusFallingSpeed = 0;
        } else {
            paddleSpeed = tPaddleSpeed;
            balls.forEach(ball => {
                ball.dx = ball.tdx;
                ball.dy = ball.tdy;
            });
            bonusFallingSpeed = 3;
        }
        isPaused = !isPaused
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        if(normalDirection) {
            rightPressed = false;
        } else {
            leftPressed = false;
        }
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        if (normalDirection) {
            leftPressed = false;
        } else {
            rightPressed = false;
        }
    }
}

function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var brick = bricks[c][r];
            if (brick.status > 0) {
                balls.forEach(ball => {
                    if (ball.x + ballRadius > brick.x && ball.x - ballRadius < brick.x + brickWidth && ball.y + ballRadius > brick.y && ball.y - ballRadius < brick.y + brickHeight) {
                        ball.dy = -ball.dy;
                        brick.status--;
                        if (brick.status == 0) {
                            score++;
                            var bonus = Math.floor(Math.random() * 45);
                            if (bonus < 9) {
                                bonuses.push({type: bonus, x: brick.x + brickWidth / 2, y: brick.y});
                            }
                        }
                        if (score == brickRowCount * brickColumnCount) {
                            alert("YOU WIN, CONGRATS!");
                            document.location.reload();
                        }
                    }
                });

            }
        }
    }
}

function drawBall() {
    balls.forEach(ball => {
        ctxGame.beginPath();
        ctxGame.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctxGame.fillStyle = "#512DA8";
        ctxGame.fill();
        ctxGame.closePath();
    });

}

function drawPaddle() {
    ctxGame.beginPath();
    ctxGame.rect(paddleX, canvasGame.height - paddleHeight, paddleWidth, paddleHeight);
    ctxGame.fillStyle = "#5D4037";
    ctxGame.fill();
    ctxGame.closePath();
}

function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctxGame.beginPath();
                ctxGame.rect(brickX, brickY, brickWidth, brickHeight);
                ctxGame.fillStyle = colors[bricks[c][r].status - 1];
                ctxGame.fill();
                ctxGame.closePath();
            }
        }
    }
}

function drawBonuses() {
    bonuses.forEach(bonus => {
        ctxGame.beginPath();
        var image = bonusesDesc[bonus.type].image;
        image.src = bonusesDesc[bonus.type].imageSrc;
        ctxGame.drawImage(image, bonus.x, bonus.y);
        ctxGame.fill();
        ctxGame.closePath();
    })
}

function moveBonuses() {
    bonuses.forEach(bonus => {
        bonus.y += bonusFallingSpeed;
    })
}

function detectBonusCollision() {
    bonuses.forEach(bonus => {
        if (bonus.y + 15 > canvasGame.height - paddleHeight) {
            if (bonus.x + 15 > paddleX && bonus.x < paddleX + paddleWidth) {
                bonusesDesc[bonus.type].bonusFunction();
            }
            bonuses.splice(bonuses.indexOf(bonus), 1);
        }
    })


}

function drawScore() {
    ctxGame.font = "16px Arial";
    ctxGame.fillStyle = "#0095DD";
    ctxGame.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctxGame.font = "16px Arial";
    ctxGame.fillStyle = "#0095DD";
    ctxGame.fillText("Lives: " + lives, canvasGame.width - 65, 20);
}

function draw() {
    ctxGame.clearRect(0, 0, canvasGame.width, canvasGame.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawBonuses();
    collisionDetection();
    detectBonusCollision();

    balls.forEach(ball => {
        if (ball.x + ball.dx > canvasGame.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ballRadius + ball.dy > canvasGame.height - ballRadius) {
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
            } else {
                balls.splice(balls.indexOf(ball), 1);
                if(balls.length == 0) {
                    lives--;
                    resetBonuses();
                }
                if (!lives) {
                    alert("GAME OVER");
                    document.location.reload();
                }
            }
        }
    });

    if (rightPressed && paddleX < canvasGame.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    balls.forEach(ball => {
        ball.x += ball.dx;
        ball.y += ball.dy;
    });
    moveBonuses();
    requestAnimationFrame(draw);
}

draw();
drawMenu();
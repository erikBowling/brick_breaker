const canvas = document.querySelector('#surface');
const ctx = canvas.getContext('2d');

//Getting user input
document.addEventListener('keydown', (key)=>{
    if(key.code == 'Space' && started == false){
        ball.velocity = 7
        let x = Math.random() * 10;
        let y = Math.random() * 10 + 7;
        if(Math.round(Math.random() * 100) % 2 == 0) x *= -1;
        ball.changeDirection(x, y);
        started = true;
    }
});

canvas.addEventListener('mousemove', (e)=>{
    if(playerPaddle.posX < 0){
        playerPaddle.posX = 0;
    }else if(playerPaddle.posX + playerPaddle.width > canvas.width / scale){
        playerPaddle.posX = canvas.width / scale - playerPaddle.width;
    }else{
        playerPaddle.posX = e.clientX - playerPaddle.width / 2;
    }
});

const ballPopSound = new Audio('mixkit-game-ball-tap-2073.wav');


//Globals for Canvas Size
let widthSize, heightSize, scale, centerX, centerY;
// Set the dimensions of the canvas and get scale
const setDimensions = function(){
    widthSize = window.innerWidth;
    heightSize = window.innerHeight;
    canvas.style.width = `${widthSize}px`;
    canvas.style.height = `${heightSize}px`;

    scale = window.devicePixelRatio;
    canvas.width = widthSize * scale;
    canvas.height = heightSize * scale;

    centerX = canvas.width / (2 * scale);
    centerY = canvas.height / (2 * scale);

    ctx.scale(scale, scale);   
}

//Initiliazing the canvas
setDimensions();

//Classes for objects on screen
class Paddle{
    constructor(posX, posY, width, height, color){
        this.posX = posX,
        this.posY = posY,
        this.width = width,
        this.height = height,
        this.color = color
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){

        //Fixing Paddle Wall Collisions
        if(this.posX < 0){
            this.posX = 0;
        }else if(this.posX + this.width > canvas.width / scale){
            this.posX = canvas.width / scale - this.width;
        }
    }
}

class Brick{
    constructor(posX, posY, width, height, color){
        this.posX = posX,
        this.posY = posY,
        this.width = width,
        this.height = height,
        this.color = color
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Ball{
    constructor(posX, posY, radius, color, velocity){
        this.posX = posX,
        this.posY = posY,
        this.radius = radius,
        this.color = color,
        this.velocity = velocity,
        this.direction = [1,1],
        this.hitPaddle = false,
        this.magnitude = 0
    }

    draw(){
        if(score.lives >= 0){
            ctx.beginPath();
            ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = `${this.color}`;
            ctx.fill();
        }
    }

    update(){
        //Paddle collision
        if(this.hitPaddle == false){
            if(this.posX + this.radius > playerPaddle.posX && this.posX - this.radius < playerPaddle.posX + playerPaddle.width && this.posY + this.radius > playerPaddle.posY && this.posY - this.radius < playerPaddle.posY + playerPaddle.height){
                this.hitPaddle = true;

                //Side Collisions
                if(this.posY > playerPaddle.posY && this.posY < playerPaddle.posY + playerPaddle.height){
                    //Left
                    if(this.posX <= playerPaddle.posX) this.changeDirection(-3, 1);

                    //Right
                    if(this.posX >= playerPaddle.posX + playerPaddle.width) this.changeDirection(3, 1);
                }

                //Left Top
                if(this.posX + this.radius < playerPaddle.posX + playerPaddle.width / 3){
                    if(Math.sign(this.direction[0]) == 1){
                        this.direction[0] *=-1;
                    }

                //Middle Top
                }else if(this.posX + this.radius > playerPaddle.posX + playerPaddle.width / 3 && this.posX + this.radius < playerPaddle.posX + 2 * playerPaddle.width / 3){
                    let x = Math.random() * 4;
                    let y = Math.random() * 10 + 2;
                    if(Date.now() % 2 == 0) x *= -1;
                    
                    this.changeDirection(x, y);

                //Right Top
                }else if(this.posX + this.radius > playerPaddle.posX + 2 * playerPaddle.width / 3){
                    if(Math.sign(this.direction[0]) == -1){
                        this.direction[0] *= -1;
                    }
                }
                this.direction[1] *= -1;
            }
        }

        //Side Wall Collision
        if(this.posX + this.radius > canvas.width / scale || this.posX - this.radius < 0){
            this.direction[0] *= -1;
            this.hitPaddle = false;
        }

        //Bottom Wall collision
        if(this.posY + this.radius > canvas.height / scale){
            started = false;
            this.hitPaddle = false;
            this.posX = centerX;
            this.posY = (canvas.height / scale) - 500;
            this.direction = [0,0];
            score.changeLife();
        }
            
        //Top wall collision
        if(this.posY - this.radius < 0){
            this.hitPaddle = false;
            this.direction[1] *= -1;
        }

        this.posX += this.direction[0] * this.velocity;
        this.posY += this.direction[1] * this.velocity;
        
    }

    changeDirection(x, y){
        this.magnitude = Math.sqrt(x ** 2 + y ** 2);
        this.direction = [x / this.magnitude, y / this.magnitude];
    }
}

class ScoreBoard{
    constructor(){
        this.score = 0,
        this.lives = 3
    }

    draw(){
        ctx.fillStyle = 'white';
        if(this.lives >= 0){
            ctx.font = '20px arial';
            ctx.fillText(`Score: ${this.score} Lives: ${this.lives}`, canvas.width / scale - 200, canvas.height / scale - 20);
        }else{
            ctx.font = '50px arial';
            ctx.fillText(`GAME OVER`, centerX - 100, centerY);
            ctx.font = '30px arial';
            ctx.fillText(`Score: ${this.score}`, centerX - 100, centerY + 100);
            cancelAnimationFrame(animationFrameID);
        }
    }

    changeLife(){
        if(this.lives <= 0) started = true;
            this.lives--;
    }

    changeScore(type){
        switch(type){
            case 'red':
                this.score += 25;
                break;
            case 'blue':
                this.score += 20;
                break;
            case 'orange':
                this.score += 15;
                break;
            case 'pink':
                this.score += 10;
                break;
            case 'green':
                this.score += 5;
                break;
        }
    }

}

// Initialize game
const generateBricks = function(){
    const colors = ['red', 'blue', 'orange', 'pink', 'green'];
    const numPerRow = 12;
    let x = (canvas.width / scale / numPerRow);
    for(let i = 0; i < colors.length; i++){
        for(let j = 0; j < numPerRow; j++){
            let margin = 2 * i;
            let brick = new Brick(x * j , 50 * i + margin, x - 1, 50, colors[i]);
            bricks.push(brick);
        }
    }
}

const bricks = [];
const playerPaddle = new Paddle(centerX - 50, (canvas.height / scale) - 100, 100, 30,  'white');
const ball = new Ball(centerX, (canvas.height / scale) - 500, 10, 'white', 0);
const score = new ScoreBoard();
let started = false;
generateBricks();

//Clear the surface before drawing again
let animationFrameID;
const animate = function(){
    ctx.clearRect(0,0, canvas.width / scale, canvas.height / scale);
    animationFrameID = requestAnimationFrame(animate);
    playerPaddle.draw();
    let hit = false;
    bricks.forEach((brick, index)=>{
        //Brick Collision with Ball
        if(ball.posX + ball.radius > brick.posX && ball.posX - ball.radius < brick.posX + brick.width && ball.posY + ball.radius > brick.posY && ball.posY - ball.radius < brick.posY + brick.height){
            ball.hitPaddle = false;
            ballPopSound.pause();
            ballPopSound.currentTime = 0;
            ballPopSound.play();
            if(hit == false){
                setTimeout(()=> bricks.splice(index, 1));
                hit = true;
                score.changeScore(brick.color);
                if(ball.posX < brick.posX || ball.posX > brick.posX + brick.width){
                    ball.direction[0] *= -1
                }else ball.direction[1] *= -1;

                if(ball.posY < brick.posY && ball.posY > brick.posY + brick.height){
                    if(ball.posX < brick.posX || ball.posX > brick.posX + brick.width) ball.direction[0] *= -1;
                }

                switch(brick.color){
                    case 'red':
                        if(ball.velocity < 20) ball.velocity = 20;
                        break;
                    case 'blue':
                        if(ball.velocity < 14) ball.velocity = 14;
                        break;
                    case 'orange':
                        if(ball.velocity < 10) ball.velocity = 10;
                        break;
                }
            }
        }
        brick.draw();
    });

    if(bricks.length == 0) generateBricks();
    ball.draw();
    ball.update();
    score.draw();
}

animate();

/*To Do List

    3. Add lives
    4. Be able to win
    5. Add ball velocity changes after hitting certain bricks
    6. paddle velocity being more dynamic

*/
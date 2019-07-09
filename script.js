// define all required variables
const WIDTH = 300;
const HEIGHT = 600;
let obstaclesCount = 3;     // count of obstacles generated at once.
let cars = [];              // array to hold cars.
let generateRate = 1200;    // cars generation rate.
let laneWidth = WIDTH / obstaclesCount; // width of each lane.
let score = 0;              // holds current user score.
let bullets = [];           // array to hold every bullet.
let isGameStarted = false;   // is game started or not?
let isGameOver = false;     // is game over? 
let totalBulletsCount = 60; // total ammo for the player.
let isBulletsActivated = false; // is ammo activated or disabled? 
let backgroundSpeed = 5     // speed for the player car.
const totalLanes = 3;       // total number of lanes.
const ammoActivator = 10     // threshold to activate ammo.
// player's car image.
const PLAYER_IMAGE = new Image(); 
PLAYER_IMAGE.src = "./playercar.png";

// obstacle's car image.
const OBSTACLE_IMAGE = new Image();
OBSTACLE_IMAGE.src = "./obstaclecar.png";

// initialize canvas.
var canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
var ctx = canvas.getContext("2d");

// create the player's car.
cars.push(new Car(true));

// make changes to the gameplay depending on the current score.
let makeUpdates = () => {
  
  // speed up game play
  if(score >= 15 && score <= 25) {

      generateRate = 1000;
      obstaclesCount = 3;
      backgroundSpeed = 8;

  }else if(score >= 26 && score <= 35) {

      generateRate = 800;
      obstaclesCount = 5;
      backgroundSpeed = 9;        
  }
  // activate ammo for user.
  if(score >= ammoActivator) {
      isBulletsActivated = true;
}
}

// event handler for the action buttons.
document.onkeydown = e => {

  // if left arrow is pressed, 
  // move the player's car to left.
  if(e.keyCode == 37) {

    if(cars[0].currentLane != 1) {

      cars[0].currentLane -= 1; 
    }
  }else if(e.keyCode == 39) {
    // if right arrow is pressed, 
    // move the player's card to right.

    if(cars[0].currentLane != 3) {
      cars[0].currentLane += 1;   
    }
    
  }else if(e.keyCode  == 13) {

    // start the came is entered is pressed.
    if(!isGameStarted) {

    // if game is started, then push obstacles randomly.
      setInterval(function() {
        var tempCar = new Car(false);
        cars.push(tempCar);
      }, generateRate);
      isGameStarted = true;

    }
  }else if(e.keyCode == 32) {

    // hit the bullets if space is pressed
    if(score > ammoActivator && totalBulletsCount > 0) {

        bullets.push(new Bullet(cars[0]));
        totalBulletsCount--;
    }
  }
}

// update the highest score in localstorage.
let updateScore = () => {
  if(score > localStorage.getItem('highScore')) {

    localStorage.setItem("highScore", score);
  }
}

// animator function 
let draw = () => {

  // request draw function for animation infinitely.
  var animationFrame = requestAnimationFrame(draw);

  // start screen of the game.
  if(!isGameStarted) {

    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    ctx.closePath();
    // start screen text.
    ctx.beginPath();
    ctx.fillStyle = "#02b875";
    ctx.font = "35px Verdana";
    ctx.fillText("CAR GAME", WIDTH / 5.5, HEIGHT / 4);
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px Verdana";
    ctx.fillText("Press Enter to Play", WIDTH / 4, HEIGHT / 3);
    ctx.font = "10px Verdana";
    ctx.fillText("Hint: ", WIDTH / 2.5, HEIGHT / 2.5);
    ctx.fillText("You can press space bar to fire bullets.", WIDTH / 7, HEIGHT / 2.2)
    ctx.fillText(`Ammo is activated only after score >= ${ammoActivator}.`, WIDTH / 7, HEIGHT / 2.0)

    ctx.fill();
    ctx.closePath();

  }else if(isGameOver) { // screen to show after gameover.
    
    // re-set canvas.
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    ctx.closePath();
    // end of game screen text.
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "30px Verdana";
    ctx.fillText("BOOM!", WIDTH / 3, HEIGHT / 4);
    ctx.fillStyle = "red";
    ctx.font = "20px Verdana";
    ctx.fillText("YOU CRASHED!", WIDTH / 4, HEIGHT / 3);

    // show high score.
    ctx.fillStyle = "white";
    ctx.font = "15px Verdana";
    ctx.fillText(`Highest score: ${localStorage.getItem('highScore')}`, WIDTH / 4, HEIGHT / 2);
    ctx.fillText(`Current score: ${score}`, WIDTH / 4, HEIGHT / 1.8);
    ctx.fillStyle = "#02b875";
    ctx.font = "12px Verdana";

    //get high score from localStorage to be displayed in the gameover screen.
    if(score >= localStorage.getItem('highScore')) {
      
      //congratulations screen if new high score set.
      ctx.fillText("Congrats! New High Score!!", WIDTH / 5, HEIGHT / 1.6);
    }
    
    // instructions to replay the game.
    ctx.fillStyle = "#f5f5f5";
    ctx.fillText(`Press F5 to play again.`, WIDTH / 4, HEIGHT / 1.2);
    ctx.fill();
    ctx.closePath();    

    // stop the on-going animation.
    cancelAnimationFrame(animationFrame);

  }else {
    
    // game play screen here.

    // re-set the canvas.
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    ctx.closePath();

    // creating the lane divider.
    for(let i = 1; i <= totalLanes - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(WIDTH / 3 * i, 0);
      ctx.lineTo(WIDTH / 3 * i, HEIGHT);
      ctx.setLineDash([10, 25]); /*dashes are 15px and spaces are 25px*/
      ctx.lineWidth = 3;
      ctx.strokeStyle = "white";  
      ctx.stroke();
      ctx.closePath();      
    }
    ctx.lineDashOffset -= backgroundSpeed;    
    
    // make changes to the gameplay.
    makeUpdates();
    for(let i = cars.length - 1; i >= 0; i--) {

      // update and draw the cars.
      cars[i].update();
      cars[i].draw();

      if(i != 0) {

        // modify speed of the game as per difficulty
        cars[i].updateSpeed();

        // check if the player car has successfully passed the obstacle car.
        if(cars[i].isPassed(cars[0])) {
          // remove the corresponding obstacle car from the game context.
          cars.splice(i, 1);   
          // increase the user's by one.
          score++;

        }else if(cars[i].isColliding(cars[0])) { // if the car has not successfully passed,
                                                 // then check for the collision.
            
          // if collision occured, update userscore in localStorage before ExtensionScriptApis.                                                 
          updateScore();
          // set isGameOver to true.
          isGameOver = true;

          // isGameStarted = false;
        }    
      }   
    }
    

    for(let i = bullets.length - 1; i >= 0; i--) {

      //update and render the bullets.
      bullets[i].move();                
      bullets[i].render();    

      // check if any bullet hits all other obstacle cars.
      if(bullets[i].hits(cars)) {

        // remove obstacle cars hit by bullet.
        bullets.splice(i, 1);
        
        // increase score
        score++;

      }
      else if(bullets[i].isNotInRange()) {
        // if bullets are par their power, then remove them
        bullets.splice(i, 1);
      }
    }
    
    // display info about user score and ammo.
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.font = "15px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Bullets: ${totalBulletsCount}`, 220, 20);
    ctx.font = "12px  Verdana";
    isBulletsActivated ? (ctx.fillStyle = "#02b875", ctx.fillText(`Activated`, 220, 40)): 
                             (ctx.fillStyle = "red", ctx.fillText(`Disabled`, 220, 40));
    }
}

// call the animator function.
draw();


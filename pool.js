// Fig. 14.27 cannon.js
// Logic of the Cannon Game
var canvas; // the canvas
var context; // used for drawing on the canvas

// constants for game play
var NUM_BALLS = 15; // sections in the target
var TIME_INTERVAL = 5; // screen refresh interval in milliseconds
var NUM_HOLES = 6;

var mars = false;
var earth = false;
var moon = false;
var jupiter = false;

var ballGap = 1;
var ballThreshhold = 2;
var holeThreshhold = 2;
var wallThreshhold = 2;

var poolBackground = new Image();
poolBackground.src = "table.png";

// variables for the game loop and tracking statistics
var intervalTimer; // holds interval timer
var timerCount; // number of times the timer fired since the last second
var timeLeft; // the amount of time left in seconds
var shotsFired; // the number of shots the user has fired
var timeElapsed; // the number of seconds elapsed

// variables for the balls[0] and target balls
var ballVelocity;
var ballRadius = 12; // balls[0] radius
var whiteBallSpeed = 1500; // balls[0] speed
var entropy = 0;

var ballVolume; // m^3
var ballDensity = 7860; //  kg per m^3
var ballMass; // in kg

var balls; // target balls
var dist;

var sunkStates; // is each target piece hit?
var targetBallsSunk; // number of balls sunk

var holes;
var holeRadius;
var wallWidth;

var friction = 1;
var tableTilt;

// variables for sounds
var collisionSound;
var stickSound;
var wallSound;

var canvasWidth; // width of the canvas
var canvasHeight; // height of the canvas

var ballImages = [];
ballImages[9] = new Image();
ballImages[9].src = "ball9.png";

ballImages[10] = new Image();
ballImages[10].src = "ball10.png";

ballImages[11] = new Image();
ballImages[11].src = "ball11.png";

ballImages[12] = new Image();
ballImages[12].src = "ball12.png";

ballImages[13] = new Image();
ballImages[13].src = "ball13.png";

ballImages[14] = new Image();
ballImages[14].src = "ball14.png";

ballImages[15] = new Image();
ballImages[15].src = "ball15.png";
var colorArray = [];
colorArray[1] = "#FFD600";
colorArray[2] = "#005AFF";
colorArray[3] = "red";
colorArray[4] = "#6500FF";
colorArray[5] = "#FF7700";
colorArray[6] = "#00FF25";
colorArray[7] = "#972A00";

// called when the app first launches
function setupGame()
{
   // stop timer if document unload occurs
   document.addEventListener( "unload", stopTimer, false );
   document.addEventListener( "keypress", newGame, false );

   // start a new game when user clicks Start Game button
   document.getElementById( "startButton" ).addEventListener(
      "click", newGame, false );
   document.getElementById( "resetButton" ).addEventListener(
      "click", reset, false );
   document.getElementById( "pauseButton" ).addEventListener(
      "click", pauseGame, false );

   document.getElementById( "increaseBallSpeed" ).addEventListener(
      "click", increaseBallSpeed);
   document.getElementById( "decreaseBallSpeed" ).addEventListener(
      "click", decreaseBallSpeed);

   document.getElementById( "increaseBallSize" ).addEventListener(
      "click", increaseBallSize);
   document.getElementById( "decreaseBallSize" ).addEventListener(
      "click", decreaseBallSize);

   document.getElementById( "changeBallSize" ).addEventListener(
      "click", changeBallSize);

   document.getElementById( "increaseBallDensity" ).addEventListener(
      "click", increaseBallDensity);
   document.getElementById( "decreaseBallDensity" ).addEventListener(
      "click", decreaseBallDensity);

   document.getElementById( "increaseFriction" ).addEventListener(
      "click", increaseFriction);
   document.getElementById( "decreaseFriction" ).addEventListener(
      "click", decreaseFriction);


   // get the canvas, its context and setup its click event handler
   canvas = document.getElementById( "theCanvas" );
   context = canvas.getContext("2d");


   // create balls
   balls = new Array(NUM_BALLS + 1);
   sunkStates = new Array(NUM_BALLS + 1);
   for (var i=0; i <= NUM_BALLS; i++){
      balls[i] = {};
      balls[i].velocity = {};
      balls[i].velocity.x = 0;
      balls[i].velocity.y = 0;
      balls[i].speed = 0;
      balls[i].angle = 0;
      balls[i].angleTop = true;
      balls[i].angleRight = true;
      balls[i].moving = false;
      sunkStates[i] = false;
   }

   //create holes
   holes = new Array(NUM_HOLES);
   for (var j=0; j < NUM_HOLES; j++){
      holes[j] = {};
   }

   // get sounds
   collisionSound = document.getElementById( "collisionSound" );
   stickSound = document.getElementById( "stickSound" );
   wallSound = document.getElementById( "wallHitSound" );
   newGame();
} // end function setupGame

// set up interval timer to update game
function startTimer()
{
   canvas.addEventListener( "click", fireWhiteBall, false );
   intervalTimer = window.setInterval( updatePositions, TIME_INTERVAL );
} // end function startTimer

// terminate interval timer
function stopTimer()
{
   canvas.removeEventListener( "click", fireWhiteBall, false );
   window.clearInterval( intervalTimer );
} // end function stopTimer

// called by function newGame to scale the size of the game elements
// relative to the size of the canvas before the game begins
function resetElements()
{
   var w = canvas.width;
   var h = canvas.height;
   canvasWidth = w; // store the width
   canvasHeight = h; // store the height

   // set up the holes
   holes[0].x = h/16; holes[0].y = h/16; //top left
   holes[1].x = h/16; holes[1].y = h - (h/16); // bottom left

   holes[2].x = w - (h/16); holes[2].y = h/16; // top right
   holes[3].x = w - (h/16); holes[3].y = h - (h/16); // bottom right

   holes[4].x = w / 2; holes[4].y = h/16; // top middle
   holes[5].x = w / 2; holes[5].y = h - (h/16); // bottom middle

   // set up the balls
   for (var i=0; i <= NUM_BALLS; i++){
      balls[i].radius = ballRadius;
      balls[i].density = 7950;
      balls[i].mass = 4 * Math.PI * balls[i].radius * balls[i].radius / 3;
      balls[i].velocity.x = 0;
      balls[i].velocity.y = 0;
      balls[i].speed = 0;
      balls[i].kineticEnergy = balls[i].mass * balls[i].speed;
      balls[i].moving = false;
      balls[i].angleTop = true;
      balls[i].angleRight = true;
      balls[i].angle = 0;
      sunkStates[i] = false;
   }
   balls[0].x = w * 1 / 4; //white ball position from the left
   balls[0].y = h / 2; // white ball position from the top

   // configure instance variables related to the balls
   balls[8].x = w * 3 / 4;
   balls[8].y = h/2;

   var r = ballRadius + ballGap;
   var h = r*2;
   var a = Math.sqrt((4 * r * r) - (r * r));

   // COLUMN 2 of balls
   balls[7].x = balls[8].x - a; balls[7].y = balls[8].y + r;
   balls[1].x = balls[8].x - a; balls[1].y = balls[8].y - r;

   // COLUMN 1 (FRONT BALL)
   balls[9].x = balls[8].x - (2*a); balls[9].y = balls[8].y;

   // COLUMN 3 (WHERE 8 BALL IS)
   balls[15].x = balls[8].x; balls[15].y = balls[8].y + h;
   balls[12].x = balls[8].x; balls[12].y = balls[8].y - h;

   // COLUMN 4
   balls[10].x = balls[8].x + a; balls[10].y = balls[8].y + r;
   balls[3].x = balls[10].x; balls[3].y = balls[8].y - r;
   balls[6].x = balls[10].x; balls[6].y = balls[10].y + h;
   balls[5].x = balls[10].x; balls[5].y = balls[3].y - h;

   // COLUMN 5
   balls[13].x = balls[8].x + (2*a); balls[13].y = balls[8].y;
   balls[2].x = balls[13].x; balls[2].y = balls[13].y + h;
   balls[11].x = balls[13].x; balls[11].y = balls[13].y + (2*h);
   balls[4].x = balls[13].x; balls[4].y = balls[13].y - h;
   balls[14].x = balls[13].x; balls[14].y = balls[13].y - (2*h);

   r = ballRadius/100;
   ballVolume = 4 * Math.PI * r * r * r / 3;
   ballMass = ballDensity * ballVolume;

   holeRadius = ballRadius + 5;
   wallWidth = holes[0].y;

   document.getElementById("ballSize" +
       "").innerHTML = ballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = ballRadius;
   ballVolume = ballVolume * 1000;
   ballVolume = Math.trunc(ballVolume);
   ballVolume = ballVolume / 1000;
   document.getElementById("volume").innerHTML = ballVolume;

   document.getElementById("whiteBallSpeed").innerHTML = whiteBallSpeed + " m/s";
   document.getElementById("ballDensity").innerHTML = ballDensity + " kg/m<sup>3</sup>";
   document.getElementById("friction").innerHTML = friction + " N";
   ballMass = ballMass * 100;
   ballMass = Math.trunc(ballMass);
   ballMass = ballMass/100;
   document.getElementById("mass").innerHTML = ballMass;
} // end function resetElements

function pauseGame() {
   stopTimer();
   document.getElementById( "pauseButton" ).value = "Play";
   document.getElementById( "pauseButton" ).removeEventListener(
      "click", pauseGame, false );
   document.getElementById( "pauseButton" ).addEventListener(
      "click", unpauseGame, false );
}

function unpauseGame() {
   startTimer();
   document.getElementById( "pauseButton" ).value = "Pause";
   document.getElementById( "pauseButton" ).removeEventListener(
      "click", unpauseGame, false );
   document.getElementById( "pauseButton" ).addEventListener(
      "click", pauseGame, false );
}

// reset all the screen elements and start a new game
function newGame()
{
   resetElements(); // reinitialize all game elements
   stopTimer(); // terminate previous interval timer
   document.getElementById( "startButton" ).value = "Restart";

   targetBallsSunk = 0; // no balls have been sunk
   ballVelocity = whiteBallSpeed; // set initial velocity
   timeLeft = 1000; // start the countdown at 10 seconds
   timerCount = 0; // the timer has fired 0 times so far
   shotsFired = 0; // set the initial number of shots fired
   timeElapsed = 0; // set the time elapsed to zero

   startTimer(); // starts the game loop
} // end function newGame

function reset() {
   whiteBallSpeed = 300;
   ballVelocity = 300;

   ballRadius = 20; // balls[0] radius
   whiteBallSpeed = 700 * 1.5; // balls[0] speed
   ballDensity = 7860; //  kg per m^3

   let r = ballRadius/100;
   ballVolume = 4 * Math.PI * r * r * r / 3;
   ballMass = ballDensity * ballVolume;

   document.getElementById("whiteBallSpeed").innerHTML = whiteBallSpeed + " pixels/second";
   document.getElementById("ballSize" +
       "").innerHTML = ballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = ballRadius;
   ballVolume = ballVolume * 1000;
   ballVolume = Math.trunc(ballVolume);
   ballVolume = ballVolume / 1000;
   document.getElementById("volume").innerHTML = ballVolume;
   ballMass = ballMass * 100;
   ballMass = Math.trunc(ballMass);
   ballMass = ballMass/100;
   document.getElementById("mass").innerHTML = ballMass;
   document.getElementById("whiteBallSpeed").innerHTML = whiteBallSpeed + " m/s";
   document.getElementById("ballDensity").innerHTML = ballDensity + " kg/m<sup>3</sup>";
   document.getElementById("friction").innerHTML = friction + " m/s<sup>2</sup>";
}

function increaseBallSpeed() {
   whiteBallSpeed = whiteBallSpeed*1.5;
   whiteBallSpeed = Math.trunc(whiteBallSpeed);
   document.getElementById("whiteBallSpeed").innerHTML = whiteBallSpeed + " pixels/second";
   newGame();
}

function decreaseBallSpeed() {
   whiteBallSpeed = whiteBallSpeed/1.5;
   whiteBallSpeed = Math.trunc(whiteBallSpeed);
   document.getElementById("whiteBallSpeed").innerHTML = whiteBallSpeed + " pixels/second";
}

function increaseBallDensity() {
   ballDensity = ballDensity + 200;
   document.getElementById("ballDensity").innerHTML = ballDensity + " kg/m<sup>3</sup>";
   ballMass = ballDensity * ballVolume;

   ballMass = ballMass * 100;
   ballMass = Math.trunc(ballMass);
   ballMass = ballMass/100;
   document.getElementById("mass").innerHTML = ballMass;

}

function decreaseBallDensity() {
   ballDensity = ballDensity - 200;
   document.getElementById("ballDensity").innerHTML = ballDensity + " kg/m<sup>3</sup>";
   ballMass = ballDensity * ballVolume;

   ballMass = ballMass * 100;
   ballMass = Math.trunc(ballMass);
   ballMass = ballMass/100;
   document.getElementById("mass").innerHTML = ballMass;
}

function increaseFriction() {
   friction = (friction + 1);
   document.getElementById("friction").innerHTML = friction + " N";
}

function decreaseFriction() {
   friction = (friction - 1);
   document.getElementById("friction").innerHTML = friction + " N";
}

function changeBallSize() {
   var input = document.getElementById("changeBallSize").value;
   console.log(input);
   ballRadius = input;
   document.getElementById("ballSize").innerHTML = ballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = ballRadius;

   let r = ballRadius/100;
   ballVolume = 4 * Math.PI * r * r * r / 3;
   ballMass = ballDensity * ballVolume;
   ballVolume = ballVolume * 1000;
   ballVolume = Math.trunc(ballVolume);
   ballVolume = ballVolume / 1000;
   document.getElementById("volume").innerHTML = ballVolume;

   ballMass = ballMass * 100;
   ballMass = Math.trunc(ballMass);
   ballMass = ballMass/100;
   document.getElementById("mass").innerHTML = ballMass;

   holeRadius = ballRadius + 5;
   wallWidth = 2 * holeRadius * 1.2;
   resetElements();
   newGame();
   resetElements();
}

function increaseBallSize() {
   if (ballRadius < 5) {
      ballRadius = ballRadius + 1;
   }
   else if (ballRadius >= 5) {
      ballRadius = ballRadius + 5;
   }
   document.getElementById("ballSize" +
       "").innerHTML = ballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = ballRadius;

   let r = ballRadius/100;
   ballVolume = 4 * Math.PI * r * r * r / 3;
   ballMass = ballDensity * ballVolume;
   ballVolume = ballVolume * 1000;
   ballVolume = Math.trunc(ballVolume);
   ballVolume = ballVolume / 1000;
   document.getElementById("volume").innerHTML = ballVolume;

   ballMass = ballMass * 100;
   ballMass = Math.trunc(ballMass);
   ballMass = ballMass/100;
   document.getElementById("mass").innerHTML = ballMass;
   newGame();
}

function decreaseBallSize() {
   if (ballRadius > 1) {
      if (ballRadius > 5) {
      ballRadius = ballRadius - 5;
      }
      else if (ballRadius <= 5) {
         ballRadius = ballRadius - 1;
      }
   }
   document.getElementById("ballSize" +
       "").innerHTML = ballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = ballRadius;

   let r = ballRadius/100;
   ballVolume = 4 * Math.PI * r * r * r / 3;
   ballMass = ballDensity * ballVolume;

   ballVolume = ballVolume * 1000;
   ballVolume = Math.trunc(ballVolume);
   ballVolume = ballVolume / 1000;
   document.getElementById("volume").innerHTML = ballVolume;
   ballMass = ballMass * 100;
   ballMass = Math.trunc(ballMass);
   ballMass = ballMass/100;
   document.getElementById("mass").innerHTML = ballMass;
   newGame();
}

// called every TIME_INTERVAL milliseconds
function updatePositions()
{
   for (var i =0; i <= NUM_BALLS; i++)
   {
      if (balls[i].moving) {
         var collided = false;
         // apply friction
         if (balls[i].velocity.x !== 0 && balls[i].velocity.x !== null) {
            balls[i].velocity.x = balls[i].velocity.x * (1 - (friction/1000));
            balls[i].velocity.x = balls[i].velocity.x * 1000;
            balls[i].velocity.x = Math.trunc(balls[i].velocity.x );
            balls[i].velocity.x = balls[i].velocity.x / 1000;
         }
         if (balls[i].velocity.y !== 0) {
            balls[i].velocity.y = balls[i].velocity.y * (1 - (friction/1000));
            balls[i].velocity.y = balls[i].velocity.y * 1000;
            balls[i].velocity.y = Math.trunc(balls[i].velocity.y );
            balls[i].velocity.y = balls[i].velocity.y / 1000;
         }

         var interval = TIME_INTERVAL / 1000.0;
         // move the ball
         var potentialX = balls[i].x + (interval * balls[i].velocity.x);
         var potentialY = balls[i].y + (interval * balls[i].velocity.y);


         // prevent overlap
         if (isOverlap(potentialX, potentialY, i) === i) {
            balls[i].x = potentialX;
            balls[i].y = potentialY;
         }
         else {
            console.log("PREVENTING OVERLAP");
            collision(i, isOverlap(potentialX, potentialY, i));
            collided = true;
         }

         // COLLISION WITH WALLS
         // check for collisions with side walls
         if (((balls[i].x + ballRadius + wallThreshhold > (canvasWidth - wallWidth) ||
             balls[i].x - ballRadius - wallThreshhold < wallWidth) &&
             balls[i].velocity.x !== 0) &&
             collided === false
         ) {
            if (balls[i].y < (holes[0].y + holeRadius) ||
                balls[i].y > (holes[1].y - holeRadius))
            {
               sunkStates[i] = true;
               balls[i].moving = false;
            }
            else {
                balls[i].velocity.x *= (-1.00); //reverse x direction
                balls[i].x += interval * balls[i].velocity.x;
                balls[i].y += interval * balls[i].velocity.y;
                wallSound.play();
            }

         } // end if

         // check for collisions with top and bottom walls
         else if (((balls[i].y + ballRadius + wallThreshhold > (canvasHeight - wallWidth) ||
             balls[i].y - ballRadius - wallThreshhold < wallWidth) &&
             balls[i].velocity.y !== 0) &&
             collided === false
         ) {
             if (balls[i].x < (holes[0].x + holeRadius) ||
             (balls[i].x > (holes[4].x - holeRadius) &&
             balls[i].x < (holes[4].x + holeRadius)) ||
             balls[i].x > (holes[3].x - holeRadius)) {
               sunkStates[i] = true;
               balls[i].moving = false;
            }
            else {
                balls[i].velocity.y *= (-1.00); //reverse y direction
                balls[i].x += interval * balls[i].velocity.x;
                balls[i].y += interval * balls[i].velocity.y;
                wallSound.play();
            }
         } // end else if

         // check for ball is no longer moving
         if ((Math.abs(balls[i].velocity.x) < 5) && (Math.abs(balls[i].velocity.y) < 5)) {
            balls[i].velocity.x = 0;
            balls[i].velocity.y = 0;
            balls[i].moving = false;
         }
         // check for collision with holes
         else {
            for (var j = 0; j <= NUM_BALLS; j++) {
               // check for collision with holes
               for (var k = 0; k < NUM_HOLES; k++) {
                  if (balls[i].x < (holes[k].x + holeThreshhold) &&
                      balls[i].x > (holes[k].x - holeThreshhold) &&
                      balls[i].y < (holes[k].y + holeThreshhold) &&
                      balls[i].y > (holes[k].y - holeThreshhold) &&
                      !sunkStates[i]
                  ) {
                     sunkStates[i] = true;
                     balls[i].moving = false;
                     // if all pieces have been sunk
                     if (++targetBallsSunk === NUM_BALLS) {
                        stopTimer(); // game over so stop the interval timer
                        draw(); // draw the game pieces one final time
                        showGameOverDialog("You Won!"); // show winning dialog
                        var c = document.createElement("P");
                        c.innerText = timeElapsed + " seconds ";
                        document.getElementById("highScores").appendChild(c);
                     } // end if
                  }
               }
            }
         } //end else
      } // end if
   } // end for loop

   ++timerCount; // increment the timer event counter

   // if one second has passed
   if (TIME_INTERVAL * timerCount >= 1000)
   {
      --timeLeft; // decrement the timer
      ++timeElapsed; // increment the time elapsed
      timerCount = 0; // reset the count
   } // end if

   draw(); // draw all elements at updated positions

   // if the timer reached zero
   if (timeLeft <= 0)
   {
      stopTimer();
      showGameOverDialog("You lost HAHA!"); // show the losing dialog
   } // end if

   if (sunkStates[0]) {
      sunkWhiteBall("You sunk the white ball DUMBASS!"); // show the losing dialog
   }

} // end function updatePositions

// fires the white ball
function fireWhiteBall(event)
{
   if (!balls[0].moving && !sunkStates[0]) {
      directBall(event);
      ++shotsFired; // increment shotsFired
      stickSound.play();
   }
   else if (sunkStates[0]) {
      replaceWhiteBall(event);
   }
} // end function firewhiteBall

function replaceWhiteBall(event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var currentElement = canvas;
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

   // get the location of the click
   var clickPoint = {};
   clickPoint.x = event.x - totalOffsetX;
   clickPoint.y = event.y - totalOffsetY;

   if (isOverlap(clickPoint.x, clickPoint.y, 0) !== 0) {
      showGameOverDialog("There's already a ball there.");
      draw();
   }
   else if (isOverlap(clickPoint.x, clickPoint.y, 0) === 0){
      sunkStates[0] = false;
      balls[0].x = clickPoint.x;
      balls[0].y = clickPoint.y;
      balls[0].moving = false;
      balls[0].velocity.x = 0;
      balls[0].velocity.y = 0;
   }
}

function isOverlap(x, y, i) {
   var result = i;
   for (var j = 1; j <= NUM_BALLS; j++) {
      dist = Math.sqrt(((x - balls[j].x) * (x - balls[j].x)) +
      ((y - balls[j].y) * (y - balls[j].y)));

      if ((i !== j) && (dist <= (2 * ballRadius) + 2) && !sunkStates[j]) {
         result = j;
      }
   }
   return result;
}

function collision(i, j) {
   collisionSound.play(); // play target hit sound

   // calculate new speed
   balls[j].speed = (Math.random() * balls[i].speed) + (0.5*balls[i].speed);
   
   // calculate other ball new angle
   var angleSign = Math.random();
   if (angleSign > 0.5) {
      balls[j].angle = balls[i].angle + (Math.random() * (Math.PI/2));
   }
   else {
      balls[j].angle = balls[i].angle - (Math.random() * (Math.PI/2));
   }

   // get the x component of the total velocity
   balls[j].velocity.x = (balls[j].speed * Math.cos(balls[j].angle)).toFixed(3);

   // get the y component of the total velocity
   balls[j].velocity.y = (-1) * (balls[j].speed * Math.sin(balls[j].angle)).toFixed(3);
   balls[j].moving = true;

   // give the other ball opposite direction
   balls[i].angle = balls[j].angle + Math.PI;
   balls[i].speed = balls[i].speed - balls[j].speed;

   // get the x component of the total velocity
   balls[i].velocity.x = (balls[i].speed * Math.cos(balls[i].angle)).toFixed(3);
   // get the y component of the total velocity
   balls[i].velocity.y = (-1) * (balls[i].speed * Math.sin(balls[i].angle)).toFixed(3);

   // check for ball is no longer moving
   if ((Math.abs(balls[i].velocity.x) < 5) && (Math.abs(balls[i].velocity.y) < 5)) {
      balls[i].velocity.x = 0;
      balls[i].velocity.y = 0;
      balls[i].moving = false;
   }
   // check for ball is no longer moving
   if ((Math.abs(balls[j].velocity.x) < 5) && (Math.abs(balls[j].velocity.y) < 5)) {
      balls[j].velocity.x = 0;
      balls[j].velocity.y = 0;
      balls[j].moving = false;
   }

}

function directBall(event)
{
   // get the relative offset of the canvas
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var currentElement = canvas;
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

   // get the location of the click 
   var clickPoint = {};
   clickPoint.x = event.x - totalOffsetX;
   clickPoint.y = event.y - totalOffsetY;

   // compute the click's distance from center of the white ball
   var yDistance = Math.abs(balls[0].y - clickPoint.y);
   var xDistance = Math.abs(clickPoint.x - balls[0].x);

   var angle = 0; // initialize angle to 0

   // calculate the angle the ball makes with the horizontal
   if (xDistance !== 0)  { // prevent division by 0
      angle = Math.atan(yDistance / xDistance);
   }
   else {
      angle = Math.PI / 2;
   }
   balls[0].angle = angle;

   // BOTTOM RIGHT
   if ((balls[0].y < clickPoint.y) && (balls[0].x < clickPoint.x)) {
      angle = (2 * Math.PI) - angle;
   }
   // TOP LEFT
   else if ((balls[0].y > clickPoint.y) && (balls[0].x > clickPoint.x)) {
      angle = (Math.PI) - angle;
   }
   // BOTTOM LEFT
   else if ((balls[0].y < clickPoint.y) && (balls[0].x > clickPoint.x)) {
      angle = (Math.PI) + angle;
   }
   // get the x component of the total velocity
   balls[0].velocity.x = (whiteBallSpeed * Math.cos(angle)).toFixed(3);
   // get the y component of the total velocity
   balls[0].velocity.y = (-1) * (whiteBallSpeed * Math.sin(angle)).toFixed(3);

   // get the total speed
   balls[0].speed = whiteBallSpeed;

   balls[0].moving = true; // the white ball is moving
} // end function alignCannon

// draws the game elements to the given Canvas
function draw()
{
   context.fillStyle = "white";
   context.fontFamily = "Futura, sans serif";
   context.font = "bold 24px sans-serif";
   context.textBaseline = "top";
   context.fillText("Time remaining: " + timeLeft, 5, 5);

   //document.body.style.background = "#00bd13";
   context.drawImage(poolBackground,0,0, canvas.width, canvas.height);

   // draw the table
   context.fillStyle = "green";
   context.fillRect(0, 0, canvasWidth, canvasHeight);

   // draw the walls
   context.strokeStyle = "#632A0D";
   context.beginPath(); // begin a new path
   context.moveTo(0, 0); // start
   context.lineTo(canvasWidth, 0); // end
   context.lineWidth = 2 * wallWidth; // line width
   context.stroke(); //draw path
   context.beginPath(); // begin a new path
   context.moveTo(0, 0); // start
   context.lineTo(0, canvasHeight); // end
   context.stroke(); //draw path
   context.beginPath(); // begin a new path
   context.moveTo(0, canvasHeight); // start
   context.lineTo(canvasWidth, canvasHeight); // end
   context.stroke(); //draw path
   context.beginPath(); // begin a new path
   context.moveTo(canvasWidth, 0); // start
   context.lineTo(canvasWidth, canvasHeight); // end
   context.stroke(); //draw path

   // draw the balls // draw balls
   for (var k = 0; k <= NUM_BALLS; k++) {
      if (!sunkStates[k]) {
         if (k === 0 || k > 8) {
            context.fillStyle = "white";
         }
         else if (k !== 8) {
            context.fillStyle = colorArray[k];
         }
         else if (k === 8) {
            context.fillStyle = "black";
         }
         context.beginPath();
         context.arc(balls[k].x, balls[k].y, ballRadius,
         0, Math.PI * 2);
         context.closePath();
         context.fill();
         if (k > 8) {
            context.drawImage(ballImages[k],balls[k].x - ballRadius,balls[k].y - ballRadius, 2 * ballRadius, 2 * ballRadius);
         }
         if (k !== 0) {
            context.font = "12px Futura";
            if (k > 8 || k < 8) {
               context.fillStyle = "black";
            }
            else {
               context.fillStyle = "white";
            }

            if (k < 10) {
               context.fillText(k, balls[k].x - 4, balls[k].y - 4);
            }
            else {
               context.fillText(k, balls[k].x - 7, balls[k].y - 4);
            }
         }
      } // end if
   }

   //draw the holes
   holeRadius = ballRadius + 5; // reset the holeRadius because for some reason there's a glitch with the dial nob
   context.fillStyle = "black";
   for (k = 0; k < NUM_HOLES; k++) {
      holeRadius = ballRadius + 5;
      context.beginPath();
      context.arc(holes[k].x, holes[k].y, holeRadius,
          0, Math.PI * 2);
      context.closePath();
      context.fill();
   }

} // end function draw

// display an alert when the game ends
function showGameOverDialog(message)
{
   context.fillStyle = "white";
   context.fontFamily = "Futura, sans serif";
   context.font = "bold 20px sans-serif";
   context.textBaseline = "top";
   context.fillText(message, 40, 60);

   context.fillText("Shots fired: " + shotsFired, 40, 90);
   context.fillText("Total time: " + timeElapsed + " seconds ", 40, 120);
   context.fillText("Click on the screen to replace the white ball.", 40, 150);

   /*document.getElementById("Message").innerHTML = message;
   document.getElementById("scores").innerHTML = "Shots fired: " + shotsFired +
      "</br>Total time: " + timeElapsed + " seconds ";*/
} // end function showGameOverDialog

function sunkWhiteBall(message)
{
   context.fillStyle = "white";
   context.fontFamily = "Futura, sans serif";
   context.font = "bold 20px sans-serif";
   context.textBaseline = "top";
   context.fillText(message, 40, 60);
   context.fillText("Click on the screen to replace the white ball.", 40, 90);

   /*document.getElementById("Message").innerHTML = message;
   document.getElementById("scores").innerHTML = "Shots fired: " + shotsFired +
      "</br>Total time: " + timeElapsed + " seconds ";*/
} // end function showGameOverDialog

window.addEventListener("load", setupGame, false);


/*************************************************************************
* (C) Copyright 1992-2012 by Deitel & Associates, Inc. and               *
* Pearson Education, Inc. All Rights Reserved.                           *
*                                                                        *
* DISCLAIMER: The authors and publisher of this book have used their     *
* best efforts in preparing the book. These efforts include the          *
* development, research, and testing of the theories and programs        *
* to determine their effectiveness. The authors and publisher make       *
* no warranty of any kind, expressed or implied, with regard to these    *
* programs or to the documentation contained in these books. The authors *
* and publisher shall not be liable in any event for incidental or       *
* consequential damages in connection with, or arising out of, the       *
* furnishing, performance, or use of these programs.                     *
*************************************************************************/
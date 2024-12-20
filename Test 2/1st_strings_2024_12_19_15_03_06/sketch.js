/*
 * This file is part of [Unfocused Focus].
 *
 * [Unfocused Focus] is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License
 *
 * [Unfocused Focus] is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with [Unfocused Focus]. If not, see <https://www.gnu.org/licenses/>.
 */


let startPoint, endPoint;
let tangledLine = [];
let solveButton, tangledButton;
let messageTimer = 0; // Timer for message display
let solving = false; // Flag to trigger the animation
let solveProgress = 0; // Progress of the untangling animation (0 to 1)
let dragging = false; // Flag for dragging
let dragIndex = -1; // Index of the dragged point
let colorOffset = 0; // Offset for animating colors
let isShaking = false; // Flag to determine if the line is shaking
let backgroundImage; // Variable for the background image
let quoteImage; // Variable for the quote image
let customFont; // Variable for the custom font
let showQuote = true; // Flag to control the visibility of the quote

// Sound variables
let buzzSound, solveSound, popSound;

function preload() {
  // Load the background, quote images, font, and sounds
  backgroundImage = loadImage('New background.png');
  quoteImage = loadImage('quote.png');
  customFont = loadFont('Perandory-Regular.otf');
  buzzSound = loadSound('buzz-sound.mp3');
  solveSound = loadSound('solve-sound.mp3');
  popSound = loadSound('pop-sound.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Transparent background
  clear();

  // Adjust start and end points to make the tangled line higher
  startPoint = { x: 200, y: height / 2 + 40 };
  endPoint = { x: width - 200, y: height / 2 + 40 };

  // Generate initial tangled points
  generateTangledLine();

  // Create "Solve" button
  solveButton = createButton('SOLVE');
  solveButton.position(80, height - 550); // Moved up and to the left
  solveButton.size(100, 40);
  solveButton.style('font-family', 'Perandory-Regular');
  solveButton.style('font-size', '18px');
  solveButton.style('background-color', '#021024');
  solveButton.style('color', '#FFFFFF');
  solveButton.style('border', '2px solid #FFFFFF');
  solveButton.style('border-radius', '15px');
  solveButton.style('box-shadow', 'none');
  solveButton.mousePressed(() => {
    solveSound.play();
    startSolving();
  });
  solveButton.mouseOver(() => solveButton.style('box-shadow', '0px 4px 10px rgba(255, 255, 255, 0.6)'));
  solveButton.mouseOut(() => solveButton.style('box-shadow', 'none'));

  // Create "Tangled" button
  tangledButton = createButton('TANGLED');
  tangledButton.position(190, height - 550); // Next to Solve button
  tangledButton.size(100, 40);
  tangledButton.style('font-family', 'Perandory-Regular');
  tangledButton.style('font-size', '20px');
  tangledButton.style('background-color', '#021024');
  tangledButton.style('color', '#FFFFFF');
  tangledButton.style('border', '2px solid #FFFFFF');
  tangledButton.style('border-radius', '15px');
  tangledButton.style('box-shadow', 'none');
  tangledButton.mousePressed(() => {
    popSound.play();
    resetTangledLine();
  });
  tangledButton.mouseOver(() => tangledButton.style('box-shadow', '0px 4px 10px rgba(255, 255, 255, 0.6)'));
  tangledButton.mouseOut(() => tangledButton.style('box-shadow', 'none'));
}

function draw() {
  clear(); // Clear the canvas
  image(backgroundImage, 0, 0, width, height); // Set the background image

  colorOffset += 2; // Increment color offset for animation

  // Display the quote image if the flag is true
  if (showQuote) {
    image(quoteImage, width / 2 - quoteImage.width / 3 - 150, height / 4 - 180, quoteImage.width / 1.2, quoteImage.height / 1.2); // Adjusted size
  }

  // Add instructions text at the position of the removed Instruction button
  fill(255);
  textFont(customFont);
  textSize(25);
  textAlign(LEFT, CENTER);
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
  drawingContext.shadowBlur = 10;
  text("Click and drag to untangle your thoughts", 975, height - 550);
  drawingContext.shadowBlur = 0; // Reset shadow

  // Update solving animation
  if (solving) {
    solveProgress += 0.01; // Animation speed
    if (solveProgress >= 1) {
      solveProgress = 1;
      solving = false;
      for (let dot of tangledLine) {
        dot.isStaticColor = true; // Stop changing colors after straight line is complete
        dot.color = [255, 255, 255]; // Set all dots to white
      }
      messageTimer = 180; // Show message for 3 seconds
    }
  }

  // Draw the vivid multi-gradient tangled wire
  drawMultiGradientWire();

  // Draw draggable dots on the tangled line with animated colors
  drawDots();

  // Display the message "Attention is yours" for 3 seconds
  if (messageTimer > 0) {
    textSize(48);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Attention is yours", width / 2, height / 2);
    messageTimer--;
  }
}

function drawMultiGradientWire() {
  let numSegments = tangledLine.length;

  noFill();
  strokeWeight(1); // Adjust thickness of the string
  beginShape();

  curveVertex(startPoint.x, startPoint.y);
  curveVertex(startPoint.x, startPoint.y);

  for (let i = 0; i < numSegments; i++) {
    let t = (i + 1) / (numSegments + 1);

    // Generate multiple vivid colors cycling through the hue wheel
    let hue = (map(i, 0, numSegments, 0, 360) + colorOffset) % 360;
    stroke(color(`hsl(${hue}, 100%, 50%)`));

    // Solve animation logic
    let targetX = lerp(startPoint.x, endPoint.x, t);
    let targetY = lerp(startPoint.y, endPoint.y, t);

    let currentX = lerp(tangledLine[i].x, targetX, solveProgress);
    let currentY = lerp(tangledLine[i].y, targetY, solveProgress);

    if (isShaking) {
      currentX += random(-3, 3); // Add random shake
      currentY += random(-3, 3); // Add random shake
    }

    // Update dot positions along the line
    tangledLine[i].x = currentX;
    tangledLine[i].y = currentY;

    curveVertex(currentX, currentY);
  }

  curveVertex(endPoint.x, endPoint.y);
  curveVertex(endPoint.x, endPoint.y);

  endShape();
}

function drawDots() {
  for (let i = 0; i < tangledLine.length; i++) {
    if (!tangledLine[i].isStaticColor && !tangledLine[i].isBeingDragged) {
      // Update dot's color for continuous change only if not being dragged or static
      tangledLine[i].color = [random(255), random(255), random(255)];
    }

    // Set fill color based on updated RGB
    fill(tangledLine[i].color);
    noStroke();

    // Draw the dot
    ellipse(tangledLine[i].x, tangledLine[i].y, tangledLine[i].size, tangledLine[i].size);
  }
}

function mousePressed() {
  // Check if the quote image is visible and if the user clicks outside it
  if (showQuote) {
    if (
      mouseX < width / 2 - quoteImage.width / 2.5 ||
      mouseX > width / 2 + quoteImage.width / 2.5 ||
      mouseY < height / 4 ||
      mouseY > height / 4 + quoteImage.height / 1.25
    ) {
      showQuote = false; // Hide the quote image
    }
  }

  for (let i = 0; i < tangledLine.length; i++) {
    let d = dist(mouseX, mouseY, tangledLine[i].x, tangledLine[i].y);
    if (d < tangledLine[i].size / 2) {
      dragging = true;
      dragIndex = i;
      tangledLine[i].isBeingDragged = true; // Mark dot as being dragged
      showQuote = false; // Hide the quote when dragging starts
      isShaking = true; // Start shaking the tangled line

      // Play buzz sound when dragging starts
      if (!buzzSound.isPlaying()) {
        buzzSound.loop();
      }
      break;
    }
  }
}

function mouseDragged() {
  if (dragging && dragIndex !== -1) {
    tangledLine[dragIndex].x = constrain(mouseX, 0, width);
    tangledLine[dragIndex].y = constrain(mouseY, 0, height);
  }
}

function mouseReleased() {
  if (dragIndex !== -1) {
    tangledLine[dragIndex].isBeingDragged = false; // Mark dot as not being dragged
  }
  dragging = false;
  dragIndex = -1;
  isShaking = false; // Stop shaking the tangled line

  // Stop buzz sound when dragging ends
  if (buzzSound.isPlaying()) {
    buzzSound.stop();
  }
}

function startSolving() {
  solving = true;
  solveProgress = 0;
}

function resetTangledLine() {
  tangledLine = [];
  generateTangledLine();
}

function generateTangledLine() {
  for (let i = 0; i < 20; i++) {
    tangledLine.push({
      x: random(startPoint.x + 50, endPoint.x - 50),
      y: random(startPoint.y - 300, startPoint.y + 300),
      size: random(5, 15),
      color: [random(255), random(255), random(255)],
      isBeingDragged: false,
      isStaticColor: false
    });
  }
}

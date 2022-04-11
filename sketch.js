let osn;

// Total numbers to be collected
let goal = 500;

// Tracking the numbers
let refined = [];
let numbers = [];
let r, baseSize;
let buffer = 100;
let cols, rows;

// Info for refining
let refining = false;
let refineTX, refinteTY, refineBX, refineBY;

let lumon;

const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

// Info for "nope" state
let nope = false;
let nopeImg;
let nopeTime = 0;

// Info for "MDE" state
let mdeGIF = [];
let mde = false;
let mdeDone = false;
let mdeTime = 0;

// Info for 100% state
let completed = false;
let completedImg;
let completedTime = 0;

// Info for sharing
let shared = false;
let sharedImg;
let sharedTime = 0;

// Coordinates of your data
let coordinates = `0x6AF307:0x38A6B7`;

let shareDiv;

// for CRT Shader
let canvas, shaderLayer, crtShader, ctx;

// Function to pick coordinates
function randHex() {
  return floor(random(0, 256)).toString(16).toUpperCase();
}

function generateCoordinates() {
  let x = randHex() + randHex() + randHex();
  let y = randHex() + randHex() + randHex();
  coordinates = `${x}:${y}`;
}

function preload() {
  lumon = loadImage('images/lumon.png');
  nopeImg = loadImage('images/nope.png');
  completedImg = loadImage('images/100.png');
  sharedImg = loadImage('images/clipboard.png');
  mdeGIF[0] = loadImage('images/mde.gif');

  crtShader = loadShader('shaders/crt.vert.glsl', 'shaders/crt.frag.glsl')
}

function startOver() {
  generateCoordinates();
  // Create the space
  r = (smaller - buffer * 2) / 10;
  baseSize = r * 0.33;
  osn = new OpenSimplexNoise();
  cols = floor(width / r);
  rows = floor((height - buffer * 2) / r);

  let wBuffer = width - cols * r;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let x = i * r + r * 0.5 + wBuffer * 0.5;
      let y = j * r + r * 0.5 + buffer;
      // Initialize the number objects
      numbers[i + j * cols] = new Data(x, y);
    }
  }

  // Refinement bins
  for (let i = 0; i < 5; i++) {
    const w = width / 5;
    refined[i] = new Bin(w, i, goal / 5);
  }

  mde = false;
  mdeDone = false;
  mdeTime = 0;
  nopeTime = 0;
  nope = false;
  completed = false;
  shared = false;
  shareDiv.hide();
}
let zoff = 0;

let smaller;

function setup() {
  // Get the canvas context so we can grab the image data from it later
  canvas = createCanvas(windowWidth, windowHeight).canvas;
  ctx = canvas.getContext('2d');

  // force pixel density to 1 to improve perf on retina screens
  pixelDensity(1);
  // reduce screen res to improve performance
  scale(0.5);

  // p5 graphics element to draw our shader output to
  shaderLayer = createGraphics(windowWidth, windowHeight, WEBGL);
  shaderLayer.noStroke();  
  
  smaller = min(width, height);

  sharedImg.resize(smaller * 0.5, 0);
  nopeImg.resize(smaller * 0.5, 0);
  completedImg.resize(smaller * 0.5, 0);

  // Width for the share 100% button
  const shw = completedImg.width;
  const shh = completedImg.height;
  shareDiv = createDiv('');
  shareDiv.hide();
  //shareDiv.style("background-color", "#AAA");
  shareDiv.position(width * 0.5 - shw * 0.5, height * 0.5 - shh * 0.5);
  shareDiv.style('width', `${shw}px`);
  shareDiv.style('height', `${shh}px`);
  shareDiv.mousePressed(function () {
    let thenumbers = '';
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        thenumbers += random(emojis);
      }
      thenumbers += '\n';
    }
    const msg = `In refining ${coordinates} I have brought glory to the company.
Praise Kier.
${thenumbers}#mdrlumon #severance 🧇🐐🔢💯
lumon-industries.com`;

    // if (navigator.share) {
    //   console.log("using navigator share");
    // } else {
    console.log('navigator share not availabe, copy to clipboard!');
    navigator.clipboard.writeText(msg);
    shared = true;
    //}
  });

  // for (let i = 0; i < 1; i++) {
  //   loadImage('mde.gif', (img) => {
  //     mdeGIF[i] = img;
  //   });
  // }

  startOver();
}
function mousePressed() {
  // This is the worst if statement in the history of if statements
  if (!refining && !mde && !completed && !shared) {
    refineTX = mouseX;
    refineTY = mouseY;
    refineBX = mouseX;
    refineBY = mouseY;
    refining = true;
    nope = false;
  }
}

function mouseDragged() {
  refineBX = mouseX;
  refineBY = mouseY;
}

function mouseReleased() {
  refining = false;
  let countRed = 0;
  let total = 0;
  let refinery = [];
  for (let num of numbers) {
    if (num.inside(refineTX, refineTY, refineBX, refineBY)) {
      if (num.refined) {
        refinery.push(num);
        countRed++;
      }
      total++;
    }
    num.turn(255, 255, 255);
    num.refined = false;
  }
  // half of numbers must be refinable
  if (countRed > 0.5 * total) {
    const options = [];
    for (let bin of refined) {
      if (bin.count < bin.goal) {
        options.push(bin);
      }
    }
    const bin = random(options);
    for (let num of refinery) {
      num.refine(bin);
    }
  } else {
    refinery = [];
    // 2nd worst if statement in the history of time
    if (!completed && !shared) {
      nope = true;
    }
    nopeTime = millis();
  }
}

function draw() {
  colorMode(RGB);
  let sum = 0;
  for (let bin of refined) {
    sum += bin.count;
  }
  let percent = sum / goal;

  if (percent >= 0.75 && !mde && !mdeDone) {
    mde = true;
    mdeTime = millis();
  }

  if (millis() - mdeTime > 5 * 1000 && mde) {
    mdeDone = true;
    mde = false;
  }

  if (percent >= 1.0 && !completed && !shared) {
    // completedTime = millis();
    completed = true;
    shareDiv.show();
    console.log('completed!');
  }

  if (completed && shared) {
    completed = false;
    sharedTime = millis();
  }

  background(0);
  textFont('Courier');

  drawTop(percent);
  drawNumbers();
  drawBottom();

  drawBinned();

  imageMode(CORNER);
  image(lumon, width - lumon.width, 0);
  if (nope) {
    imageMode(CENTER);
    image(nopeImg, width * 0.5, height * 0.5);
    if (millis() - nopeTime > 1000) {
      nope = false;
    }
  }

  if (completed) {
    imageMode(CENTER);
    image(completedImg, width * 0.5, height * 0.5);
    // if (millis() - completedTime > 5000) {
    //   startOver();
    // }
  }

  if (shared) {
    imageMode(CENTER);
    image(sharedImg, width * 0.5, height * 0.5);
    if (millis() - sharedTime > 10000) {
      startOver();
    }
  }

  if (mde) {
    colorMode(HSB);
    let dim = 5;
    let yoff = 100;
    let inc = 0;
    let index = 0;
    for (let i = 0; i < dim; i++) {
      let xoff = 100;
      for (let j = 0; j < dim; j++) {
        let w = width / dim;
        let h = height / dim;
        noStroke();
        let hu = map(osn.noise3D(xoff, yoff, zoff * 2), -1, 1, -100, 500);
        fill(hu, 255, 255, 0.2);
        stroke(hu, 255, 255);
        strokeWeight(4);
        imageMode(CORNER);
        image(mdeGIF[0], i * w, j * h, w, h);
        index++;
        rectMode(CORNER);
        rect(i * w, j * h, w, h);
        xoff += 5;
      }
      yoff += 5;
    }
  }
  // push();
  // imageMode(CENTER);
  // translate(width * 0.5, height * 0.5);
  // rotate(frameCount * 0.05);
  // image(mdeGIF, 0, 0);
  // pop();

  shaderLayer.rect(0, 0, width, height);
  shaderLayer.shader(crtShader);
  
  // pass the image from canvas context in to shader as uniform
  crtShader.setUniform('u_tex', ctx.getImageData(0, 0, width, height));
  crtShader.setUniform('u_resolution', [width, height]);
  
  // Resetting the backgroudn to black to check we're not seeing the original drawing output 
  background(0);
  imageMode(CORNER);
  image(shaderLayer, 0, 0, width, height);

  drawFPS();
}

function drawTop(percent) {
  rectMode(CORNER);
  stroke(255);
  let w = width * 0.9;
  strokeWeight(2);
  let wx = (width - w) * 0.5;
  noFill();
  rect(wx, 25, w, 50);
  noStroke();
  fill(255);

  let realW = w - lumon.width * 0.4;
  let pw = realW * percent;

  rect(wx + realW - pw, 25, pw, 50);
  // rect(w * (1.0 - percent) + (width - w) * 0.5, 25, pw, 50);
  noFill();
  fill(0);
  stroke(255);
  strokeWeight(4);
  textSize(32);
  textFont('Arial');
  text(`${floor(nf(percent * 100, 2, 0))}% Complete`, w * 0.33, 50);
}

function drawNumbers() {
  rectMode(CENTER);
  noFill();
  strokeWeight(1);
  line(0, buffer, width, buffer);
  line(0, height - buffer, width, height - buffer);
  //rect(width * 0.5, height * 0.5, width * 2, 20 + height - buffer * 2);
  //rect(width * 0.5, height * 0.5, width * 2, 30 + height - buffer * 2);

  let yoff = 0;

  const inc = 0.2;
  for (let i = 0; i < cols; i++) {
    let xoff = 0;
    for (let j = 0; j < rows; j++) {
      let num = numbers[i + j * cols];

      if (num.binIt) {
        num.goBin();
        num.show();
        continue;
      }

      let n = osn.noise3D(xoff, yoff, zoff) - 0.4;
      if (n < 0) {
        n = 0;
        num.goHome();
      } else {
        num.x += random(-1, 1);
        num.y += random(-1, 1);
      }

      let sz = n * baseSize * 4 + baseSize;
      let d = dist(mouseX, mouseY, num.x, num.y);
      if (d < width * 0.1) {
        //sz += map(d, 0, width * 0.1, 24, 0);
        num.x += random(-1, 1);
        num.y += random(-1, 1);
      } else {
        num.goHome();
      }
      num.size(sz);
      num.show();
      xoff += inc;
    }
    yoff += inc;
  }
  zoff += 0.005;
}

function drawBottom() {
  for (let i = 0; i < refined.length; i++) {
    refined[i].show();
  }

  if (refining) {
    push();
    rectMode(CORNERS);
    stroke(255);
    noFill();
    rect(refineTX, refineTY, refineBX, refineBY);

    for (let num of numbers) {
      if (
        num.inside(refineTX, refineTY, refineBX, refineBY) &&
        num.sz > baseSize
      ) {
        num.turn(255, 0, 0);
        num.refined = true;
      } else {
        num.turn(255, 255, 255);
        num.refined = false;
      }
    }
    pop();
  }

  rectMode(CORNER);
  fill(255);
  rect(0, height - 20, width, 20);
  fill(0);
  textFont('Courier');
  textAlign(CENTER, CENTER);
  textSize(baseSize * 0.8);
  text(coordinates, width * 0.5, height - 10);
}

function drawBinned() {
  for (let num of numbers) {
    if (num.binIt) num.show();
  }
}

function drawFPS() {
  textSize(24)
  fill(255)
  noStroke();
  text(frameRate().toFixed(2), 50, 25);
}

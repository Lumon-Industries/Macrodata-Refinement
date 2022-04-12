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
let shaderLayer, crtShader;
let g; //p5 graphics instance

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
  cols = floor(g.width / r);
  rows = floor((g.height - buffer * 2) / r);

  let wBuffer = g.width - cols * r;
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
    const w = g.width / 5;
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
  createCanvas(windowWidth, windowHeight);
  
  // create a downscaled graphics buffer to draw to, we'll upscale after applying crt shader
  g = createGraphics(windowWidth, windowHeight);
  
  // force pixel density to 1 to improve perf on retina screens
  pixelDensity(1);
  
  // p5 graphics element to draw our shader output to
  shaderLayer = createGraphics(g.width, g.height, WEBGL);
  shaderLayer.noStroke();  
  crtShader.setUniform('u_resolution', [g.width, g.height]);
  
  smaller = min(g.width, g.height);

  sharedImg.resize(smaller * 0.5, 0);
  nopeImg.resize(smaller * 0.5, 0);
  completedImg.resize(smaller * 0.5, 0);

  // Width for the share 100% button
  const shw = completedImg.width;
  const shh = completedImg.height;
  shareDiv = createDiv('');
  shareDiv.hide();
  //shareDiv.style("background-color", "#AAA");
  shareDiv.position(g.width * 0.5 - shw * 0.5, g.height * 0.5 - shh * 0.5);
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
  g.colorMode(RGB);
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

  g.background(2);
  g.textFont('Courier');

  drawTop(percent);
  drawNumbers();
  drawBottom();

  drawBinned();

  g.imageMode(CORNER);
  g.image(lumon, g.width - lumon.width, 0);
  if (nope) {
    g.imageMode(CENTER);
    g.image(nopeImg, g.width * 0.5, g.height * 0.5);
    if (millis() - nopeTime > 1000) {
      nope = false;
    }
  }

  if (completed) {
    g.imageMode(CENTER);
    g.image(completedImg, g.width * 0.5, g.height * 0.5);
    // if (millis() - completedTime > 5000) {
    //   startOver();
    // }
  }

  if (shared) {
    g.imageMode(CENTER);
    g.image(sharedImg, g.width * 0.5, g.height * 0.5);
    if (millis() - sharedTime > 10000) {
      startOver();
    }
  }

  if (mde) {
    g.colorMode(HSB);
    let dim = 5;
    let yoff = 100;
    let inc = 0;
    let index = 0;
    for (let i = 0; i < dim; i++) {
      let xoff = 100;
      for (let j = 0; j < dim; j++) {
        let w = g.width / dim;
        let h = g.height / dim;
        g.noStroke();
        let hu = map(osn.noise3D(xoff, yoff, zoff * 2), -1, 1, -100, 500);
        g.fill(hu, 255, 255, 0.2);
        g.stroke(hu, 255, 255);
        g.strokeWeight(4);
        g.imageMode(CORNER);
        g.image(mdeGIF[0], i * w, j * h, w, h);
        index++;
        g.rectMode(CORNER);
        g.rect(i * w, j * h, w, h);
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

  shaderLayer.rect(0, 0, g.width, g.height);
  shaderLayer.shader(crtShader);
  
  // pass the image from canvas context in to shader as uniform
  crtShader.setUniform('u_tex', g);
  
  // Resetting the backgroudn to black to check we're not seeing the original drawing output 
  background(0);
  imageMode(CORNER);
  image(shaderLayer, 0, 0, g.width, g.height);

  drawFPS();
}

function drawTop(percent) {
  g.rectMode(CORNER);
  g.stroke(255);
  let w = g.width * 0.9;
  g.strokeWeight(2);
  let wx = (g.width - w) * 0.5;
  g.noFill();
  g.rect(wx, 25, w, 50);
  g.noStroke();
  g.fill(255);

  let realW = w - lumon.width * 0.4;
  let pw = realW * percent;

  g.rect(wx + realW - pw, 25, pw, 50);
  // rect(w * (1.0 - percent) + (width - w) * 0.5, 25, pw, 50);
  g.noFill();
  g.fill(0);
  g.stroke(255);
  g.strokeWeight(4);
  g.textSize(32);
  g.textFont('Arial');
  g.text(`${floor(nf(percent * 100, 2, 0))}% Complete`, w * 0.33, 50);
}

function drawNumbers() {
  g.rectMode(CENTER);
  g.noFill();
  g.strokeWeight(1);
  g.line(0, buffer, g.width, buffer);
  g.line(0, g.height - buffer, g.width, g.height - buffer);
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
      if (d < g.width * 0.1) {
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
    g.push();
    g.rectMode(CORNERS);
    g.stroke(255);
    g.noFill();
    g.rect(refineTX, refineTY, refineBX, refineBY);

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
    g.pop();
  }

  g.rectMode(CORNER);
  g.fill(255);
  g.rect(0, g.height - 20, g.width, 20);
  g.fill(0);
  g.textFont('Courier');
  g.textAlign(CENTER, CENTER);
  g.textSize(baseSize * 0.8);
  g.text(coordinates, g.width * 0.5, g.height - 10);
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

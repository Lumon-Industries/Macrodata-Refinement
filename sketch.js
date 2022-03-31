let osn;

let goal = 1000;
let refined = [];
let numbers = [];
let r, baseSize;
let buffer = 100;
let cols, rows;

let refining = false;
let refineTX, refinteTY, refineBX, refineBY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  r = (height - buffer * 2) / 10;
  baseSize = r * 0.33;
  osn = new OpenSimplexNoise();
  cols = floor(width / r);
  rows = floor((height - buffer * 2) / r);

  let wBuffer = width - cols * r;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let x = i * r + r * 0.5 + wBuffer * 0.5;
      let y = j * r + r * 0.5 + buffer;
      numbers[i + j * cols] = new Data(x, y);
    }
  }

  for (let i = 0; i < 5; i++) {
    const w = width / 5;
    refined[i] = new Bin(w, i);
  }
}
let zoff = 0;

function mousePressed() {
  if (!refining) {
    refineTX = mouseX;
    refineTY = mouseY;
    refineBX = mouseX;
    refineBY = mouseY;
    refining = true;
  }
}

function mouseDragged() {
  refineBX = mouseX;
  refineBY = mouseY;
}

function mouseReleased() {
  refining = false;
  allGood = true;
  let refinery = [];
  for (let num of numbers) {
    if (num.inside(refineTX, refineTY, refineBX, refineBY)) {
      if (num.refined) refinery.push(num);
      // else allGood = false;
    }
    num.turn(255, 255, 255);
    num.refined = false;
  }
  if (allGood) {
    const bin = random(refined);
    for (let num of refinery) {
      num.refine(bin);
    }
  } else {
    refinery = [];
  }
}

function draw() {
  let sum = 0;
  for (let bin of refined) {
    sum += bin.count;
  }
  let percent = sum / goal;

  background(0);
  textFont('Courier');

  drawTop(percent);
  drawNumbers();
  drawBottom();
}

function drawTop(percent) {
  rectMode(CORNER);
  stroke(255);
  let w = width * 0.9;
  strokeWeight(2);
  rect((width - w) * 0.5, 25, w, 50);
  noStroke();
  fill(255);
  rect(w * (1.0 - percent) + (width - w) * 0.5, 25, w * percent, 50);
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

      let n = osn.noise3D(xoff, yoff, zoff) - 0.35;
      if (n < 0) {
        n = 0;
        num.goHome();
      } else {
        num.x += random(-1, 1);
        num.y += random(-1, 1);
      }

      let sz = n * baseSize * 2 + baseSize;
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
  zoff += 0.02;
}

function drawBottom() {
  for (let i = 0; i < refined.length; i++) {
    refined[i].show();
  }

  if (refining) {
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
  }
}

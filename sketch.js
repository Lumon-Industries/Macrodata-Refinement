let osn;

let goal = 10000;
let refined = [0, 0, 0, 0, 0];
let numbers = [];
let r = 36;
let buffer = 100;
let cols, rows;

function setup() {
  createCanvas(windowWidth, windowHeight);
  osn = new OpenSimplexNoise();
  cols = width / r;
  rows = (height - buffer * 2) / r;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      numbers[i + j * cols] = floor(random(10));
    }
  }
}
let zoff = 0;
function draw() {
  let sum = refined.reduce((a, b) => a + b, 0);
  let percent = sum / goal;

  background(0);
  textFont('Courier');

  let yoff = 0;

  // TOP

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

  // NUMBERS
  rectMode(CENTER);
  noFill();
  strokeWeight(1);
  rect(width * 0.5, height * 0.5, width * 2, 20 + height - buffer * 2);
  rect(width * 0.5, height * 0.5, width * 2, 30 + height - buffer * 2);

  const inc = 0.1;
  for (let i = 0; i < cols; i++) {
    let xoff = 0;
    for (let j = 0; j < rows; j++) {
      textAlign(CENTER, CENTER);
      push();
      let x = i * r + r * 0.5;
      let y = j * r + r * 0.5 + buffer;
      fill(255);
      noStroke();
      let n = osn.noise3D(xoff, yoff, zoff) - 0.5;
      if (n < 0) {
        n = 0;
      } else {
        randomSeed(x + y);
        x += random(-4, 4);
        y += random(-4, 4);
      }

      let sz = n * 48 + 12;
      let d = dist(mouseX, mouseY, x, y);
      if (d < width * 0.1) {
        sz += map(d, 0, width * 0.1, 24, 0);
        randomSeed(x + y);
        x += random(-4, 4);
        y += random(-4, 4);
      }
      textSize(sz);
      text(numbers[i + j * cols], x, y);
      pop();
      xoff += inc;
    }
    yoff += inc;
  }
  zoff += 0.01;

  // BOTTOM
  for (let i = 0; i < refined.length; i++) {
    let perc = refined[i] / (goal / refined.length);
    rectMode(CENTER);
    let w = width / refined.length;
    let rw = w - w * 0.25;
    stroke(255);
    let x = i * w + w * 0.5;
    let y = height - buffer * 0.6;
    strokeWeight(1);
    rect(x, y, rw, buffer * 0.25);
    rect(x, y + buffer * 0.3, rw, buffer * 0.25);
    textSize(16);
    textFont('Arial');
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    text(nf(i, 2, 0), x, y);
    textAlign(LEFT, CENTER);
    stroke(255);
    strokeWeight(2);
    fill(0);
    text(`${floor(nf(perc, 2, 0))}%`, x - rw * 0.45, y + buffer * 0.3);
  }
}

// for CRT Shader
let shaderLayer, crtShader;
let g; //p5 graphics instance
let useShader;

// Background and Foreground colours
const mobilePalette = {
  BG: '#010A13',
  FG: '#ABFFE9',
  SELECT: '#EEFFFF',
  LEVELS: {
    WO: '#05C3A8',
    FC: '#1EEFFF',
    DR: '#DF81D5',
    MA: '#F9ECBB',
  },
};

const shaderPalette = {
  BG: '#111111',
  FG: '#99f',
  SELECT: '#fff',
  LEVELS: {
    WO: '#17AC97',
    FC: '#4ABCC5',
    DR: '#B962B0',
    MA: '#D4BB5E',
  },
};

let palette = mobilePalette;

function preload() {
  crtShader = loadShader('shaders/crt.vert.glsl', 'shaders/crt.frag.glsl');
}

const columns = 15;
const dots = [];
const buckets = [];
let yLine;
let w;
let smaller;
let fullW;

function setup() {
  createCanvas(windowWidth, windowHeight);
  fullW = min(windowWidth, 1280);

  frameRate(30);

  // create a downscaled graphics buffer to draw to, we'll upscale after applying crt shader
  g = createGraphics(windowWidth, windowHeight);

  // We don't want to use shader on mobile
  useShader = !isTouchScreenDevice();

  // The shader boosts colour values so we reset the palette if using shader
  if (useShader) {
    palette = shaderPalette;
  }

  // force pixel density to 1 to improve perf on retina screens
  pixelDensity(1);

  // p5 graphics element to draw our shader output to
  shaderLayer = createGraphics(g.width, g.height, WEBGL);
  shaderLayer.noStroke();
  crtShader.setUniform('u_resolution', [g.width, g.height]);

  smaller = min(g.width, g.height);

  yLine = g.height / 4;
  w = fullW / columns;
  for (let i = 0; i < columns; i++) {
    const x = (i * fullW) / columns + fullW / columns / 2;
    const y = yLine + w * 0.5;
    dots.push(new Dot(i, x, y, w * 0.5));
    buckets.push(new Bucket(i, 0));
  }
}

function keyPressed() {
  let keys = '1234567890qwertyuiopasdfghjklzxcvbnm'.split('');
  if (keys.includes(key.toLowerCase())) {
    let i = keys.indexOf(key) % columns;
    if (dots[i]) dots[i].go();
  }
}

function draw() {
  g.background(palette.BG);
  g.push();
  const diff = g.width - fullW;
  g.translate(diff / 2, 0);
  g.rectMode(CORNER);
  g.stroke(palette.FG);

  // Frame
  g.strokeWeight(3);
  g.line(0, yLine, fullW, yLine);
  for (let i = 0; i < columns + 1; i++) {
    g.line(i * w, yLine, i * w, yLine + w * 1);
  }

  g.line(0, g.height - yLine * 0.25, fullW, g.height - yLine * 0.25);
  for (let i = 0; i < columns + 1; i++) {
    g.line(i * w, g.height - yLine * 0.25, i * w, g.height - yLine * 0.25 - w * 2);
  }

  // Top Bar
  const topBarTotal = 11;
  const topBarSpacing = fullW / topBarTotal;
  const y = yLine * 0.4;
  for (let i = 0; i < topBarTotal; i++) {
    const x = topBarSpacing * i + (i / topBarTotal) * (topBarSpacing - w);
    if (i == 0 || i > topBarTotal - 4) {
      g.noFill();
      g.strokeWeight(3);
      g.stroke(palette.FG);
      g.square(x, y, w);
    }
    if (i == 0) g.circle(x + w * 0.5, y + w * 0.5, w * 0.5);
    if (i == 1) {
      for (let j = 1; j < 5; j++) {
        g.ellipse(x + w * 0.5, y + j * w * 0.2, w * 0.75, w * 0.2);
      }
    }
    if (i == 2) {
      g.push();
      g.strokeWeight(w * 0.2);
      g.line(x + w * 0.25, y + w * 0.25, x + w * 0.75, y + w * 0.75);
      g.line(x + w * 0.75, y + w * 0.25, x + w * 0.25, y + w * 0.75);
      g.pop();
    }
    if (i == 3) {
      g.push();
      g.rectMode(CENTER);
      g.square(x + w * 0.5, y + w * 0.5, w * 0.75);
      g.pop();
    }
    if (i == 4) {
      for (let n = 0; n < 2; n++) {
        for (let m = 0; m < 2; m++) {
          g.rectMode(CORNER);
          g.square(x + w * 0.125 + n * w * 0.375, y + w * 0.125 + m * w * 0.375, w * 0.375);
        }
      }
    }
    if (i == 5) {
      for (let n = 0; n < 4; n++) {
        for (let m = 0; m < 4; m++) {
          g.rectMode(CORNER);
          g.square(x + w * 0.125 + n * w * 0.1875, y + w * 0.125 + m * w * 0.1875, w * 0.1875);
        }
      }
    }

    if (i == 8) {
      for (let j = 1; j < 4; j++) {
        g.line(x + w * 0.25, y + j * w * 0.25, x + w * 0.75, y + j * w * 0.25);
      }
    }
    if (i == 9) {
      g.fill(palette.FG);
      g.circle(x + w * 0.25, y + w * 0.25, w * 0.25);
      g.strokeWeight(w * 0.15);
      g.line(x + w * 0.25, y + w * 0.25, x + w * 0.75, y + w * 0.75);
    }
  }

  g.line(topBarSpacing, y, topBarSpacing * 8 - topBarSpacing / topBarTotal, y);
  g.line(topBarSpacing, y + w, topBarSpacing * 8 - topBarSpacing / topBarTotal, y + w);

  g.fill(palette.FG);
  g.noStroke();
  g.textSize(24);
  g.textAlign(CENTER, CENTER);
  g.text('⇦ MAIN LEVEL ⇨', fullW / 2, yLine * 0.25);

  for (let i = columns - 1; i >= 0; i--) {
    if (!dots[i]) continue;
    dots[i].show();
    if (dots[i].update()) {
      buckets[i].dots.push(dots[i]);
      dots[i] = null;
      for (let j = 0; j < columns; j++) {
        if (!dots[j] && buckets[j].dots.length < 3 && random(1) < 0.25) {
          const x = (j * fullW) / columns + fullW / columns / 2;
          const y = yLine + w * 0.5;
          dots[j] = new Dot(j, x, y, w * 0.5);
        }
      }
    }
  }

  for (let i = 0; i < columns; i++) {
    buckets[i].show();
  }

  g.pop();
  for (let i = 0; i < columns; i++) {
    if (useShader) {
      shaderLayer.rect(0, 0, g.width, g.height);
      shaderLayer.shader(crtShader);

      // pass the image from canvas context in to shader as uniform
      crtShader.setUniform('u_tex', g);

      // Resetting the backgroudn to black to check we're not seeing the original drawing output
      background(palette.BG);
      imageMode(CORNER);
      image(shaderLayer, 0, 0, g.width, g.height);
    } else {
      image(g, 0, 0, g.width, g.height);
    }
  }
}

class Dot {
  constructor(i, x, y, r) {
    this.i = i;
    this.x = x;
    this.y = y;
    this.r = r;
    this.going = false;
    this.speed = 20;
  }

  show() {
    g.stroke(palette.FG);
    g.strokeWeight(3);
    g.noFill();
    g.circle(this.x, this.y, this.r);
  }

  update() {
    if (this.going) {
      this.y += this.speed;
      const total = buckets[this.i].dots.length;
      const boundary = g.height - yLine * 0.25 - this.r * 0.8 - this.r * total * 1.25;
      if (this.y > boundary) {
        this.y = boundary;
        this.going = false;
        return true;
      }
    }
  }

  go() {
    this.going = true;
  }
}

class Bucket {
  constructor(i, count) {
    this.i = i;
    this.dots = [];
    this.count = count;
  }

  show() {
    for (let dot of this.dots) {
      dot.show();
    }
  }
}

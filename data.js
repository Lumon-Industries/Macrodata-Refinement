class Data {
  constructor(x, y) {
    this.num = floor(random(10));
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.color = palette.FG; //TODO: pass this in as arg rather than global variable?
    this.alpha = 255;
    this.sz = baseSize;
    this.refined = false;
    this.binIt = false;
    this.bin = undefined;
    this.binPauseTime = 8;
    this.binPause = this.binPauseTime;
  }
  
  refine(bin) {
    this.binIt = true;
    this.bin = bin;
  }
  
  goBin() {
    // This is a band-aid
    if (this.bin) {
      this.bin.open();
      if (this.binPause <= 0) {
        const dx = this.bin.x - this.x;
        const dy = this.bin.y - this.y;
        let easing = map(abs(dy), this.bin.y, 0, 0.02, 0.1);
        this.x += dx * easing;
        this.y += max(dy * easing, -20);
        this.alpha = map(this.y, this.homeY, this.bin.y, 255, 5);
        this.bin.lastRefinedTime = millis();
      } else {
        this.binPause--;
      }
      if (dist(this.x, this.y, this.bin.x, this.bin.y) < 2) {
        this.bin.addNumber();
        this.num = floor(random(10));
        this.x = this.homeX;
        this.y = this.homeY;
        this.refined = false;
        this.binIt = false;
        this.bin = undefined;
        this.color = palette.FG;
        this.alpha = 255;
        this.binPause = this.binPauseTime;
      }
    }
  }

  goHome() {
    this.x = lerp(this.x, this.homeX, 0.1);
    this.y = lerp(this.y, this.homeY, 0.1);
    this.sz = lerp(this.sz, baseSize, 0.1);
  }

  size(sz) {
    this.sz = sz;
  }

  turn(newColor) {
    this.color = newColor;
  }

  inside(x1, y1, x2, y2) {
    return (
      this.x > min(x1, x2) &&
      this.x < max(x1, x2) &&
      this.y > min(y1, y2) &&
      this.y < max(y1, y2)
    );
  }

  show() {
    g.textFont('Courier');
    // if the digit is ready to be binned, lerp to a large size proprtional to the pause time
    const digitSize = this.binIt ? lerp(this.sz, baseSize * 2.5, map(this.binPause, this.binPauseTime, 0, 0, 1)) : this.sz;
    g.textSize(digitSize);
    g.textAlign(CENTER, CENTER);

    const col = color(this.color);
    col.setAlpha(this.alpha);
    g.fill(col);
    g.stroke(col);    
    g.text(this.num, this.x, this.y);
    // rectMode(CENTER);
    // noFill();
    // square(this.x, this.y, r);
  }

  resize(newX, newY) {
    this.homeX = newX;
    this.homeY = newY;
  }
}

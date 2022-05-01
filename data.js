class Data {
  constructor(x, y) {
    this.num = floor(random(10));
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.color = palette.FG; //TODO: pass this in as arg rather than global variable?
    this.sz = baseSize;
    this.refined = false;
    this.binIt = false;
    this.bin = undefined;
  }
  
  refine(bin) {
    this.binIt = true;
    this.bin = bin;
  }
  
  goBin() {
    // This is a band-aid
    if (this.bin) {
      this.bin.open();
      let targetX = g.width / 2;
      let targetY = g.height;
      if (this.bin) this.x = lerp(this.x, this.bin.x, random(0, 0.2));
      this.y = lerp(this.y, this.bin.y, random(0, 0.2));
      this.x += random(-5, 5);
      this.y += random(-5, 5);
      if (dist(this.x, this.y, this.bin.x, this.bin.y) < 2) {
        this.bin.addNumber();
        this.num = floor(random(10));
        this.x = this.homeX;
        this.y = this.homeY;
        this.refined = false;
        this.binIt = false;
        this.bin = undefined;
        this.color = palette.FG;
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
    g.textSize(this.sz);
    g.textAlign(CENTER, CENTER);
    g.fill(this.color);
    
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

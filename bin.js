class Bin {
  constructor(w, i) {
    this.w = w;
    this.i = i;
    this.x = i * w + w * 0.5;
    this.y = height - buffer * 0.6;
    this.count = 0;
  }

  show() {
    let perc = this.count / (goal / refined.length);
    rectMode(CENTER);
    let rw = this.w - this.w * 0.25;
    stroke(255);
    strokeWeight(1);
    noFill();
    rectMode(CENTER);
    rect(this.x, this.y, rw, buffer * 0.25);
    rect(this.x, this.y + buffer * 0.3, rw, buffer * 0.25);
    fill(255);
    noStroke();
    rectMode(CORNER);
    let h = buffer * 0.25;
    rect(this.x - rw * 0.5, this.y + buffer * 0.3 - h * 0.5, rw * perc, h);
    textSize(16);
    textFont('Arial');
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    text(nf(this.i, 2, 0), this.x, this.y);
    textAlign(LEFT, CENTER);
    stroke(255);
    strokeWeight(2);
    fill(0);
    text(
      `${floor(nf(100 * perc, 2, 0))}%`,
      this.x - rw * 0.45,
      this.y + buffer * 0.3
    );
  }
}

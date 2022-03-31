const keys = ['WO', 'FC', 'DR', 'MA'];

class Bin {
  constructor(w, i, goal) {
    this.w = w;
    this.i = i;
    this.x = i * w + w * 0.5;
    this.y = height - buffer * 0.75;
    this.count = 0;
    this.goal = goal;

    this.levelGoal = this.goal / 4;

    this.levels = {
      WO: 0,
      FC: 0,
      DR: 0,
      MA: 0,
    };

    this.showLevels = false;
    this.showTime = 0;
  }

  addNumber() {
    const options = [];
    for (let key of keys) {
      if (this.levels[key] < this.levelGoal) {
        options.push(key);
      }
    }
    const key = random(options);
    this.levels[key]++;

    this.showLevels = true;
    this.showTime = millis();
  }

  show() {
    push();
    this.count =
      this.levels.WO + this.levels.FC + this.levels.DR + this.levels.MA;

    this.count = constrain(this.count, 0, this.goal);
    let perc = this.count / this.goal;
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

    if (this.showLevels) {
      rectMode(CENTER);
      let levelH = buffer * 1.7;
      let levelY = this.y - buffer;
      stroke(255);
      fill(0);
      rect(this.x, levelY, rw, levelH);

      push();
      translate(this.x + rw * 0.5, height - buffer);
      rectMode(CORNER);
      stroke(255);
      fill(0);
      rotate(-PI / 4);
      rect(0, 0, width * 0.05, 10);
      pop();
      push();
      translate(this.x - rw * 0.5 - 8, height - buffer + 8);
      rectMode(CORNER);
      stroke(255);
      fill(0);
      rotate(PI + PI / 4);
      rect(0, 0, width * 0.05, 10);
      pop();

      for (let i = 1; i < 5; i++) {
        rectMode(CORNER);
        stroke(255);
        noFill();
        rect(
          this.x - rw * 0.25,
          levelY - buffer + i * buffer * 0.35,
          rw * 0.7,
          buffer * 0.15
        );

        fill(255);
        let w = (rw * 0.7 * this.levels[keys[i - 1]]) / this.levelGoal;
        rect(
          this.x - rw * 0.25,
          levelY - buffer + i * buffer * 0.35,
          w,
          buffer * 0.15
        );

        textAlign(LEFT, CENTER);
        noStroke();
        fill(255);
        text(
          keys[i - 1],
          this.x - rw * 0.45,
          levelY - buffer + i * buffer * 0.35 + buffer * 0.075
        );
      }

      if (millis() - this.showTime > 1000) this.showLevels = false;
    }
    pop();
  }
}

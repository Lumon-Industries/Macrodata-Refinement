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
    g.push();
    this.count =
      this.levels.WO + this.levels.FC + this.levels.DR + this.levels.MA;

    this.count = constrain(this.count, 0, this.goal);
    let perc = this.count / this.goal;
    g.rectMode(CENTER);
    let rw = this.w - this.w * 0.25;
    g.stroke(255);
    g.strokeWeight(1);
    g.noFill();
    g.rectMode(CENTER);
    g.rect(this.x, this.y, rw, buffer * 0.25);
    g.rect(this.x, this.y + buffer * 0.3, rw, buffer * 0.25);
    g.fill(255);
    g.noStroke();
    g.rectMode(CORNER);
    let h = buffer * 0.25;
    g.rect(this.x - rw * 0.5, this.y + buffer * 0.3 - h * 0.5, rw * perc, h);
    g.textSize(16);
    g.textFont('Arial');
    g.textAlign(CENTER, CENTER);
    g.fill(255);
    g.noStroke();
    g.text(nf(this.i, 2, 0), this.x, this.y);
    g.textAlign(LEFT, CENTER);
    g.stroke(255);
    g.strokeWeight(2);
    g.fill(0);
    g.text(
      `${floor(nf(100 * perc, 2, 0))}%`,
      this.x - rw * 0.45,
      this.y + buffer * 0.3
    );

    if (this.showLevels) {
      g.rectMode(CENTER);
      let levelH = buffer * 1.7;
      let levelY = this.y - buffer;
      g.stroke(255);
      g.fill(0);
      g.rect(this.x, levelY, rw, levelH);

      g.push();
      g.translate(this.x + rw * 0.5, g.height - buffer);
      g.rectMode(CORNER);
      g.stroke(255);
      g.fill(0);
      g.rotate(-PI / 4);
      g.rect(0, 0, g.width * 0.05, 10);
      g.pop();
      g.push();
      g.translate(this.x - rw * 0.5 - 8, g.height - buffer + 8);
      g.rectMode(CORNER);
      g.stroke(255);
      g.fill(0);
      g.rotate(PI + PI / 4);
      g.rect(0, 0, g.width * 0.05, 10);
      g.pop();

      for (let i = 1; i < 5; i++) {
        g.rectMode(CORNER);
        g.stroke(255);
        g.noFill();
        g.rect(
          this.x - rw * 0.25,
          levelY - buffer + i * buffer * 0.35,
          rw * 0.7,
          buffer * 0.15
        );

        g.fill(255);
        let w = (rw * 0.7 * this.levels[keys[i - 1]]) / this.levelGoal;
        g.rect(
          this.x - rw * 0.25,
          levelY - buffer + i * buffer * 0.35,
          w,
          buffer * 0.15
        );

        g.textAlign(g.LEFT, g.CENTER);
        g.noStroke();
        g.fill(255);
        g.text(
          keys[i - 1],
          this.x - rw * 0.45,
          levelY - buffer + i * buffer * 0.35 + buffer * 0.075
        );
      }

      if (millis() - this.showTime > 1000) this.showLevels = false;
    }
    g.pop();
  }
}

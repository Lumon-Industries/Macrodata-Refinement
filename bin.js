const keys = ['WO', 'FC', 'DR', 'MA'];
const maxLidAngle = 45;
const closedLidAngle = 180;
const maxShowTime = 1000;

let levelH = buffer * 1.7;

class Bin {
  constructor(w, i, goal) {
    this.w = w;
    this.i = i;
    this.x = i * w + w * 0.5;
    this.y = height - buffer * 0.75;
    this.count = 0;
    this.goal = goal;

    this.levelGoal = this.goal / 4;

    this.levelsYOffset = levelH;

    this.levels = {
      WO: 0,
      FC: 0,
      DR: 0,
      MA: 0,
    };

    this.showLevels = false;
    this.closingAnimation = false;
    this.openingAnimation = false;
    this.lidAngle = closedLidAngle;
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

  open() {
    if (!this.showLevels) {
      // Only start the animation if the bin is closed
      this.lidAngle = closedLidAngle;
      this.animationStartTime = millis();
      this.openingAnimation = true;
      this.showLevels = true;
    }
  }

  show() {
    push();
    this.count =
      this.levels.WO + this.levels.FC + this.levels.DR + this.levels.MA;

    this.count = constrain(this.count, 0, this.goal);
    let perc = this.count / this.goal;
    rectMode(CENTER);
    let rw = this.w - this.w * 0.25;

    if (this.showLevels) {
      this.drawLevels(rw, buffer);
    }

    this.drawBottomOutlines(rw, buffer);

    this.drawProgressBar(rw, buffer, perc);
    this.writeIndex();
    this.writePercentage(perc, rw, buffer);

    pop();
  }

  drawBottomOutlines(rw, buffer) {
    stroke(255);
    strokeWeight(1);
    fill(0);

    rectMode(CENTER);
    rect(this.x, this.y, rw, buffer * 0.25);
    rect(this.x, this.y + buffer * 0.3, rw, buffer * 0.25);
  }

  drawProgressBar(rw, buffer, perc) {
    fill(255);
    noStroke();
    rectMode(CORNER);

    let h = buffer * 0.25;
    rect(this.x - rw * 0.5, this.y + buffer * 0.3 - h * 0.5, rw * perc, h);
  }

  writeIndex() {
    textSize(16);
    textFont('Arial');
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    text(nf(this.i, 2, 0), this.x, this.y);
  }

  writePercentage(perc, rw, buffer) {
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

  drawLevels(rw, buffer) {
    rectMode(CENTER);
    let levelY = this.y - buffer;

    // Draw main outline
    stroke(255);
    fill(0);
    rect(this.x, levelY + this.levelsYOffset, rw, levelH);

    this.drawBinLids(rw, buffer);

    for (let i = 1; i < 5; i++) {
      this.drawLevel(i, levelY + this.levelsYOffset, rw, buffer);
    }

    if (millis() - this.showTime > maxShowTime) {
      if (!this.openingAnimation) {
        this.lidAngle = maxLidAngle;
        if (!this.closingAnimation) {
          this.animationStartTime = millis();
        }
        this.closingAnimation = true;
        this.showLevels = true;
      }
    }

    if (this.openingAnimation) {
      this.lidAngle = map(
        millis() - this.animationStartTime,
        0,
        maxShowTime,
        closedLidAngle,
        maxLidAngle
      );
      this.levelsYOffset = map(
        millis() - this.animationStartTime,
        0,
        maxShowTime,
        levelH,
        0
      );

      if (this.lidAngle <= maxLidAngle) {
        this.lidAngle = maxLidAngle;
        this.openingAnimation = false;
        this.showTime = millis();
      }
    } else if (this.closingAnimation) {
      this.lidAngle = map(
        millis() - this.animationStartTime,
        0,
        maxShowTime,
        maxLidAngle,
        closedLidAngle
      );
      this.levelsYOffset = map(
        millis() - this.animationStartTime,
        0,
        maxShowTime,
        0,
        levelH
      );

      if (this.lidAngle >= closedLidAngle) {
        this.lidAngle = maxLidAngle;
        this.closingAnimation = false;
        this.showLevels = false;
      }
    }
  }

  drawLevel(i, y, rw, buffer) {
    rectMode(CORNER);
    stroke('255');
    noFill();

    // Draw the outline of the progress bar
    rect(
      this.x - rw * 0.25,
      y - buffer + i * buffer * 0.35,
      rw * 0.7,
      buffer * 0.15
    );

    // Draw the filled bar inside of the progress bar.
    fill(255);
    let w = (rw * 0.7 * this.levels[keys[i - 1]]) / this.levelGoal;
    rect(this.x - rw * 0.25, y - buffer + i * buffer * 0.35, w, buffer * 0.15);

    // Draw the label for the progress bar.
    textAlign(LEFT, CENTER);
    noStroke();
    fill(255);
    textSize(16);
    text(
      keys[i - 1],
      this.x - rw * 0.45,
      y - buffer + i * buffer * 0.35 + buffer * 0.075
    );
  }

  drawBinLids(rw, buffer) {
    let angle = radians(-this.lidAngle);

    stroke(255);
    fill(0);

    // Draw the top part of the lid.
    this.drawHalfBinLid(this.x + rw * 0.5, height - buffer, angle, rw);

    angle = radians(180 + this.lidAngle);

    // Draw left bin lid
    this.drawHalfBinLid(this.x - rw * 0.5, height - buffer, angle, rw);
  }

  drawHalfBinLid(x, y, angle, rw) {
    const lidThickness = 15;
    // const doorWidth = width * 0.05;
    const doorWidth = rw * 0.5;

    // cos(angle) = a/h, a = h * cos(angle)
    const doorXLength = doorWidth * cos(angle);

    // sin(angle) = o/h, o = h * sin(angle)
    const doorYLength = doorWidth * sin(angle);

    // In the show we see that the lids do not have 90 degree angles, which means that we cannot use the rect() function.

    push();
    beginShape();
    translate(x, y);
    vertex(0, 0);
    vertex(doorXLength, doorYLength);
    // Move down
    vertex(doorXLength, doorYLength + lidThickness);
    vertex(0, lidThickness);
    endShape(CLOSE);
    pop();
  }
}

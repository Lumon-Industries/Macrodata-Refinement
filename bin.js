const keys = ['WO', 'FC', 'DR', 'MA'];
const maxLidAngle = 45;
const closedLidAngle = 180;
const maxShowTime = 1000;
const lidOpenCloseTime = 1500;

let levelH = buffer * 1.7;

class Bin {
  constructor(w, i, goal, levels) {
    this.w = w;
    this.i = i;
    this.x = i * w + w * 0.5;
    this.y = g.height - buffer * 0.75;

    this.goal = goal;
    this.levelGoal = this.goal / 4;

    this.levelsYOffset = levelH;
    this.lastRefinedTime = millis();

// if levels is undefined, assign empty levels
    this.levels = levels ?? {
      WO: 0,
      FC: 0,
      DR: 0,
      MA: 0,
    };

    // sum the levels to get current count
    this.count = Object.values(this.levels).reduce((prev, curr) => prev + curr);

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
    g.push();
    this.count =
      this.levels.WO + this.levels.FC + this.levels.DR + this.levels.MA;

    this.count = constrain(this.count, 0, this.goal);
    let perc = this.count / this.goal;
    g.rectMode(CENTER);
    let rw = this.w - this.w * 0.25;

    if (this.showLevels) {
      this.drawLevels(rw, buffer);
    }

    this.drawBottomOutlines(rw, buffer);

    this.drawProgressBar(rw, buffer, perc);
    this.writeIndex();
    this.writePercentage(perc, rw, buffer);
    
    g.pop();
  }

  drawBottomOutlines(rw, buffer) {
    // Extra layer to block tray sliding
    g.noStroke();
    g.fill(palette.BG);
    g.rectMode(CORNER);
    let extra = 4;
    g.rect(
      this.x - rw * 0.5 - extra,
      this.y - buffer * 0.125,
      rw + extra * 2,
      buffer
    );

    g.stroke(palette.FG);
    g.strokeWeight(1);
    g.fill(palette.BG);

    g.rectMode(CENTER);
    g.rect(this.x, this.y, rw, buffer * 0.25);
    g.rect(this.x, this.y + buffer * 0.3, rw, buffer * 0.25);
  }

  drawProgressBar(rw, buffer, perc) {
    g.fill(palette.FG);
    g.noStroke();
    g.rectMode(CORNER);

    let h = buffer * 0.25;
    g.rect(this.x - rw * 0.5, this.y + buffer * 0.3 - h * 0.5, rw * perc, h);
  }

  writeIndex() {
    g.textSize(18);
    g.textFont('Arial');
    g.textAlign(CENTER, CENTER);
    g.fill(palette.FG);
    g.noStroke();
    g.text(nf(this.i, 2, 0), this.x, this.y);
  }

  writePercentage(perc, rw, buffer) {
    g.textAlign(LEFT, CENTER);
    g.stroke(palette.FG);
    g.strokeWeight(2);
    g.fill(palette.BG);
    g.text(
      `${floor(nf(100 * perc, 2, 0))}%`,
      this.x - rw * 0.45,
      this.y + buffer * 0.3
    );
  }

  drawLevels(rw, buffer) {
    g.rectMode(CENTER);
    let levelY = this.y - buffer;

    // Draw main outline
    g.stroke(palette.FG);
    g.fill(palette.BG);
    g.rect(this.x, levelY + this.levelsYOffset, rw, levelH);

    this.drawBinLids(rw, buffer);

    for (let i = 1; i < 5; i++) {
      this.drawLevel(i, levelY + this.levelsYOffset, rw, buffer);
    }

    if (millis() - this.lastRefinedTime > 120) {
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
        lidOpenCloseTime,
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
    const level = keys[i - 1];
    const levelColor = palette.LEVELS[level];
    
    g.rectMode(CORNER);
    g.stroke(levelColor);
    g.noFill();
    
    // Draw the outline of the progress bar
    g.rect(
      this.x - rw * 0.25,
      y - buffer + i * buffer * 0.35,
      rw * 0.7,
      buffer * 0.15
    );
    // Draw the filled bar inside of the progress bar.
    g.fill(levelColor);
    let w = (rw * 0.7 * this.levels[level]) / this.levelGoal;
    g.rect(this.x - rw * 0.25, y - buffer + i * buffer * 0.35, w, buffer * 0.15);

    // Draw the label for the progress bar.
    g.textAlign(LEFT, CENTER);
    g.noStroke();
    g.fill(levelColor);
    g.textSize(16);
    g.text(
      level,
      this.x - rw * 0.45,
      y - buffer + i * buffer * 0.35 + buffer * 0.075
    );
  }

  drawBinLids(rw, buffer) {
    let angle = radians(-this.lidAngle);

    g.stroke(palette.FG);
    g.fill(palette.BG);

    // Draw the top part of the lid.
    this.drawHalfBinLid(this.x + rw * 0.5, g.height - buffer, angle, rw);

    angle = radians(180 + this.lidAngle);

    // Draw left bin lid
    this.drawHalfBinLid(this.x - rw * 0.5, g.height - buffer, angle, rw);
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

    g.push();
    g.beginShape();
    g.translate(x, y);
    g.vertex(0, 0);
    g.vertex(doorXLength, doorYLength);
    // Move down
    g.vertex(doorXLength, doorYLength + lidThickness);
    g.vertex(0, lidThickness);
    g.endShape(CLOSE);
    g.pop();
  }

  resize(newW) {
    this.w = newW;
    this.x = this.i * newW + newW * 0.5;
    this.y = g.height - buffer * 0.75;    
  }
}

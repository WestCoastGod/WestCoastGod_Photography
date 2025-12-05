class M_Cloud {
  constructor(sel) {
    // 'sel' is currently passed as null from M_Grfx.
    // If not used for any other purpose, it can be removed.
    // this.sel = sel; // This line can be removed if sel is not used.

    this.partCount = 50;
    this.glideWindow = 0;

    this.angY = [];
    this.angZ = [];
    this.gSpeed = [];
    // this.dist = []; // 'dist' array was declared but not used. Can be removed.

    this.gAccel = 0.15;

    this.xSpace = [];
    this.ySpace = [];
    this.zSpace = [];
    for (var p = 0; p < this.partCount; p++) {
      this.xSpace[p] = 0;
      this.ySpace[p] = 0;
      this.zSpace[p] = 0;
      this.angY[p] = random(2 * PI);
      this.angZ[p] = random(2 * PI);
      this.gSpeed[p] = random(10, 140);
    }

    this.rColor3D = grabRandomColor();
  }

  glide() {
    for (var p = 0; p < this.partCount; p++) {
      this.gSpeed[p] -= this.gSpeed[p] * this.gAccel;
      var nowDist = this.gSpeed[p];

      this.xSpace[p] += nowDist * sin(this.angZ[p]) * cos(this.angY[p]);
      this.ySpace[p] += nowDist * sin(this.angZ[p]) * sin(this.angY[p]);
      this.zSpace[p] += nowDist * cos(this.angZ[p]);
    }
    this.glideWindow++;
  }

  display() {
    push();
    // THIS LINE MUST BE REMOVED OR COMMENTED OUT (this is line 48)
    // translate(circ[this.sel].body.position.x, circ[this.sel].body.position.y);

    rotateY(frameCount * 0.001); // This rotation can stay if desired

    noFill();
    stroke(this.rColor3D);
    strokeWeight(1);
    for (var p = 0; p < this.partCount; p++) {
      push();
      translate(this.xSpace[p], this.ySpace[p], this.zSpace[p]);
      rotateY(-frameCount * 0.001); // Counter-rotation for individual particles
      ellipse(0, 0, 10, 10);
      pop();
    }
    pop();
  }
}

class M_Ring {
  constructor(sel) {
    this.sel = sel; // This 'sel' was originally an index for the 'circ' array.
    // It's currently being passed an x-coordinate from M_Grfx,
    // which is not its intended use but won't cause an error here by itself.

    this.glideWindow = 0;

    this.gSpeed = random(50, 140);
    this.gAccel = 0.15;

    this.r = 0;

    this.rColor3D = grabRandomColor();
  }

  glide() {
    this.gSpeed -= this.gSpeed * this.gAccel;
    this.r += this.gSpeed;

    this.glideWindow++;
  }

  display() {
    push();
    // REMOVE the translate that used 'circ':
    // translate(circ[this.sel].body.position.x, circ[this.sel].body.position.y);

    rotateX(PI / 2); // This rotation can likely stay.

    // REMOVE or REPLACE the rotateY that used 'circ':
    // rotateY(atan2(circ[this.sel].body.position.y - height/2, circ[this.sel].body.position.x - width/2) + PI/2);
    // You could add a generic rotation if desired, e.g.:
    // rotateY(frameCount * 0.01);
    // Or simply remove it if the original orientation logic is not critical without 'circ'.

    noFill();
    stroke(this.rColor3D);
    strokeWeight(1);
    ellipse(0, 0, this.r, this.r);
    pop();
  }
}

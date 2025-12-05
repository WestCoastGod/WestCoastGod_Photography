class M_Sphere {
  constructor(sel) {
    // 'sel' was originally an index for the 'circ' array.
    // It's currently being passed an x-coordinate from M_Grfx in sketch_clutter.js,
    // which is not its intended use for positioning.
    // We are removing its use for positioning within this class.
    this.sel = sel;

    this.latCount = 10;
    this.latAng = (2 * PI) / this.latCount / 2;

    this.glideWindow = 0;

    this.gSpeed = random(50, 140);
    this.gAccel = 0.125;

    this.r = 0; // Radius, animated by glide()

    this.rColor3D = grabRandomColor();

    this.mode = round(random(2)); // Randomly picks one of the 3 drawing modes
  }

  glide() {
    this.gSpeed -= this.gSpeed * this.gAccel;
    this.r += this.gSpeed;

    this.glideWindow++;
  }

  display() {
    if (this.mode == 0) {
      push();
      // REMOVED: translate(circ[this.sel].body.position.x, circ[this.sel].body.position.y);
      rotateX(PI / 2);
      // REMOVED: rotateY(atan2(circ[this.sel].body.position.y, circ[this.sel].body.position.x) + PI / 2);
      // You can add a generic rotation if desired, e.g., rotateY(frameCount * 0.01);

      noFill();
      stroke(this.rColor3D);
      strokeWeight(1);
      var animateP = (frameCount / 120) % 1;

      for (var p = animateP; p < this.latCount; p++) {
        push();
        rotateY(-p * this.latAng);
        ellipse(0, 0, this.r, this.r);
        pop();
      }
      pop();
    } else if (this.mode == 1) {
      push();
      // REMOVED: translate(circ[this.sel].body.position.x, circ[this.sel].body.position.y);
      rotateX(PI / 2);
      // REMOVED: rotateY(atan2(circ[this.sel].body.position.y, circ[this.sel].body.position.x) + PI / 2);
      // You can add a generic rotation if desired, e.g., rotateY(frameCount * 0.01);

      noFill();
      stroke(this.rColor3D);
      strokeWeight(1);

      var animateP = (frameCount / 120) % 1;

      for (var p = animateP; p < this.latCount; p++) {
        var stepR = map(p, 0, this.latCount, 0, PI);
        var newRadius = sin(stepR) * this.r;

        // Original mapping for newY was: map(p, 0, this.latCount, this.r/2, -this.r/2);
        // Corrected mapping for newY based on cosine for spherical distribution:
        var newY = cos(stepR) * (this.r / 2); // Distributes points along the sphere's axis

        push();
        translate(0, 0, newY);
        ellipse(0, 0, newRadius, newRadius);
        pop();
      }
      pop();
    } else if (this.mode == 2) {
      push();
      // REMOVED: translate(circ[this.sel].body.position.x, circ[this.sel].body.position.y);
      rotateX(PI / 2);
      // REMOVED: rotateY(atan2(circ[this.sel].body.position.y, circ[this.sel].body.position.x) + PI / 2);
      // You can add a generic rotation if desired, e.g., rotateY(frameCount * 0.01);

      noFill();
      stroke(this.rColor3D);
      strokeWeight(1);

      var animateP = (frameCount / 120) % 1;

      for (var p = animateP; p < this.latCount; p++) {
        var stepR = map(p, 0, this.latCount, 0, PI);
        var newRadius = sin(stepR) * this.r;

        var newY = map(cos(stepR), 1, -1, -this.r / 2, this.r / 2);
        push();
        translate(0, 0, newY);
        ellipse(0, 0, newRadius, newRadius);
        pop();

        // This part draws longitudinal lines
        push();
        rotateX(PI / 2); // This might be redundant or could be combined with the initial rotateX
        rotateY(p * this.latAng);
        ellipse(0, 0, this.r, this.r);
        pop();
      }
      pop();
    }
  }
}

class M_Grfx {
  constructor(x, y, typeIdentifier) {
    // Constructor parameters: x, y position, and type
    this.x = x; // Store its own x position
    this.y = y; // Store its own y position
    this.typeIdentifier = typeIdentifier; // Use this to determine graphic type

    this.mode = 0; // 0 for 2D (texture from pg_grfx), 1 for 3D object
    this.graphic3D = null; // To store the 3D graphic instance
    this.textureTypeIndex = 0; // To store the type/index for 2D textures

    // gOptionCount should be a global variable from sketch_clutter.js
    // representing the total number of distinct graphic types.
    if (typeof gOptionCount === "undefined") {
      console.error("M_Grfx: gOptionCount is not defined globally!");
      // Provide a fallback or handle error, e.g., default to 17 if that was the previous value
      // For safety, let's assume a default if not found, but this should be fixed in sketch_clutter.js
      gOptionCount = 17;
    }

    if (this.typeIdentifier < 0 || this.typeIdentifier >= gOptionCount) {
      console.error(
        "M_Grfx: Invalid typeIdentifier:",
        this.typeIdentifier,
        "Max is:",
        gOptionCount - 1
      );
      this.typeIdentifier = 0; // Default to a safe type
    }

    // Determine graphic type based on typeIdentifier
    // This maps typeIdentifier to specific 2D texture functions or 3D classes
    if (this.typeIdentifier == 0) {
      // M_Cloud
      this.mode = 1;
      if (typeof M_Cloud === "function") this.graphic3D = new M_Cloud();
      else console.error("M_Cloud not defined");
    } else if (this.typeIdentifier == 15) {
      // M_Cosmic
      this.mode = 1;
      if (typeof M_Cosmic === "function") this.graphic3D = new M_Cosmic();
      else console.error("M_Cosmic not defined");
    } else if (this.typeIdentifier == 16) {
      // M_Sphere
      this.mode = 1;
      if (typeof M_Sphere === "function") this.graphic3D = new M_Sphere();
      else console.error("M_Sphere not defined");
    } else {
      // Fallback for any other typeIdentifier (should not happen if gOptionCount is correct)
      console.warn(
        "M_Grfx: Reached fallback in constructor for typeIdentifier:",
        this.typeIdentifier
      );
      this.mode = 0;
      this.textureTypeIndex = 0; // Default to first texture
      if (typeof pgG_star1 === "function") pgG_star1(this.textureTypeIndex);
    }
  }

  display() {
    push();
    // Translate to this M_Grfx instance's own position (this.x, this.y)
    // These coordinates are from the main canvas, WEBGL mode might require adjustment if 0,0 is center
    translate(this.x, this.y);

    if (this.mode == 0) {
      // 2D graphic (texture)
      // The problematic 'translate(circ[this.sel]...)' line has been removed.

      // pg_grfx is a global array of p5.Graphics objects from textures.js
      // It should be indexed by 'this.textureTypeIndex'
      if (pg_grfx && pg_grfx[this.textureTypeIndex]) {
        let tex = pg_grfx[this.textureTypeIndex];
        if (tex && tex.width && tex.height && tex.width > 0 && tex.height > 0) {
        }
      }
    } else {
      // 3D graphic
      if (this.graphic3D && typeof this.graphic3D.display === "function") {
        this.graphic3D.display(); // 3D objects draw relative to the current translated origin
        if (
          typeof this.graphic3D.glide === "function" &&
          typeof this.graphic3D.glideWindow !== "undefined" &&
          this.graphic3D.glideWindow < 90
        ) {
          this.graphic3D.glide();
        }
      } else {
        // console.warn("M_Grfx: 3D graphic object not found or has no display method for typeIdentifier:", this.typeIdentifier);
      }
    }
    pop();
  }
}
window.M_Grfx = M_Grfx;

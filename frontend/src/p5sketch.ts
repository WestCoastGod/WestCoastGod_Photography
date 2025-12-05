import type { P5CanvasInstance, SketchProps } from "react-p5-wrapper";

export const sketch = (p: P5CanvasInstance<SketchProps>) => {
  let grfx: any[] = [];
  let gOptionCount = 17; // Should be consistent with M_Grfx and other uses
  let bkgdColor: any, foreColor: any, typeColor: any;
  let color1: any, color2: any, color3: any;

  let darkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // This function attempts to create a global LCG state, which might help
  // if some p5 internals or legacy code expect it globally.
  function ensureLcgRandomGlobals() {
    if (!(window as any)._lcg_random) {
      (window as any)._lcg_random = {
        _lcg_random_state: Math.random() * 2147483648,
      }; // Initialize with a random seed
    }
    const desc = Object.getOwnPropertyDescriptor(window, "_lcg_random_state");
    if (!desc || !desc.get) {
      Object.defineProperty(window, "_lcg_random_state", {
        get() {
          return (window as any)._lcg_random._lcg_random_state;
        },
        set(val) {
          (window as any)._lcg_random._lcg_random_state = val;
        },
        configurable: true,
      });
    }
    // Also ensure p5 instance has its own LCG state if it relies on it.
    // p5 typically initializes this itself.
    if ((p as any)._lcg_random_state === undefined) {
      (p as any)._lcg_random_state = Math.random() * 2147483648;
    }
  }

  function updateColors() {
    // Updated background colors
    bkgdColor = darkMode ? p.color(0) : p.color(255); // Black for dark, White for light

    // Updated graph colors to shades of grey
    // You can use the same grey or vary them slightly
    const grey1 = p.color(128); // Mid-grey
    const grey2 = p.color(150);
    const grey3 = p.color(100);

    foreColor = grey1;
    typeColor = grey1; // Assuming typeColor also becomes grey

    color1 = grey1;
    color2 = grey2;
    color3 = grey3;

    // Sync to window for legacy code
    (window as any).bkgdColor = bkgdColor;
    (window as any).foreColor = foreColor;
    (window as any).typeColor = typeColor;
    (window as any).color1 = color1;
    (window as any).color2 = color2;
    (window as any).color3 = color3;
  }

  function generateGrfx() {
    if (typeof (window as any).M_Grfx !== "function") {
      console.warn(
        "M_Grfx class not found on window. Ensure m_grfx.js is loaded and window.M_Grfx is set."
      );
      return;
    }

    // Use p.random which is correctly bound
    let r_type = p.floor(p.random(gOptionCount));

    // Define the center area to avoid (where your text stack is)
    const centerX = p.width / 2;
    const centerY = p.height / 2;

    // Check if mobile and adjust exclusion zone accordingly
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;

    let exclusionWidth, exclusionHeight;

    if (isSmallMobile) {
      // For very small phones - make exclusion smaller to leave more space for graphics
      exclusionWidth = p.width * 0.5; // Reduced from 0.6 to 0.5
      exclusionHeight = p.height * 0.6; // Reduced from 0.7 to 0.6
    } else if (isMobile) {
      // For regular mobile phones
      exclusionWidth = p.width * 0.55; // Reduced from 0.65 to 0.55
      exclusionHeight = p.height * 0.65; // Reduced from 0.75 to 0.65
    } else {
      // For desktop/tablet
      exclusionWidth = p.width * 0.6; // 60% of screen width
      exclusionHeight = p.height * 0.8; // 80% of screen height
    }

    // Define the four corner regions around the exclusion zone
    const cornerRegions = [
      // Top-left corner
      {
        name: "top-left",
        minX: 0,
        maxX: centerX - exclusionWidth / 2,
        minY: 0,
        maxY: centerY - exclusionHeight / 2,
      },
      // Top-right corner
      {
        name: "top-right",
        minX: centerX + exclusionWidth / 2,
        maxX: p.width,
        minY: 0,
        maxY: centerY - exclusionHeight / 2,
      },
      // Bottom-left corner
      {
        name: "bottom-left",
        minX: 0,
        maxX: centerX - exclusionWidth / 2,
        minY: centerY + exclusionHeight / 2,
        maxY: p.height,
      },
      // Bottom-right corner
      {
        name: "bottom-right",
        minX: centerX + exclusionWidth / 2,
        maxX: p.width,
        minY: centerY + exclusionHeight / 2,
        maxY: p.height,
      },
    ];

    // Filter out regions that are too small
    const minRegionSize = isMobile ? 20 : 30; // Reduced minimum size
    const validRegions = cornerRegions.filter((region) => {
      const width = region.maxX - region.minX;
      const height = region.maxY - region.minY;
      const isValid = width > minRegionSize && height > minRegionSize;

      // Debug logging
      console.log(
        `Region ${region.name}: ${width}x${height}, valid: ${isValid}`
      );

      return isValid;
    });

    if (validRegions.length === 0) {
      console.warn("No valid corner regions found for graphics placement");
      return;
    }

    // Randomly select one of the valid corner regions
    const selectedRegion = validRegions[p.floor(p.random(validRegions.length))];

    // Generate random position within the selected corner region
    const x = p.random(selectedRegion.minX, selectedRegion.maxX);
    const y = p.random(selectedRegion.minY, selectedRegion.maxY);

    // Debug logging
    console.log(
      `Generated graphic in ${selectedRegion.name} at (${x.toFixed(
        0
      )}, ${y.toFixed(0)})`
    );

    try {
      // M_Grfx constructor will use global p5 functions (e.g., random, color)
      let newGraphic = new (window as any).M_Grfx(x, y, r_type);

      // Store the position and region info for debugging
      newGraphic.debugX = x;
      newGraphic.debugY = y;
      newGraphic.debugRegion = selectedRegion.name;

      // Apply mobile scaling to the graphic
      if (newGraphic && isMobile) {
        let mobileScale;

        if (isSmallMobile) {
          mobileScale = 0.5; // Increased from 0.4 to make more visible
        } else {
          mobileScale = 0.6; // Increased from 0.5 to make more visible
        }

        // Try different ways to apply scaling based on how M_Grfx is structured
        if (typeof newGraphic.setScale === "function") {
          newGraphic.setScale(mobileScale);
        } else if (newGraphic.hasOwnProperty("scale")) {
          newGraphic.scale = mobileScale;
        } else if (newGraphic.hasOwnProperty("size")) {
          newGraphic.size *= mobileScale;
        } else if (
          newGraphic.hasOwnProperty("w") &&
          newGraphic.hasOwnProperty("h")
        ) {
          // If it has width and height properties
          newGraphic.w *= mobileScale;
          newGraphic.h *= mobileScale;
        } else if (newGraphic.hasOwnProperty("radius")) {
          // If it's a circular graphic
          newGraphic.radius *= mobileScale;
        }

        // Add a mobile scale property for use in display methods
        newGraphic.mobileScale = mobileScale;
      } else if (newGraphic) {
        newGraphic.mobileScale = 1.0;
      }

      grfx.push(newGraphic);
    } catch (e) {
      console.error("Error creating new M_Grfx instance in generateGrfx:", e);
    }
  }

  p.setup = () => {
    ensureLcgRandomGlobals(); // Call this early

    // --- Shim p5 properties and constants ---
    const p5PropsAndConsts = [
      "PI",
      "TWO_PI",
      "HALF_PI",
      "QUARTER_PI",
      "TAU",
      "CENTER",
      "RADIUS",
      "CORNER",
      "CORNERS",
      "RGB",
      "HSB",
      "HSL",
      "NORMAL",
      "ITALIC",
      "BOLD",
      "BOLDITALIC",
      "POINTS",
      "LINES",
      "TRIANGLES",
      "TRIANGLE_FAN",
      "TRIANGLE_STRIP",
      "QUADS",
      "QUAD_STRIP",
      "CLOSE",
      "OPEN",
      "WEBGL",
      "P2D",
      // Add any other constants your legacy code might use
    ];
    p5PropsAndConsts.forEach((prop) => {
      if ((p as any)[prop] !== undefined) {
        (window as any)[prop] = (p as any)[prop];
      }
    });

    // --- Shim p5 functions (bound to p) ---
    const p5FunctionsToShim = [
      "random",
      "round",
      "floor",
      "ceil",
      "map",
      "lerp",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "atan2",
      "createGraphics",
      "color",
      "textSize",
      "textFont",
      "textWidth",
      "textAlign",
      "textLeading",
      "textStyle",
      "text",
      "noStroke",
      "stroke",
      "strokeWeight",
      "strokeCap",
      "strokeJoin",
      "fill",
      "noFill",
      "ellipse",
      "rect",
      "line",
      "point",
      "quad",
      "triangle",
      "arc",
      "beginShape",
      "vertex",
      "curveVertex",
      "bezierVertex",
      "quadraticVertex",
      "endShape",
      "push",
      "pop",
      "translate",
      "rotate",
      "scale",
      "shearX",
      "shearY",
      "rotateX",
      "rotateY",
      "rotateZ", // For WEBGL
      "image",
      "tint",
      "noTint",
      "imageMode",
      "texture",
      "textureMode",
      "textureWrap",
      "loadFont",
      "loadImage", // Async, ensure callbacks are handled if used directly by legacy
      "print", // for debugging
      // Add any other p5 functions your legacy code uses
    ];

    p5FunctionsToShim.forEach((fnName) => {
      if (typeof (p as any)[fnName] === "function") {
        (window as any)[fnName] = (p as any)[fnName].bind(p);
      }
    });

    // --- Shim p5 properties that change (like width, height, frameCount) ---
    (window as any).width = p.width; // Initial width
    (window as any).height = p.height; // Initial height
    (window as any).frameCount = 0; // Initial frameCount

    // --- Global variables for your legacy clutter_js scripts ---
    (window as any).gOptionCount = gOptionCount;
    (window as any).pg_grfx = []; // Initialize if textures.js expects it
    (window as any).pgT = []; // Initialize if textures.js expects it
    (window as any).grfx = grfx;

    // Initialize and sync colors
    updateColors();

    // Keep full screen canvas - no mobile scaling here
    let cnv = p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    const canvasParent = document.getElementById("about-bg-canvas");
    if (canvasParent) {
      cnv.parent(canvasParent);
    } else {
      console.error("Parent canvas 'about-bg-canvas' not found.");
    }

    p.frameRate(30);
    if ((p as any).textureMode) p.textureMode(p.NORMAL);

    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (event) => {
          darkMode = event.matches;
          updateColors();
        });
    }

    // Initialize graphics with fewer items on mobile
    grfx.length = 0;
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;

    let graphicCount;
    if (isSmallMobile) {
      graphicCount = 14; // Very few graphics on small phones
    } else if (isMobile) {
      graphicCount = 18; // Fewer graphics on mobile
    } else {
      graphicCount = 24; // Full graphics on desktop
    }

    for (let i = 0; i < graphicCount; i++) {
      generateGrfx();
    }
  };

  p.draw = () => {
    (window as any).frameCount = p.frameCount;
    (window as any).width = p.width;
    (window as any).height = p.height;
    (window as any).deltaTime = p.deltaTime;
    (window as any).keyIsPressed = p.keyIsPressed;
    (window as any).key = p.key;
    (window as any).keyCode = p.keyCode;

    p.background(bkgdColor);

    // WEBGL coordinate fix - translate to handle coordinate system
    p.translate(-p.width / 2, -p.height / 2);

    p.push();
    for (let i = 0; i < grfx.length; i++) {
      const graphicItem = grfx[i];
      if (graphicItem && typeof graphicItem.display === "function") {
        p.push();

        // Remove the debug squares - comment out or delete this section:
        /*
      if (
        graphicItem.debugX !== undefined &&
        graphicItem.debugY !== undefined
      ) {
        p.fill(255, 0, 0, 100); // Semi-transparent red for debugging
        p.noStroke();
        p.rect(graphicItem.debugX - 5, graphicItem.debugY - 5, 10, 10);
      }
      */

        // Display the actual graphic
        graphicItem.display();

        p.pop();
      }
      if (graphicItem && typeof graphicItem.glide === "function") {
        graphicItem.glide();
      }
    }
    p.pop();
  };

  p.windowResized = () => {
    // Keep full screen resize - no mobile scaling here
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
};

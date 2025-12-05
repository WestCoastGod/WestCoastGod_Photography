// Global variables for the background animation

// Variables potentially used by M_*.js graphic classes
var unitRes = 200;
var yRes = 50;
var spacer; // Define if used by M_*.js for positioning

// Color palette variables
var color1, color2, color3;
var bkgdColor, foreColor, typeColor;

// Array to hold background graphic objects
var grfx = [];
// Offscreen graphics buffers, if used by textures.js or M_*.js for background elements
var pg_grfx = []; // Keep if textures.js or m_*.js use it for background
var m_3Dgrfx = []; // Keep if m_grfx.js uses it

// Count of available graphic options/types in M_*.js files
var gOptionCount = 17; // Adjust if you have a different number of graphic types

function preload() {
  // Font loading has been removed.
  // If your M_*.js files load images or other assets for the background, do it here.
}

// Create a variable to track current mode
let darkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

// Set up colors based on mode
function updateColors() {
  if (darkMode) {
    bkgdColor = color(10); // Near black for dark mode
  } else {
    bkgdColor = color(255); // White for light mode
  }
}

// In setup(), replace the single line with:
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  cnv.parent("about-bg-canvas");

  // Initialize colors based on current mode
  updateColors();

  // Set other colors
  foreColor = darkMode ? color(245) : color(255);
  typeColor = darkMode ? color(245) : color(255);

  // Adjust palette colors for dark mode if needed
  color1 = darkMode ? color(245) : color(255);
  color2 = darkMode ? color(180) : color(200);
  color3 = darkMode ? color(120) : color(150);

  frameRate(30);
  textureMode(NORMAL);

  // Listen for system dark mode changes
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        darkMode = event.matches;
        updateColors();
      });
  }

  for (var i = 0; i < 16; i++) {
    generateGrfx();
  }
}

function draw() {
  background(bkgdColor);

  // WEBGL mode typically uses a 0,0 center, so translate
  translate(-width / 2, -height / 2);

  // Display 3D background graphics (if any are set to mode 1)
  push();
  for (var i = 0; i < grfx.length; i++) {
    if (grfx[i] && typeof grfx[i].display === "function") {
      // Check if mode property exists, otherwise display all
      if (typeof grfx[i].mode !== "undefined") {
        if (grfx[i].mode == 1) {
          grfx[i].display();
        }
      } else {
        // If no mode property, assume it's a 3D element or display all
        // grfx[i].display(); // Or handle as per your M_*.js logic
      }
    }
  }
  pop();

  // Display 2D background graphics (if any are set to mode 0 or have no mode)
  push();

  pop();
}

// Function to generate a new background graphic element
function generateGrfx() {
  if (typeof M_Grfx !== "function") {
    console.error("M_Grfx class is not defined. Cannot generate graphics.");
    return;
  }
  // gOptionCount should be defined globally in sketch_clutter.js
  var r_type = floor(random(gOptionCount)); // This is the typeIdentifier
  var x = random(width); // Or however you determine x
  var y = random(height); // Or however you determine y

  try {
    // Pass x, y, and r_type to the M_Grfx constructor
    var newGraphic = new M_Grfx(x, y, r_type);
    grfx.push(newGraphic);
  } catch (e) {
    console.error("Error creating new M_Grfx instance in generateGrfx:", e);
  }
}

function keyPressed() {
  // Example: Pressing any key generates a new background graphic.
  // You can change the key or condition.
  generateGrfx();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // If your M_*.js graphics need to react to resize (beyond canvas scaling),
  // you might need to iterate through 'grfx' and call an update method on them.
}

// Keep sinEngine if your M_*.js files (background graphics) use it for animation.
// function sinEngine(val1, val2, speed, phase) {
//   var amp = (val2 - val1) / 2;
//   var offset = val1 + amp;
//   var val = sin(frameCount * speed + phase) * amp + offset;
//   return val;
// }

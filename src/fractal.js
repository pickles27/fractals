const MAX_ITERATION = 80;
const REAL_SET = { start: -2, end: 1 }; // represented by x-axis
const IMAGINARY_SET = { start: -1, end: 1 }; // represented by y-axis

/**
 * Calculates whether point c in complex plane is member of mandelbrot set (M)
 * Returns tuple containing rate of divergence and boolean representing if c is in M
 * f_c(Z) = Z^2 + c
 */
function mandelbrot(c) {
  // Start iterating from 0
  let z = { x: 0, y: 0 };
  let iterationCount = 0;
  let zSquared;
  let modulus;

  do {
    // Calculate and store square of Z
    zSquared = {
      x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
      y: 2 * z.x * z.y,
    };

    // Update Z by adding c
    z = {
      x: zSquared.x + c.x,
      y: zSquared.y + c.y,
    };

    // Calculate modulus: |z| = √(x2 + y2)
    modulus = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));

    // increment iteration count
    iterationCount += 1;

    // Keep looping until we discover point is not within M,
    // or we hit the max iteration count.
    // Point is only member of M if the modulus never diverges > 2
  } while (modulus <= 2 && iterationCount < MAX_ITERATION);

  // Iteration count represents rate of diversion for non-members of M
  // Second element is true if point is member of M
  return [iterationCount, modulus <= 2];
}

const HEX_CHARS = "0123456789abcdef";
function generateRandomHexColor() {
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += HEX_CHARS[Math.floor(Math.random() * 16)];
  }
  return color;
}

const colors = Array(MAX_ITERATION)
  .fill(0)
  .map((_, index) => generateRandomHexColor());

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
ctx.canvas.width = WIDTH;
ctx.canvas.height = HEIGHT;
draw();

function draw() {
  // Iterate over entire canvas
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      // Map point to complex number
      const complexNum = {
        // Map x to position in real number range { start: -2, end: 1 }
        // i / WIDTH = (x - start) / (end - start) => x = i * (end - start) / WIDTH
        x: REAL_SET.start + (i * (REAL_SET.end - REAL_SET.start)) / WIDTH,
        // Map y to position in imaginary number range { start: -1, end: 1 }
        // j / HEIGHT = (y - start) / (end - start) => y = j * (end - start) / HEIGHT
        y:
          IMAGINARY_SET.start +
          (j * (IMAGINARY_SET.end - IMAGINARY_SET.start)) / HEIGHT,
      };

      const [divergence, isWithinSet] = mandelbrot(complexNum);
      const pointColor = isWithinSet ? "#000" : colors[divergence];

      ctx.fillStyle = pointColor;
      ctx.fillRect(i, j, 1, 1);
    }
  }
}

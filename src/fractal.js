const z = {};
const zSquared = {};
const MAX_ITERATION = 80;
/**
 * Calculates whether point c in complex plane is member of mandelbrot set (M)
 * Returns tuple containing rate of divergence and boolean representing if c is in M
 * f_c(Z) = Z^2 + c
 */
function mandelbrot(real, imaginary) {
  // Start iterating from 0
  let iterationCount = 0;
  let modulus;
  z.x = 0;
  z.y = 0;

  do {
    // Calculate and store square of Z
    zSquared.x = Math.pow(z.x, 2) - Math.pow(z.y, 2);
    zSquared.y = 2 * z.x * z.y;

    // Update Z by adding c
    z.x = zSquared.x + real;
    z.y = zSquared.y + imaginary;

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
  .map(() => generateRandomHexColor());

const REAL_SET = { start: -2, end: 1 }; // represented by x-axis
const IMAGINARY_SET = { start: -1, end: 1 }; // represented by y-axis

const mutableRealSet = { start: REAL_SET.start, end: REAL_SET.end };
const mutableImaginarySet = {
  start: IMAGINARY_SET.start,
  end: IMAGINARY_SET.end,
};

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
ctx.canvas.width = WIDTH;
ctx.canvas.height = HEIGHT;
draw();

const SCALE_FACTOR = 0.75;
document.body.addEventListener("click", () => {
  // reduce size of real/imaginary sets by 25%
  mutableRealSet.start = SCALE_FACTOR * mutableRealSet.start;
  mutableRealSet.end = SCALE_FACTOR * mutableRealSet.end;
  mutableImaginarySet.start = SCALE_FACTOR * mutableImaginarySet.start;
  mutableImaginarySet.end = SCALE_FACTOR * mutableImaginarySet.end;

  draw();
});

function draw() {
  // Iterate over entire canvas
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      // Map point to complex number
      // Map x to position in real number range { start: -2, end: 1 }
      // i / WIDTH = (x - start) / (end - start) => x = i * (end - start) / WIDTH
      const real =
        mutableRealSet.start +
        (i * (mutableRealSet.end - mutableRealSet.start)) / WIDTH;
      // Map y to position in imaginary number range { start: -1, end: 1 }
      // j / HEIGHT = (y - start) / (end - start) => y = j * (end - start) / HEIGHT
      const imaginary =
        mutableImaginarySet.start +
        (j * (mutableImaginarySet.end - mutableImaginarySet.start)) / HEIGHT;

      const [divergence, isWithinSet] = mandelbrot(real, imaginary);
      const pointColor = isWithinSet ? "#000" : colors[divergence];

      ctx.fillStyle = pointColor;
      ctx.fillRect(i, j, 1, 1);
    }
  }
}

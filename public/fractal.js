const MAX_ITERATION = 80;

const z = {};
const zSquared = {};

const ALPHA_CHANNEL = 255;
const MEMBER_COLOR = [0, 0, 0];

const colors = Array(MAX_ITERATION)
  .fill(0)
  .map(() => generateRandomColor());

const REAL_SET = { start: -2, end: 1 }; // represented by x-axis
const IMAGINARY_SET = { start: -1, end: 1 }; // represented by y-axis

const mutableRealSet = { start: REAL_SET.start, end: REAL_SET.end };
const mutableImaginarySet = {
  start: IMAGINARY_SET.start,
  end: IMAGINARY_SET.end,
};

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

document.body.addEventListener("click", handleClick);

draw();

/**
 * Calculates divergence of all pixels and paints canvas
 */
function draw() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  // Iterate over entire canvas
  for (let i = 0; i < canvas.width; i++) {
    for (let j = 0; j < canvas.height; j++) {
      // Map point to complex number
      // Map x to position in real number range { start: -2, end: 1 }
      // i / WIDTH = (x - start) / (end - start) => x = i * (end - start) / WIDTH
      const real =
        mutableRealSet.start +
        (i * (mutableRealSet.end - mutableRealSet.start)) / canvas.width;
      // Map y to position in imaginary number range { start: -1, end: 1 }
      // j / HEIGHT = (y - start) / (end - start) => y = j * (end - start) / HEIGHT
      const imaginary =
        mutableImaginarySet.start +
        (j * (mutableImaginarySet.end - mutableImaginarySet.start)) /
          canvas.height;

      const [divergence, isWithinSet] = mandelbrot(real, imaginary);
      const [r, g, b] = isWithinSet ? MEMBER_COLOR : colors[divergence - 1];
      setPixel(imageData, i, j, r, g, b, ALPHA_CHANNEL);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

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

function generateRandomColor() {
  const r = Math.round(255 * Math.random());
  const g = Math.round(255 * Math.random());
  const b = Math.round(255 * Math.random());

  return [r, g, b];
}

function setPixel(imageData, x, y, r, g, b) {
  // Calculate the index in the flat buffer
  const index = (y * imageData.width + x) * 4;

  // Set pixel values at the calculated index
  imageData.data[index] = r; // Red channel
  imageData.data[index + 1] = g; // Green channel
  imageData.data[index + 2] = b; // Blue channel
  imageData.data[index + 3] = ALPHA_CHANNEL; // Alpha channel
}

const SCALE_FACTOR = 0.5;
/** Scales down the real and imaginary sets and redraws canvas */
function handleClick(e) {
  // handle x coordinate
  const proportionAcrossWindowX = e.pageX / window.innerWidth;
  const realSetWidth = mutableRealSet.end - mutableRealSet.start;
  const newRealSetWidth = realSetWidth * SCALE_FACTOR;
  const newRealSetCenter =
    mutableRealSet.start + realSetWidth * proportionAcrossWindowX;
  const newRealSetStart = newRealSetCenter - newRealSetWidth / 2;
  const newRealSetEnd = newRealSetCenter + newRealSetWidth / 2;
  mutableRealSet.start = newRealSetStart;
  mutableRealSet.end = newRealSetEnd;

  // handle y coordinate
  const proportionAcrossWindowY = e.pageY / window.innerHeight;
  const imaginarySetWidth = mutableImaginarySet.end - mutableImaginarySet.start;
  const newImaginarySetWidth = imaginarySetWidth * SCALE_FACTOR;
  const newImaginarySetCenter =
    mutableImaginarySet.start + imaginarySetWidth * proportionAcrossWindowY;
  const newImaginarySetStart = newImaginarySetCenter - newImaginarySetWidth / 2;
  const newImaginarySetEnd = newImaginarySetCenter + newImaginarySetWidth / 2;
  mutableImaginarySet.start = newImaginarySetStart;
  mutableImaginarySet.end = newImaginarySetEnd;

  draw();
}

/**
 * This code calculates whether each pixel (representing a point in the complex plane c)
 * within the window is included in the Mandelbrot set (M). The points within M are colored black,
 * and the points outside M are mapped to a rainbow color based on the rate of divergence.
 * The horizontal axis represents the real portion of the complex number, and the vertical represents the imaginary.
 */

/**
 * The maximum number of times the modulus is calculated and checked if less than 2 for each point c in the complex plane.
 */
const MAX_ITERATION = 80;

/**
 * Alpha channel of every color in the list. Fully opaque.
 */
const ALPHA_CHANNEL = 255;

/**
 * The color assigned to the points representing members of M.
 */
const MEMBER_COLOR = [0, 0, 0];

/**
 * A list of colors in rainbow order.
 */
const COLORS = [
  [139, 0, 0],
  [166, 29, 0],
  [192, 57, 43],
  [217, 84, 45],
  [242, 121, 41],
  [245, 160, 0],
  [255, 185, 15],
  [255, 209, 26],
  [255, 223, 34],
  [255, 240, 0],
  [230, 230, 0],
  [200, 200, 0],
  [173, 255, 47],
  [154, 205, 50],
  [124, 252, 0],
  [50, 205, 50],
  [34, 139, 34],
  [0, 128, 0],
  [0, 100, 0],
  [0, 255, 255],
  [0, 206, 209],
  [64, 224, 208],
  [0, 255, 127],
  [0, 250, 154],
  [46, 139, 87],
  [0, 128, 128],
  [0, 255, 0],
  [34, 139, 34],
  [60, 179, 113],
  [152, 251, 152],
  [144, 238, 144],
  [152, 255, 152],
  [0, 255, 0],
  [127, 255, 0],
  [124, 252, 0],
  [50, 205, 50],
  [173, 255, 47],
  [154, 205, 50],
  [173, 216, 230],
  [0, 191, 255],
  [135, 206, 235],
  [30, 144, 255],
  [0, 0, 255],
  [65, 105, 225],
  [0, 0, 139],
  [0, 0, 128],
  [25, 25, 112],
  [0, 0, 205],
  [0, 0, 255],
  [30, 144, 255],
  [65, 105, 225],
  [0, 0, 139],
  [128, 0, 128],
  [75, 0, 130],
  [139, 0, 139],
  [148, 0, 211],
  [186, 85, 211],
  [139, 0, 139],
  [238, 130, 238],
  [255, 0, 255],
  [255, 20, 147],
  [255, 105, 180],
  [255, 182, 193],
  [255, 192, 203],
  [255, 240, 245],
  [255, 255, 255],
  [245, 245, 245],
  [220, 220, 220],
  [211, 211, 211],
  [192, 192, 192],
  [169, 169, 169],
  [128, 128, 128],
  [105, 105, 105],
  [255, 69, 0],
  [128, 0, 128],
  [75, 0, 130],
  [139, 0, 139],
  [148, 0, 211],
  [186, 85, 211],
  [139, 0, 139],
];

/**
 * The factor by which the x and y axis are multiplied when zooming in.
 */
const SCALE_FACTOR = 0.5;

/**
 * Represented by x-axis. The start and end of the maximum range that we consider.
 */
const REAL_SET = { start: -2, end: 1 };

/**
 * Represented by y-axis. The start and end of the maximum range that we consider.
 */
const IMAGINARY_SET = { start: -1, end: 1 };

/**
 * The current point in c being considered.
 */
const z = {};

/**
 * The current point in c being considered, squared.
 */
const zSquared = {};

/**
 * The current start and end of the real number range we are considering.
 */
const mutableRealSet = { start: REAL_SET.start, end: REAL_SET.end };

/**
 * The current start and end of the imaginary number range we are considering.
 */
const mutableImaginarySet = {
  start: IMAGINARY_SET.start,
  end: IMAGINARY_SET.end,
};

var canvas = document.getElementById("canvas");

/**
 * The canvas element. Width and height are set to full inner width and height of window.
 */
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

document.body.addEventListener("click", handleClick);

draw();

/**
 * Calculates divergence of all pixels and paints canvas.
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
      const [r, g, b] = isWithinSet ? MEMBER_COLOR : COLORS[divergence - 1];
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

/**
 * Assigns the provided RGB color to the given pixel.
 * @param {*} imageData - The canvas context's image data.
 * @param {number} x - Position along horizontal axis.
 * @param {number} y - Position along vertical axis.
 * @param {number} r - red portion of RGB color.
 * @param {number} g - green portion of RGB color.
 * @param {number} b - blue portion of RGB color.
 */
function setPixel(imageData, x, y, r, g, b) {
  // Calculate the index in the flat buffer
  const index = (y * imageData.width + x) * 4;

  // Set pixel values at the calculated index
  imageData.data[index] = r; // Red channel
  imageData.data[index + 1] = g; // Green channel
  imageData.data[index + 2] = b; // Blue channel
  imageData.data[index + 3] = ALPHA_CHANNEL; // Alpha channel
}

/** Scales down the real and imaginary sets being considered and redraws canvas. */
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

const imageInput = document.getElementById("imageInput");
const gridWidthInput = document.getElementById("gridWidth");
const cubeSubdivisionInput = document.getElementById("cubeSubdivision");
const squareSizeInput = document.getElementById("squareSize");
const generateBtn = document.getElementById("generateGrid");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let loadedImage = null;

// Image loading
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// Generate
generateBtn.addEventListener("click", () => {
  if (!loadedImage) {
    alert("Upload an image first");
    return;
  }
  generateMosaic();
});

// Core logic
function generateMosaic() {
  const gridWidth = parseInt(gridWidthInput.value, 10);
  const subdivision = parseInt(cubeSubdivisionInput.value, 10);
  const squareSize = parseInt(squareSizeInput.value, 10);

  // derive grid height from aspect ratio
  const gridHeight = Math.round(
    gridWidth * (loadedImage.height / loadedImage.width)
  );

  // pixel resolution
  const pixelWidth = gridWidth * subdivision;
  const pixelHeight = gridHeight * subdivision;

  // offscreen sampling canvas
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = pixelWidth;
  sampleCanvas.height = pixelHeight;
  const sctx = sampleCanvas.getContext("2d");

  sctx.drawImage(loadedImage, 0, 0, pixelWidth, pixelHeight);
  const imageData = sctx.getImageData(0, 0, pixelWidth, pixelHeight);

  // visible canvas size
  canvas.width = pixelWidth * squareSize;
  canvas.height = pixelHeight * squareSize;

  render(imageData, gridWidth, gridHeight, subdivision, squareSize);
}

// 6-color palette
const PALETTE = [
  { r: 255, g: 255, b: 255 }, // white
  { r: 255, g: 0,   b: 0   }, // red
  { r: 0,   g: 128, b: 0   }, // green
  { r: 0,   g: 0,   b: 255 }, // blue
  { r: 255, g: 165, b: 0   }, // orange
  { r: 255, g: 255, b: 0   }  // yellow
];

function nearestPaletteColor(r, g, b) {
  let best = PALETTE[0];
  let minDist = Infinity;

  for (const c of PALETTE) {
    const dr = r - c.r;
    const dg = g - c.g;
    const db = b - c.b;
    const dist = dr * dr + dg * dg + db * db;

    if (dist < minDist) {
      minDist = dist;
      best = c;
    }
  }
  return best;
}


// Rendering
function render(imageData, gridWidth, gridHeight, subdivision, squareSize) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const data = imageData.data;
  const cubeSize = subdivision * squareSize;

  // draw pixels
  for (let py = 0; py < imageData.height; py++) {
    for (let px = 0; px < imageData.width; px++) {

      const idx = (py * imageData.width + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // 🔹 quantize to 6 colors
      const qc = nearestPaletteColor(r, g, b);

      const x = px * squareSize;
      const y = py * squareSize;

      ctx.fillStyle = `rgb(${qc.r},${qc.g},${qc.b})`;
      ctx.fillRect(x, y, squareSize, squareSize);

      // small square border
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, squareSize, squareSize);
    }
  }

  // cube borders
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.lineWidth = 3;

  for (let cy = 0; cy < gridHeight; cy++) {
    for (let cx = 0; cx < gridWidth; cx++) {
      ctx.strokeRect(
        cx * cubeSize,
        cy * cubeSize,
        cubeSize,
        cubeSize
      );
    }
  }
}


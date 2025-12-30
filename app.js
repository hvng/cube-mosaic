const imageInput = document.getElementById("imageInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const gridWidthInput = document.getElementById("gridWidth");
const cubeSizeInput = document.getElementById("cubeSize");
const generateBtn = document.getElementById("generateGrid");

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

let sourceImageData = null;
let sourceWidth = 0;
let sourceHeight = 0;
let cubeGrid = [];

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => drawImageScaled(img);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

generateBtn.addEventListener("click", () => {
  if (!sourceImageData) {
    alert("Upload an image first");
    return;
  }

  const gridWidth = parseInt(gridWidthInput.value, 10);
  cubeGrid = sampleToGrid(gridWidth);

  renderCubes();
});

function drawImageScaled(img) {
  const scale = Math.min(
    MAX_WIDTH / img.width,
    MAX_HEIGHT / img.height,
    1
  );

  sourceWidth = Math.floor(img.width * scale);
  sourceHeight = Math.floor(img.height * scale);

  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  ctx.clearRect(0, 0, sourceWidth, sourceHeight);
  ctx.drawImage(img, 0, 0, sourceWidth, sourceHeight);

  sourceImageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
}

function sampleToGrid(gridWidth) {
  const gridHeight = Math.round(
    gridWidth * (sourceHeight / sourceWidth)
  );

  const cellWidth = sourceWidth / gridWidth;
  const cellHeight = sourceHeight / gridHeight;

  const data = sourceImageData.data;
  const cubes = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {

      const xStart = Math.floor(gx * cellWidth);
      const yStart = Math.floor(gy * cellHeight);
      const xEnd = Math.floor((gx + 1) * cellWidth);
      const yEnd = Math.floor((gy + 1) * cellHeight);

      let r = 0, g = 0, b = 0, count = 0;

      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const idx = (y * sourceWidth + x) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }

      if (count === 0) continue;

      cubes.push({
        x: gx,
        y: gy,
        color: {
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count)
        }
      });
    }
  }

  return cubes;
}

function renderCubes() {
  const gridWidth = parseInt(gridWidthInput.value, 10);
  const cubeSize = parseInt(cubeSizeInput.value, 10);

  if (!gridWidth || !cubeSize) return;

  const gridHeight = Math.round(
    gridWidth * (sourceHeight / sourceWidth)
  );

  canvas.width = gridWidth * cubeSize;
  canvas.height = gridHeight * cubeSize;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cubeGrid.forEach(cube => {
    const x = cube.x * cubeSize;
    const y = cube.y * cubeSize;

    ctx.fillStyle = `rgb(${cube.color.r},${cube.color.g},${cube.color.b})`;
    ctx.fillRect(x, y, cubeSize, cubeSize);

    // cube border
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cubeSize, cubeSize);
  });
}



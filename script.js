const IMAGE_POOL = [
  "https://picsum.photos/id/1015/1280/720",
  "https://picsum.photos/id/1025/1280/720",
  "https://picsum.photos/id/1035/1280/720",
  "https://picsum.photos/id/1043/1280/720",
  "https://picsum.photos/id/1050/1280/720",
  "https://picsum.photos/id/1069/1280/720",
  "https://picsum.photos/id/1074/1280/720",
  "https://picsum.photos/id/1084/1280/720",
  "https://picsum.photos/id/1080/1280/720",
  "https://picsum.photos/id/109/1280/720",
  "https://picsum.photos/id/110/1280/720",
  "https://picsum.photos/id/111/1280/720"
];

const DISTANCE_MAX = 441.67;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const targetSwatch = document.getElementById("targetSwatch");
const targetRgbText = document.getElementById("targetRgb");
const scoreValue = document.getElementById("scoreValue");
const roundCount = document.getElementById("roundCount");
const roundMessage = document.getElementById("roundMessage");
const clickedSwatch = document.getElementById("clickedSwatch");
const clickedRgbText = document.getElementById("clickedRgb");
const distanceValue = document.getElementById("distanceValue");
const clickMarker = document.getElementById("clickMarker");

const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");

let activeImage = null;
let target = { r: 0, g: 0, b: 0, x: 0, y: 0 };
let round = 0;
let roundResolved = false;
let selected = null;

function rgbToCss({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function clampScore(score) {
  return Math.max(0, Math.min(10, score));
}

function scoreFromColors(a, b) {
  const distance = Math.sqrt(
    (a.r - b.r) ** 2 +
    (a.g - b.g) ** 2 +
    (a.b - b.b) ** 2
  );
  const normalized = distance / DISTANCE_MAX;
  const score = clampScore(10 * (1 - normalized));
  return { score, distance };
}

function samplePixel(x, y) {
  const data = ctx.getImageData(x, y, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
}

function chooseTargetColor() {
  const x = Math.floor(Math.random() * canvas.width);
  const y = Math.floor(Math.random() * canvas.height);
  const color = samplePixel(x, y);
  target = { ...color, x, y };
  targetSwatch.style.backgroundColor = rgbToCss(target);
}

function pickRandomImageUrl() {
  return IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)];
}

async function loadRoundImage() {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";

  const src = `${pickRandomImageUrl()}?seed=${Date.now()}`;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });

  activeImage = image;
  ctx.drawImage(activeImage, 0, 0, canvas.width, canvas.height);
  chooseTargetColor();
}

async function startRound() {
  round += 1;
  roundResolved = false;
  selected = null;

  roundCount.textContent = String(round);
  scoreValue.textContent = "-";
  roundMessage.textContent = "Image loaded. Click the canvas any number of times, then press Submit.";
  targetRgbText.textContent = "RGB(-, -, -)";
  clickedSwatch.style.backgroundColor = "transparent";
  clickedRgbText.textContent = "RGB(-, -, -)";
  distanceValue.textContent = "-";
  clickMarker.hidden = true;

  submitBtn.disabled = true;
  nextBtn.disabled = true;
  startBtn.disabled = true;

  try {
    await loadRoundImage();
  } catch (err) {
    roundMessage.textContent = "Could not load image. Check your internet and try next round.";
    nextBtn.disabled = false;
  } finally {
    startBtn.disabled = round > 0;
  }
}

function getCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((event.clientX - rect.left) * scaleX);
  const y = Math.floor((event.clientY - rect.top) * scaleY);
  return { x, y, rect };
}

canvas.addEventListener("click", (event) => {
  if (!activeImage || roundResolved) return;

  const { x, y, rect } = getCanvasCoords(event);
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

  const clicked = samplePixel(x, y);
  selected = { ...clicked, x, y };

  clickedSwatch.style.backgroundColor = rgbToCss(clicked);
  clickedRgbText.textContent = "RGB(-, -, -)";
  roundMessage.textContent = "Selection updated. You can click again, then press Submit.";

  clickMarker.style.left = `${event.clientX - rect.left}px`;
  clickMarker.style.top = `${event.clientY - rect.top}px`;
  clickMarker.hidden = false;

  submitBtn.disabled = false;
});

submitBtn.addEventListener("click", () => {
  if (!activeImage || roundResolved || !selected) {
    return;
  }

  const { score, distance } = scoreFromColors(selected, target);

  scoreValue.textContent = score.toFixed(2);
  distanceValue.textContent = distance.toFixed(2);
  targetRgbText.textContent = `RGB(${target.r}, ${target.g}, ${target.b})`;
  clickedRgbText.textContent = `RGB(${selected.r}, ${selected.g}, ${selected.b})`;
  roundMessage.textContent = `Round complete. Your color similarity score is ${score.toFixed(2)}/10.`;

  roundResolved = true;
  submitBtn.disabled = true;
  nextBtn.disabled = false;
});

startBtn.addEventListener("click", startRound);
nextBtn.addEventListener("click", startRound);

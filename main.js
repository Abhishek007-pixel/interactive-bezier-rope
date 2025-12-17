/* ASSIGNMENT: Interactive Bézier Curve with Physics
   FILE: main.js
   STATUS: Optimized for 60 FPS (Mobile/Touch Support Added)
*/

import { bezierPoint, bezierTangent } from "./bezier.js";
import { SpringPoint } from "./spring.js";

/* ---------- 1. SETUP ---------- */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false }); 

// UI Elements
const uiK = document.getElementById("input-k");
const uiD = document.getElementById("input-d");
const valK = document.getElementById("val-k");
const valD = document.getElementById("val-d");
const uiGrid = document.getElementById("check-grid");
const uiTangents = document.getElementById("check-tangents");
const uiFPS = document.getElementById("fps-counter");

// --- INITIAL RESIZE (Critical Step) ---
// Set size immediately so Points are created in the right place
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ---------- 2. PHYSICS OBJECTS ---------- */

// Fixed Anchors
const p0 = { x: 50, y: canvas.height / 2 };
const p3 = { x: canvas.width - 50, y: canvas.height / 2 };

// Dynamic Points (Physics)
const p1 = new SpringPoint(canvas.width * 0.33, canvas.height / 2);
const p2 = new SpringPoint(canvas.width * 0.66, canvas.height / 2);

const OFFSET_X = 120;

/* ---------- 3. RESIZE HANDLER ---------- */
// This runs ONLY when the window is resized by the user
function handleResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Now it is safe to access p1/p2 because they definitely exist
  p1.target.x = canvas.width * 0.33;
  p1.target.y = canvas.height / 2;
  p2.target.x = canvas.width * 0.66;
  p2.target.y = canvas.height / 2;
}
window.addEventListener("resize", handleResize);

/* ---------- 4. INPUT HANDLING ---------- */

// A. Mouse Interaction
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  p1.target.x = mouseX - OFFSET_X;
  p2.target.x = mouseX + OFFSET_X;
  p1.target.y = mouseY; 
  p2.target.y = mouseY;
});

// B. Touch Interaction (Mobile/Tablet Support)
function handleTouch(e) {
  e.preventDefault(); 
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const touchX = touch.clientX - rect.left;
  const touchY = touch.clientY - rect.top;

  p1.target.x = touchX - OFFSET_X;
  p2.target.x = touchX + OFFSET_X;
  p1.target.y = touchY;
  p2.target.y = touchY;
}

canvas.addEventListener("touchstart", handleTouch, { passive: false });
canvas.addEventListener("touchmove", handleTouch, { passive: false });

canvas.addEventListener("touchend", () => {
  p1.target.x = canvas.width * 0.33;
  p1.target.y = canvas.height / 2;
  p2.target.x = canvas.width * 0.66;
  p2.target.y = canvas.height / 2;
});

canvas.addEventListener("mouseleave", () => {
  p1.target.x = canvas.width * 0.33;
  p1.target.y = canvas.height / 2;
  p2.target.x = canvas.width * 0.66;
  p2.target.y = canvas.height / 2;
});

// C. UI Controls
uiK.addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  p1.k = val;
  p2.k = val;
  valK.textContent = val.toFixed(2);
});

uiD.addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  p1.damping = val;
  p2.damping = val;
  valD.textContent = val.toFixed(2);
});

/* ---------- 5. RENDERING ---------- */

function drawGrid() {
  if (!uiGrid.checked) return;

  const step = 60;
  ctx.strokeStyle = "rgba(40, 40, 50, 0.5)"; 
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  for (let x = 0; x < canvas.width; x += step) {
    ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
  }
  for (let y = 0; y < canvas.height; y += step) {
    ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();
}

function drawBezierCurve() {
  const path = new Path2D();
  
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const pt = bezierPoint(t, p0, p1.position, p2.position, p3);
    if (i === 0) path.moveTo(pt.x, pt.y);
    else path.lineTo(pt.x, pt.y);
  }

  ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.stroke(path);

  ctx.strokeStyle = "#00d4ff"; 
  ctx.lineWidth = 3;
  ctx.stroke(path);
}

function drawTangents() {
  if (!uiTangents.checked) return;

  ctx.strokeStyle = "#67f105ff";
  ctx.lineWidth = 3;           
  ctx.beginPath();
  
  for (let i = 0; i <= 100; i += 10) { 
    const t = i / 100;
    const origin = bezierPoint(t, p0, p1.position, p2.position, p3);
    const tangent = bezierTangent(t, p0, p1.position, p2.position, p3);

    const len = Math.hypot(tangent.x, tangent.y);
    if (len < 0.001) continue;

    const nx = tangent.x / len;
    const ny = tangent.y / len;
    const scale = 50; 

    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + nx * scale, origin.y + ny * scale);
  }
  ctx.stroke();

  ctx.fillStyle = "#0fe14eff";
  for (let i = 0; i <= 100; i += 10) {
    const t = i / 100;
    const origin = bezierPoint(t, p0, p1.position, p2.position, p3);
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawControlPoints() {
  function drawDot(x, y, color, label, isFixed) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(x, y, isFixed ? 12 : 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(x, y, isFixed ? 6 : 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 11px monospace";
    ctx.fillText(label, x - 5, y - 18);
  }

  drawDot(p0.x, p0.y, "#00d4ff", "P0", true);
  drawDot(p3.x, p3.y, "#00d4ff", "P3", true);
  drawDot(p1.position.x, p1.position.y, "#ffcc00", "P1", false);
  drawDot(p2.position.x, p2.position.y, "#ffcc00", "P2", false);
}

/* ---------- 6. LOOP ---------- */

let lastTime = 0;
let frameCount = 0;

function loop(timestamp) {
  if (timestamp - lastTime >= 1000) {
    uiFPS.textContent = frameCount + " FPS";
    frameCount = 0;
    lastTime = timestamp;
  }
  frameCount++;
  
  const bg = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
  bg.addColorStop(0, "#141420");
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  p1.update();
  p2.update();

  p0.y = canvas.height / 2;
  p3.x = canvas.width - 50; 
  p3.y = canvas.height / 2;

  drawGrid();
  drawTangents();
  drawBezierCurve();
  drawControlPoints();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
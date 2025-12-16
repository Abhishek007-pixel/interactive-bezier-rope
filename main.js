/* ASSIGNMENT: Interactive Bézier Curve with Physics
   FILE: main.js
*/

import { bezierPoint, bezierTangent } from "./bezier.js";
import { SpringPoint } from "./spring.js";

/* ---------- 1. CANVAS SETUP ---------- */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------- 2. CONTROL POINTS ---------- */

// Fixed anchors
const p0 = { x: 50, y: canvas.height / 2 };
const p3 = { x: canvas.width - 50, y: canvas.height / 2 };

// Spring-controlled points
const p1 = new SpringPoint(canvas.width * 0.33, canvas.height / 2);
const p2 = new SpringPoint(canvas.width * 0.66, canvas.height / 2);

// Resting configuration
const OFFSET_X = 100;

/* ---------- 3. INPUT HANDLING ---------- */

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // X Offsets (Keep these the same)
  p1.target.x = mouseX - OFFSET_X;
  p2.target.x = mouseX + OFFSET_X;

  // --- NEW Y LOGIC ---
  // In Canvas, Y=0 is the top. 
  // Subtracting moves UP. Adding moves DOWN.
  
  p1.target.y = mouseY - 150; // Force P1 to float 150px ABOVE mouse
  p2.target.y = mouseY + 150; // Force P2 to hang 150px BELOW mouse
});

// Reset to stable resting state
canvas.addEventListener("mouseleave", () => {
  p1.target.x = canvas.width * 0.33;
  p1.target.y = canvas.height / 2;

  p2.target.x = canvas.width * 0.66;
  p2.target.y = canvas.height / 2;
});

/* ---------- 4. RENDERING ---------- */

// NEW: Draws a background grid for "Technical" feel
function drawGrid() {
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;
  const step = 50;

  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let y = 0; y < canvas.height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();
}

function drawBezierCurve() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.beginPath();

  // Sampling 200 points for high precision smoothing
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const pt = bezierPoint(t, p0, p1.position, p2.position, p3);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }

  ctx.stroke();
}

function drawTangents() {
  // 1. INCREASE VISIBILITY: Solid Red (No transparency) + Thicker Line
  ctx.strokeStyle = "#ff0044"; 
  ctx.lineWidth = 2; // Was 1, now 2 (Thicker)

  for (let i = 0; i <= 200; i += 10) {
    const t = i / 200;

    const origin = bezierPoint(t, p0, p1.position, p2.position, p3);
    const tangent = bezierTangent(t, p0, p1.position, p2.position, p3);

    const len = Math.hypot(tangent.x, tangent.y);
    if (len < 0.001) continue;

    const nx = tangent.x / len;
    const ny = tangent.y / len;

    // 2. INCREASE LENGTH: Make lines longer so they are easier to spot
    const scale = 50; // Was 25, now 50 (Longer)

    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + nx * scale, origin.y + ny * scale);
    ctx.stroke();

    // 3. TANGENT DOT: Slightly larger for better contrast
    ctx.fillStyle = "#ff0044";
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2); // Radius 3 (was 2)
    ctx.fill();
  }
}
function drawControlPoints() {
  function drawPoint(x, y, color, label) {
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow for text
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#888"; // Gray text
    ctx.font = "12px monospace";
    ctx.fillText(label, x + 12, y - 8);
  }

  drawPoint(p0.x, p0.y, "#00d2ff", "P0"); // Cyan
  drawPoint(p3.x, p3.y, "#00d2ff", "P3");
  drawPoint(p1.position.x, p1.position.y, "#ffeb3b", "P1"); // Yellow
  drawPoint(p2.position.x, p2.position.y, "#ffeb3b", "P2");
}

/* ---------- 5. MAIN LOOP ---------- */

function loop() {
  // Clear background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Grid first (behind everything)
  drawGrid();

  // Physics update
  p1.update();
  p2.update();

  // Responsive Anchors
  p0.x = 50; p0.y = canvas.height / 2;
  p3.x = canvas.width - 50; p3.y = canvas.height / 2;

  // Render Scene
  drawTangents(); // Draw tangents behind curve
  drawBezierCurve();
  drawControlPoints();

  requestAnimationFrame(loop);
}

loop();
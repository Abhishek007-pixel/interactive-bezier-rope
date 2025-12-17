
export function bezierPoint(t, p0, p1, p2, p3) {
  // Pre-calculate powers to save multiplication cycles
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  // Formula: (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
  };
}

export function bezierTangent(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;

  // Derivative Formula: 3(1-t)²(P1-P0) + 6(1-t)t(P2-P1) + 3t²(P3-P2)
  return {
    x: 3 * uu * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x),
    y: 3 * uu * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y)
  };
}


// //de castelijau bezier.js


//    DESCRIPTION: Geometric implementation (De Casteljau's Algorithm).

// 

// // Linear Interpolation
// // "Find the point t% of the way from A to B"
// function lerp(p0, p1, t) {
//   return {
//     x: (1 - t) * p0.x + t * p1.x,
//     y: (1 - t) * p0.y + t * p1.y
//   };
// }

// /
//   Calculates a point on a Cubic Bézier curve using De Casteljau's Algorithm.
//   It connects dots between moving lines.
//  
// export function bezierPoint(t, p0, p1, p2, p3) {
//   // --- LEVEL 1 (3 Lines) ---
//   // Interpolate between the 4 control points to get 3 new points
//   const a = lerp(p0, p1, t);
//   const b = lerp(p1, p2, t);
//   const c = lerp(p2, p3, t);

//   // --- LEVEL 2 (2 Lines) ---
//   // Interpolate between the 3 new points to get 2 new points
//   const d = lerp(a, b, t);
//   const e = lerp(b, c, t);

//   // --- LEVEL 3 (1 Line) ---
//   // Interpolate between the last 2 points to get the FINAL point
//   const p = lerp(d, e, t);

//   return p; 
// }

// /
//  Calculates the Tangent using Geometry.
//   In De Casteljau, the tangent is simply the vector connecting the
//  two points from Level 2 (d and e).
//  
// export function bezierTangent(t, p0, p1, p2, p3) {
//   // Re-calculate up to Level 2
//   const a = lerp(p0, p1, t);
//   const b = lerp(p1, p2, t);
//   const c = lerp(p2, p3, t);

//   const d = lerp(a, b, t);
//   const e = lerp(b, c, t);

//   // The direction from D to E is the tangent!
//   return {
//     x: e.x - d.x,
//     y: e.y - d.y
//   };
// }
// spring.js
// Simple spring-damper model

export class SpringPoint {
  constructor(x, y) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.target = { x, y };

    this.k = 0.05;        // stiffness
    this.damping = 0.6; // damping factor
  }

  update() {
    const ax =
      -this.k * (this.position.x - this.target.x) -
      this.damping * this.velocity.x;

    const ay =
      -this.k * (this.position.y - this.target.y) -
      this.damping * this.velocity.y;

    this.velocity.x += ax;
    this.velocity.y += ay;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

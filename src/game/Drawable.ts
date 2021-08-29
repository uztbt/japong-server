export abstract class Drawable {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#fff";
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  isCollidingWith(d: Drawable): boolean {
    return areColliding(d, this);
  }
}

export function areColliding(d1: Drawable, d2: Drawable): boolean {
  return d1.x < d2.x + d2.width && d1.x + d1.width > d2.x &&
    d1.y + d1.height > d2.y && d1.y < d2.y + d2.height;
}
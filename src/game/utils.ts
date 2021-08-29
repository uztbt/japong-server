export function scale([x1, x2]: [number, number], [y1, y2]: [number, number]) {
  return (x: number): number => {
    const a = (y1 - y2) / (x1 - x2);
    const b = y1 - a * x1;
    return a * x + b;
  }
}
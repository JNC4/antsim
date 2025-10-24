import { Vector2D } from './types';

// Vector math utilities
export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(v: Vector2D): Vector2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function add(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function multiply(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function magnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function limit(v: Vector2D, max: number): Vector2D {
  const mag = magnitude(v);
  if (mag > max) {
    return multiply(normalize(v), max);
  }
  return v;
}

export function rotate(v: Vector2D, angle: number): Vector2D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos
  };
}

export function angle(v: Vector2D): number {
  return Math.atan2(v.y, v.x);
}

export function angleBetween(a: Vector2D, b: Vector2D): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function randomAngle(): number {
  return Math.random() * Math.PI * 2;
}

export function randomInCircle(radius: number): Vector2D {
  const angle = randomAngle();
  const r = Math.sqrt(Math.random()) * radius;
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r
  };
}

// Spatial hashing for efficient collision detection
export class SpatialHash {
  private cellSize: number;
  private grid: Map<string, Set<any>>;

  constructor(cellSize: number = 50) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): string {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    return `${gridX},${gridY}`;
  }

  insert(item: any, position: Vector2D): void {
    const key = this.getKey(position.x, position.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(item);
  }

  clear(): void {
    this.grid.clear();
  }

  getNearby(position: Vector2D, range: number): any[] {
    const items: any[] = [];
    const minX = position.x - range;
    const maxX = position.x + range;
    const minY = position.y - range;
    const maxY = position.y + range;

    const minGridX = Math.floor(minX / this.cellSize);
    const maxGridX = Math.floor(maxX / this.cellSize);
    const minGridY = Math.floor(minY / this.cellSize);
    const maxGridY = Math.floor(maxY / this.cellSize);

    for (let gx = minGridX; gx <= maxGridX; gx++) {
      for (let gy = minGridY; gy <= maxGridY; gy++) {
        const key = `${gx},${gy}`;
        const cell = this.grid.get(key);
        if (cell) {
          items.push(...Array.from(cell));
        }
      }
    }

    return items;
  }
}

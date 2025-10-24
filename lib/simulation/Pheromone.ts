import { Vector2D } from './types';

export enum PheromoneType {
  FOOD = 'food',      // "Food this way"
  HOME = 'home',      // "Nest this way"
  EXPLORE = 'explore' // "Already explored"
}

export class PheromoneGrid {
  private width: number;
  private height: number;
  private cellSize: number;
  private gridWidth: number;
  private gridHeight: number;

  // Separate grids for each pheromone type
  private foodGrid: Float32Array;
  private homeGrid: Float32Array;
  private exploreGrid: Float32Array;

  constructor(width: number, height: number, cellSize: number = 5) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.gridWidth = Math.ceil(width / cellSize);
    this.gridHeight = Math.ceil(height / cellSize);

    const gridSize = this.gridWidth * this.gridHeight;
    this.foodGrid = new Float32Array(gridSize);
    this.homeGrid = new Float32Array(gridSize);
    this.exploreGrid = new Float32Array(gridSize);
  }

  private getIndex(x: number, y: number): number {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return -1;
    }

    return gridY * this.gridWidth + gridX;
  }

  deposit(position: Vector2D, type: PheromoneType, strength: number): void {
    const idx = this.getIndex(position.x, position.y);
    if (idx === -1) return;

    switch (type) {
      case PheromoneType.FOOD:
        this.foodGrid[idx] = Math.min(100, this.foodGrid[idx] + strength);
        break;
      case PheromoneType.HOME:
        this.homeGrid[idx] = Math.min(100, this.homeGrid[idx] + strength);
        break;
      case PheromoneType.EXPLORE:
        this.exploreGrid[idx] = Math.min(100, this.exploreGrid[idx] + strength);
        break;
    }
  }

  get(position: Vector2D, type: PheromoneType): number {
    const idx = this.getIndex(position.x, position.y);
    if (idx === -1) return 0;

    switch (type) {
      case PheromoneType.FOOD:
        return this.foodGrid[idx];
      case PheromoneType.HOME:
        return this.homeGrid[idx];
      case PheromoneType.EXPLORE:
        return this.exploreGrid[idx];
      default:
        return 0;
    }
  }

  // Get pheromone gradient direction (points toward strongest concentration)
  getGradient(position: Vector2D, type: PheromoneType, sensorRange: number): Vector2D {
    const current = this.get(position, type);
    let bestDirection: Vector2D = { x: 0, y: 0 };
    let maxStrength = current;

    // Sample in multiple directions
    const sampleAngles = 8;
    for (let i = 0; i < sampleAngles; i++) {
      const angle = (i / sampleAngles) * Math.PI * 2;
      const samplePos: Vector2D = {
        x: position.x + Math.cos(angle) * sensorRange,
        y: position.y + Math.sin(angle) * sensorRange
      };

      const strength = this.get(samplePos, type);
      if (strength > maxStrength) {
        maxStrength = strength;
        bestDirection = {
          x: Math.cos(angle),
          y: Math.sin(angle)
        };
      }
    }

    return bestDirection;
  }

  evaporate(rate: number): void {
    const decay = 1 - rate;
    for (let i = 0; i < this.foodGrid.length; i++) {
      this.foodGrid[i] *= decay;
      this.homeGrid[i] *= decay;
      this.exploreGrid[i] *= decay;
    }
  }

  diffuse(rate: number): void {
    if (rate <= 0) return;

    const tempFood = new Float32Array(this.foodGrid);
    const tempHome = new Float32Array(this.homeGrid);
    const tempExplore = new Float32Array(this.exploreGrid);

    for (let y = 1; y < this.gridHeight - 1; y++) {
      for (let x = 1; x < this.gridWidth - 1; x++) {
        const idx = y * this.gridWidth + x;

        // Average with neighbors
        const neighbors = [
          idx - 1,           // left
          idx + 1,           // right
          idx - this.gridWidth, // up
          idx + this.gridWidth  // down
        ];

        let foodSum = this.foodGrid[idx];
        let homeSum = this.homeGrid[idx];
        let exploreSum = this.exploreGrid[idx];

        for (const nIdx of neighbors) {
          foodSum += this.foodGrid[nIdx];
          homeSum += this.homeGrid[nIdx];
          exploreSum += this.exploreGrid[nIdx];
        }

        tempFood[idx] = this.foodGrid[idx] * (1 - rate) + (foodSum / 5) * rate;
        tempHome[idx] = this.homeGrid[idx] * (1 - rate) + (homeSum / 5) * rate;
        tempExplore[idx] = this.exploreGrid[idx] * (1 - rate) + (exploreSum / 5) * rate;
      }
    }

    this.foodGrid.set(tempFood);
    this.homeGrid.set(tempHome);
    this.exploreGrid.set(tempExplore);
  }

  update(evaporationRate: number, diffusionRate: number): void {
    this.evaporate(evaporationRate);
    this.diffuse(diffusionRate);
  }

  clear(): void {
    this.foodGrid.fill(0);
    this.homeGrid.fill(0);
    this.exploreGrid.fill(0);
  }

  // For rendering
  getGridData(type: PheromoneType): { data: Float32Array; width: number; height: number; cellSize: number } {
    let data: Float32Array;
    switch (type) {
      case PheromoneType.FOOD:
        data = this.foodGrid;
        break;
      case PheromoneType.HOME:
        data = this.homeGrid;
        break;
      case PheromoneType.EXPLORE:
        data = this.exploreGrid;
        break;
    }
    return {
      data,
      width: this.gridWidth,
      height: this.gridHeight,
      cellSize: this.cellSize
    };
  }
}

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

  // Separate grids for each pheromone type per colony
  private foodGrids: Map<string, Float32Array>;
  private homeGrids: Map<string, Float32Array>;
  private exploreGrid: Float32Array; // Shared exploration

  constructor(width: number, height: number, cellSize: number = 5) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.gridWidth = Math.ceil(width / cellSize);
    this.gridHeight = Math.ceil(height / cellSize);

    const gridSize = this.gridWidth * this.gridHeight;
    this.foodGrids = new Map();
    this.homeGrids = new Map();
    this.exploreGrid = new Float32Array(gridSize);
  }

  // Initialize grids for a new colony
  addColony(colonyId: string): void {
    const gridSize = this.gridWidth * this.gridHeight;
    this.foodGrids.set(colonyId, new Float32Array(gridSize));
    this.homeGrids.set(colonyId, new Float32Array(gridSize));
  }

  // Remove colony grids
  removeColony(colonyId: string): void {
    this.foodGrids.delete(colonyId);
    this.homeGrids.delete(colonyId);
  }

  private getIndex(x: number, y: number): number {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return -1;
    }

    return gridY * this.gridWidth + gridX;
  }

  deposit(position: Vector2D, type: PheromoneType, strength: number, colonyId: string = 'default'): void {
    const idx = this.getIndex(position.x, position.y);
    if (idx === -1) return;

    switch (type) {
      case PheromoneType.FOOD:
        const foodGrid = this.foodGrids.get(colonyId);
        if (foodGrid) {
          foodGrid[idx] = Math.min(100, foodGrid[idx] + strength);
        }
        break;
      case PheromoneType.HOME:
        const homeGrid = this.homeGrids.get(colonyId);
        if (homeGrid) {
          homeGrid[idx] = Math.min(100, homeGrid[idx] + strength);
        }
        break;
      case PheromoneType.EXPLORE:
        this.exploreGrid[idx] = Math.min(100, this.exploreGrid[idx] + strength);
        break;
    }
  }

  get(position: Vector2D, type: PheromoneType, colonyId: string = 'default'): number {
    const idx = this.getIndex(position.x, position.y);
    if (idx === -1) return 0;

    switch (type) {
      case PheromoneType.FOOD:
        const foodGrid = this.foodGrids.get(colonyId);
        return foodGrid ? foodGrid[idx] : 0;
      case PheromoneType.HOME:
        const homeGrid = this.homeGrids.get(colonyId);
        return homeGrid ? homeGrid[idx] : 0;
      case PheromoneType.EXPLORE:
        return this.exploreGrid[idx];
      default:
        return 0;
    }
  }

  // Get pheromone gradient direction (points toward strongest concentration)
  getGradient(position: Vector2D, type: PheromoneType, sensorRange: number, colonyId: string = 'default'): Vector2D {
    const current = this.get(position, type, colonyId);
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

      const strength = this.get(samplePos, type, colonyId);
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

    // Evaporate all colony grids
    for (const foodGrid of this.foodGrids.values()) {
      for (let i = 0; i < foodGrid.length; i++) {
        foodGrid[i] *= decay;
      }
    }

    for (const homeGrid of this.homeGrids.values()) {
      for (let i = 0; i < homeGrid.length; i++) {
        homeGrid[i] *= decay;
      }
    }

    for (let i = 0; i < this.exploreGrid.length; i++) {
      this.exploreGrid[i] *= decay;
    }
  }

  diffuse(rate: number): void {
    if (rate <= 0) return;

    // Diffuse for each colony
    for (const [colonyId, foodGrid] of this.foodGrids) {
      const tempFood = new Float32Array(foodGrid);

      for (let y = 1; y < this.gridHeight - 1; y++) {
        for (let x = 1; x < this.gridWidth - 1; x++) {
          const idx = y * this.gridWidth + x;
          const neighbors = [
            idx - 1, idx + 1,
            idx - this.gridWidth, idx + this.gridWidth
          ];

          let foodSum = foodGrid[idx];
          for (const nIdx of neighbors) {
            foodSum += foodGrid[nIdx];
          }
          tempFood[idx] = foodGrid[idx] * (1 - rate) + (foodSum / 5) * rate;
        }
      }
      foodGrid.set(tempFood);
    }

    for (const [colonyId, homeGrid] of this.homeGrids) {
      const tempHome = new Float32Array(homeGrid);

      for (let y = 1; y < this.gridHeight - 1; y++) {
        for (let x = 1; x < this.gridWidth - 1; x++) {
          const idx = y * this.gridWidth + x;
          const neighbors = [
            idx - 1, idx + 1,
            idx - this.gridWidth, idx + this.gridWidth
          ];

          let homeSum = homeGrid[idx];
          for (const nIdx of neighbors) {
            homeSum += homeGrid[nIdx];
          }
          tempHome[idx] = homeGrid[idx] * (1 - rate) + (homeSum / 5) * rate;
        }
      }
      homeGrid.set(tempHome);
    }

    // Diffuse exploration grid
    const tempExplore = new Float32Array(this.exploreGrid);
    for (let y = 1; y < this.gridHeight - 1; y++) {
      for (let x = 1; x < this.gridWidth - 1; x++) {
        const idx = y * this.gridWidth + x;
        const neighbors = [
          idx - 1, idx + 1,
          idx - this.gridWidth, idx + this.gridWidth
        ];

        let exploreSum = this.exploreGrid[idx];
        for (const nIdx of neighbors) {
          exploreSum += this.exploreGrid[nIdx];
        }
        tempExplore[idx] = this.exploreGrid[idx] * (1 - rate) + (exploreSum / 5) * rate;
      }
    }
    this.exploreGrid.set(tempExplore);
  }

  update(evaporationRate: number, diffusionRate: number): void {
    this.evaporate(evaporationRate);
    this.diffuse(diffusionRate);
  }

  clear(): void {
    for (const foodGrid of this.foodGrids.values()) {
      foodGrid.fill(0);
    }
    for (const homeGrid of this.homeGrids.values()) {
      homeGrid.fill(0);
    }
    this.exploreGrid.fill(0);
  }

  // For rendering - get all colonies' grids
  getAllColonyIds(): string[] {
    return Array.from(this.foodGrids.keys());
  }

  getGridData(type: PheromoneType, colonyId?: string): { data: Float32Array; width: number; height: number; cellSize: number } {
    let data: Float32Array;

    if (colonyId) {
      switch (type) {
        case PheromoneType.FOOD:
          data = this.foodGrids.get(colonyId) || new Float32Array(this.gridWidth * this.gridHeight);
          break;
        case PheromoneType.HOME:
          data = this.homeGrids.get(colonyId) || new Float32Array(this.gridWidth * this.gridHeight);
          break;
        case PheromoneType.EXPLORE:
          data = this.exploreGrid;
          break;
        default:
          data = this.foodGrids.get(colonyId) || new Float32Array(this.gridWidth * this.gridHeight);
          break;
      }
    } else {
      // Return first colony or default
      const firstColonyId = this.getAllColonyIds()[0] || 'default';
      switch (type) {
        case PheromoneType.FOOD:
          data = this.foodGrids.get(firstColonyId) || new Float32Array(this.gridWidth * this.gridHeight);
          break;
        case PheromoneType.HOME:
          data = this.homeGrids.get(firstColonyId) || new Float32Array(this.gridWidth * this.gridHeight);
          break;
        case PheromoneType.EXPLORE:
          data = this.exploreGrid;
          break;
        default:
          data = this.foodGrids.get(firstColonyId) || new Float32Array(this.gridWidth * this.gridHeight);
          break;
      }
    }

    return {
      data,
      width: this.gridWidth,
      height: this.gridHeight,
      cellSize: this.cellSize
    };
  }
}

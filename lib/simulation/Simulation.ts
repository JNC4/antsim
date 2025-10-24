import { Ant } from './Ant';
import { PheromoneGrid } from './Pheromone';
import { createFoodSource, isDepleted } from './Food';
import { SpatialHash } from './physics';
import {
  SimulationConfig,
  FoodSource,
  Obstacle,
  Colony,
  Vector2D,
  AntType,
  FoodType,
  DEFAULT_CONFIG
} from './types';
import * as physics from './physics';

export interface SimulationStats {
  totalAnts: number;
  activeForagers: number;
  foodCollected: number;
  activePheromoneTrails: number;
  efficiency: number;
  explorationCoverage: number;
  averageTripTime: number;
}

export class Simulation {
  config: SimulationConfig;
  ants: Ant[];
  pheromones: PheromoneGrid;
  foodSources: FoodSource[];
  obstacles: Obstacle[];
  colony: Colony;
  spatialHash: SpatialHash;

  private width: number;
  private height: number;
  private frameCount: number;
  private startTime: number;

  // Stats tracking
  private foodCollectedHistory: number[];
  private tripTimes: number[];

  constructor(width: number, height: number, config: SimulationConfig = DEFAULT_CONFIG) {
    this.width = width;
    this.height = height;
    this.config = { ...config };

    this.colony = {
      position: { x: width / 2, y: height / 2 },
      radius: 30,
      foodCollected: 0
    };

    this.ants = [];
    this.pheromones = new PheromoneGrid(width, height, 5);
    this.foodSources = [];
    this.obstacles = [];
    this.spatialHash = new SpatialHash(50);
    this.frameCount = 0;
    this.startTime = Date.now();
    this.foodCollectedHistory = [];
    this.tripTimes = [];

    this.initializeAnts();
  }

  private initializeAnts(): void {
    this.ants = [];
    const { antCount, enableScouts, enableSoldiers } = this.config;

    for (let i = 0; i < antCount; i++) {
      let type = AntType.WORKER;

      if (enableScouts && Math.random() < 0.1) {
        type = AntType.SCOUT;
      } else if (enableSoldiers && Math.random() < 0.1) {
        type = AntType.SOLDIER;
      }

      const offset = physics.randomInCircle(this.colony.radius);
      const position = physics.add(this.colony.position, offset);
      this.ants.push(new Ant(position, type));
    }
  }

  setConfig(newConfig: Partial<SimulationConfig>): void {
    const oldAntCount = this.config.antCount;
    this.config = { ...this.config, ...newConfig };

    // Reinitialize ants if count changed
    if (newConfig.antCount !== undefined && newConfig.antCount !== oldAntCount) {
      this.initializeAnts();
    }

    // Update ant types if toggles changed
    if (newConfig.enableScouts !== undefined || newConfig.enableSoldiers !== undefined) {
      this.initializeAnts();
    }
  }

  addFoodSource(position: Vector2D, type: FoodType): void {
    this.foodSources.push(createFoodSource(position, type));
  }

  addObstacle(position: Vector2D, width: number, height: number): void {
    this.obstacles.push({
      id: Math.random().toString(36).substr(2, 9),
      position,
      width,
      height
    });
  }

  removeFoodSource(id: string): void {
    this.foodSources = this.foodSources.filter(f => f.id !== id);
  }

  removeObstacle(id: string): void {
    this.obstacles = this.obstacles.filter(o => o.id !== id);
  }

  setColonyPosition(position: Vector2D): void {
    this.colony.position = position;
    // Move ants to new colony position
    for (const ant of this.ants) {
      const offset = physics.randomInCircle(this.colony.radius);
      ant.position = physics.add(position, offset);
    }
  }

  update(): void {
    this.frameCount++;

    // Update spatial hash
    this.spatialHash.clear();
    for (const ant of this.ants) {
      this.spatialHash.insert(ant, ant.position);
    }

    // Update each ant
    for (const ant of this.ants) {
      const nearbyAnts = this.spatialHash.getNearby(ant.position, 20);
      ant.update(
        this.config,
        this.pheromones,
        this.foodSources,
        this.obstacles,
        this.colony.position,
        nearbyAnts,
        this.width,
        this.height
      );

      // Check if ant reached colony with food
      if (ant.hasFood && physics.distance(ant.position, this.colony.position) < this.colony.radius) {
        this.colony.foodCollected += ant.foodCarried;
        ant.hasFood = false;
        ant.foodCarried = 0;
      }
    }

    // Update pheromones
    this.pheromones.update(this.config.evaporationRate, this.config.diffusionRate);

    // Remove depleted food sources
    this.foodSources = this.foodSources.filter(food => !isDepleted(food));

    // Track food collection history (every 60 frames)
    if (this.frameCount % 60 === 0) {
      this.foodCollectedHistory.push(this.colony.foodCollected);
      if (this.foodCollectedHistory.length > 100) {
        this.foodCollectedHistory.shift();
      }
    }
  }

  getStats(): SimulationStats {
    const activeForagers = this.ants.filter(ant => !ant.hasFood).length;
    const returningAnts = this.ants.filter(ant => ant.hasFood).length;

    // Calculate efficiency (food per ant per minute)
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const efficiency = elapsedMinutes > 0 ? this.colony.foodCollected / (this.ants.length * elapsedMinutes) : 0;

    // Estimate active pheromone trails
    let activePheromoneTrails = 0;
    const foodGrid = this.pheromones.getGridData(1 as any); // FOOD type
    for (let i = 0; i < foodGrid.data.length; i++) {
      if (foodGrid.data[i] > 10) activePheromoneTrails++;
    }

    // Exploration coverage (simplified)
    const explorationCoverage = Math.min(100, (this.frameCount / 1000) * 50);

    // Average trip time (simplified)
    const averageTripTime = returningAnts > 0 ? 30 : 0;

    return {
      totalAnts: this.ants.length,
      activeForagers,
      foodCollected: Math.round(this.colony.foodCollected),
      activePheromoneTrails,
      efficiency: Math.round(efficiency * 100) / 100,
      explorationCoverage: Math.round(explorationCoverage),
      averageTripTime
    };
  }

  reset(): void {
    this.ants = [];
    this.foodSources = [];
    this.obstacles = [];
    this.pheromones.clear();
    this.colony.foodCollected = 0;
    this.frameCount = 0;
    this.startTime = Date.now();
    this.foodCollectedHistory = [];
    this.tripTimes = [];
    this.initializeAnts();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.pheromones = new PheromoneGrid(width, height, 5);
  }
}

import { Ant } from './Ant';
import { PheromoneGrid, PheromoneType } from './Pheromone';
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
  colonies: Colony[];
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

    this.colonies = [
      {
        id: 'colony1',
        position: { x: width / 4, y: height / 2 },
        radius: 30,
        foodCollected: 0,
        color: '#8B4513',
        name: 'Brown Colony'
      }
    ];

    this.ants = [];
    this.pheromones = new PheromoneGrid(width, height, 5);
    this.pheromones.addColony('colony1');
    this.foodSources = [];
    this.obstacles = [];
    this.spatialHash = new SpatialHash(50);
    this.frameCount = 0;
    this.startTime = Date.now();
    this.foodCollectedHistory = [];
    this.tripTimes = [];

    this.initializeAnts();
  }

  // Backward compatibility
  get colony(): Colony {
    return this.colonies[0];
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
      this.ants.push(new Ant(position, 'colony1', type));
    }

    // Add rival colony ants if enabled
    if (this.config.enableRivalColony) {
      // Add rival colony if it doesn't exist
      if (this.colonies.length < 2) {
        const rivalColony: Colony = {
          id: 'colony2',
          position: { x: this.width * 0.75, y: this.height / 2 },
          radius: 30,
          foodCollected: 0,
          color: '#DC143C',
          name: 'Red Colony'
        };
        this.colonies.push(rivalColony);
        this.pheromones.addColony('colony2');
      }

      const rivalCount = this.config.rivalAntCount || this.config.antCount;
      const rivalColony = this.colonies[1];

      for (let i = 0; i < rivalCount; i++) {
        let type = AntType.WORKER;

        if (enableScouts && Math.random() < 0.1) {
          type = AntType.SCOUT;
        } else if (enableSoldiers && Math.random() < 0.1) {
          type = AntType.SOLDIER;
        }

        const offset = physics.randomInCircle(rivalColony.radius);
        const position = physics.add(rivalColony.position, offset);
        this.ants.push(new Ant(position, 'colony2', type));
      }
    } else {
      // Remove rival colony if disabled
      if (this.colonies.length > 1) {
        this.colonies = [this.colonies[0]];
        this.pheromones.removeColony('colony2');
      }
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

      // Find ant's colony
      const antColony = this.colonies.find(c => c.id === ant.colonyId) || this.colonies[0];

      ant.update(
        this.config,
        this.pheromones,
        this.foodSources,
        this.obstacles,
        antColony.position,
        nearbyAnts,
        this.width,
        this.height
      );

      // Check if ant reached its colony with food
      if (ant.hasFood && physics.distance(ant.position, antColony.position) < antColony.radius) {
        antColony.foodCollected += ant.foodCarried;
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
    // Safety check
    if (!this.ants || this.ants.length === 0) {
      return {
        totalAnts: 0,
        activeForagers: 0,
        foodCollected: 0,
        activePheromoneTrails: 0,
        efficiency: 0,
        explorationCoverage: 0,
        averageTripTime: 0
      };
    }

    const activeForagers = this.ants.filter(ant => !ant.hasFood).length;
    const returningAnts = this.ants.filter(ant => ant.hasFood).length;

    // Calculate efficiency (food per ant per minute) - combined for all colonies
    const totalFoodCollected = this.colonies.reduce((sum, c) => sum + c.foodCollected, 0);
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const efficiency = elapsedMinutes > 0 ? totalFoodCollected / (this.ants.length * elapsedMinutes) : 0;

    // Estimate active pheromone trails
    let activePheromoneTrails = 0;
    try {
      const foodGrid = this.pheromones.getGridData(PheromoneType.FOOD);
      for (let i = 0; i < foodGrid.data.length; i++) {
        if (foodGrid.data[i] > 10) activePheromoneTrails++;
      }
    } catch (e) {
      // Fallback if grid not ready
      activePheromoneTrails = 0;
    }

    // Exploration coverage (simplified)
    const explorationCoverage = Math.min(100, (this.frameCount / 1000) * 50);

    // Average trip time (simplified)
    const averageTripTime = returningAnts > 0 ? 30 : 0;

    return {
      totalAnts: this.ants.length,
      activeForagers,
      foodCollected: Math.round(totalFoodCollected),
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

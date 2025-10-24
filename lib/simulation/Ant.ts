import { Vector2D, AntState, AntType, FoodSource, Obstacle, SimulationConfig } from './types';
import { PheromoneGrid, PheromoneType } from './Pheromone';
import * as physics from './physics';
import { harvest, canCarryFood } from './Food';

export class Ant {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  type: AntType;
  state: AntState;
  hasFood: boolean;
  foodCarried: number;
  targetFood: FoodSource | null;
  path: Vector2D[];
  angle: number;
  colonyId: string;

  // Behavior parameters
  private wanderAngle: number;
  private stuckCounter: number;
  private lastPosition: Vector2D;

  constructor(position: Vector2D, colonyId: string, type: AntType = AntType.WORKER) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = { ...position };
    this.velocity = { x: 0, y: 0 };
    this.type = type;
    this.state = AntState.SEARCHING;
    this.hasFood = false;
    this.foodCarried = 0;
    this.targetFood = null;
    this.path = [];
    this.angle = physics.randomAngle();
    this.colonyId = colonyId;
    this.wanderAngle = 0;
    this.stuckCounter = 0;
    this.lastPosition = { ...position };
  }

  getSpeed(config: SimulationConfig): number {
    const baseSpeed = config.antSpeed;
    switch (this.type) {
      case AntType.SCOUT:
        return baseSpeed * 1.3;
      case AntType.SOLDIER:
        return baseSpeed * 0.8;
      case AntType.WORKER:
      default:
        return baseSpeed;
    }
  }

  getCarryingCapacity(config: SimulationConfig): number {
    const baseCapacity = config.carryingCapacity;
    switch (this.type) {
      case AntType.SOLDIER:
        return baseCapacity * 2;
      case AntType.SCOUT:
        return baseCapacity * 0.7;
      case AntType.WORKER:
      default:
        return baseCapacity;
    }
  }

  getSensorRange(config: SimulationConfig): number {
    const baseRange = config.sensorRange;
    switch (this.type) {
      case AntType.SCOUT:
        return baseRange * 1.5;
      default:
        return baseRange;
    }
  }

  update(
    config: SimulationConfig,
    pheromones: PheromoneGrid,
    foodSources: FoodSource[],
    obstacles: Obstacle[],
    colonyPosition: Vector2D,
    otherAnts: Ant[],
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // Check if stuck
    const distMoved = physics.distance(this.position, this.lastPosition);
    if (distMoved < 0.1) {
      this.stuckCounter++;
      if (this.stuckCounter > 30) {
        // Unstuck by random jump
        this.wanderAngle += (Math.random() - 0.5) * Math.PI;
        this.stuckCounter = 0;
      }
    } else {
      this.stuckCounter = 0;
    }
    this.lastPosition = { ...this.position };

    // State machine
    switch (this.state) {
      case AntState.SEARCHING:
        this.searchBehavior(config, pheromones, foodSources, colonyPosition);
        break;
      case AntState.RETURNING:
        this.returnBehavior(config, pheromones, colonyPosition);
        break;
      case AntState.FOLLOWING_TRAIL:
        this.followTrailBehavior(config, pheromones, foodSources, colonyPosition);
        break;
    }

    // Apply obstacle avoidance
    this.avoidObstacles(obstacles, config.obstacleAvoidance);

    // Apply ant avoidance (slight)
    this.avoidAnts(otherAnts, config.obstacleAvoidance * 0.5);

    // Apply velocity
    const speed = this.getSpeed(config);
    this.velocity = physics.limit(this.velocity, speed);
    this.position = physics.add(this.position, this.velocity);

    // Boundary handling
    this.position.x = Math.max(0, Math.min(canvasWidth, this.position.x));
    this.position.y = Math.max(0, Math.min(canvasHeight, this.position.y));

    // Update angle
    if (physics.magnitude(this.velocity) > 0.1) {
      this.angle = physics.angle(this.velocity);
    }

    // Record path
    if (this.path.length === 0 || physics.distance(this.position, this.path[this.path.length - 1]) > 10) {
      this.path.push({ ...this.position });
      if (this.path.length > 100) {
        this.path.shift();
      }
    }
  }

  private searchBehavior(
    config: SimulationConfig,
    pheromones: PheromoneGrid,
    foodSources: FoodSource[],
    colonyPosition: Vector2D
  ): void {
    // Check if food is nearby
    const sensorRange = this.getSensorRange(config);
    const nearbyFood = this.findNearbyFood(foodSources, sensorRange);

    if (nearbyFood) {
      // Found food! Go pick it up
      this.targetFood = nearbyFood;
      const direction = physics.subtract(nearbyFood.position, this.position);
      this.velocity = physics.multiply(physics.normalize(direction), this.getSpeed(config));

      // Try to pick up food
      if (physics.distance(this.position, nearbyFood.position) < nearbyFood.radius) {
        const capacity = this.getCarryingCapacity(config);
        const harvested = harvest(nearbyFood, capacity);
        if (harvested > 0) {
          this.hasFood = true;
          this.foodCarried = harvested;
          this.state = AntState.RETURNING;
          this.path = []; // Clear path to start recording return path
        }
      }
      return;
    }

    // Check for food pheromone trails
    const foodPheromone = pheromones.get(this.position, PheromoneType.FOOD, this.colonyId);
    if (foodPheromone > 5 && Math.random() < config.trailFollowingStrength) {
      // Switch to following trail
      this.state = AntState.FOLLOWING_TRAIL;
      return;
    }

    // Random walk with momentum (correlated random walk)
    this.wanderAngle += (Math.random() - 0.5) * config.explorationRandomness * Math.PI;

    const wanderDirection: Vector2D = {
      x: Math.cos(this.wanderAngle),
      y: Math.sin(this.wanderAngle)
    };

    // Slight bias away from colony (explore outward)
    const fromColony = physics.subtract(this.position, colonyPosition);
    const distFromColony = physics.magnitude(fromColony);

    if (distFromColony > 5) {
      const explorationBias = physics.multiply(physics.normalize(fromColony), 0.3);
      this.velocity = physics.add(
        physics.multiply(wanderDirection, 0.7),
        explorationBias
      );
    } else {
      this.velocity = wanderDirection;
    }

    // Deposit weak home pheromone
    pheromones.deposit(this.position, PheromoneType.HOME, config.pheromoneStrength * 0.3, this.colonyId);
    pheromones.deposit(this.position, PheromoneType.EXPLORE, config.pheromoneStrength * 0.5, this.colonyId);
  }

  private returnBehavior(
    config: SimulationConfig,
    pheromones: PheromoneGrid,
    colonyPosition: Vector2D
  ): void {
    // Navigate back to nest
    const toNest = physics.subtract(colonyPosition, this.position);
    const distToNest = physics.magnitude(toNest);

    if (distToNest < 30) {
      // Reached nest
      this.hasFood = false;
      this.foodCarried = 0;
      this.state = AntState.SEARCHING;
      this.targetFood = null;
      return;
    }

    // Move toward nest
    this.velocity = physics.multiply(physics.normalize(toNest), this.getSpeed(config));

    // Deposit strong food pheromone trail
    const pheromoneStrength = this.type === AntType.SCOUT ?
      config.pheromoneStrength * 0.5 :
      config.pheromoneStrength;

    pheromones.deposit(this.position, PheromoneType.FOOD, pheromoneStrength, this.colonyId);
  }

  private followTrailBehavior(
    config: SimulationConfig,
    pheromones: PheromoneGrid,
    foodSources: FoodSource[],
    colonyPosition: Vector2D
  ): void {
    // Check if food is nearby first
    const sensorRange = this.getSensorRange(config);
    const nearbyFood = this.findNearbyFood(foodSources, sensorRange);

    if (nearbyFood) {
      this.state = AntState.SEARCHING; // Will pick up food in next frame
      return;
    }

    // Follow pheromone gradient
    const gradient = pheromones.getGradient(
      this.position,
      PheromoneType.FOOD,
      sensorRange * 0.5,
      this.colonyId
    );

    const gradientStrength = physics.magnitude(gradient);

    if (gradientStrength > 0.1) {
      // Follow the trail
      this.velocity = physics.multiply(gradient, this.getSpeed(config));

      // Reinforce trail
      pheromones.deposit(this.position, PheromoneType.FOOD, config.pheromoneStrength * 0.3, this.colonyId);
    } else {
      // Lost the trail, resume searching
      this.state = AntState.SEARCHING;
    }
  }

  private findNearbyFood(foodSources: FoodSource[], range: number): FoodSource | null {
    for (const food of foodSources) {
      if (food.quantity <= 0 && food.quantity !== Infinity) continue;

      const dist = physics.distance(this.position, food.position);
      if (dist < range + food.radius) {
        return food;
      }
    }
    return null;
  }

  private avoidObstacles(obstacles: Obstacle[], strength: number): void {
    if (strength <= 0) return;

    for (const obstacle of obstacles) {
      const obstacleCenter: Vector2D = {
        x: obstacle.position.x + obstacle.width / 2,
        y: obstacle.position.y + obstacle.height / 2
      };

      const toAnt = physics.subtract(this.position, obstacleCenter);
      const dist = physics.magnitude(toAnt);
      const avoidRadius = Math.max(obstacle.width, obstacle.height) / 2 + 20;

      if (dist < avoidRadius && dist > 0) {
        const avoidForce = physics.multiply(
          physics.normalize(toAnt),
          (avoidRadius - dist) * strength * 0.1
        );
        this.velocity = physics.add(this.velocity, avoidForce);
      }
    }
  }

  private avoidAnts(otherAnts: Ant[], strength: number): void {
    if (strength <= 0) return;

    const avoidRadius = 5;
    for (const other of otherAnts) {
      if (other.id === this.id) continue;

      const toThis = physics.subtract(this.position, other.position);
      const dist = physics.magnitude(toThis);

      if (dist < avoidRadius && dist > 0) {
        const avoidForce = physics.multiply(
          physics.normalize(toThis),
          (avoidRadius - dist) * strength * 0.05
        );
        this.velocity = physics.add(this.velocity, avoidForce);
      }
    }
  }
}

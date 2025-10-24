// Core types for the ant simulation

export interface Vector2D {
  x: number;
  y: number;
}

export enum AntState {
  SEARCHING,
  RETURNING,
  FOLLOWING_TRAIL
}

export enum AntType {
  WORKER,
  SCOUT,
  SOLDIER
}

export enum FoodType {
  SMALL_CRUMB,
  MEDIUM,
  LARGE,
  SUGAR,
  PROTEIN
}

export interface SimulationConfig {
  // Colony settings
  antCount: number;
  antSpeed: number;
  sensorRange: number;
  carryingCapacity: number;

  // Pheromone settings
  evaporationRate: number;
  pheromoneStrength: number;
  diffusionRate: number;
  trailFollowingStrength: number;

  // Behavior settings
  explorationRandomness: number;
  colonyLoyalty: number;
  obstacleAvoidance: number;

  // Visual settings
  showPheromones: boolean;
  showSensors: boolean;
  showPaths: boolean;
  nightMode: boolean;

  // Ant types enabled
  enableScouts: boolean;
  enableSoldiers: boolean;
  enableObstacles: boolean;
}

export interface FoodSource {
  id: string;
  type: FoodType;
  position: Vector2D;
  quantity: number;
  maxQuantity: number;
  radius: number;
}

export interface Obstacle {
  id: string;
  position: Vector2D;
  width: number;
  height: number;
}

export interface Colony {
  position: Vector2D;
  radius: number;
  foodCollected: number;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  antCount: 100,
  antSpeed: 1.5,
  sensorRange: 30,
  carryingCapacity: 5,
  evaporationRate: 0.01,
  pheromoneStrength: 2.0,
  diffusionRate: 0.1,
  trailFollowingStrength: 0.7,
  explorationRandomness: 0.3,
  colonyLoyalty: 0.8,
  obstacleAvoidance: 1.0,
  showPheromones: true,
  showSensors: false,
  showPaths: false,
  nightMode: false,
  enableScouts: true,
  enableSoldiers: true,
  enableObstacles: false
};

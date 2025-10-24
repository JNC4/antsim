import { Simulation } from '../simulation/Simulation';
import { FoodType, SimulationConfig, DEFAULT_CONFIG } from '../simulation/types';

export interface Preset {
  name: string;
  description: string;
  setup: (simulation: Simulation, width: number, height: number) => void;
}

export const PRESETS: Preset[] = [
  {
    name: 'Simple Foraging',
    description: '50 ants, 1 nest, 3 small food sources - Learn the basics',
    setup: (sim: Simulation, w: number, h: number) => {
      sim.reset();
      sim.setConfig({
        ...DEFAULT_CONFIG,
        antCount: 50
      });

      // Add 3 small food sources around the map
      sim.addFoodSource({ x: w * 0.7, y: h * 0.3 }, FoodType.SMALL_CRUMB);
      sim.addFoodSource({ x: w * 0.3, y: h * 0.7 }, FoodType.SMALL_CRUMB);
      sim.addFoodSource({ x: w * 0.8, y: h * 0.8 }, FoodType.SMALL_CRUMB);
    }
  },
  {
    name: 'Maze Challenge',
    description: 'Navigate obstacles to reach food - Watch optimal paths emerge',
    setup: (sim: Simulation, w: number, h: number) => {
      sim.reset();
      sim.setConfig({
        ...DEFAULT_CONFIG,
        antCount: 100,
        enableObstacles: true
      });

      // Create maze walls
      const wallThickness = 10;
      sim.addObstacle({ x: w * 0.3, y: h * 0.2 }, wallThickness, h * 0.3);
      sim.addObstacle({ x: w * 0.5, y: h * 0.5 }, wallThickness, h * 0.3);
      sim.addObstacle({ x: w * 0.7, y: h * 0.2 }, wallThickness, h * 0.3);

      // Food at the end
      sim.addFoodSource({ x: w * 0.85, y: h * 0.5 }, FoodType.LARGE);
    }
  },
  {
    name: 'Multiple Food Sources',
    description: '100 ants, 5 different food types - Efficient resource allocation',
    setup: (sim: Simulation, w: number, h: number) => {
      sim.reset();
      sim.setConfig({
        ...DEFAULT_CONFIG,
        antCount: 100
      });

      // Scatter different food types
      sim.addFoodSource({ x: w * 0.2, y: h * 0.2 }, FoodType.SMALL_CRUMB);
      sim.addFoodSource({ x: w * 0.8, y: h * 0.2 }, FoodType.MEDIUM);
      sim.addFoodSource({ x: w * 0.2, y: h * 0.8 }, FoodType.PROTEIN);
      sim.addFoodSource({ x: w * 0.8, y: h * 0.8 }, FoodType.SUGAR);
      sim.addFoodSource({ x: w * 0.5, y: h * 0.1 }, FoodType.LARGE);
    }
  },
  {
    name: 'Long Distance',
    description: 'Far food source - Tests pheromone trail stability',
    setup: (sim: Simulation, w: number, h: number) => {
      sim.reset();
      sim.setConfig({
        ...DEFAULT_CONFIG,
        antCount: 75,
        evaporationRate: 0.005, // Slower evaporation for long trails
        pheromoneStrength: 3.0
      });

      // Colony on left, food on far right
      sim.setColonyPosition({ x: w * 0.1, y: h * 0.5 });
      sim.addFoodSource({ x: w * 0.9, y: h * 0.5 }, FoodType.SUGAR);
    }
  },
  {
    name: 'Obstacle Course',
    description: 'Complex environment with barriers - Food in hard-to-reach places',
    setup: (sim: Simulation, w: number, h: number) => {
      sim.reset();
      sim.setConfig({
        ...DEFAULT_CONFIG,
        antCount: 150,
        enableObstacles: true
      });

      // Create complex obstacles
      sim.addObstacle({ x: w * 0.2, y: h * 0.1 }, w * 0.1, h * 0.3);
      sim.addObstacle({ x: w * 0.4, y: h * 0.4 }, w * 0.2, h * 0.1);
      sim.addObstacle({ x: w * 0.7, y: h * 0.2 }, w * 0.1, h * 0.4);
      sim.addObstacle({ x: w * 0.3, y: h * 0.7 }, w * 0.3, h * 0.1);

      // Food in corners
      sim.addFoodSource({ x: w * 0.1, y: h * 0.1 }, FoodType.MEDIUM);
      sim.addFoodSource({ x: w * 0.9, y: h * 0.1 }, FoodType.MEDIUM);
      sim.addFoodSource({ x: w * 0.1, y: h * 0.9 }, FoodType.MEDIUM);
      sim.addFoodSource({ x: w * 0.9, y: h * 0.9 }, FoodType.LARGE);
    }
  },
  {
    name: 'Scout Mission',
    description: 'Scout ants explore efficiently - Watch different behaviors',
    setup: (sim: Simulation, w: number, h: number) => {
      sim.reset();
      sim.setConfig({
        ...DEFAULT_CONFIG,
        antCount: 80,
        enableScouts: true,
        enableSoldiers: true
      });

      // Scattered small food sources
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const dist = Math.sqrt((x - w/2)**2 + (y - h/2)**2);
        if (dist > 50) { // Not too close to colony
          sim.addFoodSource({ x, y }, FoodType.SMALL_CRUMB);
        }
      }

      // One large source
      sim.addFoodSource({ x: w * 0.8, y: h * 0.8 }, FoodType.LARGE);
    }
  }
];

export function getPreset(name: string): Preset | undefined {
  return PRESETS.find(p => p.name === name);
}

export function applyPreset(simulation: Simulation, presetName: string, width: number, height: number): boolean {
  const preset = getPreset(presetName);
  if (preset) {
    preset.setup(simulation, width, height);
    return true;
  }
  return false;
}

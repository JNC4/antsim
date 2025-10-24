'use client';

import React, { useState, useEffect, useRef } from 'react';
import SimulationCanvas from '@/components/SimulationCanvas';
import ControlPanel from '@/components/ControlPanel';
import ToolBar, { Tool } from '@/components/ToolBar';
import StatsDisplay from '@/components/StatsDisplay';
import { Simulation, SimulationStats } from '@/lib/simulation/Simulation';
import { SimulationConfig, DEFAULT_CONFIG, FoodType } from '@/lib/simulation/types';
import { applyPreset } from '@/lib/utils/presets';

export default function Home() {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [selectedFoodType, setSelectedFoodType] = useState<FoodType>(FoodType.SMALL_CRUMB);
  const [stats, setStats] = useState<SimulationStats>({
    totalAnts: 0,
    activeForagers: 0,
    foodCollected: 0,
    activePheromoneTrails: 0,
    efficiency: 0,
    explorationCoverage: 0,
    averageTripTime: 0
  });

  const canvasWidth = 800;
  const canvasHeight = 600;
  const statsIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize simulation
  useEffect(() => {
    const sim = new Simulation(canvasWidth, canvasHeight, config);

    // Add some initial food sources
    sim.addFoodSource({ x: canvasWidth * 0.7, y: canvasHeight * 0.3 }, FoodType.SMALL_CRUMB);
    sim.addFoodSource({ x: canvasWidth * 0.3, y: canvasHeight * 0.7 }, FoodType.MEDIUM);
    sim.addFoodSource({ x: canvasWidth * 0.8, y: canvasHeight * 0.8 }, FoodType.LARGE);

    setSimulation(sim);

    // Update stats periodically
    statsIntervalRef.current = setInterval(() => {
      if (sim) {
        setStats(sim.getStats());
      }
    }, 100);

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfigChange = (newConfig: Partial<SimulationConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    if (simulation) {
      simulation.setConfig(updated);
    }
  };

  const handleReset = () => {
    if (simulation) {
      simulation.reset();

      // Re-add initial food sources
      simulation.addFoodSource({ x: canvasWidth * 0.7, y: canvasHeight * 0.3 }, FoodType.SMALL_CRUMB);
      simulation.addFoodSource({ x: canvasWidth * 0.3, y: canvasHeight * 0.7 }, FoodType.MEDIUM);
      simulation.addFoodSource({ x: canvasWidth * 0.8, y: canvasHeight * 0.8 }, FoodType.LARGE);
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (!simulation) return;

    switch (selectedTool) {
      case 'food':
        simulation.addFoodSource({ x, y }, selectedFoodType);
        break;

      case 'obstacle':
        simulation.addObstacle({ x: x - 25, y: y - 25 }, 50, 50);
        break;

      case 'nest':
        simulation.setColonyPosition({ x, y });
        break;

      case 'erase':
        // Find and remove nearby food or obstacles
        const foods = simulation.foodSources.filter(f => {
          const dist = Math.sqrt((f.position.x - x) ** 2 + (f.position.y - y) ** 2);
          return dist < f.radius + 10;
        });
        foods.forEach(f => simulation.removeFoodSource(f.id));

        const obstacles = simulation.obstacles.filter(o => {
          return x >= o.position.x && x <= o.position.x + o.width &&
                 y >= o.position.y && y <= o.position.y + o.height;
        });
        obstacles.forEach(o => simulation.removeObstacle(o.id));
        break;
    }
  };

  const handlePresetSelect = (presetName: string) => {
    if (simulation) {
      applyPreset(simulation, presetName, canvasWidth, canvasHeight);
      setConfig({ ...simulation.config });
    }
  };

  if (!simulation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading simulation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🐜 AntSim - Ant Colony Simulation
          </h1>
          <p className="text-gray-600">
            Watch emergent intelligence and swarm behavior in action
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4">
          <ToolBar
            isPaused={isPaused}
            speed={speed}
            selectedTool={selectedTool}
            selectedFoodType={selectedFoodType}
            onPlayPause={() => setIsPaused(!isPaused)}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            onToolSelect={setSelectedTool}
            onFoodTypeSelect={setSelectedFoodType}
            onPresetSelect={handlePresetSelect}
          />
        </div>

        {/* Main Content */}
        <div className="flex gap-4 items-start">
          {/* Canvas */}
          <div className="flex-shrink-0">
            <SimulationCanvas
              simulation={simulation}
              config={config}
              isPaused={isPaused}
              speed={speed}
              onCanvasClick={handleCanvasClick}
            />
          </div>

          {/* Right Sidebar */}
          <div className="flex-1 space-y-4">
            <StatsDisplay stats={stats} />
            <ControlPanel config={config} onConfigChange={handleConfigChange} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Click on the canvas to place food sources, obstacles, or move the nest.
            Watch as ants discover food, create pheromone trails, and optimize their paths!
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Simulation } from '@/lib/simulation/Simulation';
import { Ant } from '@/lib/simulation/Ant';
import { PheromoneType } from '@/lib/simulation/Pheromone';
import { getFoodColor, getCurrentRadius } from '@/lib/simulation/Food';
import { FoodSource, Obstacle, AntType, FoodType, SimulationConfig } from '@/lib/simulation/types';

interface SimulationCanvasProps {
  simulation: Simulation;
  config: SimulationConfig;
  isPaused: boolean;
  speed: number;
  onCanvasClick?: (x: number, y: number) => void;
}

export default function SimulationCanvas({
  simulation,
  config,
  isPaused,
  speed,
  onCanvasClick
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  const render = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;

    // Clear canvas
    ctx.fillStyle = config.nightMode ? '#2C2C2C' : '#F5E6D3';
    ctx.fillRect(0, 0, width, height);

    // Render pheromones
    if (config.showPheromones) {
      renderPheromones(ctx, simulation, config.nightMode);
    }

    // Render obstacles
    renderObstacles(ctx, simulation.obstacles);

    // Render colony
    renderColony(ctx, simulation.colony.position, simulation.colony.radius, config.nightMode);

    // Render food sources
    renderFoodSources(ctx, simulation.foodSources);

    // Render ants
    renderAnts(ctx, simulation.ants, config);

    // Render stats overlay
    renderStatsOverlay(ctx, simulation, width);
  }, [simulation, config]);

  const animate = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Calculate delta time for consistent speed
    const deltaTime = timestamp - lastFrameTimeRef.current;
    const frameInterval = 1000 / (60 * speed); // 60 FPS base * speed multiplier

    if (!isPaused && deltaTime >= frameInterval) {
      simulation.update();
      lastFrameTimeRef.current = timestamp;
    }

    render(ctx, canvasRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [simulation, isPaused, speed, render]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onCanvasClick) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onCanvasClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onClick={handleClick}
      className="border border-gray-300 rounded-lg cursor-crosshair shadow-lg"
    />
  );
}

// Rendering helper functions
function renderPheromones(ctx: CanvasRenderingContext2D, simulation: Simulation, nightMode: boolean) {
  const foodGrid = simulation.pheromones.getGridData(PheromoneType.FOOD);
  const homeGrid = simulation.pheromones.getGridData(PheromoneType.HOME);

  // Render food pheromones (blue-cyan)
  for (let y = 0; y < foodGrid.height; y++) {
    for (let x = 0; x < foodGrid.width; x++) {
      const idx = y * foodGrid.width + x;
      const strength = foodGrid.data[idx];

      if (strength > 1) {
        const alpha = Math.min(0.6, strength / 100);
        const intensity = Math.min(255, strength * 2.5);
        ctx.fillStyle = nightMode
          ? `rgba(0, ${intensity}, 255, ${alpha})`
          : `rgba(0, ${intensity}, 255, ${alpha * 0.5})`;

        ctx.fillRect(
          x * foodGrid.cellSize,
          y * foodGrid.cellSize,
          foodGrid.cellSize,
          foodGrid.cellSize
        );
      }
    }
  }

  // Render home pheromones (green-yellow)
  for (let y = 0; y < homeGrid.height; y++) {
    for (let x = 0; x < homeGrid.width; x++) {
      const idx = y * homeGrid.width + x;
      const strength = homeGrid.data[idx];

      if (strength > 1) {
        const alpha = Math.min(0.3, strength / 150);
        const intensity = Math.min(200, strength * 2);
        ctx.fillStyle = nightMode
          ? `rgba(${intensity}, 255, 0, ${alpha})`
          : `rgba(${intensity}, 200, 0, ${alpha * 0.3})`;

        ctx.fillRect(
          x * homeGrid.cellSize,
          y * homeGrid.cellSize,
          homeGrid.cellSize,
          homeGrid.cellSize
        );
      }
    }
  }
}

function renderColony(ctx: CanvasRenderingContext2D, position: { x: number; y: number }, radius: number, nightMode: boolean) {
  // Outer circle
  ctx.fillStyle = nightMode ? '#3D2817' : '#8B4513';
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner entrance
  ctx.fillStyle = nightMode ? '#1A0F08' : '#5C2E0F';
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(position.x - radius * 0.3, position.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function renderFoodSources(ctx: CanvasRenderingContext2D, foodSources: FoodSource[]) {
  for (const food of foodSources) {
    const radius = getCurrentRadius(food);
    const color = getFoodColor(food.type);

    // Main food circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(food.position.x, food.position.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Special rendering for sugar (crystalline)
    if (food.type === FoodType.SUGAR) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const x = food.position.x + Math.cos(angle) * radius * 0.5;
        const y = food.position.y + Math.sin(angle) * radius * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Show quantity for non-infinite food
    if (food.quantity !== Infinity && food.quantity > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(food.quantity).toString(), food.position.x, food.position.y + radius + 12);
    }
  }
}

function renderAnts(ctx: CanvasRenderingContext2D, ants: Ant[], config: SimulationConfig) {
  for (const ant of ants) {
    // Ant body color based on type
    let color: string;
    let size: number;

    switch (ant.type) {
      case AntType.SCOUT:
        color = '#A0522D';
        size = 3;
        break;
      case AntType.SOLDIER:
        color = '#000000';
        size = 5;
        break;
      case AntType.WORKER:
      default:
        color = '#8B4513';
        size = 4;
        break;
    }

    // Draw path if enabled
    if (config.showPaths && ant.path.length > 1) {
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ant.path[0].x, ant.path[0].y);
      for (let i = 1; i < ant.path.length; i++) {
        ctx.lineTo(ant.path[i].x, ant.path[i].y);
      }
      ctx.stroke();
    }

    // Draw sensor range if enabled
    if (config.showSensors) {
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ant.position.x, ant.position.y, config.sensorRange, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw ant body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ant.position.x, ant.position.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw antennae
    const antennaLength = size * 2;
    const antennaAngle = 0.3;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Left antenna
    ctx.beginPath();
    ctx.moveTo(ant.position.x, ant.position.y);
    ctx.lineTo(
      ant.position.x + Math.cos(ant.angle - antennaAngle) * antennaLength,
      ant.position.y + Math.sin(ant.angle - antennaAngle) * antennaLength
    );
    ctx.stroke();

    // Right antenna
    ctx.beginPath();
    ctx.moveTo(ant.position.x, ant.position.y);
    ctx.lineTo(
      ant.position.x + Math.cos(ant.angle + antennaAngle) * antennaLength,
      ant.position.y + Math.sin(ant.angle + antennaAngle) * antennaLength
    );
    ctx.stroke();

    // Draw food if carrying
    if (ant.hasFood) {
      ctx.fillStyle = '#FFE66D';
      ctx.beginPath();
      ctx.arc(ant.position.x, ant.position.y - size - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[]) {
  for (const obstacle of obstacles) {
    // Main obstacle
    ctx.fillStyle = '#555555';
    ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);

    // Shadow effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(
      obstacle.position.x + 2,
      obstacle.position.y + 2,
      obstacle.width,
      obstacle.height
    );

    // Outline
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
  }
}

function renderStatsOverlay(ctx: CanvasRenderingContext2D, simulation: Simulation, width: number) {
  const stats = simulation.getStats();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(10, 10, 250, 80);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';

  ctx.fillText(`Ants: ${stats.totalAnts} | Foraging: ${stats.activeForagers}`, 20, 30);
  ctx.fillText(`Food collected: ${stats.foodCollected}`, 20, 50);
  ctx.fillText(`Active trails: ${stats.activePheromoneTrails}`, 20, 70);
}

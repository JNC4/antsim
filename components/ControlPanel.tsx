'use client';

import React from 'react';
import { SimulationConfig } from '@/lib/simulation/types';

interface ControlPanelProps {
  config: SimulationConfig;
  onConfigChange: (config: Partial<SimulationConfig>) => void;
}

export default function ControlPanel({ config, onConfigChange }: ControlPanelProps) {
  return (
    <div className="w-full max-w-xs bg-white rounded-lg shadow-lg p-4 space-y-4 overflow-y-auto max-h-[600px]">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Controls</h2>

      {/* Colony Settings */}
      <Section title="Colony Settings">
        <Slider
          label="Ant Count"
          value={config.antCount}
          min={10}
          max={500}
          step={10}
          onChange={(v) => onConfigChange({ antCount: v })}
        />
        <Slider
          label="Ant Speed"
          value={config.antSpeed}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(v) => onConfigChange({ antSpeed: v })}
        />
        <Slider
          label="Sensor Range"
          value={config.sensorRange}
          min={5}
          max={50}
          step={5}
          onChange={(v) => onConfigChange({ sensorRange: v })}
        />
        <Slider
          label="Carrying Capacity"
          value={config.carryingCapacity}
          min={1}
          max={10}
          step={1}
          onChange={(v) => onConfigChange({ carryingCapacity: v })}
        />
      </Section>

      {/* Pheromone Settings */}
      <Section title="Pheromone Settings">
        <Slider
          label="Evaporation Rate"
          value={config.evaporationRate}
          min={0.001}
          max={0.1}
          step={0.001}
          onChange={(v) => onConfigChange({ evaporationRate: v })}
          displayValue={(v) => v.toFixed(3)}
        />
        <Slider
          label="Pheromone Strength"
          value={config.pheromoneStrength}
          min={0.5}
          max={5}
          step={0.1}
          onChange={(v) => onConfigChange({ pheromoneStrength: v })}
        />
        <Slider
          label="Diffusion Rate"
          value={config.diffusionRate}
          min={0}
          max={0.5}
          step={0.05}
          onChange={(v) => onConfigChange({ diffusionRate: v })}
        />
        <Slider
          label="Trail Following"
          value={config.trailFollowingStrength}
          min={0}
          max={1}
          step={0.1}
          onChange={(v) => onConfigChange({ trailFollowingStrength: v })}
        />
      </Section>

      {/* Behavior Settings */}
      <Section title="Behavior Settings">
        <Slider
          label="Exploration Randomness"
          value={config.explorationRandomness}
          min={0}
          max={1}
          step={0.1}
          onChange={(v) => onConfigChange({ explorationRandomness: v })}
        />
        <Slider
          label="Colony Loyalty"
          value={config.colonyLoyalty}
          min={0}
          max={1}
          step={0.1}
          onChange={(v) => onConfigChange({ colonyLoyalty: v })}
        />
        <Slider
          label="Obstacle Avoidance"
          value={config.obstacleAvoidance}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => onConfigChange({ obstacleAvoidance: v })}
        />
      </Section>

      {/* Toggles */}
      <Section title="Visual & Features">
        <Toggle
          label="Show Pheromone Trails"
          checked={config.showPheromones}
          onChange={(v) => onConfigChange({ showPheromones: v })}
        />
        <Toggle
          label="Show Ant Sensors"
          checked={config.showSensors}
          onChange={(v) => onConfigChange({ showSensors: v })}
        />
        <Toggle
          label="Show Ant Paths"
          checked={config.showPaths}
          onChange={(v) => onConfigChange({ showPaths: v })}
        />
        <Toggle
          label="Enable Scout Ants"
          checked={config.enableScouts}
          onChange={(v) => onConfigChange({ enableScouts: v })}
        />
        <Toggle
          label="Enable Soldier Ants"
          checked={config.enableSoldiers}
          onChange={(v) => onConfigChange({ enableSoldiers: v })}
        />
        <Toggle
          label="Enable Obstacles"
          checked={config.enableObstacles}
          onChange={(v) => onConfigChange({ enableObstacles: v })}
        />
        <Toggle
          label="Night Mode"
          checked={config.nightMode}
          onChange={(v) => onConfigChange({ nightMode: v })}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="space-y-3 pl-2">
        {children}
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: (value: number) => string;
}

function Slider({ label, value, min, max, step, onChange, displayValue }: SliderProps) {
  const display = displayValue ? displayValue(value) : value.toFixed(1);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs text-gray-600">{label}</label>
        <span className="text-xs font-mono text-gray-800">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-xs text-gray-700">{label}</span>
    </label>
  );
}

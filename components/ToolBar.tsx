'use client';

import React from 'react';
import { FoodType } from '@/lib/simulation/types';
import { getFoodName } from '@/lib/simulation/Food';
import { PRESETS } from '@/lib/utils/presets';

export type Tool = 'food' | 'obstacle' | 'nest' | 'erase' | null;

interface ToolBarProps {
  isPaused: boolean;
  speed: number;
  selectedTool: Tool;
  selectedFoodType: FoodType;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onToolSelect: (tool: Tool) => void;
  onFoodTypeSelect: (type: FoodType) => void;
  onPresetSelect: (preset: string) => void;
}

export default function ToolBar({
  isPaused,
  speed,
  selectedTool,
  selectedFoodType,
  onPlayPause,
  onReset,
  onSpeedChange,
  onToolSelect,
  onFoodTypeSelect,
  onPresetSelect
}: ToolBarProps) {
  const speedOptions = [0.25, 0.5, 1, 2, 4, 10];

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 space-y-3">
      {/* Playback Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onPlayPause}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          {isPaused ? 'Play' : 'Pause'}
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
        >
          Reset
        </button>

        <div className="flex items-center space-x-2 ml-4">
          <label className="text-sm text-gray-700 font-medium">Speed:</label>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {speedOptions.map(s => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="flex items-center space-x-2 border-t pt-3">
        <label className="text-sm text-gray-700 font-medium">Tool:</label>

        <button
          onClick={() => onToolSelect('food')}
          className={`px-3 py-2 rounded font-medium ${
            selectedTool === 'food'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Add Food
        </button>

        {selectedTool === 'food' && (
          <select
            value={selectedFoodType}
            onChange={(e) => onFoodTypeSelect(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={FoodType.SMALL_CRUMB}>{getFoodName(FoodType.SMALL_CRUMB)}</option>
            <option value={FoodType.MEDIUM}>{getFoodName(FoodType.MEDIUM)}</option>
            <option value={FoodType.LARGE}>{getFoodName(FoodType.LARGE)}</option>
            <option value={FoodType.SUGAR}>{getFoodName(FoodType.SUGAR)}</option>
            <option value={FoodType.PROTEIN}>{getFoodName(FoodType.PROTEIN)}</option>
          </select>
        )}

        <button
          onClick={() => onToolSelect('obstacle')}
          className={`px-3 py-2 rounded font-medium ${
            selectedTool === 'obstacle'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Add Obstacle
        </button>

        <button
          onClick={() => onToolSelect('nest')}
          className={`px-3 py-2 rounded font-medium ${
            selectedTool === 'nest'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Move Nest
        </button>

        <button
          onClick={() => onToolSelect('erase')}
          className={`px-3 py-2 rounded font-medium ${
            selectedTool === 'erase'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Erase
        </button>

        <button
          onClick={() => onToolSelect(null)}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
        >
          None
        </button>
      </div>

      {/* Preset Selection */}
      <div className="flex items-center space-x-2 border-t pt-3">
        <label className="text-sm text-gray-700 font-medium">Preset:</label>
        <select
          onChange={(e) => e.target.value && onPresetSelect(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue=""
        >
          <option value="">Select a preset...</option>
          {PRESETS.map(preset => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

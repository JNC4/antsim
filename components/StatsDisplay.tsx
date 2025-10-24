'use client';

import React from 'react';
import { SimulationStats } from '@/lib/simulation/Simulation';

interface StatsDisplayProps {
  stats: SimulationStats;
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">Statistics</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <StatItem label="Total Ants" value={stats.totalAnts} />
        <StatItem label="Active Foragers" value={stats.activeForagers} />
        <StatItem label="Food Collected" value={stats.foodCollected} />
        <StatItem label="Active Trails" value={stats.activePheromoneTrails} />
        <StatItem label="Efficiency" value={`${stats.efficiency}/min`} />
        <StatItem label="Coverage" value={`${stats.explorationCoverage}%`} />
      </div>

      {/* Educational Info */}
      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">About Swarm Intelligence</h3>
        <div className="text-xs text-gray-600 space-y-2">
          <p>
            <strong>Stigmergy:</strong> Ants communicate indirectly through pheromone trails,
            creating complex behavior without central control.
          </p>
          <p>
            <strong>Emergence:</strong> Simple rules (follow trails, avoid obstacles) lead to
            optimal pathfinding and efficient resource allocation.
          </p>
          <p>
            <strong>Applications:</strong> Ant colony algorithms are used in network routing,
            logistics optimization, and solving traveling salesman problems.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded p-2">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-semibold text-gray-800">{value}</div>
    </div>
  );
}

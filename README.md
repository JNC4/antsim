# 🐜 AntSim - Interactive Ant Colony Simulation

A realistic, interactive simulation of ant colony behavior demonstrating swarm intelligence, pheromone trails, and emergent pathfinding.

## Features

### Realistic Ant Behavior
- **Three ant types**: Workers, Scouts (faster explorers), and Soldiers (stronger carriers)
- **State-based AI**: Searching, returning with food, and following pheromone trails
- **Obstacle avoidance**: Ants navigate around barriers and each other
- **Emergent intelligence**: No central control - optimal paths emerge naturally

### Pheromone System
- **Multiple trail types**: Food trails (blue), home trails (green), and exploration markers
- **Natural decay**: Trails evaporate over time
- **Diffusion**: Pheromones spread to adjacent cells for smooth gradients
- **Visual rendering**: See the chemical trails as they form and fade

### Interactive Controls
- **Place food sources**: 5 different food types with unique properties
- **Add obstacles**: Create mazes and challenges for ants to solve
- **Move the nest**: Relocate the colony anywhere on the map
- **Adjustable parameters**: Fine-tune ant behavior, pheromone strength, and more
- **Preset scenarios**: 6 pre-built challenges to explore different behaviors

### Real-time Statistics
- Total ants and active foragers
- Food collected
- Active pheromone trails
- Colony efficiency metrics
- Educational information about swarm intelligence

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the simulation.

### Build

```bash
npm run build
npm start
```

## How to Use

1. **Play/Pause**: Control the simulation
2. **Speed**: Adjust from 0.25x to 10x speed
3. **Place Food**: Click "Add Food", select a type, and click on the canvas
4. **Add Obstacles**: Create barriers to watch ants navigate around
5. **Move Nest**: Relocate the colony to see ants adapt
6. **Presets**: Try pre-built scenarios like "Maze Challenge" or "Long Distance"
7. **Adjust Settings**: Fine-tune ant behavior and pheromone properties in real-time

## Simulation Details

### Ant States

- **Searching**: Random walk with slight bias toward unexplored areas
- **Returning**: Navigate back to nest with food, depositing strong pheromone trail
- **Following Trail**: Follow pheromone gradient to food sources

### Pheromone Types

- **Food Pheromone** (Blue): "Food this way" - laid by ants returning with food
- **Home Pheromone** (Green): "Nest this way" - weak trail laid while searching
- **Exploration Pheromone**: Marks visited areas to prevent redundant searching

### Food Types

- **Small Crumb**: 40 units, quick to deplete
- **Medium Food**: 150 units, requires multiple trips
- **Large Food**: 500 units, sustains colony for extended time
- **Sugar Source**: Infinite supply, permanent attraction point
- **Protein Source**: 300 units, alternative food type

## Educational Value

This simulation demonstrates key concepts in:

- **Stigmergy**: Indirect communication through environmental modification
- **Swarm Intelligence**: Complex behavior from simple rules
- **Emergent Behavior**: Self-organization without central control
- **Optimization**: Natural selection of efficient paths

### Real-world Applications

Ant colony algorithms are used in:
- Network routing (AntNet protocol)
- Traveling salesman problem optimization
- Supply chain and logistics
- Job scheduling
- Robotics swarm coordination

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **HTML5 Canvas** for high-performance rendering
- **Tailwind CSS** for UI styling
- **Custom physics engine** with spatial hashing for performance

## Performance

- Optimized to handle **500+ ants** at 60 FPS
- Spatial hashing for efficient collision detection
- Float32Array for pheromone grid (memory efficient)
- RequestAnimationFrame for smooth rendering

## Contributing

This is an educational project. Feel free to:
- Add new ant behaviors
- Implement new pheromone types
- Create additional presets
- Improve performance
- Add new features (weather, predators, multiple colonies)

## License

MIT License - feel free to use for learning and education!

## Credits

Created to demonstrate emergent intelligence and swarm behavior in nature.

---

**Watch emergent intelligence in action! 🐜✨**

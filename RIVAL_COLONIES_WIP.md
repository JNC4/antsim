# Rival Colony System - Work in Progress

## Current Status

The rival colony feature is partially implemented. Here's what's been done:

### ✅ Completed
1. **Type System Updated**
   - Added `enableRivalColony` and `rivalAntCount` to SimulationConfig
   - Updated Colony interface to include `id`, `color`, and `name`
   - Made colonies support multiple instances

2. **Pheromone System Enhanced**
   - Modified PheromoneGrid to support colony-specific trails
   - Each colony now has separate food and home pheromone grids
   - Added `addColony()` and `removeColony()` methods
   - Updated deposit/get/getGradient methods to accept colonyId parameter

3. **Ant Class Updated**
   - Added `colonyId` property to Ant class
   - Constructor now requires colonyId parameter

4. **Simulation Class Partially Updated**
   - Changed from single `colony` to `colonies` array
   - Added backward compatibility getter for `colony`
   - Initialized pheromone grids for colony1

### 🚧 Remaining Work

1. **Complete Simulation Class Updates**
   - Update `initializeAnts()` to create ants for multiple colonies
   - Update `setConfig()` to handle rival colony enablement
   - Add method to add/remove rival colony
   - Update ant behavior methods to pass colonyId to pheromone calls

2. **Update Ant Behavior**
   - Pass `colonyId` to all pheromone deposit/get calls
   - Find colony by ID instead of using single colony
   - Add rival ant avoidance (ants avoid rival colony members)
   - Territorial behavior near home colony

3. **Update Rendering**
   - Render multiple colonies with different colors
   - Render pheromone trails for each colony (layered/blended)
   - Color-code ants based on colony
   - Show stats for each colony separately

4. **UI Controls**
   - Add toggle for enabling rival colony
   - Add slider for rival colony ant count
   - Add control for rival colony position
   - Show leaderboard/competition stats

5. **Preset Scenarios**
   - Add "Colony Wars" preset
   - Add "Resource Competition" preset
   - Add "Territory Control" preset

## Implementation Notes

The architecture is now set up to support multiple colonies with separate pheromone trails. The main remaining work is:

1. Wire up the colony ID throughout the ant update loop
2. Update rendering to show multiple colony colors and trails
3. Add UI controls for the rival colony feature
4. Test and balance the competition dynamics

## Design Decisions

- Each colony has its own pheromone grids for food and home trails
- Exploration pheromones are shared (all ants see where has been explored)
- Ants only follow their own colony's pheromone trails
- Food sources are neutral - any colony can harvest them
- Colonies can be positioned anywhere on the canvas

## Next Steps

1. Update all pheromone calls in Ant.ts to include colonyId
2. Update initializeAnts() to create rival colony ants
3. Update rendering in SimulationCanvas.tsx
4. Add UI controls in ControlPanel.tsx and ToolBar.tsx
5. Test and deploy

This feature will demonstrate emergent territorial behavior and resource competition between ant colonies!

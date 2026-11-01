// Module 6: Smart Vehicle & Route Optimization Engine
// Capacitated Vehicle Routing Problem (CVRP) with Route Blockage & Detour Simulation

import { computeDistanceKm } from './allocationEngine';

export function optimizeVehicleRoutes(vehicles, allocationPlan, warehouses, activeBlockages = []) {
  // Filter available vehicles and sort by capacity descending
  const fleet = vehicles.map(v => ({
    ...v,
    assignedStops: [],
    currentLoadKg: 0,
    cargoBreakdown: { food: 0, water: 0, medical: 0 },
    estimatedDistanceKm: 0,
    estimatedMinutes: 0,
    hasBlockageImpact: false,
    detourRouteUsed: null
  }));

  // Create delivery payload items for each allocated camp
  const deliveryDrops = allocationPlan
    .filter(item => item.totalWeightKg > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore); // prioritize high priority drops

  deliveryDrops.forEach(drop => {
    let remainingDropWeight = drop.totalWeightKg;
    let remainingFood = drop.allocated.food;
    let remainingWater = drop.allocated.water;
    let remainingMedical = drop.allocated.medical;

    // Distribute cargo among available vehicles without exceeding maxCapacityKg
    for (const veh of fleet) {
      if (remainingDropWeight <= 0) break;

      const availableCapacity = veh.maxCapacityKg - veh.currentLoadKg;
      if (availableCapacity > 20) { // minimum drop threshold
        const loadToAssign = Math.min(remainingDropWeight, availableCapacity);
        const ratio = loadToAssign / remainingDropWeight;

        const foodChunk = Math.round(remainingFood * ratio);
        const waterChunk = Math.round(remainingWater * ratio);
        const medChunk = Math.round(remainingMedical * ratio);

        veh.currentLoadKg += loadToAssign;
        veh.cargoBreakdown.food += foodChunk;
        veh.cargoBreakdown.water += waterChunk;
        veh.cargoBreakdown.medical += medChunk;

        veh.assignedStops.push({
          campId: drop.campId,
          campName: drop.campName,
          priorityScore: drop.priorityScore,
          priorityStatus: drop.priorityStatus,
          weightKg: loadToAssign,
          food: foodChunk,
          water: waterChunk,
          medical: medChunk,
          sequence: veh.assignedStops.length + 1
        });

        remainingDropWeight -= loadToAssign;
        remainingFood -= foodChunk;
        remainingWater -= waterChunk;
        remainingMedical -= medChunk;
      }
    }
  });

  // Calculate route metrics, distances, ETAs, and apply blockage detours
  fleet.forEach(veh => {
    const originWarehouse = warehouses.find(w => w.id === veh.currentWarehouseId) || warehouses[0];
    let prevCoord = originWarehouse.coordinates;
    let totalDistKm = 0;

    veh.assignedStops.forEach(stop => {
      // Find camp coord (mock lookup)
      const campCoords = getCampCoordinates(stop.campId);
      let legDist = computeDistanceKm(prevCoord, campCoords);

      // Check if this route leg encounters any active road blockages
      const isBlocked = activeBlockages.some(b => b.active && b.affectedCamps.some(c => stop.campName.includes(c)));
      if (isBlocked) {
        veh.hasBlockageImpact = true;
        veh.detourRouteUsed = 'Eastern Link Expressway Detour (+7.4 km)';
        legDist += 7.4; // detour penalty
      }

      totalDistKm += legDist;
      prevCoord = campCoords;
    });

    // Return to base depot
    totalDistKm += computeDistanceKm(prevCoord, originWarehouse.coordinates);
    veh.estimatedDistanceKm = Math.round(totalDistKm * 10) / 10;

    // Average disaster zone transit speed: 32 km/h without blockage, slower in waterlogged sections
    const baseMinutes = (veh.estimatedDistanceKm / 32) * 60;
    const blockageDelay = veh.hasBlockageImpact ? 45 : 0;
    veh.estimatedMinutes = Math.round(baseMinutes + blockageDelay);
  });

  return fleet;
}

function getCampCoordinates(campId) {
  const coords = {
    'camp-a': [19.1200, 72.8500],
    'camp-b': [19.2180, 72.9500],
    'camp-c': [19.0150, 72.9100],
    'camp-d': [19.0550, 72.8350],
    'camp-e': [19.2450, 72.8650]
  };
  return coords[campId] || [19.1000, 72.8800];
}

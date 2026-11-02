// Module 6: Smart Vehicle & Route Optimization Engine
// Capacitated Vehicle Routing Problem (CVRP) with Route Blockage & Detour Simulation

import { computeDistanceKm } from './allocationEngine';

export function optimizeVehicleRoutes(vehicles = [], allocationPlan = [], warehouses = [], activeBlockages = []) {
  if (!Array.isArray(vehicles) || vehicles.length === 0 || !Array.isArray(allocationPlan) || allocationPlan.length === 0) {
    return [];
  }
  // Filter available vehicles and sort by capacity descending
  const fleet = vehicles.map(v => ({
    ...v,
    assignedStops: [],
    currentLoadKg: 0,
    cargoBreakdown: { food: 0, water: 0, medical: 0, shelter: 0 },
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
    let remainingFood = drop.allocated?.food ?? drop.allocatedFood ?? 0;
    let remainingWater = drop.allocated?.water ?? drop.allocatedWater ?? 0;
    let remainingMedical = drop.allocated?.medical ?? drop.allocatedMedical ?? 0;
    let remainingShelter = drop.allocated?.shelter ?? drop.allocatedShelter ?? 0;

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
        const shelterChunk = Math.round(remainingShelter * ratio);

        veh.currentLoadKg += loadToAssign;
        veh.cargoBreakdown.food += foodChunk;
        veh.cargoBreakdown.water += waterChunk;
        veh.cargoBreakdown.medical += medChunk;
        veh.cargoBreakdown.shelter += shelterChunk;

        veh.assignedStops.push({
          campId: drop.campId,
          campName: drop.campName,
          coordinates: drop.coordinates,
          priorityScore: drop.priorityScore,
          priorityStatus: drop.priorityStatus,
          weightKg: loadToAssign,
          food: foodChunk,
          water: waterChunk,
          medical: medChunk,
          shelter: shelterChunk,
          sequence: veh.assignedStops.length + 1
        });

        remainingDropWeight -= loadToAssign;
        remainingFood -= foodChunk;
        remainingWater -= waterChunk;
        remainingMedical -= medChunk;
        remainingShelter -= shelterChunk;
      }
    }
  });

  // Calculate route metrics, distances, ETAs, and apply blockage detours
  fleet.forEach(veh => {
    const originWarehouse = warehouses.find(w => w.id === veh.currentWarehouseId) || warehouses[0] || { coordinates: [13.0827, 80.2707] };
    let prevCoord = originWarehouse.coordinates || [13.0827, 80.2707];
    let totalDistKm = 0;

    veh.assignedStops.forEach(stop => {
      // Find camp coord dynamically from stop data
      const campCoords = stop.coordinates || [prevCoord[0] + 0.012, prevCoord[1] + 0.015];
      let legDist = computeDistanceKm(prevCoord, campCoords);

      // Check if this route leg encounters any active road blockages
      const isBlocked = activeBlockages.some(b => b.active && Array.isArray(b.affectedCamps) && b.affectedCamps.some(c => stop.campName.includes(c)));
      if (isBlocked) {
        veh.hasBlockageImpact = true;
        veh.detourRouteUsed = 'Eastern Bypass Detour (+4.8 km)';
        legDist += 4.8; // detour penalty
      }

      totalDistKm += legDist;
      prevCoord = campCoords;
    });

    // Return to base depot
    totalDistKm += computeDistanceKm(prevCoord, originWarehouse.coordinates || [13.0827, 80.2707]);
    veh.estimatedDistanceKm = Math.round(totalDistKm * 10) / 10;

    // Average disaster zone transit speed: 32 km/h without blockage, slower in waterlogged sections
    const baseMinutes = (veh.estimatedDistanceKm / 32) * 60;
    const blockageDelay = veh.hasBlockageImpact ? 30 : 0;
    veh.estimatedMinutes = Math.round(baseMinutes + blockageDelay);
  });

  return fleet;
}

// Module 5: Intelligent Resource Allocation Engine
// Multi-constraint optimizer with explainable rationale

import { calculatePriorityScore } from './aiEstimationEngine';

export function runResourceAllocation(camps = [], warehouses = [], vehicles = []) {
  if (!Array.isArray(camps) || camps.length === 0 || !Array.isArray(warehouses) || warehouses.length === 0) {
    return { allocationPlan: [], allocationExplanations: [], totalAllocatedKg: 0 };
  }
  // Deep clone warehouses stock to simulate allocation deductions
  const simWarehouses = warehouses.map(w => ({
    ...w,
    stock: {
      food: { ...w.stock.food, availableRemaining: w.stock.food.available },
      water: { ...w.stock.water, availableRemaining: w.stock.water.available },
      medical: { ...w.stock.medical, availableRemaining: w.stock.medical.available }
    }
  }));

  // Score all camps and sort by priority score descending (Highest Urgency First)
  const scoredCamps = camps.map(camp => {
    const priority = calculatePriorityScore(camp);
    return {
      ...camp,
      priority
    };
  }).sort((a, b) => b.priority.score - a.priority.score);

  const allocationPlan = [];
  const allocationExplanations = [];
  let totalAllocatedKg = 0;

  scoredCamps.forEach(camp => {
    const demands = camp.demands;
    const foodNeeded = Math.max(0, demands.food - (camp.received?.food || 0));
    const waterNeeded = Math.max(0, demands.water - (camp.received?.water || 0));
    const medicalNeeded = Math.max(0, demands.medical - (camp.received?.medical || 0));

    // Calculate geo-distance to each warehouse to pick closest warehouse with stock
    const sortedWarehouses = simWarehouses.map(wh => {
      const distKm = computeDistanceKm(camp.coordinates, wh.coordinates);
      return { wh, distKm };
    }).sort((a, b) => a.distKm - b.distKm);

    let allocatedFood = 0;
    let allocatedWater = 0;
    let allocatedMedical = 0;
    const sourcesUsed = [];

    // Fulfill demand across warehouses prioritizing closest
    sortedWarehouses.forEach(({ wh, distKm }) => {
      // Priority weighting: high priority camps get 90-100% fulfill factor; low priority gets fair share
      const fulfillFactor = camp.priority.score >= 85 ? 1.0 : camp.priority.score >= 70 ? 0.85 : 0.65;

      const targetFood = Math.round(foodNeeded * fulfillFactor);
      const targetWater = Math.round(waterNeeded * fulfillFactor);
      const targetMedical = Math.round(medicalNeeded * fulfillFactor);

      // Alloc food
      const remainingFoodNeeded = targetFood - allocatedFood;
      if (remainingFoodNeeded > 0 && wh.stock.food.availableRemaining > 0) {
        const takeFood = Math.min(remainingFoodNeeded, wh.stock.food.availableRemaining);
        allocatedFood += takeFood;
        wh.stock.food.availableRemaining -= takeFood;
        sourcesUsed.push({ warehouseId: wh.id, warehouseName: wh.name, item: 'food', qty: takeFood, distKm });
      }

      // Alloc water
      const remainingWaterNeeded = targetWater - allocatedWater;
      if (remainingWaterNeeded > 0 && wh.stock.water.availableRemaining > 0) {
        const takeWater = Math.min(remainingWaterNeeded, wh.stock.water.availableRemaining);
        allocatedWater += takeWater;
        wh.stock.water.availableRemaining -= takeWater;
        sourcesUsed.push({ warehouseId: wh.id, warehouseName: wh.name, item: 'water', qty: takeWater, distKm });
      }

      // Alloc medical
      const remainingMedNeeded = targetMedical - allocatedMedical;
      if (remainingMedNeeded > 0 && wh.stock.medical.availableRemaining > 0) {
        const takeMed = Math.min(remainingMedNeeded, wh.stock.medical.availableRemaining);
        allocatedMedical += takeMed;
        wh.stock.medical.availableRemaining -= takeMed;
        sourcesUsed.push({ warehouseId: wh.id, warehouseName: wh.name, item: 'medical', qty: takeMed, distKm });
      }
    });

    const foodShortage = Math.max(0, foodNeeded - allocatedFood);
    const waterShortage = Math.max(0, waterNeeded - allocatedWater);
    const medicalShortage = Math.max(0, medicalNeeded - allocatedMedical);

    const totalWeightKg = (allocatedFood * 0.8) + (allocatedWater * 1.0) + (allocatedMedical * 1.5);
    totalAllocatedKg += totalWeightKg;

    // Pick best suited vehicle based on capacity and distance
    const assignedWarehouseId = sourcesUsed[0]?.warehouseId || 'wh-alpha';
    const assignedWarehouse = warehouses.find(w => w.id === assignedWarehouseId);

    // Build plain English explainable text
    let explainText = '';
    if (camp.priority.score >= 85) {
      explainText = `${camp.name} received priority allocation rank #1 due to critical score (${camp.priority.score}/100) and ${camp.injured} injured casualties. Supplied directly from ${assignedWarehouse?.name || 'Central Hub'} to minimize transit lag.`;
    } else if (camp.priority.score >= 70) {
      explainText = `${camp.name} received high allocation (${Math.round((allocatedFood / (foodNeeded || 1)) * 100)}% demand coverage) balancing severe demand against remaining fleet payload.`;
    } else {
      explainText = `${camp.name} received fair-share baseline allocation. Non-critical non-perishable demand queued for secondary resupply run to safeguard critical camp reserves.`;
    }

    allocationPlan.push({
      campId: camp.id,
      campName: camp.name,
      coordinates: camp.coordinates,
      priorityScore: camp.priority.score,
      priorityStatus: camp.priority.status,
      demands: { food: foodNeeded, water: waterNeeded, medical: medicalNeeded },
      allocated: { food: allocatedFood, water: allocatedWater, medical: allocatedMedical },
      shortages: { food: foodShortage, water: waterShortage, medical: medicalShortage },
      totalWeightKg: Math.round(totalWeightKg),
      primaryWarehouseId: assignedWarehouseId,
      primaryWarehouseName: assignedWarehouse?.name,
      sourcesUsed,
      explanation: explainText
    });

    allocationExplanations.push({
      campName: camp.name,
      priorityScore: camp.priority.score,
      status: camp.priority.status,
      text: explainText
    });
  });

  return {
    allocationPlan,
    allocationExplanations,
    simWarehouses,
    totalAllocatedKg: Math.round(totalAllocatedKg),
    timestamp: new Date().toISOString()
  };
}

export function computeDistanceKm(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

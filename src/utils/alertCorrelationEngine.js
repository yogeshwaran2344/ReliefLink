// Intelligent Alert Correlation & Escalation Engine for ReliefLink
// Groups multi-camp shortages into regional emergency clusters and calculates escalation states

export const ALERT_CATEGORIES = {
  CRITICAL: 'Critical',
  WARNING: 'Warning',
  OPERATIONAL: 'Operational',
  INFORMATIONAL: 'Informational'
};

export function correlateOperationalAlerts(camps, warehouses, vehicles, blockages, deliveries) {
  const alerts = [];
  const now = new Date();

  // 1. Check for Regional Shortage Correlation (Advanced Alert Correlation)
  // If multiple camps have critical shortages in the same supply category, correlate them into a single regional cluster alert.
  const criticalWaterCamps = camps.filter(c => {
    const waterShortage = (c.waterDemand || 0) - (c.allocatedWater || 0);
    return waterShortage > 100 || c.priorityScore >= 85;
  });

  if (criticalWaterCamps.length >= 2) {
    const campNames = criticalWaterCamps.map(c => c.name).join(', ');
    alerts.push({
      id: 'alert-corr-water-regional',
      isCorrelated: true,
      category: ALERT_CATEGORIES.CRITICAL,
      title: '🚨 REGIONAL CRISIS CLUSTER: Multi-Camp Potable Water Deficit',
      message: `Simultaneous acute drinking water exhaustion identified across ${criticalWaterCamps.length} sectors: [${campNames}]. Coordinated inter-depot bulk dispatch recommended.`,
      affectedEntities: criticalWaterCamps.map(c => c.name),
      recommendedAction: 'Trigger surplus redistribution from Warehouse Gamma & prioritize heavy tanker RL-03.',
      timestamp: '5 mins ago',
      assignedTo: 'Dr. Vikram Malhotra (Lead Coordinator)',
      escalationLevel: 2, // 1: Standard, 2: Escalated, 3: Emergency
      acknowledged: false,
      targetTab: 'allocation'
    });
  }

  // 2. Individual Camp Critical Urgency
  camps.forEach(camp => {
    if (camp.priorityScore >= 90) {
      alerts.push({
        id: `alert-camp-${camp.id}`,
        isCorrelated: false,
        category: ALERT_CATEGORIES.CRITICAL,
        title: `CRITICAL TRIAGE: ${camp.name} Urgency Index ${camp.priorityScore}/100`,
        message: `${camp.name} has severe casualties (${camp.injuredCount} injured) and critical supply deficit under Level-3 storm surge.`,
        affectedEntities: [camp.name],
        recommendedAction: 'Immediate medical stabilization kits and food rations dispatch.',
        timestamp: '12 mins ago',
        assignedTo: 'Disaster Coordinator',
        escalationLevel: 2,
        acknowledged: false,
        targetTab: 'priority'
      });
    }
  });

  // 3. Warehouse Inventory Warnings
  warehouses.forEach(wh => {
    const water = wh.inventory?.water || 0;
    const food = wh.inventory?.food || 0;
    if (water < 200 || food < 300) {
      alerts.push({
        id: `alert-wh-${wh.id}`,
        isCorrelated: false,
        category: ALERT_CATEGORIES.WARNING,
        title: `DEPOT BUFFER WARNING: ${wh.name} Below Threshold`,
        message: `Depot reserves depleted below minimum safety buffer (Water: ${water}L, Food: ${food} pkts).`,
        affectedEntities: [wh.name],
        recommendedAction: 'Initiate inter-warehouse surplus replenishment transfer.',
        timestamp: '25 mins ago',
        assignedTo: 'Warehouse Manager',
        escalationLevel: 1,
        acknowledged: true,
        targetTab: 'inventory'
      });
    }
  });

  // 4. Operational Fleet & Road Hazards
  const activeHazard = blockages.find(b => b.active);
  if (activeHazard) {
    alerts.push({
      id: 'alert-hazard-road',
      isCorrelated: false,
      category: ALERT_CATEGORIES.OPERATIONAL,
      title: `ACTIVE ROAD BLOCKAGE: ${activeHazard.name}`,
      message: `${activeHazard.description}. OR-Tools routing algorithm automatically activated detour (+${activeHazard.extraKm} km).`,
      affectedEntities: ['Highway 4 Western Bypass', 'Vehicles RL-01, RL-02'],
      recommendedAction: 'Monitor detour convoy transit times and driver fatigue.',
      timestamp: '35 mins ago',
      assignedTo: 'Transport Manager',
      escalationLevel: 1,
      acknowledged: true,
      targetTab: 'routing'
    });
  }

  // 5. Informational Delivery Receipts
  const completedDeliveries = deliveries.filter(d => d.stageIndex >= 5);
  if (completedDeliveries.length > 0) {
    const latest = completedDeliveries[completedDeliveries.length - 1];
    alerts.push({
      id: `alert-del-${latest.id}`,
      isCorrelated: false,
      category: ALERT_CATEGORIES.INFORMATIONAL,
      title: `DELIVERY VERIFIED: Consignment ${latest.deliveryCode}`,
      message: `Delivery receipt confirmed with biometric/manual signature at destination. Ground inventory updated.`,
      affectedEntities: [latest.deliveryCode],
      recommendedAction: 'Archive consignment ledger and release vehicle for next dispatch.',
      timestamp: '1 hour ago',
      assignedTo: 'Relief Camp Manager',
      escalationLevel: 1,
      acknowledged: true,
      targetTab: 'tracking'
    });
  }

  return alerts;
}

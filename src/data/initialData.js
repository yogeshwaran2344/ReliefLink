// ReliefLink Canonical Data Engine
// Starts completely CLEAN (0 demo/dummy records) ready for real GPS location intake

export const INITIAL_LOCATIONS = [];
export const INITIAL_WAREHOUSES = [];
export const INITIAL_VEHICLES = [];
export const INITIAL_REQUESTS = [];
export const INITIAL_DELIVERIES = [];
export const ROAD_BLOCKAGES = [];

// Helper to generate a realistic local disaster cluster centered on the user's actual GPS position
export function generateBaselineAroundLocation(centerLat = 13.0827, centerLng = 80.2707) {
  const camps = [
    {
      id: `camp-gps-1`,
      name: `Shelter Sector 1 (Northern High School)`,
      coordinates: [Number((centerLat + 0.0145).toFixed(4)), Number((centerLng - 0.0120).toFixed(4))],
      population: 850,
      injured: 28,
      disasterType: 'Flood Inundation',
      severity: 'Critical',
      lastDeliveryHoursAgo: 26,
      demands: { food: 350, water: 600, medical: 60, shelter: 40 },
      allocated: { food: 0, water: 0, medical: 0 },
      received: { food: 100, water: 150, medical: 15 },
      contactPerson: 'Sector Field Warden',
      phone: '+91 98000 00001',
      accessRoadCondition: 'Partially Submerged',
      notes: 'Urgent potable water and emergency dry food needed.'
    },
    {
      id: `camp-gps-2`,
      name: `Shelter Sector 2 (Community Stadium)`,
      coordinates: [Number((centerLat - 0.0160).toFixed(4)), Number((centerLng + 0.0140).toFixed(4))],
      population: 620,
      injured: 12,
      disasterType: 'Monsoon Overflow',
      severity: 'High',
      lastDeliveryHoursAgo: 14,
      demands: { food: 240, water: 420, medical: 35, shelter: 25 },
      allocated: { food: 0, water: 0, medical: 0 },
      received: { food: 80, water: 120, medical: 10 },
      contactPerson: 'Local Relief Volunteer',
      phone: '+91 98000 00002',
      accessRoadCondition: 'Open Highway',
      notes: 'Stable conditions, requests baby food and hygiene supplies.'
    },
    {
      id: `camp-gps-3`,
      name: `Shelter Sector 3 (Coastal Primary Ground)`,
      coordinates: [Number((centerLat + 0.0210).toFixed(4)), Number((centerLng + 0.0180).toFixed(4))],
      population: 410,
      injured: 8,
      disasterType: 'Flash Surge',
      severity: 'Moderate',
      lastDeliveryHoursAgo: 8,
      demands: { food: 160, water: 280, medical: 20, shelter: 15 },
      allocated: { food: 0, water: 0, medical: 0 },
      received: { food: 60, water: 100, medical: 8 },
      contactPerson: 'Ground Lead',
      phone: '+91 98000 00003',
      accessRoadCondition: 'Causeway Waterlogged',
      notes: 'Needs water purification tablets.'
    }
  ];

  const warehouses = [
    {
      id: `wh-gps-1`,
      name: `Central Regional Depot Alpha`,
      code: `DEPOT-A`,
      coordinates: [Number((centerLat - 0.0080).toFixed(4)), Number((centerLng - 0.0110).toFixed(4))],
      capacityKg: 15000,
      address: `Logistics Hub, Zone 1`,
      stock: {
        food: { total: 1200, reserved: 0, dispatched: 0, available: 1200, minThreshold: 300, unit: 'packets', unitWeightKg: 0.8, expiryDays: 20 },
        water: { total: 2000, reserved: 0, dispatched: 0, available: 2000, minThreshold: 500, unit: 'liters', unitWeightKg: 1.0, expiryDays: 180 },
        medical: { total: 300, reserved: 0, dispatched: 0, available: 300, minThreshold: 60, unit: 'kits', unitWeightKg: 1.5, expiryDays: 90 },
        shelter: { total: 200, reserved: 0, dispatched: 0, available: 200, minThreshold: 40, unit: 'kits', unitWeightKg: 4.0, expiryDays: 730 }
      },
      assignedVehicles: [`veh-gps-1`],
      status: 'Operational'
    },
    {
      id: `wh-gps-2`,
      name: `Coastal Staging Station Beta`,
      code: `DEPOT-B`,
      coordinates: [Number((centerLat + 0.0120).toFixed(4)), Number((centerLng + 0.0150).toFixed(4))],
      capacityKg: 10000,
      address: `Freight Depot, Zone 2`,
      stock: {
        food: { total: 400, reserved: 0, dispatched: 0, available: 400, minThreshold: 350, unit: 'packets', unitWeightKg: 0.8, expiryDays: 14 },
        water: { total: 900, reserved: 0, dispatched: 0, available: 900, minThreshold: 400, unit: 'liters', unitWeightKg: 1.0, expiryDays: 180 },
        medical: { total: 180, reserved: 0, dispatched: 0, available: 180, minThreshold: 50, unit: 'kits', unitWeightKg: 1.5, expiryDays: 60 },
        shelter: { total: 100, reserved: 0, dispatched: 0, available: 100, minThreshold: 30, unit: 'kits', unitWeightKg: 4.0, expiryDays: 730 }
      },
      assignedVehicles: [`veh-gps-2`],
      status: 'Operational (Low Food Buffer)'
    }
  ];

  const vehicles = [
    {
      id: `veh-gps-1`,
      name: `Heavy Logistics Truck RL-01`,
      type: '10-Ton Heavy Hauler',
      maxCapacityKg: 1500,
      currentLoadKg: 0,
      assignedWarehouseId: `wh-gps-1`,
      currentPosition: [Number(centerLat.toFixed(4)), Number(centerLng.toFixed(4))],
      status: 'Available',
      driverName: 'Rajesh Kumar',
      phone: '+91 98000 11001',
      speedKmh: 45
    },
    {
      id: `veh-gps-2`,
      name: `All-Terrain 4x4 Carrier RL-02`,
      type: 'Medium 4x4 High-Clearance',
      maxCapacityKg: 800,
      currentLoadKg: 0,
      assignedWarehouseId: `wh-gps-2`,
      currentPosition: [Number((centerLat + 0.0050).toFixed(4)), Number((centerLng + 0.0050).toFixed(4))],
      status: 'Available',
      driverName: 'Amit Singh',
      phone: '+91 98000 11002',
      speedKmh: 55
    }
  ];

  const blockages = [
    {
      id: `blk-gps-1`,
      name: `Arterial Causeway Bridge Submerged`,
      coordinates: [Number((centerLat + 0.0050).toFixed(4)), Number((centerLng - 0.0040).toFixed(4))],
      description: `Flood water exceeds safe transit depth. Rerouting required.`,
      active: true,
      extraKm: 4.8
    }
  ];

  const requests = [
    {
      id: `req-gps-1`,
      locationId: `camp-gps-1`,
      locationName: `Shelter Sector 1 (Northern High School)`,
      requesterName: `Sector Field Warden`,
      requesterRole: `Camp Lead`,
      phone: `+91 98000 00001`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disasterType: `Flood Inundation`,
      urgency: `Critical`,
      quantities: { food: 250, water: 450, medical: 45 },
      evidencePhoto: `https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80`,
      status: `Approved`,
      isDuplicate: false
    },
    {
      id: `req-gps-2`,
      locationId: `camp-gps-2`,
      locationName: `Shelter Sector 2 (Community Stadium)`,
      requesterName: `Local Relief Volunteer`,
      requesterRole: `Relief Volunteer`,
      phone: `+91 98000 00002`,
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disasterType: `Monsoon Overflow`,
      urgency: `High`,
      quantities: { food: 160, water: 300, medical: 25 },
      evidencePhoto: `https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80`,
      status: `Approved`,
      isDuplicate: false
    }
  ];

  const deliveries = [
    {
      id: `del-gps-1`,
      deliveryCode: `DEL-LOK-001`,
      warehouseId: `wh-gps-1`,
      warehouseName: `Central Regional Depot Alpha`,
      targetLocationId: `camp-gps-1`,
      targetLocationName: `Shelter Sector 1 (Northern High School)`,
      vehicleId: `veh-gps-1`,
      vehicleName: `Heavy Logistics Truck RL-01`,
      stageIndex: 2,
      stage: `Dispatched`,
      dispatchedQuantities: { food: 200, water: 350, medical: 30 },
      dispatchedTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verifiedQuantities: null,
      discrepancy: null,
      recipientName: 'Sector Field Warden',
      photoProofUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
      routeAudit: [
        { time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'Delivery generated by AI Allocation Engine' },
        { time: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'Dispatched from Central Regional Depot Alpha' }
      ]
    }
  ];

  return { camps, warehouses, vehicles, blockages, requests, deliveries };
}

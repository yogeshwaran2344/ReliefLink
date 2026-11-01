// ReliefLink Initial Canonical Dataset as specified in PPT
// 5 Affected Locations, 3 Warehouses, 3 Vehicles

export const INITIAL_LOCATIONS = [
  {
    id: 'camp-a',
    name: 'Camp A (Riverbank High School)',
    coordinates: [19.1200, 72.8500],
    population: 1200,
    injured: 65,
    disasterType: 'Flood',
    severity: 'High',
    lastDeliveryHoursAgo: 38,
    demands: {
      food: 450, // packets
      water: 700, // liters/bottles
      medical: 140, // kits
      shelter: 80
    },
    allocated: {
      food: 0,
      water: 0,
      medical: 0
    },
    received: {
      food: 200,
      water: 250,
      medical: 40
    },
    contactPerson: 'Dr. Ananya Roy (Camp Lead)',
    phone: '+91 98201 11001',
    accessRoadCondition: 'Partially Submerged',
    notes: 'Urgent medical aid needed for waterborne infections. Drinking water reserve exhausted.'
  },
  {
    id: 'camp-b',
    name: 'Camp B (Northern Ridge Shelter)',
    coordinates: [19.2180, 72.9500],
    population: 850,
    injured: 32,
    disasterType: 'Landslide',
    severity: 'High',
    lastDeliveryHoursAgo: 24,
    demands: {
      food: 320,
      water: 480,
      medical: 80,
      shelter: 60
    },
    allocated: {
      food: 0,
      water: 0,
      medical: 0
    },
    received: {
      food: 120,
      water: 200,
      medical: 30
    },
    contactPerson: 'Suresh Patil (Coordinator)',
    phone: '+91 98201 11002',
    accessRoadCondition: 'Debris Clearance Active',
    notes: 'Access road cleared for light vehicles only. High food requirement.'
  },
  {
    id: 'camp-c',
    name: 'Camp C (East Valley Community Center)',
    coordinates: [19.0150, 72.9100],
    population: 520,
    injured: 12,
    disasterType: 'Cyclone',
    severity: 'Medium',
    lastDeliveryHoursAgo: 16,
    demands: {
      food: 190,
      water: 310,
      medical: 45,
      shelter: 40
    },
    allocated: {
      food: 0,
      water: 0,
      medical: 0
    },
    received: {
      food: 90,
      water: 180,
      medical: 20
    },
    contactPerson: 'Meera Deshmukh (Volunteer Lead)',
    phone: '+91 98201 11003',
    accessRoadCondition: 'Operational',
    notes: 'Temporary power restored. Water supply low.'
  },
  {
    id: 'camp-d',
    name: 'Camp D (St. Jude Parish Hall)',
    coordinates: [19.0550, 72.8350],
    population: 340,
    injured: 5,
    disasterType: 'Urban Inundation',
    severity: 'Low',
    lastDeliveryHoursAgo: 10,
    demands: {
      food: 120,
      water: 200,
      medical: 25,
      shelter: 20
    },
    allocated: {
      food: 0,
      water: 0,
      medical: 0
    },
    received: {
      food: 80,
      water: 120,
      medical: 15
    },
    contactPerson: 'Father Thomas (Camp Coordinator)',
    phone: '+91 98201 11004',
    accessRoadCondition: 'Fully Accessible',
    notes: 'Adequate dry rations for next 18 hrs, requesting hygiene packs.'
  },
  {
    id: 'camp-e',
    name: 'Camp E (Delta Island Coastal Primary School)',
    coordinates: [19.2450, 72.8650],
    population: 980,
    injured: 48,
    disasterType: 'Tidal Surge / Flood',
    severity: 'Critical',
    lastDeliveryHoursAgo: 42,
    demands: {
      food: 410,
      water: 620,
      medical: 110,
      shelter: 70
    },
    allocated: {
      food: 0,
      water: 0,
      medical: 0
    },
    received: {
      food: 150,
      water: 190,
      medical: 30
    },
    contactPerson: 'Capt. R. Kulkarni (Disaster Warden)',
    phone: '+91 98201 11005',
    accessRoadCondition: 'Causeway Waterlogged',
    notes: 'Island causeway flooded at high tide. Extreme drinking water shortage.'
  }
];

export const INITIAL_WAREHOUSES = [
  {
    id: 'wh-alpha',
    name: 'Warehouse A (Central Regional Depot)',
    code: 'W-ALPHA',
    coordinates: [19.0760, 72.8777],
    capacityKg: 20000,
    address: 'BKC Logistics Hub, Zone 1',
    stock: {
      food: { total: 1100, reserved: 200, dispatched: 150, available: 750, minThreshold: 300, unit: 'packets', unitWeightKg: 0.8, expiryDays: 14 },
      water: { total: 1600, reserved: 350, dispatched: 200, available: 1050, minThreshold: 500, unit: 'liters', unitWeightKg: 1.0, expiryDays: 180 },
      medical: { total: 280, reserved: 60, dispatched: 40, available: 180, minThreshold: 75, unit: 'kits', unitWeightKg: 1.5, expiryDays: 90 },
      shelter: { total: 180, reserved: 30, dispatched: 20, available: 130, minThreshold: 50, unit: 'kits', unitWeightKg: 4.0, expiryDays: 730 }
    },
    assignedVehicles: ['veh-1'],
    status: 'Operational'
  },
  {
    id: 'wh-beta',
    name: 'Warehouse B (Northern Relief Base)',
    code: 'W-BETA',
    coordinates: [19.2200, 72.9800],
    capacityKg: 12000,
    address: 'Ghodbunder Foothills Depot, Zone 2',
    stock: {
      // Intentionally low in food to demonstrate surplus redistribution USP:
      // Warehouse A has surplus food, Warehouse B has shortage!
      food: { total: 220, reserved: 80, dispatched: 60, available: 80, minThreshold: 350, unit: 'packets', unitWeightKg: 0.8, expiryDays: 20 },
      water: { total: 850, reserved: 200, dispatched: 150, available: 500, minThreshold: 400, unit: 'liters', unitWeightKg: 1.0, expiryDays: 180 },
      medical: { total: 140, reserved: 30, dispatched: 20, available: 90, minThreshold: 60, unit: 'kits', unitWeightKg: 1.5, expiryDays: 60 },
      shelter: { total: 90, reserved: 15, dispatched: 10, available: 65, minThreshold: 30, unit: 'kits', unitWeightKg: 4.0, expiryDays: 730 }
    },
    assignedVehicles: ['veh-2'],
    status: 'Operational (Low Food Alert)'
  },
  {
    id: 'wh-gamma',
    name: 'Warehouse C (Coastal Logistics Station)',
    code: 'W-GAMMA',
    coordinates: [18.9600, 72.8250],
    capacityKg: 10000,
    address: 'South Port Container Freight Station, Zone 3',
    stock: {
      food: { total: 650, reserved: 150, dispatched: 100, available: 400, minThreshold: 200, unit: 'packets', unitWeightKg: 0.8, expiryDays: 30 },
      water: { total: 950, reserved: 200, dispatched: 180, available: 570, minThreshold: 300, unit: 'liters', unitWeightKg: 1.0, expiryDays: 180 },
      medical: { total: 110, reserved: 25, dispatched: 20, available: 65, minThreshold: 40, unit: 'kits', unitWeightKg: 1.5, expiryDays: 45 },
      shelter: { total: 70, reserved: 10, dispatched: 10, available: 50, minThreshold: 25, unit: 'kits', unitWeightKg: 4.0, expiryDays: 730 }
    },
    assignedVehicles: ['veh-3'],
    status: 'Operational'
  }
];

export const INITIAL_VEHICLES = [
  {
    id: 'veh-1',
    regNumber: 'MH-04-RL-8821',
    name: 'Heavy Truck RL-01',
    type: 'Heavy 6-Wheel Truck',
    maxCapacityKg: 1500,
    currentLoadKg: 0,
    status: 'Available', // Available, Dispatched, In Transit, Returning, Maintenance
    currentWarehouseId: 'wh-alpha',
    currentLocation: [19.0760, 72.8777],
    assignedRoute: [],
    assignedDemands: null,
    etaMinutes: 0,
    fuelLevelPercent: 92,
    driverName: 'Rajendra Singh',
    driverPhone: '+91 97000 44101'
  },
  {
    id: 'veh-2',
    regNumber: 'MH-04-RL-4412',
    name: 'All-Terrain 4x4 RL-02',
    type: 'Off-Road Cargo Truck',
    maxCapacityKg: 800,
    currentLoadKg: 0,
    status: 'Available',
    currentWarehouseId: 'wh-beta',
    currentLocation: [19.2200, 72.9800],
    assignedRoute: [],
    assignedDemands: null,
    etaMinutes: 0,
    fuelLevelPercent: 85,
    driverName: 'Vikram Joshi',
    driverPhone: '+91 97000 44102'
  },
  {
    id: 'veh-3',
    regNumber: 'MH-04-RL-1090',
    name: 'Rapid Transit Van RL-03',
    type: 'Urban Transit Van',
    maxCapacityKg: 500,
    currentLoadKg: 0,
    status: 'Available',
    currentWarehouseId: 'wh-gamma',
    currentLocation: [18.9600, 72.8250],
    assignedRoute: [],
    assignedDemands: null,
    etaMinutes: 0,
    fuelLevelPercent: 78,
    driverName: 'Faisal Khan',
    driverPhone: '+91 97000 44103'
  }
];

export const INITIAL_REQUESTS = [
  {
    id: 'req-101',
    locationId: 'camp-a',
    locationName: 'Camp A (Riverbank High School)',
    requesterName: 'Dr. Ananya Roy',
    requesterRole: 'Medical Officer / Camp Lead',
    phone: '+91 98201 11001',
    timestamp: '2026-11-01T10:15:00',
    disasterType: 'Flood',
    urgency: 'Critical',
    quantities: { food: 250, water: 450, medical: 90 },
    evidencePhoto: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    status: 'Triage Approved',
    isDuplicate: false,
    duplicateOf: null
  },
  {
    id: 'req-102',
    locationId: 'camp-e',
    locationName: 'Camp E (Delta Island Coastal Primary School)',
    requesterName: 'Capt. R. Kulkarni',
    requesterRole: 'Disaster Relief Warden',
    phone: '+91 98201 11005',
    timestamp: '2026-11-01T11:00:00',
    disasterType: 'Tidal Surge / Flood',
    urgency: 'Critical',
    quantities: { food: 260, water: 430, medical: 80 },
    evidencePhoto: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
    status: 'Triage Approved',
    isDuplicate: false,
    duplicateOf: null
  },
  {
    id: 'req-103',
    locationId: 'camp-b',
    locationName: 'Camp B (Northern Ridge Shelter)',
    requesterName: 'Suresh Patil',
    requesterRole: 'Camp Coordinator',
    phone: '+91 98201 11002',
    timestamp: '2026-11-01T11:45:00',
    disasterType: 'Landslide',
    urgency: 'High',
    quantities: { food: 200, water: 280, medical: 50 },
    evidencePhoto: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    status: 'Triage Approved',
    isDuplicate: false,
    duplicateOf: null
  },
  // Example duplicate request to demonstrate Module 2 duplicate detection:
  {
    id: 'req-104-dup',
    locationId: 'camp-a',
    locationName: 'Camp A (Riverbank High School)',
    requesterName: 'Ramesh Sawant (Local Volunteer)',
    requesterRole: 'Volunteer',
    phone: '+91 98201 99999',
    timestamp: '2026-11-01T12:05:00',
    disasterType: 'Flood',
    urgency: 'Critical',
    quantities: { food: 250, water: 400, medical: 85 },
    evidencePhoto: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    status: 'Flagged Duplicate',
    isDuplicate: true,
    duplicateOf: 'req-101',
    duplicateReason: 'Identical location (Camp A) and matching supply profile submitted within 2 hours of req-101. Auto-suppressed to prevent double allocation.'
  }
];

export const INITIAL_DELIVERIES = [
  {
    id: 'del-901',
    deliveryCode: 'DEL-2026-001',
    vehicleId: 'veh-1',
    vehicleName: 'Heavy Truck RL-01',
    warehouseId: 'wh-alpha',
    warehouseName: 'Warehouse A (Central Regional Depot)',
    targetLocationId: 'camp-a',
    targetLocationName: 'Camp A (Riverbank High School)',
    stage: 'Arrived', // 1: Delivery Created, 2: Dispatched, 3: In Transit, 4: Arrived, 5: Receipt Verification, 6: Completed
    stageIndex: 4,
    createdTimestamp: '2026-11-01T08:30:00',
    dispatchedTimestamp: '2026-11-01T09:15:00',
    arrivedTimestamp: '2026-11-01T10:45:00',
    completedTimestamp: null,
    dispatchedQuantities: {
      food: 200,
      water: 300,
      medical: 50
    },
    verifiedQuantities: {
      food: 190,
      water: 300,
      medical: 45
    },
    discrepancy: {
      foodMissing: 10,
      waterMissing: 0,
      medicalMissing: 5,
      notes: '10 food packets damaged due to water splash during transit. 5 medical kits short-shipped at loading dock.'
    },
    recipientName: 'Dr. Ananya Roy',
    recipientAcknowledgement: 'ACK-SIGNED-AR-1044',
    photoProofUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    routeAudit: [
      { time: '08:30', event: 'Allocation approved by Command Center Coordinator' },
      { time: '09:15', event: 'Dispatched from Warehouse A. Seal #RL-8821 verified.' },
      { time: '10:02', event: 'Checkpoint North Junction cleared' },
      { time: '10:45', event: 'Vehicle arrived at Camp A perimeter' }
    ]
  },
  {
    id: 'del-902',
    deliveryCode: 'DEL-2026-002',
    vehicleId: 'veh-2',
    vehicleName: 'All-Terrain 4x4 RL-02',
    warehouseId: 'wh-beta',
    warehouseName: 'Warehouse B (Northern Relief Base)',
    targetLocationId: 'camp-b',
    targetLocationName: 'Camp B (Northern Ridge Shelter)',
    stage: 'Completed',
    stageIndex: 6,
    createdTimestamp: '2026-11-01T06:00:00',
    dispatchedTimestamp: '2026-11-01T06:40:00',
    arrivedTimestamp: '2026-11-01T07:55:00',
    completedTimestamp: '2026-11-01T08:15:00',
    dispatchedQuantities: {
      food: 120,
      water: 200,
      medical: 30
    },
    verifiedQuantities: {
      food: 120,
      water: 200,
      medical: 30
    },
    discrepancy: null,
    recipientName: 'Suresh Patil',
    recipientAcknowledgement: 'ACK-SIGNED-SP-0988',
    photoProofUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
    routeAudit: [
      { time: '06:00', event: 'Emergency order generated for Northern Ridge' },
      { time: '06:40', event: 'Off-road 4x4 dispatched from Warehouse B' },
      { time: '07:55', event: 'Vehicle safely navigated debris passage and arrived' },
      { time: '08:15', event: 'Receipt verified 100% intact by Camp Coordinator Suresh Patil' }
    ]
  }
];

export const ROAD_BLOCKAGES = [
  {
    id: 'blk-1',
    roadName: 'Highway 4 Western Bypass (Near Mile 14)',
    type: 'Submerged Roadway',
    coordinates: [19.1450, 72.8600],
    active: true,
    affectedCamps: ['Camp A', 'Camp E'],
    delayAddedMinutes: 45,
    detourAvailable: true,
    detourRouteName: 'Eastern Link Expressway Detour (+7.4 km)'
  }
];

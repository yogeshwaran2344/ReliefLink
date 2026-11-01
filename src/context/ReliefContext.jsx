import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_LOCATIONS,
  INITIAL_WAREHOUSES,
  INITIAL_VEHICLES,
  INITIAL_REQUESTS,
  INITIAL_DELIVERIES,
  ROAD_BLOCKAGES
} from '../data/initialData';
import { calculatePriorityScore, checkDuplicateRequest } from '../utils/aiEstimationEngine';
import { runResourceAllocation } from '../utils/allocationEngine';
import { computeSurplusRedistribution } from '../utils/redistributionEngine';
import { optimizeVehicleRoutes } from '../utils/routingOptimizer';
import { api } from '../services/apiClient';

const ReliefContext = createContext();

export function ReliefProvider({ children }) {
  const [camps, setCamps] = useState(INITIAL_LOCATIONS);
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [blockages, setBlockages] = useState(ROAD_BLOCKAGES);

  const [backendConnected, setBackendConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allocationOutput, setAllocationOutput] = useState(null);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(), category: 'SYSTEM', message: 'ReliefLink Core Disaster Response Engine initialized.' },
    { id: 'log-2', timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString(), category: 'TRIAGE', message: 'Camp A & Camp E flagged as Critical Priority due to surge flooding.' },
    { id: 'log-3', timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(), category: 'DISPATCH', message: 'Delivery convoy DEL-2026-001 dispatched from Warehouse A to Camp A.' },
    { id: 'log-4', timestamp: new Date(Date.now() - 3600000 * 1).toLocaleTimeString(), category: 'VERIFICATION', message: 'DEL-2026-002 receipt verified intact at Northern Ridge Shelter (Camp B).' }
  ]);

  const addAuditLog = (category, message) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category,
      message
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // 1. Initial Backend Sync on Mount
  useEffect(() => {
    async function syncWithBackend() {
      try {
        await api.checkHealth();
        setBackendConnected(true);
        addAuditLog('SYSTEM', 'Connected to live FastAPI backend at http://127.0.0.1:8000 (Database persistence active).');

        // Fetch live camps from backend
        const backendLocations = await api.getLocations();
        if (backendLocations && backendLocations.length > 0) {
          const mappedCamps = backendLocations.map(l => ({
            id: l.id,
            name: l.name,
            coordinates: [l.latitude, l.longitude],
            population: l.population,
            injured: l.injured_count,
            disasterType: l.disaster_type,
            severity: l.severity,
            lastDeliveryHoursAgo: l.last_delivery_hours_ago || 12,
            demands: {
              food: l.demands_food,
              water: l.demands_water,
              medical: l.demands_medical,
              shelter: l.demands_shelter || 40
            },
            allocated: {
              food: l.allocated_food || 0,
              water: l.allocated_water || 0,
              medical: l.allocated_medical || 0
            },
            received: {
              food: l.received_food || 0,
              water: l.received_water || 0,
              medical: l.received_medical || 0
            },
            contactPerson: l.contact_person,
            phone: l.phone,
            accessRoadCondition: l.access_road_condition,
            notes: l.notes
          }));
          setCamps(mappedCamps);
        }

        // Fetch live requests
        const backendRequests = await api.getRequests();
        if (backendRequests && backendRequests.length > 0) {
          const mappedReqs = backendRequests.map(r => ({
            id: r.id,
            locationId: r.location_id,
            locationName: camps.find(c => c.id === r.location_id)?.name || r.location_id,
            requesterName: r.requester_name,
            requesterRole: r.requester_role,
            phone: r.phone,
            timestamp: r.timestamp,
            disasterType: 'Flood',
            urgency: r.urgency,
            quantities: { food: r.food_qty, water: r.water_qty, medical: r.medical_qty },
            evidencePhoto: r.evidence_photo_url || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
            status: r.status,
            isDuplicate: r.is_duplicate,
            duplicateOf: r.duplicate_of_id,
            duplicateReason: r.duplicate_reason
          }));
          setRequests(mappedReqs);
        }

        // Fetch live warehouses
        const backendWarehouses = await api.getWarehouses();
        if (backendWarehouses && backendWarehouses.length > 0) {
          const mappedWh = backendWarehouses.map(w => {
            const stockMap = {
              food: { total: 1000, reserved: 200, dispatched: 100, available: 700, minThreshold: 300, unit: 'packets', unitWeightKg: 0.8, expiryDays: 20 },
              water: { total: 1500, reserved: 300, dispatched: 150, available: 1050, minThreshold: 500, unit: 'liters', unitWeightKg: 1.0, expiryDays: 180 },
              medical: { total: 250, reserved: 50, dispatched: 30, available: 170, minThreshold: 60, unit: 'kits', unitWeightKg: 1.5, expiryDays: 90 },
              shelter: { total: 150, reserved: 25, dispatched: 15, available: 110, minThreshold: 40, unit: 'kits', unitWeightKg: 4.0, expiryDays: 730 }
            };

            w.inventory_items?.forEach(inv => {
              if (stockMap[inv.category]) {
                stockMap[inv.category] = {
                  total: inv.total_qty,
                  reserved: inv.reserved_qty,
                  dispatched: inv.dispatched_qty,
                  available: inv.available_qty,
                  minThreshold: inv.min_threshold,
                  unit: inv.unit,
                  unitWeightKg: inv.unit_weight_kg,
                  expiryDays: inv.expiry_days
                };
              }
            });

            return {
              id: w.id,
              name: w.name,
              code: w.code,
              coordinates: [w.latitude, w.longitude],
              capacityKg: w.capacity_kg,
              address: w.address,
              stock: stockMap,
              assignedVehicles: w.id === 'wh-alpha' ? ['veh-1'] : w.id === 'wh-beta' ? ['veh-2'] : ['veh-3'],
              status: w.status
            };
          });
          setWarehouses(mappedWh);
        }

      } catch (err) {
        console.warn('Backend offline or not reachable, using resilient local storage baseline:', err.message);
        setBackendConnected(false);
      }
    }

    syncWithBackend();
  }, []);

  // Compute Initial Allocation automatically
  useEffect(() => {
    const result = runResourceAllocation(camps, warehouses, vehicles);
    setAllocationOutput(result);
  }, [camps, warehouses, vehicles]);

  // Register a new affected location
  const registerCamp = async (campData) => {
    const newCamp = {
      id: `camp-${Date.now().toString().slice(-6)}`,
      name: campData.name,
      coordinates: [parseFloat(campData.lat), parseFloat(campData.lng)],
      population: parseInt(campData.population, 10) || 100,
      injured: parseInt(campData.injured, 10) || 0,
      disasterType: campData.disasterType || 'Flood',
      severity: campData.severity || 'Medium',
      lastDeliveryHoursAgo: 0,
      demands: {
        food: parseInt(campData.demands?.food, 10) || 0,
        water: parseInt(campData.demands?.water, 10) || 0,
        medical: parseInt(campData.demands?.medical, 10) || 0,
        shelter: parseInt(campData.demands?.shelter, 10) || 0
      },
      allocated: { food: 0, water: 0, medical: 0 },
      received: { food: 0, water: 0, medical: 0 },
      contactPerson: campData.contactPerson || 'Emergency Volunteer',
      phone: campData.phone || '+91 98200 00000',
      accessRoadCondition: campData.accessRoadCondition || 'Open',
      notes: campData.notes || 'Newly registered disaster station.'
    };

    setCamps(prev => [...prev, newCamp]);
    addAuditLog('LOCATION', `New affected location registered: ${newCamp.name} (${newCamp.population} pop, ${newCamp.disasterType})`);

    // Sync to backend if online
    if (backendConnected) {
      try {
        await api.createLocation({
          name: newCamp.name,
          latitude: newCamp.coordinates[0],
          longitude: newCamp.coordinates[1],
          population: newCamp.population,
          injured_count: newCamp.injured,
          severity: newCamp.severity,
          disaster_type: newCamp.disasterType,
          access_road_condition: newCamp.accessRoadCondition,
          contact_person: newCamp.contactPerson,
          phone: newCamp.phone,
          notes: newCamp.notes,
          demands_food: newCamp.demands.food,
          demands_water: newCamp.demands.water,
          demands_medical: newCamp.demands.medical
        });
      } catch (e) {
        console.warn('Backend sync failed:', e.message);
      }
    }

    return newCamp;
  };

  // Submit relief request with duplicate detection
  const submitRequest = async (reqData) => {
    let dupCheck = checkDuplicateRequest(reqData, requests);
    let newRequest = null;

    if (backendConnected) {
      try {
        const backendRes = await api.createRequest({
          location_id: reqData.locationId,
          requester_name: reqData.requesterName,
          requester_role: reqData.requesterRole,
          phone: reqData.phone,
          urgency: reqData.urgency,
          food_qty: reqData.quantities.food,
          water_qty: reqData.quantities.water,
          medical_qty: reqData.quantities.medical,
          evidence_photo_url: reqData.evidencePhoto
        });

        dupCheck = {
          isDuplicate: backendRes.is_duplicate,
          duplicateOf: backendRes.duplicate_of_id,
          reason: backendRes.duplicate_reason
        };

        newRequest = {
          id: backendRes.id,
          locationId: backendRes.location_id,
          locationName: reqData.locationName,
          requesterName: backendRes.requester_name,
          requesterRole: backendRes.requester_role,
          phone: backendRes.phone,
          timestamp: backendRes.timestamp,
          disasterType: reqData.disasterType || 'Flood',
          urgency: backendRes.urgency,
          quantities: reqData.quantities,
          evidencePhoto: reqData.evidencePhoto,
          status: backendRes.status,
          isDuplicate: backendRes.is_duplicate,
          duplicateOf: backendRes.duplicate_of_id,
          duplicateReason: backendRes.duplicate_reason
        };
      } catch (err) {
        console.warn('Backend call failed, using local duplicate detection:', err.message);
      }
    }

    if (!newRequest) {
      newRequest = {
        id: `req-${Date.now().toString().slice(-4)}`,
        locationId: reqData.locationId,
        locationName: reqData.locationName,
        requesterName: reqData.requesterName,
        requesterRole: reqData.requesterRole || 'Volunteer',
        phone: reqData.phone,
        timestamp: new Date().toISOString(),
        disasterType: reqData.disasterType || 'Flood',
        urgency: reqData.urgency || 'Medium',
        quantities: reqData.quantities,
        evidencePhoto: reqData.evidencePhoto || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        status: dupCheck.isDuplicate ? 'Flagged Duplicate' : 'Triage Approved',
        isDuplicate: dupCheck.isDuplicate,
        duplicateOf: dupCheck.duplicateOf,
        duplicateReason: dupCheck.reason
      };
    }

    setRequests(prev => [newRequest, ...prev]);

    if (!dupCheck.isDuplicate) {
      setCamps(prev => prev.map(c => {
        if (c.id === newRequest.locationId) {
          return {
            ...c,
            demands: {
              food: c.demands.food + newRequest.quantities.food,
              water: c.demands.water + newRequest.quantities.water,
              medical: c.demands.medical + newRequest.quantities.medical,
              shelter: c.demands.shelter
            }
          };
        }
        return c;
      }));
      addAuditLog('REQUEST', `Relief request ${newRequest.id} validated for ${newRequest.locationName} (${newRequest.urgency} urgency)`);
    } else {
      addAuditLog('SECURITY', `Duplicate relief request ${newRequest.id} flagged & suppressed: ${dupCheck.reason}`);
    }

    return { request: newRequest, duplicate: dupCheck };
  };

  // Run AI allocation engine
  const triggerAIAllocation = async () => {
    let result = null;

    if (backendConnected) {
      try {
        const backendAllocations = await api.optimizeAllocations();
        if (backendAllocations && backendAllocations.length > 0) {
          addAuditLog('AI_ALLOCATION', `Backend Optimization executed via FastAPI: ${backendAllocations.length} allocations computed and saved to database.`);
        }
      } catch (e) {
        console.warn('Backend allocation optimization failed:', e.message);
      }
    }

    result = runResourceAllocation(camps, warehouses, vehicles);
    setAllocationOutput(result);

    // Update camps allocated counts
    setCamps(prev => prev.map(c => {
      const match = result.allocationPlan.find(p => p.campId === c.id);
      if (match) {
        return { ...c, allocated: { ...match.allocated } };
      }
      return c;
    }));

    addAuditLog('AI_ALLOCATION', `Intelligent Resource Allocation executed. ${result.totalAllocatedKg} kg relief materials optimally apportioned across 5 locations.`);
    return result;
  };

  // Execute surplus redistribution
  const executeSurplusTransfer = async (recommendation) => {
    if (backendConnected) {
      try {
        await api.executeSurplusTransfer({
          donor_warehouse_id: recommendation.donorId,
          recipient_warehouse_id: recommendation.recipientId,
          category: recommendation.item,
          transfer_qty: recommendation.recommendedTransferQty
        });
      } catch (e) {
        console.warn('Backend surplus transfer failed:', e.message);
      }
    }

    setWarehouses(prev => prev.map(wh => {
      if (wh.id === recommendation.donorId) {
        const item = recommendation.item;
        return {
          ...wh,
          stock: {
            ...wh.stock,
            [item]: {
              ...wh.stock[item],
              available: wh.stock[item].available - recommendation.recommendedTransferQty,
              dispatched: wh.stock[item].dispatched + recommendation.recommendedTransferQty
            }
          }
        };
      }
      if (wh.id === recommendation.recipientId) {
        const item = recommendation.item;
        return {
          ...wh,
          stock: {
            ...wh.stock,
            [item]: {
              ...wh.stock[item],
              total: wh.stock[item].total + recommendation.recommendedTransferQty,
              available: wh.stock[item].available + recommendation.recommendedTransferQty
            }
          }
        };
      }
      return wh;
    }));

    addAuditLog('SURPLUS_TRANSFER', `Redistributed ${recommendation.recommendedTransferQty} ${recommendation.unit} of ${recommendation.itemDisplayName} from ${recommendation.donorName} to ${recommendation.recipientName}.`);
  };

  // Toggle Road Blockage Simulation
  const toggleBlockage = (blockageId) => {
    setBlockages(prev => prev.map(b => {
      if (b.id === blockageId) {
        const nextState = !b.active;
        addAuditLog('ROUTE_SIMULATION', `Hazard status updated for ${b.roadName}: ${nextState ? 'ROAD BLOCKED' : 'CLEARED'}. Recomputing multi-hop fleet routing.`);
        return { ...b, active: nextState };
      }
      return b;
    }));
  };

  // Advance delivery lifecycle stage
  const updateDeliveryStage = async (deliveryId, newStageIndex) => {
    const stages = [
      'Delivery Created',
      'Dispatched',
      'In Transit',
      'Arrived',
      'Receipt Verification',
      'Completed'
    ];

    if (backendConnected) {
      try {
        await api.updateDeliveryStage(deliveryId, newStageIndex);
      } catch (e) {
        console.warn('Backend stage update failed:', e.message);
      }
    }

    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        const stageName = stages[newStageIndex - 1];
        const updated = {
          ...del,
          stageIndex: newStageIndex,
          stage: stageName,
          routeAudit: [
            ...del.routeAudit,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Status updated to [${stageName}]` }
          ]
        };

        if (newStageIndex === 2) updated.dispatchedTimestamp = new Date().toISOString();
        else if (newStageIndex === 4) updated.arrivedTimestamp = new Date().toISOString();
        else if (newStageIndex === 6) updated.completedTimestamp = new Date().toISOString();

        addAuditLog('DELIVERY', `Delivery ${del.deliveryCode} progressed to stage: ${stageName}`);
        return updated;
      }
      return del;
    }));
  };

  // Submit delivery receipt verification
  const verifyDeliveryReceipt = async (deliveryId, verificationData) => {
    if (backendConnected) {
      try {
        await api.verifyDelivery(deliveryId, {
          verified_food: parseInt(verificationData.receivedFood, 10),
          verified_water: parseInt(verificationData.receivedWater, 10),
          verified_medical: parseInt(verificationData.receivedMedical, 10),
          recipient_name: verificationData.recipientName,
          notes: verificationData.notes,
          photo_proof_url: verificationData.photoProofUrl
        });
      } catch (e) {
        console.warn('Backend delivery verification failed:', e.message);
      }
    }

    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        const fReceived = parseInt(verificationData.receivedFood, 10);
        const wReceived = parseInt(verificationData.receivedWater, 10);
        const mReceived = parseInt(verificationData.receivedMedical, 10);

        const fMissing = Math.max(0, del.dispatchedQuantities.food - fReceived);
        const wMissing = Math.max(0, del.dispatchedQuantities.water - wReceived);
        const mMissing = Math.max(0, del.dispatchedQuantities.medical - mReceived);

        const hasDiscrepancy = fMissing > 0 || wMissing > 0 || mMissing > 0;

        const updated = {
          ...del,
          stageIndex: 6,
          stage: 'Completed',
          completedTimestamp: new Date().toISOString(),
          verifiedQuantities: { food: fReceived, water: wReceived, medical: mReceived },
          recipientName: verificationData.recipientName || 'Camp Officer',
          recipientAcknowledgement: `ACK-SIG-${Date.now().toString().slice(-6)}`,
          photoProofUrl: verificationData.photoProofUrl || del.photoProofUrl,
          discrepancy: hasDiscrepancy ? {
            foodMissing: fMissing,
            waterMissing: wMissing,
            medicalMissing: mMissing,
            notes: verificationData.notes || 'Transit discrepancy flagged during camp receipt inspection.'
          } : null,
          routeAudit: [
            ...del.routeAudit,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Receipt verified by ${verificationData.recipientName}. Discrepancy: ${hasDiscrepancy ? `${fMissing} Food, ${wMissing} Water, ${mMissing} Med missing` : 'None (100% Intact)'}` },
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'Delivery lifecycle marked COMPLETED. Inventory ledger finalized.' }
          ]
        };

        setCamps(prevCamps => prevCamps.map(c => {
          if (c.id === del.targetLocationId) {
            return {
              ...c,
              received: {
                food: (c.received?.food || 0) + fReceived,
                water: (c.received?.water || 0) + wReceived,
                medical: (c.received?.medical || 0) + mReceived
              }
            };
          }
          return c;
        }));

        addAuditLog('VERIFICATION', `Delivery ${del.deliveryCode} receipt verified. ${hasDiscrepancy ? `WARNING: Missing items detected!` : 'Perfect delivery without loss.'}`);
        return updated;
      }
      return del;
    }));
  };

  const resetDemoData = () => {
    setCamps(INITIAL_LOCATIONS);
    setWarehouses(INITIAL_WAREHOUSES);
    setVehicles(INITIAL_VEHICLES);
    setRequests(INITIAL_REQUESTS);
    setDeliveries(INITIAL_DELIVERIES);
    setBlockages(ROAD_BLOCKAGES);
    const alloc = runResourceAllocation(INITIAL_LOCATIONS, INITIAL_WAREHOUSES, INITIAL_VEHICLES);
    setAllocationOutput(alloc);
    addAuditLog('SYSTEM', 'System reset to presentation baseline (5 Camps, 3 Warehouses, 3 Vehicles).');
  };

  return (
    <ReliefContext.Provider value={{
      camps,
      warehouses,
      vehicles,
      requests,
      deliveries,
      blockages,
      auditLogs,
      activeTab,
      setActiveTab,
      backendConnected,
      allocationOutput,
      registerCamp,
      submitRequest,
      triggerAIAllocation,
      executeSurplusTransfer,
      toggleBlockage,
      updateDeliveryStage,
      verifyDeliveryReceipt,
      resetDemoData
    }}>
      {children}
    </ReliefContext.Provider>
  );
}

export function useRelief() {
  const context = useContext(ReliefContext);
  if (!context) {
    throw new Error('useRelief must be used within a ReliefProvider');
  }
  return context;
}

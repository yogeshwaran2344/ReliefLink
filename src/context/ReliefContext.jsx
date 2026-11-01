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

  // User Authentication & RBAC Session State
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-coord-01',
    name: 'Dr. Vikram Malhotra',
    email: 'coordinator@relieflink.org',
    role: 'Coordinator', // 'Admin', 'Coordinator', 'Warehouse Manager', 'Field Volunteer', 'Fleet Driver'
    title: 'Disaster Relief Coordinator'
  });

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (type, message, title = '') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Smart In-App Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Critical Triage Alert: Camp A Water Shortage',
      message: 'Camp A has exhausted safe drinking water reserves. 65 injured casualties reported.',
      category: 'CRITICAL',
      time: '10 mins ago',
      read: false,
      targetTab: 'priority'
    },
    {
      id: 'notif-2',
      title: 'Warehouse B Food Stock Depletion Alarm',
      message: 'Warehouse B available food buffer (80 pkts) has breached safe threshold (350 pkts). Inter-depot surplus transfer recommended.',
      category: 'INVENTORY',
      time: '24 mins ago',
      read: false,
      targetTab: 'inventory'
    },
    {
      id: 'notif-3',
      title: 'Road Blockage: Highway 4 Western Bypass',
      message: 'Arterial causeway submerged. Automated OR-Tools routing diverted convoys via Eastern Link Detour (+7.4 km).',
      category: 'FLEET',
      time: '45 mins ago',
      read: false,
      targetTab: 'routing'
    },
    {
      id: 'notif-4',
      title: 'Discrepancy Flagged: Delivery DEL-2026-001',
      message: '10 food packets damaged by road splash; 5 medical kits short-shipped at loading bay.',
      category: 'AUDIT',
      time: '1 hr ago',
      read: true,
      targetTab: 'tracking'
    }
  ]);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'All operational alerts marked as read.', 'Notifications');
  };

  // Switch User Role (RBAC)
  const switchUserRole = (roleObj) => {
    setCurrentUser({
      id: `usr-${roleObj.id.toLowerCase().replace(' ', '-')}`,
      name: roleObj.name,
      email: `${roleObj.id.toLowerCase().replace(' ', '')}@relieflink.org`,
      role: roleObj.id,
      title: roleObj.title
    });
  };

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

  // Initial Backend Sync on Mount
  useEffect(() => {
    async function syncWithBackend() {
      try {
        await api.checkHealth();
        setBackendConnected(true);
        addAuditLog('SYSTEM', 'Connected to live FastAPI backend at http://127.0.0.1:8000 (Database persistence active).');

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
      } catch (err) {
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

  // Apply "What-If" Disaster Simulation Scenario
  const applySimulationScenario = (config) => {
    // 1. Update Camps based on severity & population scale
    setCamps(prev => prev.map(c => {
      const scaledPop = Math.round(c.population * config.popMultiplier);
      const scaledInjured = config.severity === 'Extreme' ? Math.round(c.injured * 1.5) : c.injured;
      return {
        ...c,
        severity: config.severity,
        population: scaledPop,
        injured: scaledInjured,
        demands: {
          food: Math.round(c.demands.food * config.popMultiplier),
          water: Math.round(c.demands.water * config.popMultiplier),
          medical: Math.round(c.demands.medical * (config.severity === 'Extreme' ? 1.6 : 1.2)),
          shelter: Math.round(c.demands.shelter * config.popMultiplier)
        }
      };
    }));

    // 2. Road blockage
    setBlockages(prev => prev.map(b => ({
      ...b,
      active: config.blockHighway
    })));

    // 3. Vehicle breakdown
    setVehicles(prev => prev.map(v => {
      if (v.id === config.brokenVehicleId) {
        return { ...v, status: 'Maintenance / Breakdown', currentLoadKg: 0 };
      }
      return { ...v, status: 'Available' };
    }));

    // 4. Warehouse stock depletion if selected
    if (config.depleteWarehouseWater) {
      setWarehouses(prev => prev.map(w => {
        if (w.id === 'wh-beta') {
          return {
            ...w,
            stock: {
              ...w.stock,
              water: { ...w.stock.water, available: 0, total: 200 }
            }
          };
        }
        return w;
      }));
    }

    // Add alert to notification center
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Disaster Simulation Enacted: ${config.severity} Alert`,
        message: `Ground conditions modified (Pop scale: x${config.popMultiplier}). Allocation and routing recalculated.`,
        category: 'CRITICAL',
        time: 'Just now',
        read: false,
        targetTab: 'dashboard'
      },
      ...prev
    ]);

    addAuditLog('SIMULATION', `What-If Disaster Scenario active: Severity=${config.severity}, PopMultiplier=x${config.popMultiplier}, Blockade=${config.blockHighway}, BrokenVehicle=${config.brokenVehicleId}`);
  };

  // Register a new affected location
  const registerCamp = async (campData) => {
    // RBAC Check
    if (currentUser.role === 'Fleet Driver') {
      addToast('error', 'Access Denied: Drivers do not have permission to register new camps.', 'RBAC Violation');
      return null;
    }

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
    addToast('success', `Location "${newCamp.name}" added to the operational grid.`, 'Camp Registered');
    addAuditLog('LOCATION', `New location registered by ${currentUser.name} (${currentUser.role}): ${newCamp.name}`);

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
      addToast('success', `Relief request ${newRequest.id} validated for ${newRequest.locationName}.`, 'Request Approved');
      addAuditLog('REQUEST', `Request ${newRequest.id} filed by ${currentUser.name} (${currentUser.role}) for ${newRequest.locationName}`);
    } else {
      addToast('warning', `Duplicate request suppressed: identical demands filed recently.`, 'Duplicate Blocked');
      addAuditLog('SECURITY', `Duplicate relief request ${newRequest.id} suppressed: ${dupCheck.reason}`);
    }

    return { request: newRequest, duplicate: dupCheck };
  };

  // Run AI allocation engine
  const triggerAIAllocation = async () => {
    // RBAC Check: Only Coordinator or Admin can approve allocation
    if (currentUser.role === 'Field Volunteer' || currentUser.role === 'Fleet Driver') {
      addToast('error', `Access Denied: ${currentUser.role} cannot trigger or approve resource allocation. Coordinator role required.`, 'RBAC Restricted');
      return null;
    }

    let result = null;

    if (backendConnected) {
      try {
        const backendAllocations = await api.optimizeAllocations();
        if (backendAllocations && backendAllocations.length > 0) {
          addAuditLog('AI_ALLOCATION', `Backend Optimization executed by ${currentUser.name} (${currentUser.role}). ${backendAllocations.length} records saved.`);
        }
      } catch (e) {
        console.warn('Backend allocation optimization failed:', e.message);
      }
    }

    result = runResourceAllocation(camps, warehouses, vehicles);
    setAllocationOutput(result);

    setCamps(prev => prev.map(c => {
      const match = result.allocationPlan.find(p => p.campId === c.id);
      if (match) {
        return { ...c, allocated: { ...match.allocated } };
      }
      return c;
    }));

    addToast('success', `Resource allocation optimized: ${result.totalAllocatedKg.toLocaleString()} kg apportioned across camps.`, 'AI Allocation Complete');
    addAuditLog('AI_ALLOCATION', `Resource Allocation approved by ${currentUser.name} (${currentUser.role}). Total: ${result.totalAllocatedKg} kg.`);
    return result;
  };

  // Execute surplus redistribution
  const executeSurplusTransfer = async (recommendation) => {
    // RBAC Check: Warehouse Manager or Admin
    if (currentUser.role === 'Field Volunteer' || currentUser.role === 'Fleet Driver') {
      addToast('error', `Access Denied: Only Warehouse Managers or Coordinators can authorize inter-depot stock transfers.`, 'Permission Denied');
      return;
    }

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

    addToast('success', `Transferred ${recommendation.recommendedTransferQty} ${recommendation.unit} of ${recommendation.itemDisplayName} from ${recommendation.donorName} to ${recommendation.recipientName}.`, 'Surplus Rebalanced');
    addAuditLog('SURPLUS_TRANSFER', `Inter-depot transfer authorized by ${currentUser.name} (${currentUser.role}): ${recommendation.recommendedTransferQty} units.`);
  };

  // Toggle Road Blockage Simulation
  const toggleBlockage = (blockageId) => {
    setBlockages(prev => prev.map(b => {
      if (b.id === blockageId) {
        const nextState = !b.active;
        addToast(nextState ? 'warning' : 'success', `${b.roadName} hazard status updated: ${nextState ? 'BLOCKED' : 'CLEARED'}.`, 'Routing Hazard');
        addAuditLog('ROUTE_SIMULATION', `Hazard status updated by ${currentUser.name}: ${b.roadName} ${nextState ? 'ROAD BLOCKED' : 'CLEARED'}.`);
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
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Status updated to [${stageName}] by ${currentUser.name} (${currentUser.role})` }
          ]
        };

        if (newStageIndex === 2) updated.dispatchedTimestamp = new Date().toISOString();
        else if (newStageIndex === 4) updated.arrivedTimestamp = new Date().toISOString();
        else if (newStageIndex === 6) updated.completedTimestamp = new Date().toISOString();

        addToast('info', `Delivery ${del.deliveryCode} progressed to stage: ${stageName}`, 'Convoy Status');
        addAuditLog('DELIVERY', `Delivery ${del.deliveryCode} advanced to ${stageName} by ${currentUser.name}`);
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
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Lifecycle closed by ${currentUser.name} (${currentUser.role})` }
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

        addToast(
          hasDiscrepancy ? 'warning' : 'success',
          `Receipt verified for ${del.deliveryCode}. ${hasDiscrepancy ? `Loss flagged: ${fMissing} Food, ${mMissing} Medical missing!` : '100% Intact'}`,
          'Ground Receipt Audit'
        );
        addAuditLog('VERIFICATION', `Delivery ${del.deliveryCode} verified by ${verificationData.recipientName}. Auditor: ${currentUser.name}`);
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
    addAuditLog('SYSTEM', `System reset by ${currentUser.name} (${currentUser.role}) to 5 Camps / 3 Warehouses / 3 Vehicles.`);
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
      currentUser,
      switchUserRole,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      toasts,
      addToast,
      removeToast,
      applySimulationScenario,
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

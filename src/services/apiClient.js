// ReliefLink Frontend REST API Client
// Connects to FastAPI Backend at /api/v1 (in production on Render) or http://127.0.0.1:8000/api/v1 (locally)

const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000')
  ? 'http://127.0.0.1:8000/api/v1'
  : '/api/v1';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    // If backend is offline, log error and allow caller to fallback cleanly
    console.warn(`[ReliefLink API] Request to ${url} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // 1. Health & Status
  checkHealth: () => fetchJSON('/health', { method: 'GET' }),

  // 2. Dashboard
  getDashboardSummary: () => fetchJSON('/dashboard/summary'),

  // 3. Locations (Camps)
  getLocations: () => fetchJSON('/locations'),
  createLocation: (data) => fetchJSON('/locations', { method: 'POST', body: JSON.stringify(data) }),
  getLocationPriority: (id) => fetchJSON(`/locations/${id}/priority`),

  // 4. Relief Requests
  getRequests: () => fetchJSON('/requests'),
  createRequest: (data) => fetchJSON('/requests', { method: 'POST', body: JSON.stringify(data) }),

  // 5. Warehouses & Inventory
  getWarehouses: () => fetchJSON('/warehouses'),
  getSurplusRecommendations: () => fetchJSON('/warehouses/surplus-recommendations'),
  executeSurplusTransfer: (data) => fetchJSON('/warehouses/transfer', { method: 'POST', body: JSON.stringify(data) }),

  // 6. Vehicles & Fleet
  getVehicles: () => fetchJSON('/vehicles'),

  // 7. Allocation Engine
  getAllocations: () => fetchJSON('/allocations'),
  optimizeAllocations: () => fetchJSON('/allocations/optimize', { method: 'POST' }),

  // 8. Routing & Detour Simulation
  getOptimizedRoutes: (roadBlocked = false) => fetchJSON(`/routes/optimized?road_blocked=${roadBlocked}`),

  // 9. Deliveries & Verification
  getDeliveries: () => fetchJSON('/deliveries'),
  updateDeliveryStage: (deliveryId, stageIndex) => fetchJSON(`/deliveries/${deliveryId}/stage?stage_index=${stageIndex}`, { method: 'PUT' }),
  verifyDelivery: (deliveryId, data) => fetchJSON(`/deliveries/${deliveryId}/verify`, { method: 'POST', body: JSON.stringify(data) }),

  // 10. Reports & Impact Analytics
  getImpactComparison: () => fetchJSON('/reports/impact-comparison'),
};

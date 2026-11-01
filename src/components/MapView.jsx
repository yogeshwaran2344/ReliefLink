import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useRelief } from '../context/ReliefContext';
import { calculatePriorityScore } from '../utils/aiEstimationEngine';
import {
  Layers,
  Flame,
  Users,
  Warehouse,
  Truck,
  AlertTriangle,
  Compass,
  Clock,
  Droplets,
  Package,
  HeartPulse,
  Navigation
} from 'lucide-react';

export default function MapView({ height = '560px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const populationLayerRef = useRef(null);

  const { camps, warehouses, vehicles, blockages, deliveries, setActiveTab } = useRelief();

  // Selected item drawer state
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Layer Visibility Controls
  const [layers, setLayers] = useState({
    heatmap: true,
    population: true,
    camps: true,
    warehouses: true,
    vehicles: true,
    routes: true,
    hazards: true
  });

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Helper to create custom SVG icon markers
  const createCustomIcon = (type, label, color, status = '', extra = '') => {
    let svgIcon = '';
    let size = [40, 40];

    if (type === 'camp') {
      const isCritical = status === 'Critical';
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; cursor: pointer;">
          ${isCritical ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.45); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="width: 34px; height: 34px; border-radius: 50%; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
            <span>${label}</span>
          </div>
          <div style="position: absolute; bottom: -8px; background: #0f172a; color: #f8fafc; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; border: 1px solid #334155; white-space: nowrap;">
            ${extra}
          </div>
        </div>
      `;
    } else if (type === 'warehouse') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            <span>🏢</span>
          </div>
          <div style="position: absolute; bottom: -8px; background: #0f172a; color: #38bdf8; font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 4px; border: 1px solid #0284c7; white-space: nowrap;">
            ${label}
          </div>
        </div>
      `;
    } else if (type === 'vehicle') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; cursor: pointer;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
            🚚
          </div>
          <div style="position: absolute; top: -6px; right: -4px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 1.5px solid white;"></div>
        </div>
      `;
    } else if (type === 'hazard') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; cursor: pointer;">
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 8px; background: rgba(220, 38, 38, 0.4); animation: ping 2s infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 8px; background: #dc2626; border: 2px solid #fef08a; box-shadow: 0 4px 12px rgba(220,38,38,0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
            ⚠️
          </div>
        </div>
      `;
    }

    return L.divIcon({
      html: svgIcon,
      className: 'custom-map-icon',
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1] / 2],
      popupAnchor: [0, -size[1] / 2]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.1100, 72.8900],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });

      // Dark Tactical Tile Layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Layer Groups
      heatmapLayerRef.current = L.layerGroup().addTo(map);
      populationLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous layers
    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();
    populationLayerRef.current.clearLayers();

    // 1. Disaster Severity Heatmap & Flood Risk Contours Layer
    if (layers.heatmap) {
      // High-risk storm surge coastal zone around Camp A & E
      const surgeContour = [
        [19.1450, 72.8250],
        [19.1300, 72.8400],
        [19.0750, 72.8550],
        [19.0500, 72.8700],
        [19.0300, 72.8950],
        [19.0400, 72.9300],
        [19.1000, 72.9100],
        [19.1550, 72.8600]
      ];

      L.polygon(surgeContour, {
        color: '#f43f5e',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#e11d48',
        fillOpacity: 0.18,
        dashArray: '6, 6'
      }).addTo(heatmapLayerRef.current).bindTooltip('Level-3 Coastal Surge Inundation Risk Zone', { sticky: true });

      // Secondary river overflow zone
      L.circle([19.1200, 72.8450], {
        radius: 3500,
        color: '#fb7185',
        weight: 1,
        fillColor: '#f43f5e',
        fillOpacity: 0.12
      }).addTo(heatmapLayerRef.current);
    }

    // 2. Population Bubble Overlay
    if (layers.population) {
      camps.forEach(camp => {
        const radius = Math.max(1200, (camp.population || 500) * 2.2);
        L.circle([camp.lat, camp.lng], {
          radius: radius,
          color: '#38bdf8',
          weight: 1,
          opacity: 0.4,
          fillColor: '#0284c7',
          fillOpacity: 0.08
        }).addTo(populationLayerRef.current).bindTooltip(`${camp.name}: ${camp.population} displaced people`, { sticky: true });
      });
    }

    // 3. Render Camps
    if (layers.camps) {
      camps.forEach((camp) => {
        const priority = calculatePriorityScore(camp);
        const isCritical = priority.status === 'Critical';
        const color = isCritical ? '#e11d48' : priority.score >= 70 ? '#f59e0b' : '#10b981';

        const marker = L.marker([camp.lat, camp.lng], {
          icon: createCustomIcon('camp', camp.name.slice(0, 6), color, priority.status, `${priority.score} pts`)
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: 'camp',
            data: camp,
            priority: priority,
            nearestWarehouse: 'Central Depot Alpha (8.4 km)',
            eta: '22 mins'
          });
        });

        marker.addTo(markersLayerRef.current);
      });
    }

    // 4. Render Warehouses
    if (layers.warehouses) {
      warehouses.forEach((wh) => {
        const marker = L.marker([wh.lat, wh.lng], {
          icon: createCustomIcon('warehouse', wh.name.replace('Warehouse ', 'Depot '), '#0284c7')
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: 'warehouse',
            data: wh,
            availableCapacity: '4,200 kg buffer',
            activeConvoys: 2
          });
        });

        marker.addTo(markersLayerRef.current);
      });
    }

    // 5. Render Vehicles
    if (layers.vehicles) {
      vehicles.forEach((veh) => {
        const marker = L.marker([veh.currentLat, veh.currentLng], {
          icon: createCustomIcon('vehicle', veh.name, '#6366f1')
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: 'vehicle',
            data: veh,
            driver: 'Rajendra Singh',
            status: veh.status || 'In Transit'
          });
        });

        marker.addTo(markersLayerRef.current);
      });
    }

    // 6. Road Hazards & Blockages
    if (layers.hazards) {
      blockages.forEach((b) => {
        if (!b.active) return;
        const marker = L.marker([b.lat, b.lng], {
          icon: createCustomIcon('hazard', 'Hazard', '#dc2626')
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: 'hazard',
            data: b
          });
        });

        marker.addTo(markersLayerRef.current);
      });
    }

    // 7. Render Routes & Detour Paths
    if (layers.routes) {
      const activeHazard = blockages.some(b => b.active);

      // Warehouse Alpha to Camp A (Direct vs Highway 4 Detour)
      const whA = warehouses.find(w => w.id === 'wh-1') || { lat: 19.0760, lng: 72.8777 };
      const campA = camps.find(c => c.id === 'camp-1') || { lat: 19.1200, lng: 72.8450 };

      if (activeHazard) {
        // Red blocked segment on Highway 4
        L.polyline([[19.0950, 72.8600], [19.1080, 72.8520]], {
          color: '#ef4444',
          weight: 4,
          dashArray: '4, 8',
          opacity: 0.9
        }).addTo(routesLayerRef.current).bindTooltip('Highway 4 Submerged — Impassable', { sticky: true });

        // Amber Detour Route via Eastern Bypass (+7.4 km)
        const detourCoords = [
          [whA.lat, whA.lng],
          [19.0850, 72.8950],
          [19.1150, 72.8850],
          [19.1250, 72.8650],
          [campA.lat, campA.lng]
        ];

        L.polyline(detourCoords, {
          color: '#f59e0b',
          weight: 3.5,
          opacity: 0.85
        }).addTo(routesLayerRef.current).bindTooltip('Detour Active via Eastern Bypass (+7.4 km)', { sticky: true });
      } else {
        // Normal direct route
        L.polyline([[whA.lat, whA.lng], [campA.lat, campA.lng]], {
          color: '#10b981',
          weight: 3,
          opacity: 0.75
        }).addTo(routesLayerRef.current).bindTooltip('Nominal Route: Highway 4 Direct (8.4 km)', { sticky: true });
      }

      // Warehouse Beta to Camp B & C
      const whB = warehouses.find(w => w.id === 'wh-2') || { lat: 19.1350, lng: 72.9300 };
      const campB = camps.find(c => c.id === 'camp-2') || { lat: 19.1650, lng: 72.9200 };
      L.polyline([[whB.lat, whB.lng], [campB.lat, campB.lng]], {
        color: '#6366f1',
        weight: 2.5,
        opacity: 0.65
      }).addTo(routesLayerRef.current);
    }
  }, [camps, warehouses, vehicles, blockages, deliveries, layers]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Map Layer Control Bar */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 shadow-2xl flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-slate-400 font-bold uppercase text-[9px] px-2 flex items-center gap-1">
          <Layers className="w-3 h-3 text-rose-400" /> Layers:
        </span>
        <button
          onClick={() => toggleLayer('heatmap')}
          className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
            layers.heatmap ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Flame className="w-3 h-3" /> Surge Heatmap
        </button>
        <button
          onClick={() => toggleLayer('population')}
          className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
            layers.population ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Users className="w-3 h-3" /> Population
        </button>
        <button
          onClick={() => toggleLayer('camps')}
          className={`px-2 py-1 rounded-lg font-semibold transition ${
            layers.camps ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          ⛺ 5 Camps
        </button>
        <button
          onClick={() => toggleLayer('warehouses')}
          className={`px-2 py-1 rounded-lg font-semibold transition ${
            layers.warehouses ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          🏢 3 Depots
        </button>
        <button
          onClick={() => toggleLayer('vehicles')}
          className={`px-2 py-1 rounded-lg font-semibold transition ${
            layers.vehicles ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          🚚 3 Fleet
        </button>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Selected Entity Interactive Inspection Drawer */}
      {selectedEntity && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-xs space-y-3 animate-slideUp">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {selectedEntity.data.name}
                </span>
                {selectedEntity.type === 'camp' && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    selectedEntity.priority?.status === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedEntity.priority?.score}/100 {selectedEntity.priority?.status}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Lat: {selectedEntity.data.lat || selectedEntity.data.currentLat}, Lng: {selectedEntity.data.lng || selectedEntity.data.currentLng}
              </span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              ✕
            </button>
          </div>

          {/* Body Content based on type */}
          {selectedEntity.type === 'camp' && (
            <div className="space-y-2 text-slate-300">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Population:</span>
                  <span className="font-bold text-white">{selectedEntity.data.population} displaced</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Casualties:</span>
                  <span className="font-bold text-rose-400">{selectedEntity.data.injuredCount} injured</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Water Deficit:</span>
                  <span className="font-bold text-amber-400">-{selectedEntity.data.waterDemand - (selectedEntity.data.allocatedWater || 0)} L</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Food Deficit:</span>
                  <span className="font-bold text-amber-400">-{selectedEntity.data.foodDemand - (selectedEntity.data.allocatedFood || 0)} pkts</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Nearest Depot:</span>
                <span className="text-sky-300 font-semibold">{selectedEntity.nearestWarehouse}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Est. Arrival Time (ETA):</span>
                <span className="text-emerald-400 font-bold">{selectedEntity.eta}</span>
              </div>

              <button
                onClick={() => setActiveTab('allocation')}
                className="w-full mt-2 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-center transition"
              >
                Inspect Allocation Plan ➔
              </button>
            </div>
          )}

          {selectedEntity.type === 'warehouse' && (
            <div className="space-y-2 text-slate-300">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Available Inventory:</span>
                <div className="grid grid-cols-3 gap-1 text-center font-mono">
                  <div className="bg-slate-900 p-1 rounded">
                    <span className="text-slate-400 text-[9px] block">FOOD</span>
                    <span className="font-bold text-white">{selectedEntity.data.inventory?.food}</span>
                  </div>
                  <div className="bg-slate-900 p-1 rounded">
                    <span className="text-slate-400 text-[9px] block">WATER</span>
                    <span className="font-bold text-sky-400">{selectedEntity.data.inventory?.water}L</span>
                  </div>
                  <div className="bg-slate-900 p-1 rounded">
                    <span className="text-slate-400 text-[9px] block">MED KITS</span>
                    <span className="font-bold text-emerald-400">{selectedEntity.data.inventory?.medical}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('inventory')}
                className="w-full mt-2 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-center transition"
              >
                Manage Depot Stock & Surplus ➔
              </button>
            </div>
          )}

          {selectedEntity.type === 'hazard' && (
            <div className="space-y-2 text-slate-300">
              <p className="text-[11px] text-rose-200 bg-rose-950/40 p-2 rounded border border-rose-500/30">
                {selectedEntity.data.description}
              </p>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Detour Impact:</span>
                <span className="text-amber-300 font-bold">+{selectedEntity.data.extraKm} km (+18 mins delay)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

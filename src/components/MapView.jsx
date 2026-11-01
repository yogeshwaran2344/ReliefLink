import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useRelief } from '../context/ReliefContext';
import { calculatePriorityScore } from '../utils/aiEstimationEngine';

export default function MapView({ height = '500px', activeFilter = 'all' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);

  const { camps, warehouses, vehicles, blockages, deliveries } = useRelief();

  const [layers, setLayers] = useState({
    camps: true,
    warehouses: true,
    vehicles: true,
    routes: true,
    hazards: true
  });

  // Helper to create custom SVG icon markers
  const createCustomIcon = (type, label, color, status = '') => {
    let svgIcon = '';
    let size = [36, 36];

    if (type === 'camp') {
      const isCritical = status === 'Critical';
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          ${isCritical ? '<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
            ${label}
          </div>
        </div>
      `;
    } else if (type === 'warehouse') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
          <div style="width: 34px; height: 34px; border-radius: 8px; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            🏢 ${label}
          </div>
        </div>
      `;
    } else if (type === 'vehicle') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
            🚚
          </div>
        </div>
      `;
    } else if (type === 'hazard') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <div style="width: 28px; height: 28px; border-radius: 6px; background: #dc2626; border: 2px solid #fef08a; box-shadow: 0 4px 10px rgba(220,38,38,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of the 5 camps & 3 warehouses
      const map = L.map(mapContainerRef.current, {
        center: [19.1100, 72.8900],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Dark style tile layer from CartoDB (clean for emergency operations dashboard)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const markersGroup = markersLayerRef.current;
    const routesGroup = routesLayerRef.current;
    markersGroup.clearLayers();
    routesGroup.clearLayers();

    // 1. Render Warehouses
    if (layers.warehouses) {
      warehouses.forEach(wh => {
        const totalAvail = (wh.stock.food.available || 0) + (wh.stock.water.available || 0) + (wh.stock.medical.available || 0);
        const icon = createCustomIcon('warehouse', wh.code.replace('W-', ''), '#3b82f6');
        const marker = L.marker(wh.coordinates, { icon });

        marker.bindPopup(`
          <div style="min-width: 220px; font-size: 13px;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span style="background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Depot</span>
              ${wh.name}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 8px;">${wh.address}</div>
            <div style="background: #f1f5f9; padding: 8px; border-radius: 6px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>🍞 Food:</span> <b>${wh.stock.food.available} pkts</b>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>💧 Water:</span> <b>${wh.stock.water.available} L</b>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>🩹 Medical:</span> <b>${wh.stock.medical.available} kits</b>
              </div>
            </div>
            <div style="font-size: 11px; color: #0284c7; font-weight: 600;">
              Status: ${wh.status}
            </div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }

    // 2. Render Camps (Affected Locations)
    if (layers.camps) {
      camps.forEach((camp, index) => {
        const priority = calculatePriorityScore(camp);
        let color = '#10b981'; // Green for low
        if (priority.status === 'Critical') color = '#ef4444'; // Red
        else if (priority.status === 'High') color = '#f59e0b'; // Amber
        else if (priority.status === 'Medium') color = '#3b82f6'; // Blue

        const label = String.fromCharCode(65 + index); // A, B, C, D, E...
        const icon = createCustomIcon('camp', label, color, priority.status);
        const marker = L.marker(camp.coordinates, { icon });

        marker.bindPopup(`
          <div style="min-width: 240px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 800; color: #0f172a;">${camp.name}</span>
              <span style="background: ${color}; color: white; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 9999px;">
                ${priority.score}/100 • ${priority.status}
              </span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              Disaster: <b>${camp.disasterType}</b> | Pop: <b>${camp.population.toLocaleString()}</b> | Injured: <b>${camp.injured}</b>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; margin-bottom: 8px; font-size: 11px;">
              <div><b>Unmet Demands:</b></div>
              <div>• Food: ${camp.demands.food} pkts (Recv: ${camp.received?.food || 0})</div>
              <div>• Water: ${camp.demands.water} L (Recv: ${camp.received?.water || 0})</div>
              <div>• Medical: ${camp.demands.medical} kits (Recv: ${camp.received?.medical || 0})</div>
            </div>
            <div style="font-size: 11px; color: #475569; font-style: italic; border-left: 2px solid ${color}; padding-left: 6px;">
              "${priority.explanation}"
            </div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }

    // 3. Render Vehicles
    if (layers.vehicles) {
      vehicles.forEach(veh => {
        const icon = createCustomIcon('vehicle', veh.name.replace('RL-', ''), '#8b5cf6');
        const marker = L.marker(veh.currentLocation, { icon });

        marker.bindPopup(`
          <div style="min-width: 200px; font-size: 13px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">
              🚚 ${veh.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              Reg: ${veh.regNumber} (${veh.type})
            </div>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
              <div>Max Payload: <b>${veh.maxCapacityKg} kg</b></div>
              <div>Current Load: <b>${veh.currentLoadKg} kg</b></div>
              <div>Driver: <b>${veh.driverName}</b></div>
            </div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 600;">
              Availability: ${veh.status}
            </div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }

    // 4. Render Active Road Blockages & Hazards
    if (layers.hazards) {
      blockages.forEach(b => {
        if (!b.active) return;
        const icon = createCustomIcon('hazard', '!', '#dc2626');
        const marker = L.marker(b.coordinates, { icon });

        marker.bindPopup(`
          <div style="min-width: 220px; font-size: 13px;">
            <div style="color: #dc2626; font-weight: 800; font-size: 12px; margin-bottom: 4px;">
              ⚠️ ACTIVE ROAD HAZARD
            </div>
            <div style="font-weight: 600; color: #1e293b;">${b.roadName}</div>
            <div style="font-size: 11px; color: #64748b; margin: 4px 0;">
              Type: <b>${b.type}</b>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 6px; border-radius: 4px; font-size: 11px;">
              Causes +${b.delayAddedMinutes} min transit delay to ${b.affectedCamps.join(', ')}.
            </div>
            <div style="margin-top: 6px; font-size: 11px; color: #2563eb;">
              Alternative Route Active: <b>${b.detourRouteName}</b>
            </div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }

    // 5. Render Supply Corridor Routes
    if (layers.routes) {
      // Connect Warehouses to Camps with stylish dashed / animated polylines
      // Corridor Alpha -> Camp A, C, D
      const whA = warehouses[0]?.coordinates;
      const whB = warehouses[1]?.coordinates;
      const whC = warehouses[2]?.coordinates;

      if (whA && camps[0]) {
        // Warehouse A to Camp A (Primary Corridor)
        const polylineA = L.polyline([whA, camps[0].coordinates], {
          color: '#3b82f6',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 6'
        }).addTo(routesGroup);
        polylineA.bindTooltip('Primary Relief Corridor: Central Depot ➔ Camp A (14.2 km)', { sticky: true });
      }

      if (whB && camps[1]) {
        // Warehouse B to Camp B
        const polylineB = L.polyline([whB, camps[1].coordinates], {
          color: '#10b981',
          weight: 3,
          opacity: 0.8,
          dashArray: '5, 5'
        }).addTo(routesGroup);
        polylineB.bindTooltip('Northern Relief Route: Northern Hub ➔ Camp B (8.6 km)', { sticky: true });
      }

      if (whA && camps[4]) {
        // Warehouse A to Camp E (Affected by blockage detour)
        const hasBlockage = blockages.some(b => b.active);
        const routeCoords = hasBlockage
          ? [whA, [19.1600, 72.9100], [19.2000, 72.8900], camps[4].coordinates] // Detour path
          : [whA, [19.1450, 72.8600], camps[4].coordinates]; // Direct path

        const polylineE = L.polyline(routeCoords, {
          color: hasBlockage ? '#f59e0b' : '#3b82f6',
          weight: hasBlockage ? 4 : 3,
          opacity: 0.9,
          dashArray: hasBlockage ? '8, 8' : '4, 4'
        }).addTo(routesGroup);

        polylineE.bindTooltip(
          hasBlockage
            ? 'DETOUR CORRIDOR: Eastern Link Bypass ➔ Camp E (+7.4 km / +45 min)'
            : 'Direct Supply Corridor: Central Depot ➔ Camp E',
          { sticky: true }
        );
      }
    }

  }, [camps, warehouses, vehicles, blockages, layers]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 shadow-lg flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5 mr-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Live GIS Map:
        </span>
        <button
          onClick={() => setLayers(l => ({ ...l, camps: !l.camps }))}
          className={`px-2.5 py-1 rounded transition-all font-medium ${layers.camps ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-500'}`}
        >
          ⛺ 5 Camps
        </button>
        <button
          onClick={() => setLayers(l => ({ ...l, warehouses: !l.warehouses }))}
          className={`px-2.5 py-1 rounded transition-all font-medium ${layers.warehouses ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-500'}`}
        >
          🏢 3 Warehouses
        </button>
        <button
          onClick={() => setLayers(l => ({ ...l, vehicles: !l.vehicles }))}
          className={`px-2.5 py-1 rounded transition-all font-medium ${layers.vehicles ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'}`}
        >
          🚚 3 Vehicles
        </button>
        <button
          onClick={() => setLayers(l => ({ ...l, routes: !l.routes }))}
          className={`px-2.5 py-1 rounded transition-all font-medium ${layers.routes ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}
        >
          🛣️ Corridors
        </button>
        <button
          onClick={() => setLayers(l => ({ ...l, hazards: !l.hazards }))}
          className={`px-2.5 py-1 rounded transition-all font-medium ${layers.hazards ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'}`}
        >
          ⚠️ Hazards
        </button>
      </div>

      {/* Legend Badge Bottom Right */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 shadow-lg text-[11px] text-slate-300 space-y-1 hidden md:block">
        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1">Disaster Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Critical Camp (≥85 Priority)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>High Urgency Camp (70-84)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Regional Warehouse / Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>Active Transit Vehicle</span>
        </div>
      </div>

      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
}

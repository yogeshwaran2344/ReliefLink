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
  Navigation,
  Sparkles,
  RotateCcw,
  Plus,
  MapPin,
  Eye,
  Crosshair
} from 'lucide-react';

export default function MapView({ height = '580px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userAccuracyCircleRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const populationLayerRef = useRef(null);

  const {
    camps,
    warehouses,
    vehicles,
    blockages,
    deliveries,
    userLocation,
    locationLoading,
    detectUserLocation,
    setupAroundCurrentLocation,
    clearAllData,
    setActiveTab
  } = useRelief();

  // Selected item drawer state
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Map Style Selector (100% Keyless, zero API key required)
  // 'humanitarian': High-contrast Humanitarian OpenStreetMap Team (emergency response roads & camps)
  // 'satellite': Real-world satellite earth imagery from Esri
  // 'osm': Standard OpenStreetMap
  const [mapStyle, setMapStyle] = useState('humanitarian');

  // Layer Visibility Controls
  const [layers, setLayers] = useState({
    heatmap: true,
    population: true,
    camps: true,
    warehouses: true,
    vehicles: true,
    routes: true,
    hazards: true,
    userGps: true
  });

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Safe coordinate parser
  const getCoords = (item, fallback = null) => {
    const defaultAnchor = userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707];
    const safeFallback = fallback || defaultAnchor;
    if (!item) return safeFallback;
    if (Array.isArray(item.coordinates) && item.coordinates[0] !== undefined) {
      const lat = Number(item.coordinates[0]);
      const lng = Number(item.coordinates[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (Array.isArray(item.currentPosition) && item.currentPosition[0] !== undefined) {
      const lat = Number(item.currentPosition[0]);
      const lng = Number(item.currentPosition[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (item.lat !== undefined && item.lng !== undefined) {
      const lat = Number(item.lat);
      const lng = Number(item.lng);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (item.currentLat !== undefined && item.currentLng !== undefined) {
      const lat = Number(item.currentLat);
      const lng = Number(item.currentLng);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return safeFallback;
  };

  // Custom SVG Markers
  const createCustomIcon = (type, label, color, status = '', extra = '') => {
    let svgIcon = '';
    let size = [40, 40];

    if (type === 'camp') {
      const isCritical = status === 'Critical';
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer;">
          ${isCritical ? '<div style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: rgba(239, 68, 68, 0.45); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="width: 34px; height: 34px; border-radius: 50%; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
            <span>⛺</span>
          </div>
          <div style="position: absolute; bottom: -8px; background: #0f172a; color: #f8fafc; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; border: 1px solid #334155; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
            ${extra || label}
          </div>
        </div>
      `;
    } else if (type === 'warehouse') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 15px;">
            <span>🏢</span>
          </div>
          <div style="position: absolute; bottom: -8px; background: #0f172a; color: #38bdf8; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; border: 1px solid #0284c7; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
            ${label}
          </div>
        </div>
      `;
    } else if (type === 'vehicle') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; cursor: pointer;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
            🚚
          </div>
          <div style="position: absolute; top: -4px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 1.5px solid white;"></div>
        </div>
      `;
    } else if (type === 'hazard') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; cursor: pointer;">
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 8px; background: rgba(220, 38, 38, 0.4); animation: ping 2s infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 8px; background: #dc2626; border: 2px solid #fef08a; box-shadow: 0 4px 12px rgba(220,38,38,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
            ⚠️
          </div>
        </div>
      `;
    } else if (type === 'user-location') {
      svgIcon = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer;">
          <div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(37,99,235,0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">
            📍
          </div>
          <div style="position: absolute; bottom: -8px; background: #1e3a8a; color: #93c5fd; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; border: 1px solid #3b82f6; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
            YOU ARE HERE
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

  // Map Tile Layer URL resolver - 100% Free & Open-Access (No API Key Required)
  const getTileConfig = (style) => {
    switch (style) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: {
            maxZoom: 19,
            attribution: 'Esri Satellite Imagery'
          }
        };
      case 'osm':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            subdomains: 'abc',
            attribution: 'OpenStreetMap contributors'
          }
        };
      case 'topo':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          options: {
            maxZoom: 19,
            attribution: 'Esri Topo'
          }
        };
      case 'humanitarian':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            subdomains: 'abc',
            attribution: 'OpenStreetMap Humanitarian'
          }
        };
    }
  };

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Default high-contrast disaster relief tile layer (Keyless)
      const { url, options } = getTileConfig(mapStyle);
      tileLayerRef.current = L.tileLayer(url, options).addTo(map);

      // Layer Groups
      heatmapLayerRef.current = L.layerGroup().addTo(map);
      populationLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // 2. Handle Map Style (Tile Layer) Updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const { url, options } = getTileConfig(mapStyle);
    tileLayerRef.current = L.tileLayer(url, options).addTo(mapInstanceRef.current);
  }, [mapStyle]);

  // 3. Render All Entities & Dynamic Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers
    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();
    populationLayerRef.current.clearLayers();

    const boundsPoints = [];

    // A. Render User GPS Marker
    if (layers.userGps && userLocation?.lat && userLocation?.lng) {
      const userCoords = [userLocation.lat, userLocation.lng];
      boundsPoints.push(userCoords);

      const userMarker = L.marker(userCoords, {
        icon: createCustomIcon('user-location', 'You', '#2563eb'),
        zIndexOffset: 1000
      });

      userMarker.bindTooltip(
        `<b>📍 Your Live GPS Location</b><br/>Lat: ${userLocation.lat}, Lng: ${userLocation.lng}<br/>Accuracy: ±${userLocation.accuracy || 10} meters`,
        { sticky: true }
      );

      userMarker.on('click', () => {
        setSelectedEntity({
          type: 'user-location',
          data: userLocation
        });
      });

      userMarker.addTo(markersLayerRef.current);

      // Accuracy radius circle
      L.circle(userCoords, {
        radius: Math.max(30, userLocation.accuracy || 50),
        color: '#3b82f6',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#60a5fa',
        fillOpacity: 0.12
      }).addTo(markersLayerRef.current);
    }

    // B. Render Camps
    if (layers.camps && Array.isArray(camps)) {
      camps.forEach((camp) => {
        const coords = getCoords(camp);
        boundsPoints.push(coords);

        const priority = calculatePriorityScore(camp);
        const isCritical = priority.status === 'Critical';
        const color = isCritical ? '#e11d48' : priority.score >= 70 ? '#f59e0b' : '#10b981';

        const marker = L.marker(coords, {
          icon: createCustomIcon('camp', camp.name?.slice(0, 10) || 'Camp', color, priority.status, `${priority.score} pts`)
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: 'camp',
            data: camp,
            priority: priority
          });
        });

        marker.addTo(markersLayerRef.current);

        // Dynamic Risk Contours around real camps
        if (layers.heatmap) {
          const haloColor = isCritical ? '#e11d48' : priority.score >= 70 ? '#f59e0b' : '#3b82f6';
          const haloRadius = isCritical ? 1600 : priority.score >= 70 ? 1100 : 700;

          L.circle(coords, {
            radius: haloRadius,
            color: haloColor,
            weight: 1,
            opacity: 0.5,
            fillColor: haloColor,
            fillOpacity: isCritical ? 0.22 : 0.14
          }).addTo(heatmapLayerRef.current).bindTooltip(`${camp.name}: ${priority.status} Surge Zone (${priority.score} pts)`, { sticky: true });
        }

        // Population Bubble Overlay
        if (layers.population) {
          const popRadius = Math.max(600, (camp.population || 400) * 1.8);
          L.circle(coords, {
            radius: popRadius,
            color: '#0284c7',
            weight: 1,
            opacity: 0.4,
            fillColor: '#38bdf8',
            fillOpacity: 0.08
          }).addTo(populationLayerRef.current).bindTooltip(`${camp.name}: ${camp.population?.toLocaleString()} displaced persons`, { sticky: true });
        }
      });
    }

    // C. Render Warehouses
    if (layers.warehouses && Array.isArray(warehouses)) {
      warehouses.forEach((wh) => {
        const coords = getCoords(wh);
        boundsPoints.push(coords);

        const marker = L.marker(coords, {
          icon: createCustomIcon('warehouse', (wh.name || 'Depot').slice(0, 12), '#0284c7')
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: 'warehouse',
            data: wh
          });
        });

        marker.addTo(markersLayerRef.current);
      });
    }

    // D. Render Vehicles
    if (layers.vehicles && Array.isArray(vehicles)) {
      vehicles.forEach((veh) => {
        const coords = getCoords(veh);
        boundsPoints.push(coords);

        const marker = L.marker(coords, {
          icon: createCustomIcon('vehicle', veh.name || 'Fleet', '#6366f1')
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: 'vehicle',
            data: veh
          });
        });

        marker.addTo(markersLayerRef.current);
      });
    }

    // E. Road Hazards & Blockages
    if (layers.hazards && Array.isArray(blockages)) {
      blockages.forEach((b) => {
        if (!b.active) return;
        const coords = getCoords(b);
        boundsPoints.push(coords);

        const marker = L.marker(coords, {
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

    // F. Render Dynamic Dispatch Routes
    if (layers.routes && warehouses.length > 0 && camps.length > 0) {
      warehouses.forEach((wh, idx) => {
        const targetCamp = camps[idx % camps.length];
        if (!targetCamp) return;

        const whCoords = getCoords(wh);
        const campCoords = getCoords(targetCamp);

        const isBlocked = blockages.some(b => b.active);

        if (isBlocked && idx === 0) {
          // Calculate realistic midpoint detour offset
          const midLat = (whCoords[0] + campCoords[0]) / 2 + 0.008;
          const midLng = (whCoords[1] + campCoords[1]) / 2 + 0.009;

          L.polyline([whCoords, [midLat, midLng], campCoords], {
            color: '#f59e0b',
            weight: 3.5,
            dashArray: '6, 6',
            opacity: 0.85
          }).addTo(routesLayerRef.current).bindTooltip(`⚠️ Active Reroute: Detour bypassing submerged causeway (+4.8 km)`, { sticky: true });
        } else {
          L.polyline([whCoords, campCoords], {
            color: idx === 0 ? '#10b981' : '#6366f1',
            weight: 3,
            opacity: 0.75
          }).addTo(routesLayerRef.current).bindTooltip(`Direct Supply Corridor: ${wh.name} ➔ ${targetCamp.name}`, { sticky: true });
        }
      });
    }

    // G. Auto-Center or Fit Bounds
    if (boundsPoints.length > 1) {
      try {
        const latLngBounds = L.latLngBounds(boundsPoints);
        map.fitBounds(latLngBounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {
        console.warn('Bounds fitting notice:', e);
      }
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 13);
    } else if (userLocation?.lat && userLocation?.lng) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [camps, warehouses, vehicles, blockages, deliveries, userLocation, layers]);

  // Center on User GPS button
  const handleRecenterUser = () => {
    if (userLocation?.lat && userLocation?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    } else {
      detectUserLocation();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Map Layer & Style Control Bar */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 shadow-2xl flex flex-wrap items-center gap-1.5 text-[11px]">
        {/* Style Selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 mr-1">
          <button
            onClick={() => setMapStyle('humanitarian')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'humanitarian' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Humanitarian OpenStreetMap: Optimized emergency roads, camps, and medical points"
          >
            Disaster (HOT)
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="High-Resolution Satellite Earth Imagery"
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle('osm')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'osm' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Standard OpenStreetMap: Global street networks and landmark details"
          >
            OSM
          </button>
          <button
            onClick={() => setMapStyle('topo')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'topo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Topographical Elevation & Terrain Contour Map"
          >
            Topo
          </button>
        </div>

        <button
          onClick={() => toggleLayer('heatmap')}
          className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
            layers.heatmap ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Flame className="w-3 h-3" /> Risk Halos
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
          ⛺ Camps ({camps.length})
        </button>

        <button
          onClick={() => toggleLayer('warehouses')}
          className={`px-2 py-1 rounded-lg font-semibold transition ${
            layers.warehouses ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          🏢 Depots ({warehouses.length})
        </button>

        <button
          onClick={handleRecenterUser}
          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-md transition ml-1"
          title="Center on user's real-time GPS location"
        >
          <Crosshair className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
          <span>My GPS</span>
        </button>
      </div>

      {/* Clean Slate / Zero-Records Floating Card (When No Camps Exist) */}
      {camps.length === 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] w-11/12 max-w-lg bg-slate-900/95 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-5 shadow-2xl text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/40">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30">
              Clean Slate Mode • Real GPS Active
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              Zero Demo Records — Ready for Live Real-World Operation
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {userLocation
                ? `Current GPS locked at [${userLocation.lat}, ${userLocation.lng}] (±${userLocation.accuracy}m). You can initialize an operational cluster around your real location or register camps manually.`
                : 'Acquiring your browser GPS coordinates to center the operational grid...'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setupAroundCurrentLocation(userLocation?.lat, userLocation?.lng)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Setup Disaster Grid at My GPS</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Register First Camp</span>
            </button>

            <button
              onClick={detectUserLocation}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
              title="Refresh browser GPS telemetry"
            >
              🔄
            </button>
          </div>
        </div>
      )}

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-[10px] text-slate-300 flex items-center gap-3 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-semibold text-white">📍 Live GPS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>⛺ Critical Camp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>⛺ High Urgency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-blue-500"></span>
          <span>🏢 Depot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>🚚 Fleet</span>
        </div>
      </div>

      {/* Selected Entity Details Drawer */}
      {selectedEntity && (
        <div className="absolute bottom-3 right-3 z-[1000] w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {selectedEntity.type === 'user-location' ? 'Your Real-Time GPS' : selectedEntity.type.toUpperCase()} INSPECTOR
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          {selectedEntity.type === 'user-location' && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">📍 Your Current Position</h4>
              <div className="font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                <div>Latitude: <b>{selectedEntity.data.lat}</b></div>
                <div>Longitude: <b>{selectedEntity.data.lng}</b></div>
                <div>Accuracy: <b>±{selectedEntity.data.accuracy || 10} meters</b></div>
              </div>
              <p className="text-[11px] text-slate-400">
                All disaster sectors and logistics routes can be centered dynamically on your coordinates.
              </p>
            </div>
          )}

          {selectedEntity.type === 'camp' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">{selectedEntity.data.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                  {selectedEntity.priority?.status || 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>Population: <b className="text-white">{selectedEntity.data.population}</b></div>
                <div>Injured: <b className="text-rose-400">{selectedEntity.data.injured}</b></div>
                <div>Food Need: <b className="text-amber-300">{selectedEntity.data.demands?.food || 0} pkts</b></div>
                <div>Water Need: <b className="text-sky-300">{selectedEntity.data.demands?.water || 0} L</b></div>
              </div>
              <div className="text-[11px] text-slate-300 italic">
                "{selectedEntity.priority?.explanation || selectedEntity.data.notes}"
              </div>
              <button
                onClick={() => setActiveTab('allocation')}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                Inspect Allocation Matrix →
              </button>
            </div>
          )}

          {selectedEntity.type === 'warehouse' && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">🏢 {selectedEntity.data.name}</h4>
              <div className="text-[11px] text-slate-400">{selectedEntity.data.address}</div>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block">FOOD</span>
                  <b className="text-emerald-400">{selectedEntity.data.stock?.food?.available ?? 0}</b>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">WATER</span>
                  <b className="text-sky-400">{selectedEntity.data.stock?.water?.available ?? 0}L</b>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">MED</span>
                  <b className="text-rose-400">{selectedEntity.data.stock?.medical?.available ?? 0}</b>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                Open Warehouse Inventory →
              </button>
            </div>
          )}

          {selectedEntity.type === 'vehicle' && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">🚚 {selectedEntity.data.name}</h4>
              <div className="text-[11px] text-slate-400">{selectedEntity.data.type} • Status: <b className="text-emerald-400">{selectedEntity.data.status}</b></div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1">
                <div>Driver: <b className="text-white">{selectedEntity.data.driverName}</b></div>
                <div>Capacity: <b className="text-purple-300">{selectedEntity.data.maxCapacityKg} kg</b></div>
              </div>
            </div>
          )}

          {selectedEntity.type === 'hazard' && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <span>⚠️</span> {selectedEntity.data.name}
              </h4>
              <p className="text-[11px] text-slate-300">
                {selectedEntity.data.description || 'Active road blockage requiring detour calculation.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

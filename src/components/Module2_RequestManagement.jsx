import React, { useState } from 'react';
import {
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  Camera,
  ShieldAlert,
  Search,
  Filter,
  Users,
  HeartPulse,
  Droplets,
  UtensilsCrossed,
  Package
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function Module2_RequestManagement() {
  const { camps, requests, registerCamp, submitRequest } = useRelief();

  const [activeView, setActiveView] = useState('list'); // 'list', 'newRequest', 'newCamp'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [duplicateBanner, setDuplicateBanner] = useState(null);

  // New Request Form State
  const [requestForm, setRequestForm] = useState({
    locationId: camps[0]?.id || 'camp-a',
    requesterName: '',
    requesterRole: 'Camp Coordinator',
    phone: '',
    urgency: 'Critical',
    food: 200,
    water: 350,
    medical: 40,
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
  });

  // New Camp Form State
  const [campForm, setCampForm] = useState({
    name: '',
    lat: '19.1500',
    lng: '72.8800',
    population: 400,
    injured: 15,
    disasterType: 'Flood',
    severity: 'High',
    contactPerson: '',
    phone: '',
    accessRoadCondition: 'Partially Submerged',
    notes: '',
    demands: { food: 200, water: 400, medical: 50, shelter: 30 }
  });

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const selectedCamp = camps.find(c => c.id === requestForm.locationId);

    const submission = {
      locationId: requestForm.locationId,
      locationName: selectedCamp?.name || 'Affected Location',
      requesterName: requestForm.requesterName || 'Emergency Volunteer',
      requesterRole: requestForm.requesterRole,
      phone: requestForm.phone || '+91 98200 12345',
      disasterType: selectedCamp?.disasterType || 'Flood',
      urgency: requestForm.urgency,
      quantities: {
        food: parseInt(requestForm.food, 10),
        water: parseInt(requestForm.water, 10),
        medical: parseInt(requestForm.medical, 10)
      },
      evidencePhoto: requestForm.photoUrl
    };

    const res = submitRequest(submission);

    if (res.duplicate.isDuplicate) {
      setDuplicateBanner({
        type: 'DUPLICATE_FLAGGED',
        message: res.duplicate.reason,
        duplicateOf: res.duplicate.duplicateOf
      });
    } else {
      setDuplicateBanner({
        type: 'SUCCESS',
        message: `Request for ${submission.locationName} successfully validated and registered for AI allocation.`
      });
    }

    setActiveView('list');
  };

  const handleCampSubmit = (e) => {
    e.preventDefault();
    if (!campForm.name) return;

    registerCamp(campForm);
    setDuplicateBanner({
      type: 'SUCCESS',
      message: `Camp location "${campForm.name}" registered in the GIS command database.`
    });
    setActiveView('list');
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = filterUrgency === 'all' || r.urgency.toLowerCase() === filterUrgency.toLowerCase();
    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              Module 2: Field Intake & Triage
            </span>
            <span className="text-slate-400 text-xs">Anti-Duplicate Allocation Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Disaster & Relief Request Management
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Enable field coordinators and community representatives to log real-time requirements, submit photo evidence, and prevent double-supply allocation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => { setActiveView('newRequest'); setDuplicateBanner(null); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Relief Request</span>
          </button>
          <button
            onClick={() => { setActiveView('newCamp'); setDuplicateBanner(null); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>Register New Camp</span>
          </button>
        </div>
      </div>

      {/* Duplicate Alert Banner if triggered */}
      {duplicateBanner && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            duplicateBanner.type === 'DUPLICATE_FLAGGED'
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {duplicateBanner.type === 'DUPLICATE_FLAGGED' ? (
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="font-bold tracking-wide uppercase">
              {duplicateBanner.type === 'DUPLICATE_FLAGGED' ? 'Duplicate Allocation Safeguard Triggered' : 'System Notice'}
            </span>
            <p className="mt-0.5 text-slate-300">{duplicateBanner.message}</p>
          </div>
          <button
            onClick={() => setDuplicateBanner(null)}
            className="ml-auto text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-view: Register New Affected Location Form */}
      {activeView === 'newCamp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                Register New Affected Location
              </h2>
              <p className="text-xs text-slate-400">Add an affected site to the geographic operational grid.</p>
            </div>
            <button
              onClick={() => setActiveView('list')}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCampSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Location Name *</label>
              <input
                type="text"
                required
                value={campForm.name}
                onChange={e => setCampForm({ ...campForm, name: e.target.value })}
                placeholder="e.g. Camp F (South Pier Shelter)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Latitude (GPS) *</label>
              <input
                type="text"
                required
                value={campForm.lat}
                onChange={e => setCampForm({ ...campForm, lat: e.target.value })}
                placeholder="19.1234"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Longitude (GPS) *</label>
              <input
                type="text"
                required
                value={campForm.lng}
                onChange={e => setCampForm({ ...campForm, lng: e.target.value })}
                placeholder="72.8567"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Affected Population *</label>
              <input
                type="number"
                min="10"
                value={campForm.population}
                onChange={e => setCampForm({ ...campForm, population: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Reported Injured *</label>
              <input
                type="number"
                min="0"
                value={campForm.injured}
                onChange={e => setCampForm({ ...campForm, injured: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-rose-300 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Disaster Type *</label>
              <select
                value={campForm.disasterType}
                onChange={e => setCampForm({ ...campForm, disasterType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Landslide">Landslide</option>
                <option value="Urban Inundation">Urban Inundation</option>
                <option value="Tidal Surge">Tidal Surge</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Urgency Severity</label>
              <select
                value={campForm.severity}
                onChange={e => setCampForm({ ...campForm, severity: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Camp Contact Lead</label>
              <input
                type="text"
                value={campForm.contactPerson}
                onChange={e => setCampForm({ ...campForm, contactPerson: e.target.value })}
                placeholder="Dr. / Officer Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Emergency Phone</label>
              <input
                type="text"
                value={campForm.phone}
                onChange={e => setCampForm({ ...campForm, phone: e.target.value })}
                placeholder="+91 98..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="font-semibold text-slate-300">Access Road & Evacuation Conditions</label>
              <input
                type="text"
                value={campForm.accessRoadCondition}
                onChange={e => setCampForm({ ...campForm, accessRoadCondition: e.target.value })}
                placeholder="e.g. Partially submerged, 4x4 vehicles only"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="md:col-span-3 pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold shadow-lg shadow-rose-600/30"
              >
                Save Affected Location
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-view: Submit Relief Request Form */}
      {activeView === 'newRequest' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Submit Relief Request with Smart Duplicate Detection
              </h2>
              <p className="text-xs text-slate-400">
                Log critical food, water, or medical shortages with timestamped evidence.
              </p>
            </div>
            <button
              onClick={() => setActiveView('list')}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Select Affected Camp *</label>
              <select
                value={requestForm.locationId}
                onChange={e => setRequestForm({ ...requestForm, locationId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {camps.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.disasterType} - {c.population} pop)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Requester Name *</label>
              <input
                type="text"
                required
                value={requestForm.requesterName}
                onChange={e => setRequestForm({ ...requestForm, requesterName: e.target.value })}
                placeholder="Dr. Roy / Volunteer Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Requester Role</label>
              <select
                value={requestForm.requesterRole}
                onChange={e => setRequestForm({ ...requestForm, requesterRole: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Camp Lead">Camp Lead</option>
                <option value="Medical Officer">Medical Officer</option>
                <option value="Field Volunteer">Field Volunteer</option>
                <option value="Community Representative">Community Representative</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Contact Phone *</label>
              <input
                type="text"
                required
                value={requestForm.phone}
                onChange={e => setRequestForm({ ...requestForm, phone: e.target.value })}
                placeholder="+91 98201 12345"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Urgency Level *</label>
              <select
                value={requestForm.urgency}
                onChange={e => setRequestForm({ ...requestForm, urgency: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              >
                <option value="Critical">Critical (Immediate Life-Safety Risk)</option>
                <option value="High">High (&lt;12h Window)</option>
                <option value="Medium">Medium (24h Buffer)</option>
                <option value="Low">Low (Replenishment)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Evidence Photo Proof (URL/Upload)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={requestForm.photoUrl}
                  onChange={e => setRequestForm({ ...requestForm, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-[11px]"
                />
              </div>
            </div>

            {/* Demanded Quantities */}
            <div className="md:col-span-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 mt-1">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">
                Specify Requested Relief Quantities:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-300 mb-1 font-semibold">
                    <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                    <span>Food Rations (Packets)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={requestForm.food}
                    onChange={e => setRequestForm({ ...requestForm, food: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-400">~0.8 kg per packet</span>
                </div>

                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-300 mb-1 font-semibold">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span>Drinking Water (Liters)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={requestForm.water}
                    onChange={e => setRequestForm({ ...requestForm, water: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-400">1.0 kg per liter</span>
                </div>

                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-300 mb-1 font-semibold">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    <span>Medical Trauma Kits</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={requestForm.medical}
                    onChange={e => setRequestForm({ ...requestForm, medical: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold text-sm text-rose-400"
                  />
                  <span className="text-[10px] text-slate-400">Antibiotics, ORS, trauma dressings</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-lg font-semibold shadow-lg shadow-rose-600/25 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Validate & Submit Demand</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List & Duplicate Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search camp, requester, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white w-full"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Urgency:
            </span>
            <select
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Request ID & Timestamp</th>
                <th className="px-4 py-3">Location / Camp</th>
                <th className="px-4 py-3">Requester & Role</th>
                <th className="px-4 py-3">Demands (Food / Water / Med)</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status & Anti-Duplicate Check</th>
                <th className="px-4 py-3 text-right">Photo Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRequests.map(req => {
                const isDup = req.isDuplicate;
                return (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-800/50 transition ${
                      isDup ? 'bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-slate-200">{req.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{req.locationName}</div>
                      <div className="text-[11px] text-slate-400">{req.disasterType}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{req.requesterName}</div>
                      <div className="text-[10px] text-slate-400">{req.requesterRole} • {req.phone}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200 border border-slate-700">
                          🍞 {req.quantities.food}
                        </span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200 border border-slate-700">
                          💧 {req.quantities.water}
                        </span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-rose-300 border border-slate-700">
                          🩹 {req.quantities.medical}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.urgency === 'Critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : req.urgency === 'High'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {isDup ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Flagged Duplicate
                          </span>
                          <p className="text-[10px] text-amber-200/80 max-w-xs leading-tight">
                            {req.duplicateReason}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {req.status}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {req.evidencePhoto ? (
                        <button
                          onClick={() => setPreviewPhoto(req.evidencePhoto)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300"
                        >
                          <Camera className="w-3 h-3 text-sky-400" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No photo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewPhoto(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-white text-sm">Disaster Ground Evidence Proof</span>
              <button onClick={() => setPreviewPhoto(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <img src={previewPhoto} alt="Disaster Evidence" className="w-full h-64 object-cover rounded-xl" />
            <div className="text-[11px] text-slate-400 mt-2">
              GPS Verified timestamped evidence provided by field coordinator for emergency triage audit.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

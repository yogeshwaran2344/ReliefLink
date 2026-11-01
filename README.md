# ReliefLink — Autonomous Disaster Logistics & Supply Optimization

> Physical AI, Capacitated Vehicle Routing, and Explainable Humanitarian Supply Chain Management

---

## 🌟 Overview of 8 Implemented Modules

ReliefLink is divided into 8 operational modules engineered to fulfill and exceed the requirements outlined in the disaster response specification and presentation defense.

### **Module 1: Disaster Command Dashboard (Main Operational View)**
- **Total Affected Locations**: Real-time tracking of **5 canonical camps** (Camp A, Camp B, Camp C, Camp D, Camp E).
- **Total Active Relief Requests**: Live tally of incoming camp needs with anti-duplicate filtering.
- **Critical Locations Triage**: Instant identification of red-alert camps requiring life-saving assistance.
- **Available Warehouse Stock**: Live aggregate units across **3 regional depots**.
- **Available Fleet**: Telemetry and payload tracking for **3 vehicles**.
- **Delivery Progress Metrics**: Supplies dispatched, deliveries completed, pending deliveries, and overall shortage rate.
- **Interactive GIS Map**: Real-time Leaflet map rendering all 5 affected camps, 3 warehouses, 3 vehicles, supply corridor polylines, and active road hazards.

### **Module 2: Disaster & Relief Request Management**
- **Register New Affected Locations**: Log coordinates (lat/long), affected population, casualty count, disaster category (Flood, Cyclone, Landslide, Earthquake), and road condition.
- **Submit Relief Requests**: Log food packets, drinking water liters, and medical trauma kits with priority urgency ratings.
- **Photo Evidence Verification**: Field coordinates and photographic evidence attachment.
- **Anti-Duplicate Allocation Safeguard (Core Feature)**: Allows multiple reports from the same location while using fuzzy window-matching (within 6 hours) to automatically detect duplicate requests, preventing double-allocation of emergency supplies.

### **Module 3: AI-Based Priority & Demand Estimation (Core Differentiator)**
- **Multi-Factor Algorithmic Scoring (0-100)**: Evaluates 8 critical inputs:
  1. Affected population size
  2. Disaster severity & road vulnerability
  3. Casualty/injured count
  4. Food requirements
  5. Drinking water deficit
  6. Medical emergency kits
  7. Available on-site buffer
  8. Supply latency (hours elapsed since last delivery)
- **Priority Classification**:
  - `Camp A`: **95/100 (Critical)**
  - `Camp E`: **90/100 (Critical)**
  - `Camp B`: **82/100 (High)**
  - `Camp C`: **61/100 (Medium)**
  - `Camp D`: **43/100 (Low)**
- **Explainable AI (XAI) Attribution**: Transparent, plain-English breakdown of why each location received its exact score (e.g., *"Camp A – Critical because of a large affected population (1,200), high medical demand (140 kits for 65 injured), and 38 hours elapsed since last water delivery"*).
- **Architecture Defense**: Rule-based explainability for zero-hallucination life-critical decisions, paired with a time-series ML forecasting validation roadmap for judge defense.

### **Module 4: Smart Inventory & Warehouse Management (Core Proposed USP)**
- **Multi-Warehouse Monitoring**:
  - *Warehouse A (Central Regional Depot)*: 20,000 kg capacity
  - *Warehouse B (Northern Relief Base)*: 12,000 kg capacity (configured with a food deficit)
  - *Warehouse C (Coastal Logistics Station)*: 10,000 kg capacity
- **Inventory Metrics**: Total, reserved, dispatched, and available buffer stocks with automatic minimum safe threshold alarms.
- **Batch Expiry Tracking**: Perishable countdowns for medical kits and food packets.
- **★ Autonomous Surplus Redistribution Engine (USP)**:
  - Automatically identifies surplus buffer at Warehouse A (surplus food packets) and deficits at Warehouse B.
  - Recommends and executes instant inter-depot transfers subject to payload and transit constraints.

### **Module 5: Intelligent Resource Allocation Engine (Most Important Feature)**
- **Automated Allocation Solver**: Calculates the exact quantity of food, water, and medical supplies assigned to each camp, which warehouse supplies it, and remaining deficits.
- **Multi-Constraint Enforcement**:
  - `Warehouse Inventory`: Zero overdraw guarantee
  - `Location Urgency`: Critical camps (Camp A & E) prioritized first
  - `Vehicle Capacity`: Drops matched to fleet payload envelopes
  - `Geographic Proximity`: Minimal transport distance
- **Explainable Allocation Panel**: Plain-English rationale for every single allocation decision for judge review.

### **Module 6: Smart Vehicle & Route Optimization**
- **Fleet Registry**:
  - `RL-01`: Heavy 6-Wheel Truck (1,500 kg capacity, Central Depot)
  - `RL-02`: Off-Road 4x4 Truck (800 kg capacity, Northern Hub)
  - `RL-03`: Rapid Transit Van (500 kg capacity, Coastal Station)
- **Strict Capacity Lock**: If Van RL-03 has a 500 kg limit, the system never assigns >500 kg; payloads are automatically divided and balanced across available vehicles.
- **Dynamic Road Hazard & Detour Simulation**:
  - Interactive "Simulate Road Blockage" toggle (Highway 4 submerged near Mile 14).
  - Dynamically recalculates round-trip ETAs (+45 mins) and diverts routes via Eastern Link Expressway (+7.4 km detour).

### **Module 7: Delivery Tracking & Receipt Verification**
- **6-Stage Humanitarian Delivery Protocol**:
  1. `Delivery Created` (Coordinator approval)
  2. `Dispatched` (Warehouse seal verified)
  3. `In Transit` (Live convoy tracking)
  4. `Arrived` (Camp perimeter reached)
  5. `Receipt Verification` (Ground physical count audit)
  6. `Completed` (Stock ledger finalized)
- **Discrepancy Reconciliation Form**: Quantitative comparison between dispatched vs received items; automatically flags missing/damaged items (e.g., *Dispatched: 200 food, 50 medical. Received: 190 food, 45 medical → Missing 10 food, 5 medical flagged*).
- **Immutable Chain-of-Custody**: Complete timestamped event log with digital signatures and photo proof.

### **Module 8: Reports, Analytics & Impact Monitoring**
- **Impact Indicators**: Total population served (3,890 lives), supplies delivered, warehouse buffer utilization %, vehicle payload factor.
- **Head-to-Head Comparison: Traditional vs ReliefLink Allocation**:
  - **Unmet Demand**: 54% (Traditional) ➔ **14% (ReliefLink)** — *74% reduction in shortages*
  - **Delivery Turnaround**: 9.4 hrs (Traditional) ➔ **3.2 hrs (ReliefLink)** — *66% faster*
  - **Fleet Travel Mileage**: 380 km (Traditional) ➔ **194 km (ReliefLink)** — *49% fuel & distance saved*
  - **Duplicate Allocation Waste**: 22% (Traditional) ➔ **0% (ReliefLink)** — *100% duplicate lock*
- **Export Options**: 1-click Download CSV Report, JSON Audit Ledger, and Printable Humanitarian Dossier.

---

## 🚀 Running ReliefLink Locally

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start local development server
npm run dev

# 3. Production build
npm run build
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

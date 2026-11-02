import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Compass,
  Building2,
  Truck,
  AlertTriangle,
  HelpCircle,
  Cpu,
  BrainCircuit,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';
import { calculatePriorityScore } from '../utils/aiEstimationEngine';

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const { camps, warehouses, vehicles, blockages, deliveries, userLocation, setActiveTab } = useRelief();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: 'ReliefLink Operational AI Assistant online. Grounded in live disaster telemetry across your operational grid. How can I assist with triage prioritization, inventory rebalancing, or route hazards today?',
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickQuestions = [
    'Which camp needs help first?',
    'Which warehouse has surplus medical kits?',
    'What happens if Warehouse Beta becomes unavailable?',
    'Which deliveries are currently delayed?'
  ];

  const handleAsk = (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    // Add user message
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('which camp') || lower.includes('help first') || lower.includes('critical')) {
        if (!camps || camps.length === 0) {
          reply = `No affected disaster camps are currently registered on the operational grid (Clean Slate mode).\n\nTo begin triage analysis:\n- Click **⚡ Deploy Grid at My GPS** on the dashboard to deploy an operational sector around your real coordinates.\n- Or open **Relief Requests** to register a new camp and submit urgent supply requisitions.`;
        } else {
          const scored = camps.map(c => ({
            ...c,
            priority: calculatePriorityScore(c)
          })).sort((a, b) => b.priority.score - a.priority.score);

          const topCamp = scored[0];
          const waterDeficit = Math.max(0, (topCamp.demands?.water || 0) - (topCamp.received?.water || 0));
          const foodDeficit = Math.max(0, (topCamp.demands?.food || 0) - (topCamp.received?.food || 0));
          const shelterDeficit = Math.max(0, (topCamp.demands?.shelter || 0) - (topCamp.received?.shelter || 0));

          reply = `**${topCamp.name}** requires immediate priority assistance (Triage Urgency Score: **${topCamp.priority.score}/100 - ${topCamp.priority.status}**).\n\nKey Deficits:\n- Displaced Population: ${topCamp.population?.toLocaleString()} people\n- Reported Casualties: ${topCamp.injured} injured\n- Potable Water Needed: ${waterDeficit} Liters\n- Food Packets Needed: ${foodDeficit} Packets\n- Shelter Kits Needed: ${shelterDeficit} Kits\n\nDecision Logic:\n"${topCamp.priority.explanation}"\n\nRecommendation: Prioritize emergency convoy allocation in Module 5.`;
        }
      } else if (lower.includes('surplus') || lower.includes('medical') || lower.includes('kits')) {
        if (!warehouses || warehouses.length === 0) {
          reply = `No regional supply depots are currently provisioned. Initialize depots around your GPS location to track warehouse buffers and inter-depot surplus transfers.`;
        } else {
          const bestMedWh = [...warehouses].sort((a, b) => (b.stock?.medical?.available || 0) - (a.stock?.medical?.available || 0))[0];
          reply = `**${bestMedWh.name}** currently holds the largest buffer of trauma stabilization supplies (**${bestMedWh.stock?.medical?.available || 0} kits available**).\n\nReliefLink's Autonomous Surplus Redistribution engine monitors inter-depot buffers and recommends transfers if neighbouring depots experience acute deficits.`;
        }
      } else if (lower.includes('warehouse beta') || lower.includes('unavailable') || lower.includes('fails') || lower.includes('floods')) {
        if (!warehouses || warehouses.length === 0) {
          reply = `Depot failure simulation requires active warehouses. Deploy an operational grid to test cascading failovers.`;
        } else {
          reply = `**Simulated Failure Impact Analysis:**\nIf a primary regional warehouse becomes submerged:\n- Local camp commitments immediately failover to adjacent active depots.\n- Autonomous inter-depot surplus balancing reallocates reserve buffers.\n- Recommendation: Enable the **What-If Scenario Simulator** to evaluate real-time rebalanced curves.`;
        }
      } else if (lower.includes('delayed') || lower.includes('delivery') || lower.includes('transit')) {
        if (!deliveries || deliveries.length === 0) {
          reply = `There are currently no active delivery convoys in transit. Once an allocation plan is dual-approved in Module 5, dispatch missions and digital QR chain-of-custody passes will be tracked live.`;
        } else {
          reply = `**Active Convoy Pipeline (${deliveries.length} Missions):**\n` + deliveries.map(d => `- **${d.deliveryCode} (${d.vehicleName}):** Stage ${d.stageIndex}/6: ${d.stage} ➔ ${d.targetLocationName} (${d.dispatchedQuantities?.food || 0} Food, ${d.dispatchedQuantities?.water || 0}L Water, ${d.dispatchedQuantities?.shelter || 0} Shelter)`).join('\n');
        }
      } else {
        reply = `Operational Telemetry Report for "${q}":\n- Camps Registered: ${camps.length}\n- Supply Depots Online: ${warehouses.length}\n- Active Fleets: ${vehicles.length}\n- Deliveries in Pipeline: ${deliveries.length}\n- Geolocation Anchor: ${userLocation ? `Locked at ${userLocation.lat}, ${userLocation.lng}` : 'Standby'}`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[2750] flex justify-end backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-5 space-y-4 animate-slideInRight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-rose-500/20">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                ReliefLink AI Operations Assistant
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 uppercase font-bold">
                  Grounded AI
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Autonomous Natural Language Disaster Ops Copilot
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested Triage Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700/80 text-slate-300 transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-br-none shadow-md shadow-rose-600/20'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-2xl w-fit border border-slate-800 text-slate-400 text-xs">
              <Bot className="w-4 h-4 text-rose-500 animate-spin" />
              <span>Analyzing disaster constraints and live telemetry...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2 bg-slate-950 rounded-xl p-1.5 border border-slate-800 focus-within:border-rose-500/50"
          >
            <input
              type="text"
              placeholder="Ask anything about camps, depots, fleet routes, or bottlenecks..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

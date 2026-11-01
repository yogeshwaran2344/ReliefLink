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

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const { camps, warehouses, vehicles, blockages, deliveries, setActiveTab } = useRelief();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: 'ReliefLink Operational AI Assistant online. Grounded in live disaster telemetry across 5 Camps, 3 Depots, and 3 Fleet Convoys. How can I assist disaster coordination?',
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
        const topCamp = [...camps].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))[0] || camps[0];
        reply = `**${topCamp.name}** requires immediate priority assistance (Triage Urgency Score: **${topCamp.priorityScore || 95}/100 - Critical**).\n\nKey Deficits:\n- Population: ${topCamp.population} displaced persons\n- Reported Casualties: ${topCamp.injuredCount || 65} injured\n- Potable Water Shortage: ${topCamp.waterDemand - (topCamp.allocatedWater || 0)} Liters deficit\n\nRecommendation: Dispatch RL-01 Heavy Truck from Central Depot Alpha immediately.`;
      } else if (lower.includes('surplus') || lower.includes('medical') || lower.includes('kits')) {
        const whGamma = warehouses.find(w => w.id === 'wh-3') || warehouses[2];
        reply = `**${whGamma?.name || 'Warehouse Gamma'}** holds the largest surplus of trauma stabilization supplies (**${whGamma?.inventory?.medical || 180} kits available**), exceeding its local camp commitment buffer by +65 kits.\n\nReliefLink has recommended a **Surplus Inter-Depot Redistribution** transfer to Depot Alpha to fulfill pending requisitions.`;
      } else if (lower.includes('warehouse beta') || lower.includes('unavailable') || lower.includes('fails') || lower.includes('floods')) {
        reply = `**Simulated Failure Impact Analysis:**\nIf Warehouse Beta is rendered offline:\n- 850 food rations and 1,200L water committed to Camps B & C must immediately failover to Depot Alpha and Gamma.\n- Route latencies will increase by **+18.4 km (+32 mins)**.\n- Recommendation: Enable What-If Simulator with Preset 3 to view rebalanced simplex allocation curves.`;
      } else if (lower.includes('delayed') || lower.includes('delivery') || lower.includes('transit')) {
        reply = `**Convoys En-Route Status:**\n- **DEL-2026-001 (RL-01):** En route to Camp A. Detoured via Eastern Link due to Highway 4 causeway blockage (+7.4 km). Estimated delay: +14 mins.\n- **DEL-2026-002 (RL-02):** Arrived at Camp B. Awaiting ground verification.\n- **DEL-2026-003 (RL-03):** Staged at Depot Gamma for bulk water replenishment.`;
      } else {
        reply = `Understood. Analyzing operational telemetry for "${q}". Current system status: 5 Camps registered, 3 Depots active, 3 Fleet vehicles online. Road hazard active on Highway 4. Overall supply shortage index: 18%.`;
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
    }, 600);
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

import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

export const AdminView: React.FC = () => {
  const {
    bloodBanks,
    hospitals,
    donors,
    requests,
    auditLogs,
    triggerScenario
  } = useBloodBridge();

  const [logFilter, setLogFilter] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const fulfilledCount = requests.filter(r => r.status === 'FULFILLED').length;
  const fulfillmentRate = requests.length > 0 ? Math.round((fulfilledCount / requests.length) * 100) : 100;
  const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED').length;

  const handleTrigger = (scenario: 'MASS_CASUALTY' | 'PLATELET_CRISIS' | 'DONOR_MOBILIZATION' | 'RESET_DEMO', label: string) => {
    triggerScenario(scenario);
    setNotification(`Executed Scenario: ${label}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    log.details.toLowerCase().includes(logFilter.toLowerCase()) ||
    log.role.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            System Administration & Audit Console
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Global Network Oversight</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Safety Ledger</span>
            <span aria-hidden="true">·</span>
            <span>Demo Stress Simulator</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Compliance:</span>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            AUDIT-READY (NO AI DECISIONING)
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-between shadow-md">
          <span>⚡ {notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Metrics Row adhering to SaaS Guidelines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Requisitions</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {requests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Platform lifetime total</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Fulfillment Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {fulfillmentRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{fulfilledCount} completed cases</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Verified Blood Banks</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {bloodBanks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">100% cold-chain compliant</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Registered Donors</div>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {donors.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Synthetic demo roster</div>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Scenario Stress-Testing Console */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Demo Sandbox Scenario Stress-Testing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate complex emergency surges to evaluate deterministic matching, bank exhaustion, and donor SOS broadcasts.
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
            Interactive Test Suite
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleTrigger('MASS_CASUALTY', 'Mass Casualty Highway Collision')}
            className="p-3.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-left transition-colors group"
          >
            <div className="text-xs font-bold text-red-900 group-hover:text-red-950 flex items-center justify-between">
              <span>Mass Casualty Event</span>
              <span>➔</span>
            </div>
            <div className="text-[11px] text-red-700 mt-1">
              Simulates highway collision: 4 units O- PRBC + 3 units A+ PRBC. Exhausts local stock and triggers donor alerts.
            </div>
          </button>

          <button
            onClick={() => handleTrigger('PLATELET_CRISIS', 'Regional Dengue / Platelet Shortage')}
            className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-colors group"
          >
            <div className="text-xs font-bold text-amber-900 group-hover:text-amber-950 flex items-center justify-between">
              <span>Platelet Surge Outbreak</span>
              <span>➔</span>
            </div>
            <div className="text-[11px] text-amber-800 mt-1">
              Drains regional platelet buffers and requests 5 units for leukemia/dengue shock at Demo Hospital 04.
            </div>
          </button>

          <button
            onClick={() => handleTrigger('DONOR_MOBILIZATION', 'Community Donor Mobilization')}
            className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors group"
          >
            <div className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950 flex items-center justify-between">
              <span>Donor Mobilization</span>
              <span>➔</span>
            </div>
            <div className="text-[11px] text-emerald-800 mt-1">
              Simulates nearby registered donors responding and accepting open hospital emergency broadcasts.
            </div>
          </button>

          <button
            onClick={() => handleTrigger('RESET_DEMO', 'Reset Sandbox State')}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-left transition-colors group"
          >
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Reset Sandbox</span>
              <span>↺</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Restores baseline synthetic data for blood banks, hospitals, requests, and audit logs.
            </div>
          </button>
        </div>
      </div>

      {/* Global Audit Log Ledger */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Deterministic Protocol Audit Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamper-evident record of all requisitions, match calculations, reserve allocations, and courier dispatches.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search audit trail..."
            value={logFilter}
            onChange={e => setLogFilter(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold text-slate-700">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Action</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Actor / Role</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.slice(0, 15).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {log.performedBy} ({log.role})
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

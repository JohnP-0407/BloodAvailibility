import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface AdminAuditViewProps {
  onBackToDashboard: () => void;
}

export const AdminAuditView: React.FC<AdminAuditViewProps> = ({
  onBackToDashboard
}) => {
  const { auditLogs } = useBloodBridge();
  const [logFilter, setLogFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter !== 'ALL' && !log.action.includes(actionFilter)) return false;
    if (logFilter.trim()) {
      const q = logFilter.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        log.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <span className="text-slate-300">·</span>
            <h1 className="text-lg font-bold text-slate-900">Platform Audit & Regulatory Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident record of all requisitions, match calculations, reserve allocations, and courier dispatches.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          {filteredLogs.length} Events Logged
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or details..."
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Actions</option>
            <option value="REQUEST">Requisitions</option>
            <option value="MATCH">Matches</option>
            <option value="DONOR">Donor Actions</option>
            <option value="INVENTORY">Inventory</option>
            <option value="ADMIN">Admin Actions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-slate-700">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Action Type</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Actor / Role</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {log.performedBy} <span className="text-slate-400">({log.role})</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
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

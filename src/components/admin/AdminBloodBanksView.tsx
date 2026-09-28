import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodBank } from '../../types/bloodbridge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface AdminBloodBanksViewProps {
  onBackToDashboard: () => void;
  onOpenVerification: () => void;
}

export const AdminBloodBanksView: React.FC<AdminBloodBanksViewProps> = ({
  onBackToDashboard,
  onOpenVerification
}) => {
  const {
    bloodBanks,
    toggleBankVerification
  } = useBloodBridge();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankForInspect, setSelectedBankForInspect] = useState<BloodBank | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const filteredBanks = bloodBanks.filter(b => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggle = async (bank: BloodBank) => {
    try {
      const newStatus = !bank.verified;
      await toggleBankVerification(bank.id, newStatus, 'Admin console verification toggle');
      setActionFeedback(`Facility ${bank.name} verification status updated to ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

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
            <h1 className="text-lg font-bold text-slate-900">Affiliated Blood Banks Network</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor regional blood repositories, cold-chain compliance, inventory levels, and verification accreditation.
          </p>
        </div>

        <button
          onClick={onOpenVerification}
          className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
        >
          Compliance & Verification Portal ➔
        </button>
      </div>

      <MedicalSafetyBadge />

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between shadow-xs">
          <span>✓ {actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by facility name, code, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="text-slate-500 font-mono text-xs">
          {filteredBanks.length} Facilities Active
        </div>
      </div>

      {/* Blood Banks Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-slate-700">Facility / Code</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Address & Operating Hours</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Total Units Available</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Verification Status</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBanks.map(bank => {
                let totalUnits = 0;
                let criticalCount = 0;
                Object.values(bank.inventory).forEach((inv: any) => {
                  totalUnits += (inv.unitsAvailable || 0);
                  if (inv.unitsAvailable <= inv.criticalThreshold) criticalCount++;
                });

                return (
                  <tr key={bank.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{bank.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Code: {bank.code} · Contact: {bank.contactNumber}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{bank.address}, {bank.city}</div>
                      <div className="text-[11px] text-slate-500">{bank.operatingHours}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {totalUnits} <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                      {criticalCount > 0 ? (
                        <div className="text-[11px] text-amber-700 font-medium">
                          {criticalCount} group(s) at critical threshold
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          All buffer levels optimal
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-semibold text-xs ${
                        bank.verified ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        ● {bank.verified ? 'VERIFIED' : 'UNVERIFIED / PENDING'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedBankForInspect(bank)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Inspect Inventory
                      </button>

                      <button
                        onClick={() => handleToggle(bank)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                          bank.verified
                            ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                            : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                        }`}
                      >
                        {bank.verified ? 'Revoke Verification' : 'Approve Verification'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Inspection Modal */}
      {selectedBankForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  Live Stock Inspection
                </span>
                <h3 className="text-base font-bold mt-0.5">{selectedBankForInspect.name}</h3>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedBankForInspect.code} · {selectedBankForInspect.city}
                </div>
              </div>
              <button
                onClick={() => setSelectedBankForInspect(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(selectedBankForInspect.inventory).map((inv: any, idx) => {
                  const isCrit = inv.unitsAvailable <= inv.criticalThreshold;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        isCrit ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{inv.bloodGroup}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{inv.component}</span>
                      </div>
                      <div className="font-mono text-base font-bold text-slate-900 mt-1">
                        {inv.unitsAvailable} <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Thresh: {inv.criticalThreshold} · Res: {inv.unitsReserved}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedBankForInspect(null)}
                  className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

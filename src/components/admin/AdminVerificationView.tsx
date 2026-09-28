import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodBank } from '../../types/bloodbridge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface AdminVerificationViewProps {
  onBackToDashboard: () => void;
}

export const AdminVerificationView: React.FC<AdminVerificationViewProps> = ({
  onBackToDashboard
}) => {
  const {
    bloodBanks,
    toggleBankVerification,
    currentUser
  } = useBloodBridge();

  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
  const [verificationReason, setVerificationReason] = useState('Annual clinical accreditation audit passed');
  const [targetVerifiedState, setTargetVerifiedState] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredBanks = bloodBanks.filter(b => {
    if (filter === 'VERIFIED') return b.verified;
    if (filter === 'PENDING') return !b.verified;
    return true;
  });

  const handleCommitVerification = async () => {
    if (!selectedBank) return;
    try {
      await toggleBankVerification(selectedBank.id, targetVerifiedState, verificationReason);
      setSuccessMsg(`Accreditation for ${selectedBank.name} committed as ${targetVerifiedState ? 'VERIFIED' : 'UNVERIFIED'}.`);
      setSelectedBank(null);
      setTimeout(() => setSuccessMsg(null), 4000);
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
            <h1 className="text-lg font-bold text-slate-900">Institutional Verification & Cold Chain Accreditation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer regulatory accreditation for participating blood repositories, surgical centers, and emergency hubs.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          {(['ALL', 'VERIFIED', 'PENDING'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                filter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' ? 'All Facilities' : f}
            </button>
          ))}
        </div>
      </div>

      <MedicalSafetyBadge />

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Accreditation Standards Reference Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          BloodBridge Institutional Accreditation Criteria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>Continuous Cold-Chain Logging</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Continuous temperature maintenance between 2°C and 6°C for whole blood & PRBC, -18°C for plasma.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>AABB/WHO Laboratory Protocol</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Deterministic serological typing and double-blind crossmatch testing capability before clinical transfusion release.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>Licensed Medical Direction</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              24/7 designated transfusion medicine physician oversight and rapid cold-chain dispatch courier vehicles.
            </p>
          </div>
        </div>
      </div>

      {/* Facility Verification Roster */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-slate-700">Institution / Code</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Accreditation Level</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Compliance Status</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Last Audit Signoff</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBanks.map(bank => (
                <tr key={bank.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{bank.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {bank.code} · {bank.address}, {bank.city}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div>Regional Blood Repository</div>
                    <div className="text-[11px] text-slate-500">Tier-1 Cold Storage</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-semibold text-xs ${
                      bank.verified ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      ● {bank.verified ? 'ACCREDITED & VERIFIED' : 'PENDING INSPECTION'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    Audited by: {currentUser.name}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedBank(bank);
                        setTargetVerifiedState(!bank.verified);
                        setVerificationReason(
                          bank.verified
                            ? 'Suspension pending temperature logging sensor audit'
                            : 'Annual clinical accreditation audit passed'
                        );
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                        bank.verified
                          ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300'
                          : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                      }`}
                    >
                      {bank.verified ? 'Revoke Status' : 'Approve & Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className={`p-4 text-white ${targetVerifiedState ? 'bg-emerald-700' : 'bg-amber-700'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Institutional Accreditation Action
              </div>
              <h3 className="text-base font-bold mt-0.5">
                {targetVerifiedState ? 'Approve Accreditation' : 'Revoke Accreditation'}
              </h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900">{selectedBank.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{selectedBank.code}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Accreditation Rationale / Audit Notes:
                </label>
                <textarea
                  rows={3}
                  value={verificationReason}
                  onChange={(e) => setVerificationReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                All verification actions are timestamped and permanently inscribed into the system audit log with actor ID.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBank(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCommitVerification}
                  className={`px-4 py-2 font-bold text-white rounded-lg transition-colors ${
                    targetVerifiedState
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {targetVerifiedState ? 'Confirm Accreditation' : 'Confirm Revocation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { checkDonorEligibility, isBloodCompatible } from '../../utils/compatibility';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

export const DonorView: React.FC = () => {
  const {
    donors,
    activeDonorId,
    setActiveDonorId,
    requests,
    respondToDonorAlert
  } = useBloodBridge();

  const currentDonor = donors.find(d => d.id === activeDonorId) || donors[0];
  const eligibility = checkDonorEligibility(currentDonor);

  const [questionnaire, setQuestionnaire] = useState({
    noFever: true,
    weightOver50: true,
    noRecentSurgery: true,
    feelingWellToday: true
  });

  const isSelfCheckPassed =
    questionnaire.noFever &&
    questionnaire.weightOver50 &&
    questionnaire.noRecentSurgery &&
    questionnaire.feelingWellToday;

  // Find active emergency broadcasts compatible with current donor
  const activeAlerts = requests.filter(r => {
    if (r.status === 'FULFILLED' || r.status === 'CANCELLED') return false;
    const isCompatible = isBloodCompatible(r.bloodGroup, currentDonor.bloodGroup, r.component);
    return isCompatible && (r.unitsAllocated < (r.unitsRequired || r.unitsNeeded || 1) || (r.donorAlertsSent && r.donorAlertsSent > 0));
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with Donor Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Registered Donor Portal
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Synthetic Profiles</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Interval Tracking</span>
            <span aria-hidden="true">·</span>
            <span>Emergency SOS Coordination</span>
          </div>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Simulate As Donor:</label>
          <select
            value={currentDonor.id}
            onChange={(e) => setActiveDonorId(e.target.value)}
            className="text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {donors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.bloodGroup} · {d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Donor Card & Eligibility Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* Digital Donor Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                  BloodBridge Verified Donor
                </span>
                <div className="text-xl font-bold mt-1">{currentDonor.name}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{currentDonor.code} · {currentDonor.city}</div>
              </div>

              <div className="w-14 h-14 rounded-xl bg-rose-600/90 border border-rose-400/40 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xl font-black font-mono leading-none">{currentDonor.bloodGroup}</span>
                <span className="text-[9px] uppercase font-bold text-rose-200 mt-0.5">Type</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Total Donations</span>
                <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
                  {currentDonor.totalDonations}x
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px]">Weight</span>
                <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
                  {currentDonor.weightKg} kg
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px]">Current Status</span>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  {currentDonor.status}
                </div>
              </div>
            </div>

            {/* Badges adhering to zero-pill discipline */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap gap-1.5 text-[11px] text-slate-300">
              {currentDonor.badges.map((b, i) => (
                <span key={i} className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  ★ {b}
                </span>
              ))}
            </div>
          </div>

          {/* Clinical Interval Eligibility Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Mandatory Interval Eligibility (56-Day Cooldown)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic calculation based on last donation timestamp.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${
              eligibility.eligible && isSelfCheckPassed
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  eligibility.eligible && isSelfCheckPassed ? 'bg-emerald-600' : 'bg-amber-600'
                }`}></span>
                <span>
                  {eligibility.eligible && isSelfCheckPassed
                    ? 'MEDICALLY ELIGIBLE TO DONATE TODAY'
                    : 'CURRENTLY IN MANDATORY COOLDOWN / INELIGIBLE'}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed">
                {eligibility.reason}
              </p>
              <div className="text-[11px] text-slate-500 mt-2">
                Last recorded donation: {new Date(currentDonor.lastDonationDate).toLocaleDateString()}
              </div>
            </div>

            {/* Pre-Donation Self-Check */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-800">Day-of-Donation Safety Checklist:</div>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionnaire.noFever}
                  onChange={e => setQuestionnaire({ ...questionnaire, noFever: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>No fever, sore throat, or recent infection</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionnaire.weightOver50}
                  onChange={e => setQuestionnaire({ ...questionnaire, weightOver50: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Weight confirmed $\ge 50$ kg</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionnaire.noRecentSurgery}
                  onChange={e => setQuestionnaire({ ...questionnaire, noRecentSurgery: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>No major surgery or dental extraction in last 6 months</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionnaire.feelingWellToday}
                  onChange={e => setQuestionnaire({ ...questionnaire, feelingWellToday: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Well-hydrated and feeling well today</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Emergency SOS Alerts Broadcast */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Emergency SOS Alerts Feed
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hospital emergency requisitions matching your blood group ({currentDonor.bloodGroup}) where blood bank reserves have a shortfall.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {activeAlerts.length} Active Broadcasts
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No emergency broadcasts currently open for your blood group. You are on standby to save lives!
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map(req => {
                const isCritical = req.urgency === 'CRITICAL';
                const hasAccepted = currentDonor.status === 'ON_CALL';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCritical ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-600 animate-ping' : 'bg-amber-500'}`}></span>
                          <span className="font-mono text-xs font-bold text-slate-900">{req.requestNumber}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-xs font-bold text-rose-700 font-mono">
                            {req.bloodGroup} · {req.component}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 mt-1">
                          {req.hospitalName}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {req.clinicalReason}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-bold text-slate-900">
                          {req.unitsAllocated} / {req.unitsRequired || req.unitsNeeded || 1} units
                        </div>
                        <div className="text-[10px] font-bold text-red-700 uppercase mt-0.5">
                          {req.urgency} Priority
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-500 text-[11px]">
                        Hospital is within fast response transit radius. Urgent blood donation needed.
                      </div>

                      <div>
                        {hasAccepted ? (
                          <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg inline-flex items-center gap-1.5">
                            ✓ You Accepted Call (Status: On Call)
                          </span>
                        ) : (
                          <button
                            onClick={() => respondToDonorAlert(req.id, currentDonor.id)}
                            disabled={!eligibility.eligible || !isSelfCheckPassed}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
                          >
                            I Can Donate / Accept Call ➔
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

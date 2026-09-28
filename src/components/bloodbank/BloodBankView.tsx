import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

export const BloodBankView: React.FC = () => {
  const {
    bloodBanks,
    activeBloodBankId,
    setActiveBloodBankId,
    updateInventoryUnits,
    requests,
    updateRequestStatus
  } = useBloodBridge();

  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('PRBC');

  const currentBank = bloodBanks.find(b => b.id === activeBloodBankId) || bloodBanks[0];

  // Calculate totals
  let totalAvailable = 0;
  let totalReserved = 0;
  let criticalAlertsCount = 0;

  Object.values(currentBank.inventory).forEach(inv => {
    totalAvailable += inv.unitsAvailable;
    totalReserved += inv.unitsReserved;
    if (inv.unitsAvailable <= inv.criticalThreshold) {
      criticalAlertsCount++;
    }
  });

  // Requisitions involving this blood bank
  const relevantRequests = requests.filter(r =>
    r.matchedSources.some(s => s.sourceType === 'BLOOD_BANK' && s.sourceId === currentBank.id)
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Bank Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Blood Bank Inventory Management
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Cold-Chain Certified</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Reserve Allocation</span>
            <span aria-hidden="true">·</span>
            <span>Automated Shortfall Triggers</span>
          </div>
        </div>

        {/* Bank Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Active Facility:</label>
          <select
            value={currentBank.id}
            onChange={(e) => setActiveBloodBankId(e.target.value)}
            className="text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {bloodBanks.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facility Metrics Strip adhering to SaaS Guidelines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Available Units</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalAvailable}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for immediate dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Locked in Reservation</div>
          <div className="text-2xl font-bold font-mono text-purple-700 mt-1 tabular-nums">
            {totalReserved}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pending courier pickup</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Critical Stock Alerts</div>
          <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${criticalAlertsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {criticalAlertsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Groups below safety buffer</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Operating Hours</div>
          <div className="text-sm font-semibold text-slate-900 mt-2 truncate">
            {currentBank.operatingHours}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{currentBank.contactNumber}</div>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Component Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {BLOOD_COMPONENTS.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedComponent(c.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedComponent === c.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Inventory Grid: 8 Blood Groups for Selected Component */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Stock Levels · {BLOOD_COMPONENTS.find(c => c.id === selectedComponent)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust unit quantities in real-time. Depleting stock below threshold triggers automated partner bank/donor alerts.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {currentBank.code} / {currentBank.city}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map(bg => {
            const key = `${bg}_${selectedComponent}`;
            const inv = currentBank.inventory[key] || {
              bloodGroup: bg,
              component: selectedComponent,
              unitsAvailable: 0,
              unitsReserved: 0,
              criticalThreshold: 4,
              expiryWithinDays: 28
            };

            const isBelowThreshold = inv.unitsAvailable <= inv.criticalThreshold;
            const isUniversalRbc = bg === 'O-';
            const isUniversalPlasma = bg === 'AB+';

            return (
              <div
                key={bg}
                className={`p-4 rounded-xl border transition-all ${
                  isBelowThreshold
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-2xl font-black text-rose-700 tracking-tight">
                      {bg}
                    </span>
                    {isUniversalRbc && (
                      <span className="block text-[10px] font-bold text-red-700 mt-0.5">
                        Universal RBC Donor
                      </span>
                    )}
                    {isUniversalPlasma && (
                      <span className="block text-[10px] font-bold text-blue-700 mt-0.5">
                        Universal Plasma Donor
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Buffer Min</span>
                    <div className="font-mono text-xs font-semibold text-slate-600">
                      {inv.criticalThreshold} units
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500">Available</div>
                    <div className={`text-xl font-bold font-mono tabular-nums ${isBelowThreshold ? 'text-red-700' : 'text-slate-900'}`}>
                      {inv.unitsAvailable}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500">Reserved</div>
                    <div className="text-xl font-bold font-mono text-purple-700 tabular-nums">
                      {inv.unitsReserved}
                    </div>
                  </div>
                </div>

                {/* Direct Adjusters */}
                <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Adjust:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateInventoryUnits(currentBank.id, bg, selectedComponent, Math.max(0, inv.unitsAvailable - 1))}
                      className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors"
                      title="Deduct 1 unit"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold w-6 text-center text-slate-800">
                      {inv.unitsAvailable}
                    </span>
                    <button
                      onClick={() => updateInventoryUnits(currentBank.id, bg, selectedComponent, inv.unitsAvailable + 1)}
                      className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors"
                      title="Add 1 unit"
                    >
                      +
                    </button>
                  </div>
                </div>

                {isBelowThreshold && (
                  <div className="mt-2 text-[10px] font-semibold text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    <span>Low stock buffer warning</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank Requisitions Fulfillment Queue */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Facility Requisitions & Dispatch Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Matched orders assigned to {currentBank.name}. Confirm packaging and dispatch to transport couriers.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {relevantRequests.length} Active Orders
          </span>
        </div>

        {relevantRequests.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No active requisitions routed to this blood bank facility at this time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {relevantRequests.map(req => {
              const matchedStep = req.matchedSources.find(
                s => s.sourceType === 'BLOOD_BANK' && s.sourceId === currentBank.id
              );
              if (!matchedStep) return null;

              return (
                <div key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{req.requestNumber}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-xs font-bold text-rose-700">
                        {matchedStep.unitsAllocated} units {matchedStep.bloodGroupOffered} {req.component}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 font-medium">To: {req.hospitalName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Priority: {req.urgency} · Distance: {matchedStep.distanceKm} km · Status: {req.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'RESERVED' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'ACCEPTED', `Dispatched from ${currentBank.name}`)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                      >
                        Dispatch Courier ➔
                      </button>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        Courier in Transit (ETA ~{req.estimatedArrivalMin}m)
                      </span>
                    )}
                    {req.status === 'FULFILLED' && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        Delivered & Verified ✓
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

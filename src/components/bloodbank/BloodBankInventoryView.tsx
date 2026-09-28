import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface BloodBankInventoryViewProps {
  onOpenStockUpdate: (initialGroup?: BloodGroup, initialComp?: BloodComponent) => void;
  onOpenIncomingRequests: () => void;
}

export const BloodBankInventoryView: React.FC<BloodBankInventoryViewProps> = ({
  onOpenStockUpdate,
  onOpenIncomingRequests
}) => {
  const {
    bloodBanks,
    activeBloodBankId,
    setActiveBloodBankId,
    updateInventoryUnits,
    currentUser,
    userRole,
    errorMessage,
    setErrorMessage
  } = useBloodBridge();

  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('PRBC');
  const [filterType, setFilterType] = useState<'ALL' | 'RH_NEG' | 'CRITICAL_ONLY'>('ALL');
  const [adjustingGroup, setAdjustingGroup] = useState<BloodGroup | null>(null);
  const [manualInputValue, setManualInputValue] = useState<string>('');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Routine blood collection restock');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentBank = bloodBanks.find(b => b.id === activeBloodBankId) || bloodBanks[0];
  const isAuthorized = userRole !== 'BLOOD_BANK_STAFF' || !currentUser.bloodBankId || currentUser.bloodBankId === currentBank.id;

  // Calculate totals for active component
  let totalCompAvailable = 0;
  let totalCompReserved = 0;
  let criticalCount = 0;

  BLOOD_GROUPS.forEach(bg => {
    const key = `${bg}_${selectedComponent}`;
    const inv = currentBank.inventory[key];
    if (inv) {
      totalCompAvailable += inv.unitsAvailable || 0;
      totalCompReserved += inv.unitsReserved || 0;
      if (inv.unitsAvailable <= inv.criticalThreshold) {
        criticalCount++;
      }
    }
  });

  // Filter blood groups
  const displayedGroups = BLOOD_GROUPS.filter(bg => {
    if (filterType === 'RH_NEG') return bg.endsWith('-');
    if (filterType === 'CRITICAL_ONLY') {
      const key = `${bg}_${selectedComponent}`;
      const inv = currentBank.inventory[key];
      return inv ? inv.unitsAvailable <= inv.criticalThreshold : false;
    }
    return true;
  });

  const handleQuickStep = async (bg: BloodGroup, delta: number) => {
    if (!isAuthorized) {
      setErrorMessage(`Unauthorized: You are authenticated as staff of ${currentUser.bloodBankId} and cannot alter inventory for ${currentBank.id}.`);
      return;
    }

    const key = `${bg}_${selectedComponent}`;
    const currentUnits = currentBank.inventory[key]?.unitsAvailable || 0;
    const targetUnits = currentUnits + delta;

    if (targetUnits < 0) {
      setErrorMessage('Negative inventory units are prohibited.');
      return;
    }

    try {
      await updateInventoryUnits(currentBank.id, bg, selectedComponent, targetUnits, `Quick step ${delta > 0 ? '+' : ''}${delta}`);
    } catch (err: any) {
      // Handled by context
    }
  };

  const handleOpenInlineModal = (bg: BloodGroup) => {
    if (!isAuthorized) {
      setErrorMessage(`Unauthorized: You are authenticated as staff of ${currentUser.bloodBankId} and cannot alter inventory for ${currentBank.id}.`);
      return;
    }
    const key = `${bg}_${selectedComponent}`;
    const currentUnits = currentBank.inventory[key]?.unitsAvailable || 0;
    setAdjustingGroup(bg);
    setManualInputValue(String(currentUnits));
  };

  const handleSaveInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingGroup) return;

    const val = parseInt(manualInputValue, 10);
    if (isNaN(val) || val < 0) {
      setErrorMessage('Units must be a non-negative integer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateInventoryUnits(currentBank.id, adjustingGroup, selectedComponent, val, adjustmentReason);
      setAdjustingGroup(null);
    } catch (err) {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              ABO/Rh Inventory Management
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-0.5">
            Facility Inventory Matrix · {currentBank.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of all 8 blood groups with buffer monitors and cold-chain compliance.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Facility:</label>
          <select
            value={currentBank.id}
            onChange={(e) => setActiveBloodBankId(e.target.value)}
            className="text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 w-full sm:w-auto"
          >
            {bloodBanks.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Authorization Warning Banner if viewing another bank */}
      {!isAuthorized && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span>🔒 Read-Only View:</span>
            <span>
              You are signed in as staff for facility <strong>{currentUser.bloodBankId}</strong>. You cannot modify stock for <strong>{currentBank.id}</strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveBloodBankId(currentUser.bloodBankId || 'bb-01')}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
          >
            Return to My Facility ➔
          </button>
        </div>
      )}

      {/* Component Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {BLOOD_COMPONENTS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedComponent(c.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                selectedComponent === c.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Filter by Rh / Critical */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-colors ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 8 Groups
          </button>
          <button
            onClick={() => setFilterType('RH_NEG')}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-colors ${
              filterType === 'RH_NEG' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rh Negative Only (O-, A-, B-, AB-)
          </button>
          <button
            onClick={() => setFilterType('CRITICAL_ONLY')}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-colors ${
              filterType === 'CRITICAL_ONLY' ? 'bg-white text-red-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-red-700'
            }`}
          >
            Critical Only
          </button>
        </div>
      </div>

      {/* Component Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Selected Component</div>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">
            {BLOOD_COMPONENTS.find(c => c.id === selectedComponent)?.label}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Available In Stock</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalCompAvailable} <span className="text-xs font-normal text-slate-400 font-sans">units</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Locked in Reservations</div>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1 tabular-nums">
            {totalCompReserved} <span className="text-xs font-normal text-purple-400 font-sans">units</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Critical Buffer Alerts</div>
          <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${criticalCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {criticalCount} <span className="text-xs font-normal text-slate-400 font-sans">groups</span>
          </div>
        </div>
      </div>

      {/* All 8 Blood Groups Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {displayedGroups.map(bg => {
          const key = `${bg}_${selectedComponent}`;
          const inv = currentBank.inventory[key] || {
            bloodGroup: bg,
            component: selectedComponent,
            unitsAvailable: 0,
            unitsReserved: 0,
            criticalThreshold: selectedComponent === 'PRBC' ? 5 : 3,
            expiryWithinDays: 28,
            lastUpdated: '2026-09-28T07:00:00.000Z',
            status: 'UNAVAILABLE'
          };

          const isUniversalRbc = bg === 'O-';
          const isUniversalPlasma = bg === 'AB+';
          const threshold = inv.criticalThreshold || (selectedComponent === 'PRBC' ? 5 : 3);
          const units = inv.unitsAvailable || 0;

          // Compute status
          const status = inv.status || (
            units <= 0 ? 'UNAVAILABLE' :
            units <= threshold ? 'CRITICAL' :
            units <= Math.round(threshold * 1.5) ? 'LOW' : 'AVAILABLE'
          );

          const formattedTime = inv.lastUpdated 
            ? new Date(inv.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '07:00 AM';

          const isUnderBuffer = units <= threshold;

          return (
            <div
              key={bg}
              className={`p-4 rounded-2xl border transition-all ${
                status === 'CRITICAL' || status === 'UNAVAILABLE'
                  ? 'border-red-300 bg-red-50/40'
                  : status === 'LOW'
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Top Header of Card: Blood Group & Status */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl font-black text-rose-700 tracking-tight">
                      {bg}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : status === 'LOW'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : status === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {status}
                    </span>
                  </div>

                  {isUniversalRbc && (
                    <span className="block text-[10px] font-bold text-red-700 mt-1">
                      ★ Universal RBC Donor
                    </span>
                  )}
                  {isUniversalPlasma && (
                    <span className="block text-[10px] font-bold text-blue-700 mt-1">
                      ★ Universal Plasma Donor
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Buffer Min</span>
                  <span className="font-mono text-xs font-semibold text-slate-600">
                    {threshold} units
                  </span>
                </div>
              </div>

              {/* Units Available & Units Reserved Monospace Display */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Available Units</div>
                  <div className={`text-2xl font-black font-mono tabular-nums ${
                    isUnderBuffer ? 'text-red-700' : 'text-slate-900'
                  }`}>
                    {units}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500 font-medium">Reserved</div>
                  <div className="text-xl font-bold font-mono text-purple-700 tabular-nums">
                    {inv.unitsReserved || 0}
                  </div>
                </div>
              </div>

              {/* Last Updated Timestamp */}
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Last updated:</span>
                <span className="font-mono text-slate-600">{formattedTime}</span>
              </div>

              {/* Action Buttons: Increment / Decrement & Direct Edit */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={!isAuthorized || units <= 0}
                    onClick={() => handleQuickStep(bg, -1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={units <= 0 ? "Negative units not permitted" : "Deduct 1 unit"}
                  >
                    -
                  </button>

                  <button
                    disabled={!isAuthorized}
                    onClick={() => handleQuickStep(bg, 1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Add 1 unit"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={!isAuthorized}
                  onClick={() => handleOpenInlineModal(bg)}
                  className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Direct Set ➔
                </button>
              </div>

              {isUnderBuffer && (
                <div className="mt-2 text-[10px] font-semibold text-red-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span>Safety buffer shortfall warning</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{displayedGroups.length}</strong> of 8 blood groups for component <strong className="text-slate-800">{selectedComponent}</strong>.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenIncomingRequests}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Review Incoming Requests ➔
          </button>
          <button
            onClick={() => onOpenStockUpdate(undefined, selectedComponent)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            + Full Stock Update Form
          </button>
        </div>
      </div>

      {/* Inline Direct Adjustment Dialog */}
      {adjustingGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Direct Stock Adjustment: {adjustingGroup}
                </h3>
                <p className="text-xs text-slate-500">{selectedComponent} · {currentBank.name}</p>
              </div>
              <button
                onClick={() => setAdjustingGroup(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInline} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Available Units (Non-negative Integer) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={manualInputValue}
                  onChange={(e) => setManualInputValue(e.target.value)}
                  className="w-full text-sm font-mono font-bold p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Validation rule: Negative values are strictly rejected.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Reason *
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Routine blood collection restock">Routine blood collection restock</option>
                  <option value="Component separation clearance">Component separation clearance</option>
                  <option value="Inter-facility transfer received">Inter-facility transfer received</option>
                  <option value="Discard of expired / compromised unit">Discard of expired / compromised unit</option>
                  <option value="Crossmatch reservation release">Crossmatch reservation release</option>
                  <option value="Clinical physical count correction">Clinical physical count correction</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingGroup(null)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Commit Stock Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MedicalSafetyBadge />
    </div>
  );
};

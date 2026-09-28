import React, { useState, useEffect } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface BloodBankStockUpdateViewProps {
  initialGroup?: BloodGroup;
  initialComp?: BloodComponent;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BloodBankStockUpdateView: React.FC<BloodBankStockUpdateViewProps> = ({
  initialGroup,
  initialComp,
  onSuccess,
  onCancel
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

  const [selectedBankId, setSelectedBankId] = useState<string>(activeBloodBankId);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>(initialGroup || 'O-');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>(initialComp || 'PRBC');
  const [mode, setMode] = useState<'ABSOLUTE' | 'OFFSET'>('ABSOLUTE');
  const [inputValue, setInputValue] = useState<string>('10');
  const [offsetSign, setOffsetSign] = useState<'+' | '-'>('+');
  const [reasonCategory, setReasonCategory] = useState<string>('Blood Drive Batch Ingestion');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const currentBank = bloodBanks.find(b => b.id === selectedBankId) || bloodBanks[0];
  const isAuthorized = userRole !== 'BLOOD_BANK_STAFF' || !currentUser.bloodBankId || currentUser.bloodBankId === selectedBankId;

  // Current stock for selected group and component
  const key = `${selectedGroup}_${selectedComponent}`;
  const currentItem = currentBank.inventory[key] || {
    bloodGroup: selectedGroup,
    component: selectedComponent,
    unitsAvailable: 0,
    unitsReserved: 0,
    criticalThreshold: selectedComponent === 'PRBC' ? 5 : 3,
    expiryWithinDays: 28,
    lastUpdated: '2026-09-28T07:00:00.000Z',
    status: 'UNAVAILABLE'
  };

  const currentUnits = currentItem.unitsAvailable || 0;

  // Calculate projected new units
  const parsedInput = parseInt(inputValue, 10);
  let projectedUnits = currentUnits;
  if (!isNaN(parsedInput)) {
    if (mode === 'ABSOLUTE') {
      projectedUnits = parsedInput;
    } else {
      projectedUnits = offsetSign === '+' ? currentUnits + parsedInput : currentUnits - parsedInput;
    }
  }

  // Pre-fill input value when group/component changes
  useEffect(() => {
    if (mode === 'ABSOLUTE') {
      setInputValue(String(currentUnits));
    }
  }, [selectedGroup, selectedComponent, selectedBankId, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setErrorMessage(null);
    setSuccessNotice(null);

    // 1. Validation: Authorization check
    if (!isAuthorized) {
      const err = `Unauthorized: You are signed in as staff for facility ${currentUser.bloodBankId} and cannot alter inventory for ${selectedBankId}.`;
      setLocalError(err);
      return;
    }

    // 2. Validation: Blood group must be valid
    if (!BLOOD_GROUPS.includes(selectedGroup)) {
      setLocalError(`Invalid blood group: ${selectedGroup}. Must be one of standard ABO/Rh groups.`);
      return;
    }

    // 3. Validation: Non-negative units
    if (isNaN(parsedInput) || parsedInput < 0) {
      setLocalError('Please enter a valid non-negative integer quantity.');
      return;
    }

    if (projectedUnits < 0) {
      setLocalError(`Invalid adjustment: Resulting inventory would be negative (${projectedUnits} units). Negative inventory is strictly prohibited.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedReason = `${reasonCategory}${clinicalNotes ? ` - ${clinicalNotes}` : ''}`;
      await updateInventoryUnits(selectedBankId, selectedGroup, selectedComponent, projectedUnits, combinedReason);
      setSuccessNotice(`Successfully updated ${selectedGroup} ${selectedComponent} to ${projectedUnits} units.`);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to commit stock update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRestockUniversal = async () => {
    if (!isAuthorized) {
      setLocalError('Unauthorized for this facility.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newOUnits = Math.max(12, currentBank.inventory['O-_PRBC']?.unitsAvailable || 0 + 6);
      await updateInventoryUnits(selectedBankId, 'O-', 'PRBC', newOUnits, 'Emergency Universal O- Buffer Restock');
      setSuccessNotice(`Universal O- PRBC restocked to ${newOUnits} units.`);
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Inventory Ledger Adjustment
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-0.5">
            Update Blood Unit Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Perform audited modifications to available blood group stocks with clinical reason logging.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ✕ Cancel
        </button>
      </div>

      {/* Error / Success Notifications */}
      {localError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{localError}</span>
          </div>
          <button onClick={() => setLocalError(null)} className="font-bold text-red-600">✕</button>
        </div>
      )}

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
          <span>✓</span>
          <span>{successNotice}</span>
        </div>
      )}

      {/* Quick Macro Restock Helpers */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-800">Need Rapid Stock Ingestion?</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            1-click ingestion for routine donor drive batches and emergency buffers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickRestockUniversal}
          disabled={!isAuthorized || isSubmitting}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-2xs disabled:opacity-50"
        >
          ★ Restock Universal O- PRBC
        </button>
      </div>

      {/* Main Stock Update Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {/* Facility Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Assigned Facility *
          </label>
          <select
            value={selectedBankId}
            onChange={(e) => {
              setSelectedBankId(e.target.value);
              setActiveBloodBankId(e.target.value);
            }}
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold bg-white"
          >
            {bloodBanks.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code}) — {b.city}
              </option>
            ))}
          </select>

          {!isAuthorized && (
            <p className="text-[11px] text-red-600 font-semibold mt-1">
              🔒 You are logged in as staff for {currentUser.bloodBankId}. Modifying another facility is prohibited.
            </p>
          )}
        </div>

        {/* Blood Group and Component Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ABO/Rh Blood Group *
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {BLOOD_GROUPS.map(bg => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`py-2 text-xs font-black font-mono rounded-lg transition-all border ${
                    selectedGroup === bg
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
            {selectedGroup === 'O-' && (
              <span className="text-[10px] text-red-600 font-bold mt-1 block">
                Universal Red Blood Cell Donor
              </span>
            )}
            {selectedGroup === 'AB+' && (
              <span className="text-[10px] text-blue-600 font-bold mt-1 block">
                Universal Plasma Donor
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Component Type *
            </label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value as BloodComponent)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white font-medium"
            >
              {BLOOD_COMPONENTS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-2 text-[11px] text-slate-500">
              {BLOOD_COMPONENTS.find(c => c.id === selectedComponent)?.desc}
            </div>
          </div>
        </div>

        {/* Current State vs Projected State Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="text-[11px] text-slate-500 block">Current Available</span>
            <span className="font-mono text-xl font-bold text-slate-800 mt-0.5 block">
              {currentUnits} <span className="text-xs font-normal text-slate-400">units</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Locked Reserve</span>
            <span className="font-mono text-xl font-bold text-purple-700 mt-0.5 block">
              {currentItem.unitsReserved || 0} <span className="text-xs font-normal text-purple-400">units</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Buffer Threshold</span>
            <span className="font-mono text-xl font-bold text-slate-800 mt-0.5 block">
              {currentItem.criticalThreshold || 5} <span className="text-xs font-normal text-slate-400">units</span>
            </span>
          </div>
        </div>

        {/* Adjustment Mode Selector & Quantity Input */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Adjustment Method:
            </label>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setMode('ABSOLUTE')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                  mode === 'ABSOLUTE' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Set Total Units
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('OFFSET');
                  setInputValue('5');
                }}
                className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                  mode === 'OFFSET' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Add / Deduct (+/-)
              </button>
            </div>
          </div>

          {mode === 'ABSOLUTE' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                New Available Units Total (Must be ≥ 0):
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-base font-mono font-bold p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Direction</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOffsetSign('+')}
                    className={`py-1.5 text-xs font-bold rounded ${
                      offsetSign === '+' ? 'bg-emerald-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setOffsetSign('-')}
                    className={`py-1.5 text-xs font-bold rounded ${
                      offsetSign === '-' ? 'bg-red-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    - Deduct
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Delta Units:
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full text-base font-mono font-bold p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Projected Result Callout */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-600">Projected Resulting Stock:</span>
            <span className={`font-mono text-sm font-black ${
              projectedUnits < 0 ? 'text-red-600' : 'text-slate-900'
            }`}>
              {projectedUnits} units available
              {projectedUnits < 0 && ' (INVALID: Negative)'}
            </span>
          </div>
        </div>

        {/* Reason for Adjustment */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Adjustment Category *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="Blood Drive Batch Ingestion">Blood Drive Batch Ingestion</option>
              <option value="Component Separation Clearance">Component Separation Clearance</option>
              <option value="Inter-facility Emergency Transfer Received">Inter-facility Emergency Transfer Received</option>
              <option value="Transfusion Reservation Cancellation">Transfusion Reservation Cancellation</option>
              <option value="Expired / Hemolyzed Unit Discard">Expired / Hemolyzed Unit Discard</option>
              <option value="Periodic Physical Quality Audit">Periodic Physical Quality Audit</option>
              <option value="Emergency Code Red Stock Mobilization">Emergency Code Red Stock Mobilization</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Notes & Batch Tag Reference (Optional):
            </label>
            <input
              type="text"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Batch #DRIVE-2026-0928 from Mission St High Drive"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Submit / Cancel Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !isAuthorized || projectedUnits < 0}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Committing...' : 'Commit Stock Update ➔'}
          </button>
        </div>
      </form>

      <MedicalSafetyBadge />
    </div>
  );
};

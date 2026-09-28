import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { getBloodCompatibility, checkDonorEligibility } from '../../utils/compatibility';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface DonorProfileViewProps {
  onBackToDashboard: () => void;
  onOpenAvailability: () => void;
}

export const DonorProfileView: React.FC<DonorProfileViewProps> = ({
  onBackToDashboard,
  onOpenAvailability
}) => {
  const {
    donors,
    activeDonorId,
    setActiveDonorId
  } = useBloodBridge();

  const currentDonor = donors.find(d => d.id === activeDonorId) || donors[0];
  const eligibility = checkDonorEligibility(currentDonor);
  const compatInfo = getBloodCompatibility(currentDonor.bloodGroup);

  const [isEditing, setIsEditing] = useState(false);
  const [preferredHospital, setPreferredHospital] = useState(currentDonor.preferredHospitalId || 'hosp-01');
  const [weightKg, setWeightKg] = useState(currentDonor.weightKg);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    currentDonor.weightKg = Number(weightKg);
    currentDonor.preferredHospitalId = preferredHospital;
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const daysSinceLast = Math.floor(
    (Date.now() - new Date(currentDonor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

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
            <h1 className="text-lg font-bold text-slate-900">Donor Profile & Blood Group Specs</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Synthetic Registry</span>
            <span aria-hidden="true">·</span>
            <span>AABB Safety Guidelines</span>
            <span aria-hidden="true">·</span>
            <span>Zero-PII Compliance</span>
          </div>
        </div>

        {/* Switch Donor dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Simulating:</label>
          <select
            value={currentDonor.id}
            onChange={(e) => setActiveDonorId(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {donors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.bloodGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      <MedicalSafetyBadge />

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium rounded-lg">
          ✓ Profile preferences updated successfully.
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Credential & Demographics */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card Presentation */}
          <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-rose-400 font-bold">
                  BloodBridge Verified Volunteer
                </span>
                <h2 className="text-2xl font-bold mt-1 tracking-tight">{currentDonor.name}</h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {currentDonor.code} · Zone: {currentDonor.city}
                </div>
              </div>

              <div className="w-16 h-16 rounded-xl bg-rose-600/90 border border-rose-400/40 flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black font-mono leading-none">{currentDonor.bloodGroup}</span>
                <span className="text-[9px] uppercase font-bold text-rose-200 mt-1">Type</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Availability</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">
                  {currentDonor.availability || 'AVAILABLE'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block">Age / Gender</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block font-mono">
                  {currentDonor.age}y · {currentDonor.gender}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block">Total Donations</span>
                <span className="text-xs font-bold text-rose-300 mt-1 block font-mono">
                  {currentDonor.totalDonations}x
                </span>
              </div>
            </div>

            {/* Badges without pills */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs text-slate-300">
              {currentDonor.badges.map((badge, idx) => (
                <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                  ★ {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Demographic & General Location Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Demographic & Contact Safe-View</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Private phone numbers are protected from public exposure per privacy mandate.
                </p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Specs'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Body Weight (kg):</label>
                  <input
                    type="number"
                    min="45"
                    max="160"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Minimum donor safety threshold is 50 kg</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Hospital Affiliation:</label>
                  <select
                    value={preferredHospital}
                    onChange={(e) => setPreferredHospital(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="hosp-01">Demo Hospital 01 - City Emergency Trauma Center</option>
                    <option value="hosp-02">Demo Hospital 02 - St. Jude Memorial Hospital</option>
                    <option value="hosp-03">Demo Hospital 03 - Apex Metropolitan General</option>
                    <option value="hosp-04">Demo Hospital 04 - Westside Pediatric Center</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Safe Contact View:</span>
                  <span className="font-mono text-slate-800 font-semibold text-right">
                    {currentDonor.contactNumber ? currentDonor.contactNumber.replace(/(\+\d{1,2}\s*\(\d{3}\)\s*)(\d{3})-(\d{4})/, '$1***-**$3') : 'Confidential'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Location Metro Hub:</span>
                  <span className="text-slate-800 font-semibold text-right">{currentDonor.city}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Coordinates Approximation:</span>
                  <span className="font-mono text-slate-800 text-right">
                    {currentDonor.location.lat.toFixed(4)}, {currentDonor.location.lng.toFixed(4)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Confirmed Weight:</span>
                  <span className="font-mono text-slate-800 font-semibold text-right">{currentDonor.weightKg} kg</span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <span className="text-slate-500 font-medium">Preferred Trauma Hub:</span>
                  <span className="text-slate-800 font-semibold text-right">{preferredHospital}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Blood Group Compatibility Specs & Clinical Rules */}
        <div className="lg:col-span-6 space-y-6">
          {/* Blood Compatibility Deep Dive */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ABO & Rh Factor Compatibility
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deterministic immunohematology rules (No automated AI decisioning).
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xl font-bold text-rose-700">{currentDonor.bloodGroup}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-rose-600">●</span>
                  <span>Red Blood Cell (PRBC) Donation Matches</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Your red blood cells carry specific antigen profiles. You can donate to recipients with blood groups:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {compatInfo.canDonateTo.map(bg => (
                    <span key={bg} className="px-2.5 py-1 bg-white font-mono font-bold text-slate-900 rounded border border-slate-300">
                      {bg}
                    </span>
                  ))}
                </div>
                {compatInfo.isUniversalDonorRbc && (
                  <div className="text-[11px] font-semibold text-rose-700 pt-1">
                    ★ Universal Red Cell Donor: O- red blood cells can be transfused in acute trauma before crossmatch completion!
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-indigo-600">●</span>
                  <span>Plasma & Platelet Profile</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Plasma compatibility operates conversely to red cells because antibodies rather than antigens dictate safety.
                </p>
                {compatInfo.isUniversalDonorPlasma && (
                  <div className="text-[11px] font-semibold text-indigo-700 pt-1">
                    ★ Universal Plasma Donor: AB plasma contains neither anti-A nor anti-B antibodies and is universal for all blood groups.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Safety Interval Checklist */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Safety Interval Check</h3>
                <p className="text-xs text-slate-500 mt-0.5">Deterministic 56-day whole-blood interval</p>
              </div>

              <span className={`text-xs font-bold font-mono ${eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                {daysSinceLast} / 56 Days
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${
              eligibility.eligible
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}>
              <div className="text-xs font-bold">
                {eligibility.eligible ? '✓ MEDICALLY CLEARED FOR TRANSFUSION REQUISITIONS' : '⏳ ACTIVE MANDATORY COOLDOWN'}
              </div>
              <p className="text-xs mt-1 leading-relaxed text-slate-700">
                {eligibility.reason}
              </p>
              <div className="text-[11px] text-slate-500 mt-2">
                Last recorded collection: {new Date(currentDonor.lastDonationDate).toLocaleDateString()}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need to pause calls?</span>
              <button
                onClick={onOpenAvailability}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Change Availability Status ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

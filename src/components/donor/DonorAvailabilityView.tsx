import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { checkDonorEligibility } from '../../utils/compatibility';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface DonorAvailabilityViewProps {
  onBackToDashboard: () => void;
  onOpenEmergencyRequests: () => void;
}

export const DonorAvailabilityView: React.FC<DonorAvailabilityViewProps> = ({
  onBackToDashboard,
  onOpenEmergencyRequests
}) => {
  const {
    donors,
    activeDonorId,
    updateDonorAvailability
  } = useBloodBridge();

  const currentDonor = donors.find(d => d.id === activeDonorId) || donors[0];
  const eligibility = checkDonorEligibility(currentDonor);

  const [availability, setAvailability] = useState<'AVAILABLE' | 'UNAVAILABLE'>(
    currentDonor.availability === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'
  );
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Self-reported checklist (informational only)
  const [checklist, setChecklist] = useState({
    noFever: true,
    feelingWell: true,
    hydrated: true,
    noRecentSurgery: true
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateDonorAvailability(currentDonor.id, availability, availabilityNotes);
      setSuccessMessage(`Availability successfully updated to ${availability}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
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
            <h1 className="text-lg font-bold text-slate-900">Donor Standby Availability Console</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure whether BloodBridge emergency hospital dispatches can ping you for immediate donations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Current Status:</span>
          <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
            currentDonor.availability === 'UNAVAILABLE'
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}>
            {currentDonor.availability || 'AVAILABLE'}
          </span>
        </div>
      </div>

      <MedicalSafetyBadge />

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">Set Volunteer Availability</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control your operational standby status. Setting to UNAVAILABLE will suppress emergency alerts.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Interactive Segmented Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Select Availability State:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAvailability('AVAILABLE')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    availability === 'AVAILABLE'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">AVAILABLE</span>
                    <span className={`w-3 h-3 rounded-full border-2 ${
                      availability === 'AVAILABLE' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                    }`}></span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Ready to receive emergency broadcast alerts matching your blood group ({currentDonor.bloodGroup}).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAvailability('UNAVAILABLE')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    availability === 'UNAVAILABLE'
                      ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-800/10 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">UNAVAILABLE</span>
                    <span className={`w-3 h-3 rounded-full border-2 ${
                      availability === 'UNAVAILABLE' ? 'border-slate-800 bg-slate-800' : 'border-slate-300'
                    }`}></span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Temporarily pause all emergency notifications. Your profile remains active and saved.
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Custom Status Note (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Available after 5:00 PM on weekdays, or traveling until Monday"
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Notes will be visible to hospital dispatchers evaluating matching donor candidates.
              </span>
            </div>

            {/* Day of Donation Health Self-Report */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-xs text-slate-900">
                Self-Reported Health Check (Pre-Donation Awareness)
              </div>
              <p className="text-[11px] text-slate-600">
                Please confirm baseline readiness today before marking yourself active.
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.noFever}
                    onChange={(e) => setChecklist({ ...checklist, noFever: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>No acute fever, chills, cough, or viral symptoms in the last 48 hours</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.feelingWell}
                    onChange={(e) => setChecklist({ ...checklist, feelingWell: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Feeling well, rested, and had a healthy meal recently</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.hydrated}
                    onChange={(e) => setChecklist({ ...checklist, hydrated: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Well hydrated with water / non-caffeinated fluids</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.noRecentSurgery}
                    onChange={(e) => setChecklist({ ...checklist, noRecentSurgery: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>No recent invasive surgical or dental procedures in the last 6 months</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Apply Availability Changes'}
              </button>

              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Regulatory & Clinical Boundary Notice */}
        <div className="lg:col-span-5 space-y-6">
          {/* Clinical Disclaimer Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Crucial Medical Protocol Notice
            </h3>
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-950 leading-relaxed space-y-2">
              <p className="font-semibold">
                Availability status does not automatically determine clinical eligibility.
              </p>
              <p>
                In strict accordance with BloodBridge safety protocols and AABB clinical rules, formal medical eligibility is never decided by an algorithm or AI.
              </p>
              <p>
                When you accept an emergency call, final vital signs (hemoglobin, blood pressure, temperature, and infectious marker screening) must be verified in person by licensed healthcare staff at the collection facility.
              </p>
            </div>
          </div>

          {/* Current Cooldown Interval Spec */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Deterministic Cooldown State</h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Last Donation Recorded:</span>
                <span className="font-mono text-slate-900 font-semibold">
                  {new Date(currentDonor.lastDonationDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Mandatory Cooldown Window:</span>
                <span className="font-mono text-slate-900 font-semibold">56 Days</span>
              </div>

              <div className="flex justify-between py-1">
                <span>Current Clinical State:</span>
                <span className={`font-semibold ${eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {eligibility.eligible ? 'Interval Cleared' : 'In Cooldown'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={onOpenEmergencyRequests}
                className="w-full py-2 font-bold text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
              >
                View Compatible Emergency Requisitions ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { checkDonorEligibility, isBloodCompatible, getBloodCompatibility } from '../../utils/compatibility';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface DonorDashboardViewProps {
  onOpenProfile: () => void;
  onOpenAvailability: () => void;
  onOpenEmergencyRequests: () => void;
  onOpenDonationHistory: () => void;
  onOpenNotifications: () => void;
}

export const DonorDashboardView: React.FC<DonorDashboardViewProps> = ({
  onOpenProfile,
  onOpenAvailability,
  onOpenEmergencyRequests,
  onOpenDonationHistory,
  onOpenNotifications
}) => {
  const {
    donors,
    activeDonorId,
    setActiveDonorId,
    requests,
    respondToEmergencyRequest,
    updateDonorAvailability
  } = useBloodBridge();

  const currentDonor = donors.find(d => d.id === activeDonorId) || donors[0];
  const eligibility = checkDonorEligibility(currentDonor);
  const compatInfo = getBloodCompatibility(currentDonor.bloodGroup);

  // Filter urgent requests compatible with this donor
  const compatibleAlerts = requests.filter(r => {
    if (r.status === 'FULFILLED' || r.status === 'CANCELLED' || r.status === 'REJECTED') return false;
    const isCompat = isBloodCompatible(r.bloodGroup, currentDonor.bloodGroup, r.component);
    const hasShortfall = r.unitsAllocated < (r.unitsRequired || r.unitsNeeded);
    return isCompat && (hasShortfall || (r.donorAlertsSent && r.donorAlertsSent > 0));
  });

  const criticalAlerts = compatibleAlerts.filter(r => r.urgency === 'CRITICAL');
  const topEmergency = criticalAlerts[0] || compatibleAlerts[0];

  const daysSinceLast = Math.floor(
    (Date.now() - new Date(currentDonor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Top Bar with Donor Simulation Switcher & Mode Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Donor Hub</h1>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-rose-700 font-mono">{currentDonor.bloodGroup} Volunteer</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Signed in as {currentDonor.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-600">{currentDonor.code}</span>
            <span aria-hidden="true">·</span>
            <span>{currentDonor.city}</span>
          </div>
        </div>

        {/* Profile Switcher */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-medium text-slate-600">Switch Donor:</label>
          <select
            value={currentDonor.id}
            onChange={(e) => setActiveDonorId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {donors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.bloodGroup} · {d.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Hero Critical SOS Callout if Emergency Exists */}
      {topEmergency && (
        <div className="p-5 rounded-xl border border-red-300 bg-red-50/70 text-slate-900 space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                  URGENT COMPATIBLE REQUISITION IN TRANSIT RADIUS
                </span>
                <span aria-hidden="true" className="text-red-300">·</span>
                <span className="font-mono text-xs font-bold text-red-900">{topEmergency.requestNumber}</span>
              </div>
              <h2 className="text-base font-bold text-slate-950">
                {topEmergency.hospitalName} needs {topEmergency.bloodGroup} {topEmergency.component}
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                Clinical Reason: {topEmergency.clinicalReason || 'Immediate transfusion required'}. Allocation: {topEmergency.unitsAllocated} of {topEmergency.unitsRequired || topEmergency.unitsNeeded} units confirmed.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-semibold text-red-800 uppercase">{topEmergency.urgency}</div>
              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                {(topEmergency.unitsRequired || topEmergency.unitsNeeded) - topEmergency.unitsAllocated} unit(s) shortfall
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-red-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-slate-600 text-[11px]">
              <span>Required by: {new Date(topEmergency.requiredDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span aria-hidden="true">·</span>
              <span>Direct dispatch protocol</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => respondToEmergencyRequest(topEmergency.id, currentDonor.id, 'DECLINE')}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Decline Call
              </button>
              <button
                onClick={() => respondToEmergencyRequest(topEmergency.id, currentDonor.id, 'ACCEPT')}
                disabled={!eligibility.eligible || currentDonor.availability === 'UNAVAILABLE'}
                className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
              >
                Accept & Volunteer ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Availability Toggle Box */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Standby Availability</span>
              <span className={`w-2 h-2 rounded-full ${
                currentDonor.availability !== 'UNAVAILABLE' && currentDonor.status === 'AVAILABLE'
                  ? 'bg-emerald-500'
                  : currentDonor.status === 'ON_CALL'
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}></span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {currentDonor.availability === 'UNAVAILABLE' ? 'UNAVAILABLE' : currentDonor.status}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {currentDonor.availability === 'UNAVAILABLE'
                ? 'Volunteering currently paused by you'
                : 'Ready to receive hospital alerts'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => updateDonorAvailability(
                currentDonor.id,
                currentDonor.availability === 'UNAVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE'
              )}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                currentDonor.availability === 'UNAVAILABLE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {currentDonor.availability === 'UNAVAILABLE' ? 'Set as Available' : 'Set as Unavailable'}
            </button>
            <button
              onClick={onOpenAvailability}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Preferences
            </button>
          </div>
        </div>

        {/* Clinical Cooldown / Eligibility */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">56-Day Safety Interval</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {daysSinceLast >= 56 ? 'Eligible' : `${56 - daysSinceLast} Days Left`}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Last donated: {new Date(currentDonor.lastDonationDate).toLocaleDateString()} ({daysSinceLast} days ago)
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`font-semibold ${eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'}`}>
              {eligibility.eligible ? 'Interval Cleared' : 'Mandatory Cooldown'}
            </span>
            <button onClick={onOpenProfile} className="text-rose-600 hover:text-rose-800 font-semibold">
              Clinical Specs
            </button>
          </div>
        </div>

        {/* Lifetime Donations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Lifetime Contribution</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {currentDonor.totalDonations} <span className="text-sm font-normal text-slate-500">units</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Estimated lives impacted: ~{currentDonor.totalDonations * 3}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Weight: {currentDonor.weightKg} kg</span>
            <button onClick={onOpenDonationHistory} className="text-rose-600 hover:text-rose-800 font-semibold">
              View History
            </button>
          </div>
        </div>

        {/* Live Broadcasts Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Matching Broadcasts</div>
            <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
              {compatibleAlerts.length} <span className="text-sm font-normal text-slate-500">open</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {criticalAlerts.length} critical emergency callouts
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">ABO/Rh match</span>
            <button onClick={onOpenEmergencyRequests} className="text-rose-600 hover:text-rose-800 font-semibold">
              Browse Calls ➔
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Compatibility & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: ABO/Rh Matrix Card & Badges */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity & Compatibility Specs Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Blood Group Clinical Profile
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>Standardized AABB Matrix</span>
                  <span aria-hidden="true">·</span>
                  <span>Deterministic Compatibility</span>
                </div>
              </div>

              <div className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <span className="font-mono text-lg font-black text-rose-700">{currentDonor.bloodGroup}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-medium text-slate-500 block mb-1">
                  You can safely donate red blood cells to:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {compatInfo.canDonateTo.map(bg => (
                    <span
                      key={bg}
                      className="px-2 py-0.5 font-mono font-bold text-slate-800 bg-slate-100 rounded border border-slate-200"
                    >
                      {bg}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium text-slate-500 block mb-1">
                  In emergency, you can receive from:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {compatInfo.canReceiveFrom.map(bg => (
                    <span
                      key={bg}
                      className="px-2 py-0.5 font-mono font-bold text-slate-800 bg-slate-100 rounded border border-slate-200"
                    >
                      {bg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges adhering to zero-pill discipline */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">Volunteer Honors & Badges:</span>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {currentDonor.badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Donor Management Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenProfile}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors"
              >
                <div className="font-semibold text-slate-900">Donor Profile</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Demographics & contacts</div>
              </button>

              <button
                onClick={onOpenAvailability}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors"
              >
                <div className="font-semibold text-slate-900">Availability</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Toggle standby status</div>
              </button>

              <button
                onClick={onOpenEmergencyRequests}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors"
              >
                <div className="font-semibold text-slate-900">Emergency SOS</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Review hospital calls</div>
              </button>

              <button
                onClick={onOpenDonationHistory}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors"
              >
                <div className="font-semibold text-slate-900">Donation Log</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Records & certificates</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Compatible Requests Feed */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Open Hospital Emergency Alerts
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>Matching {currentDonor.bloodGroup}</span>
                  <span aria-hidden="true">·</span>
                  <span>Direct Trauma Center Feeds</span>
                </div>
              </div>

              <button
                onClick={onOpenEmergencyRequests}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                View All ({compatibleAlerts.length}) ➔
              </button>
            </div>

            {compatibleAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active hospital shortfalls matching your blood group currently. You are on standby to save lives!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {compatibleAlerts.slice(0, 3).map(req => {
                  const isCrit = req.urgency === 'CRITICAL';
                  return (
                    <div key={req.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-red-600 animate-pulse' : 'bg-amber-500'}`}></span>
                            <span className="font-mono font-bold text-slate-900">{req.requestNumber}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-semibold text-rose-700">{req.bloodGroup} {req.component}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-900 mt-1">
                            {req.hospitalName}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {req.clinicalReason}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono text-xs font-bold text-slate-800">
                            {req.unitsAllocated} / {req.unitsRequired || req.unitsNeeded} units
                          </div>
                          <div className="text-[10px] font-bold text-red-700 uppercase mt-0.5">
                            {req.urgency}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="text-[11px] text-slate-500">
                          Required by: {new Date(req.requiredDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => respondToEmergencyRequest(req.id, currentDonor.id, 'ACCEPT')}
                            disabled={!eligibility.eligible || currentDonor.availability === 'UNAVAILABLE'}
                            className="px-3 py-1 font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                          >
                            Respond / Accept ➔
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Donation Log Snapshot */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Donation Records</h3>
                <p className="text-xs text-slate-500 mt-0.5">Official clinical blood collection ledger</p>
              </div>

              <button
                onClick={onOpenDonationHistory}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Full Ledger ➔
              </button>
            </div>

            {(!currentDonor.donationHistory || currentDonor.donationHistory.length === 0) ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No past donations recorded in current synthetic session.
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentDonor.donationHistory.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{rec.facilityName}</div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <span>{new Date(rec.donationDate).toLocaleDateString()}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.unitsDonated} unit {rec.component}</span>
                        {rec.certificateId && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-600">{rec.certificateId}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="font-semibold text-emerald-700 text-xs">
                      ✓ {rec.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

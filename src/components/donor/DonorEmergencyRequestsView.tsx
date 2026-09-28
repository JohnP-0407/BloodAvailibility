import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { isBloodCompatible, checkDonorEligibility } from '../../utils/compatibility';
import { BloodRequest, UrgencyLevel } from '../../types/bloodbridge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface DonorEmergencyRequestsViewProps {
  onBackToDashboard: () => void;
  onSelectRequestDetails?: (requestId: string) => void;
}

export const DonorEmergencyRequestsView: React.FC<DonorEmergencyRequestsViewProps> = ({
  onBackToDashboard,
  onSelectRequestDetails
}) => {
  const {
    donors,
    activeDonorId,
    requests,
    respondToEmergencyRequest
  } = useBloodBridge();

  const currentDonor = donors.find(d => d.id === activeDonorId) || donors[0];
  const eligibility = checkDonorEligibility(currentDonor);

  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<BloodRequest | null>(null);
  const [actionType, setActionType] = useState<'ACCEPT' | 'DECLINE' | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Filter requests that:
  // 1. Are not fulfilled or cancelled
  // 2. Are compatible with current donor's blood group
  const compatibleRequests = requests.filter(r => {
    if (r.status === 'FULFILLED' || r.status === 'CANCELLED' || r.status === 'REJECTED') return false;
    const isCompat = isBloodCompatible(r.bloodGroup, currentDonor.bloodGroup, r.component);
    if (!isCompat) return false;
    if (urgencyFilter !== 'ALL' && r.urgency !== urgencyFilter) return false;
    return true;
  });

  const handleConfirmAction = async () => {
    if (!selectedRequestForAction || !actionType) return;
    try {
      await respondToEmergencyRequest(selectedRequestForAction.id, currentDonor.id, actionType);
      setActionSuccess(
        actionType === 'ACCEPT'
          ? `You have accepted call for ${selectedRequestForAction.requestNumber}. You are now ON CALL.`
          : `You have declined call for ${selectedRequestForAction.requestNumber}.`
      );
      setSelectedRequestForAction(null);
      setActionType(null);
      setActionNotes('');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
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
            <h1 className="text-lg font-bold text-slate-900">Hospital Emergency Requisitions Feed</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active hospital emergency blood requisitions requiring {currentDonor.bloodGroup} volunteer donations.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as (UrgencyLevel | 'ALL')[]).map((level) => (
            <button
              key={level}
              onClick={() => setUrgencyFilter(level)}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                urgencyFilter === level
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <MedicalSafetyBadge />

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between shadow-xs">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Main Request Feed */}
      <div className="space-y-4">
        {compatibleRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-sm font-bold text-slate-800">No Matching Emergency Requisitions Open</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active emergency hospital calls with a supply shortfall matching your blood group ({currentDonor.bloodGroup}).
            </p>
          </div>
        ) : (
          compatibleRequests.map(req => {
            const isCritical = req.urgency === 'CRITICAL';
            const totalUnits = req.unitsRequired || req.unitsNeeded || 1;
            const remainingUnits = Math.max(0, totalUnits - req.unitsAllocated);
            const isOnCall = currentDonor.status === 'ON_CALL';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-xl border transition-all ${
                  isCritical
                    ? 'border-red-300 bg-red-50/20 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left Column: Requisition Meta */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-red-600 animate-ping' : 'bg-amber-500'}`}></span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{req.requestNumber}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {req.bloodGroup} · {req.component}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-600">{req.status}</span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900">
                      {req.hospitalName}
                    </h2>

                    <div className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {req.clinicalReason || 'Immediate emergency transfusion evaluated by trauma department.'}
                    </div>

                    {/* Location and Timing Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>Hospital: {typeof req.location === 'object' && 'address' in req.location ? req.location.address : req.city}</span>
                      <span aria-hidden="true">·</span>
                      <span>Target: {new Date(req.requiredDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span aria-hidden="true">·</span>
                      <span>Requester: {req.requesterRole}</span>
                    </div>
                  </div>

                  {/* Right Column: Units & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0 text-right">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                        {req.urgency} URGENCY
                      </div>
                      <div className="font-mono text-base font-bold text-slate-900 mt-0.5">
                        {req.unitsAllocated} / {totalUnits} units confirmed
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {remainingUnits > 0 ? `${remainingUnits} unit(s) shortfall` : 'Units fully matched'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedRequestForAction(req);
                          setActionType('DECLINE');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRequestForAction(req);
                          setActionType('ACCEPT');
                        }}
                        disabled={!eligibility.eligible || currentDonor.availability === 'UNAVAILABLE'}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
                      >
                        {isOnCall ? 'Accept Additional Unit ➔' : 'Accept Call ➔'}
                      </button>
                    </div>
                  </div>
                </div>

                {onSelectRequestDetails && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Donor responses are coordinated directly through BloodBridge hospital triage.
                    </span>
                    <button
                      onClick={() => onSelectRequestDetails(req.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                    >
                      View Hospital Requisition Details ➔
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Accept or Decline */}
      {selectedRequestForAction && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className={`p-4 text-white ${actionType === 'ACCEPT' ? 'bg-rose-700' : 'bg-slate-800'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-200">
                {actionType === 'ACCEPT' ? 'Confirm Volunteer Acceptance' : 'Decline Emergency Call'}
              </div>
              <h3 className="text-base font-bold mt-1">
                Requisition {selectedRequestForAction.requestNumber}
              </h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900">{selectedRequestForAction.hospitalName}</div>
                <div className="text-slate-600">{selectedRequestForAction.clinicalReason}</div>
                <div className="text-rose-700 font-bold font-mono">
                  {selectedRequestForAction.bloodGroup} · {selectedRequestForAction.component}
                </div>
              </div>

              {actionType === 'ACCEPT' ? (
                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed">
                    By accepting, you indicate your immediate willingness to travel to {selectedRequestForAction.hospitalName} or the nearest affiliated blood bank for donation.
                  </p>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 font-medium">
                    Important: You must undergo in-person clinical vitals screening before donation.
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  Declining this call informs hospital dispatch that you cannot volunteer for this specific emergency. You will remain eligible for other alerts.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedRequestForAction(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-slate-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${
                    actionType === 'ACCEPT'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-slate-800 hover:bg-slate-900'
                  }`}
                >
                  {actionType === 'ACCEPT' ? 'Confirm & Accept Call' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

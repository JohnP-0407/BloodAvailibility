import React, { useState, useEffect } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { RequestStatus, MatchStep } from '../../types/bloodbridge';
import { RequestStatusBadge } from '../common/RequestStatusBadge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';
import { bloodRequestApi, RequestMatchesDto } from '../../services/api';

interface RequestDetailsViewProps {
  requestId: string | null;
  onBack: () => void;
  onOpenTracking: (id: string) => void;
}

export const RequestDetailsView: React.FC<RequestDetailsViewProps> = ({
  requestId,
  onBack,
  onOpenTracking
}) => {
  const { requests, updateRequestStatus, isLoading, userRole } = useBloodBridge();

  const [matchesData, setMatchesData] = useState<RequestMatchesDto | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const request = requests.find(r => r.id === requestId);

  useEffect(() => {
    if (!requestId) return;
    let isMounted = true;
    setMatchesLoading(true);

    bloodRequestApi
      .getMatches(requestId)
      .then(res => {
        if (isMounted) {
          setMatchesData(res);
          setMatchesLoading(false);
        }
      })
      .catch(err => {
        console.warn('Failed to load matches:', err);
        if (isMounted) setMatchesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestId, request?.status]);

  if (!request) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Requisition Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested requisition ID does not exist or has been removed from the registry.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Back to Requisitions
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: RequestStatus, note?: string) => {
    try {
      await updateRequestStatus(request.id, newStatus, note);
      setActionSuccess(`Status transitioned to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 4000);
      setIsCancelModalOpen(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const isTerminalStatus = ['FULFILLED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(request.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to All Requisitions</span>
        </button>

        <button
          onClick={() => onOpenTracking(request.id)}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-1"
        >
          <span>Open Live Tracking</span>
          <span>➔</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">{request.requestNumber}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">Created: {new Date(request.createdAt).toLocaleString()}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span>{request.hospitalName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <RequestStatusBadge status={request.status} size="md" />
            {request.urgency === 'CRITICAL' && (
              <span className="text-xs font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-1 rounded-md animate-pulse">
                CRITICAL EMERGENCY
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Blood Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Blood Group</span>
              <div className="text-2xl font-black font-mono text-rose-700 mt-0.5">{request.bloodGroup}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Deterministic ABO/Rh</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Component</span>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">{request.component}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cold chain preserved</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Units Allocated</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5 tabular-nums">
                {request.unitsAllocated} / {request.unitsRequired || request.unitsNeeded}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Units verified</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Required By</span>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {new Date(request.requiredDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Clinical timeline</div>
            </div>
          </div>

          <MedicalSafetyBadge />

          {/* Section: Clinical & Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
            <div className="space-y-3 text-xs">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Clinical Details & Patient
              </h2>
              <div>
                <span className="font-semibold text-slate-700">Patient Identifier:</span>{' '}
                <span className="text-slate-900">{request.patientName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Clinical Indication:</span>{' '}
                <span className="text-slate-900">{request.clinicalReason}</span>
              </div>
              {request.additionalNotes && (
                <div>
                  <span className="font-semibold text-slate-700">Additional Instructions:</span>{' '}
                  <span className="text-slate-600 italic bg-slate-50 p-2 rounded block mt-1 border border-slate-200">
                    "{request.additionalNotes}"
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hospital & Contact Telemetry
              </h2>
              <div>
                <span className="font-semibold text-slate-700">Destination Facility:</span>{' '}
                <span className="text-slate-900">{request.hospitalName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Contact Officer:</span>{' '}
                <span className="text-slate-900">
                  {request.contactInformation.contactPerson} ({request.contactInformation.relationship || 'Staff'})
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Emergency Phone:</span>{' '}
                <span className="font-mono text-slate-900">{request.contactInformation.phoneNumber}</span>
              </div>
              {request.contactInformation.email && (
                <div>
                  <span className="font-semibold text-slate-700">Email:</span>{' '}
                  <span className="text-slate-600">{request.contactInformation.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Source Matches (from GET /blood-requests/:id/matches) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Matched Inventory & Source Allocation (Deterministic Protocol)
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                API Endpoint: GET /blood-requests/{request.id}/matches
              </span>
            </div>

            {matchesLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading matched sources from backend API...</div>
            ) : matchesData?.matches && matchesData.matches.length > 0 ? (
              <div className="space-y-2">
                {matchesData.matches.map((match: MatchStep, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{match.sourceName}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({match.sourceType === 'BLOOD_BANK' ? 'Blood Bank Facility' : 'Registered Donor'})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Offered: <span className="font-mono font-bold text-rose-700">{match.bloodGroupOffered}</span> · Distance: <span className="font-mono">{match.distanceKm} km</span> · Stage: {match.stage}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {match.unitsAllocated} unit{match.unitsAllocated > 1 ? 's' : ''}
                      </div>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        {match.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                Matching engine is currently searching or expanding radius to partner blood banks and donors.
              </div>
            )}
          </div>

          {/* Section: Actions & Transitions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isTerminalStatus && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={isLoading}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  Cancel Requisition
                </button>
              )}

              {userRole === 'HOSPITAL' && request.status === 'RESERVED' && (
                <button
                  onClick={() => handleStatusChange('ACCEPTED', 'Hospital acknowledged allocation and booked courier pickup')}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
                >
                  Accept & Book Courier Pickup ➔
                </button>
              )}

              {userRole === 'HOSPITAL' && request.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleStatusChange('FULFILLED', 'Blood delivered, cross-matched, and transfused')}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  Confirm Transfusion / Fulfilled ✓
                </button>
              )}
            </div>

            <button
              onClick={() => onOpenTracking(request.id)}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              View Delivery Tracking ➔
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancel Blood Requisition</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel requisition <span className="font-mono font-bold text-slate-800">{request.requestNumber}</span>? Any reserved blood units will be released back into bank inventory.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Patient condition stabilized, surgery rescheduled..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Keep Requisition
              </button>
              <button
                onClick={() => handleStatusChange('CANCELLED', cancelReason || 'Cancelled by requester')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

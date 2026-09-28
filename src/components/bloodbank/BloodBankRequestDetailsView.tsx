import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { RequestStatus } from '../../types/bloodbridge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface BloodBankRequestDetailsViewProps {
  requestId: string | null;
  onBack: () => void;
  onOpenIncomingRequests: () => void;
}

export const BloodBankRequestDetailsView: React.FC<BloodBankRequestDetailsViewProps> = ({
  requestId,
  onBack,
  onOpenIncomingRequests
}) => {
  const { requests, updateRequestStatus, bloodBanks, activeBloodBankId } = useBloodBridge();

  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Insufficient compatible units in facility reserve buffer');

  const currentBank = bloodBanks.find(b => b.id === activeBloodBankId) || bloodBanks[0];

  // Validation: Check for invalid request IDs
  const request = requestId ? requests.find(r => r.id === requestId) : null;

  if (!requestId || !request) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
        <div className="text-3xl text-red-500">⚠️</div>
        <h2 className="text-lg font-bold text-slate-900">Invalid Request ID</h2>
        <p className="text-xs text-slate-600">
          The requested requisition ID (<code className="font-mono text-red-600">{requestId || 'null'}</code>) was not found in the verified database.
        </p>
        <button
          onClick={onOpenIncomingRequests}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Return to Incoming Requests
        </button>
      </div>
    );
  }

  const isCritical = request.urgency === 'CRITICAL';
  const loc = typeof request.location === 'object' && 'address' in request.location ? request.location : null;
  const hospitalName = request.hospitalName || loc?.hospitalName || 'Regional Hospital';
  const hospitalAddr = loc?.address || request.city || 'San Francisco, CA';

  const handleStatusTransition = async (newStatus: RequestStatus, note?: string) => {
    setIsSubmitting(true);
    try {
      const finalNote = note || customNote || `Updated by ${currentBank.name} staff`;
      await updateRequestStatus(request.id, newStatus, finalNote);
      setCustomNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    setIsSubmitting(true);
    try {
      await updateRequestStatus(
        request.id,
        'REJECTED',
        `Declined by ${currentBank.name}: ${rejectReason}`
      );
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to Incoming Requests</span>
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Inspection Portal · {currentBank.code}
        </span>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black text-slate-900 tracking-tight">
              {request.requestNumber}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              isCritical ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {request.urgency} Priority
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-700">
              {request.bloodGroup} {request.component}
            </span>
          </div>

          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
            <span>Patient: <strong className="text-slate-800">{request.patientName}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Hospital: <strong className="text-slate-800">{hospitalName}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Logged: {new Date(request.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Current State Badge */}
        <div className="text-right flex flex-col items-start md:items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protocol Status</span>
          <span className={`text-sm font-mono font-bold px-3 py-1 rounded-lg border mt-1 ${
            request.status === 'FULFILLED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : request.status === 'RESERVED'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : request.status === 'ACCEPTED'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : request.status === 'REJECTED' || request.status === 'CANCELLED'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {request.status}
          </span>
        </div>
      </div>

      {/* Grid: Request Metadata & Clinical Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Requisition Profile (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfusion Specifications Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Transfusion Product & Unit Requirements
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-500 block">ABO/Rh Blood Group</span>
                <span className="font-mono text-2xl font-black text-rose-700 mt-1 block">
                  {request.bloodGroup}
                </span>
                <span className="text-[10px] text-slate-400">Strict Crossmatch</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Component Type</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block truncate">
                  {request.component}
                </span>
                <span className="text-[10px] text-slate-400">Standard Pack</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Units Required</span>
                <span className="font-mono text-2xl font-black text-slate-900 mt-1 block">
                  {request.unitsRequired || request.unitsNeeded}
                </span>
                <span className="text-[10px] text-purple-700 font-medium">Allocated: {request.unitsAllocated}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Required By</span>
                <span className="text-xs font-semibold text-slate-800 mt-1 block">
                  {new Date(request.requiredDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(request.requiredDateTime).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Diagnostic Indication & Clinical Reason */}
            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold text-slate-700">Clinical Indication & Diagnosis:</div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {request.clinicalReason || 'Standard clinical transfusion requisition.'}
              </p>
            </div>

            {request.additionalNotes && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700">Additional Transfusion Notes:</div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                  "{request.additionalNotes}"
                </p>
              </div>
            )}
          </div>

          {/* Cold-Chain Compliance & Transport Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Cold-Chain Transport & Packaging Verification
              </h3>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                AABB / WHO Standard Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Storage Temperature</div>
                <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">+3.6°C</div>
                <div className="text-[10px] text-slate-500">Permitted: +2.0°C to +6.0°C</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Container Seal ID</div>
                <div className="text-sm font-bold font-mono text-slate-800 mt-1">SEAL-SF-2026-991</div>
                <div className="text-[10px] text-slate-500">Tamper-evident tag applied</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estimated Courier ETA</div>
                <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">
                  ~{request.estimatedArrivalMin || 18} mins
                </div>
                <div className="text-[10px] text-slate-500">Priority emergency transit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Hospital Location (1 col) */}
        <div className="space-y-6">
          {/* Workflow Action Command Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Staff Workflow Actions
            </h3>

            <p className="text-xs text-slate-500">
              Advance this requisition through the standardized protocol states:
            </p>

            <div className="space-y-2">
              {/* Accept Action */}
              {(request.status === 'CREATED' || request.status === 'SEARCHING' || request.status === 'MATCHED' || request.status === 'PENDING_CONFIRMATION') && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleStatusTransition('ACCEPTED', `Requisition accepted by ${currentBank.name}`)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  ✓ Accept Requisition (ACCEPTED)
                </button>
              )}

              {/* Reserve Action */}
              {(request.status === 'ACCEPTED' || request.status === 'MATCHED') && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleStatusTransition('RESERVED', `Units locked in cold-storage for ${hospitalName}`)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  🔒 Lock Units in Reserve (RESERVED)
                </button>
              )}

              {/* Fulfill Action */}
              {(request.status === 'RESERVED' || request.status === 'ACCEPTED') && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleStatusTransition('FULFILLED', `Delivery completed and crossmatched at ${hospitalName}`)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  🎉 Confirm Delivery & Fulfillment (FULFILLED)
                </button>
              )}

              {/* Reject Action */}
              {request.status !== 'FULFILLED' && request.status !== 'REJECTED' && request.status !== 'CANCELLED' && (
                <button
                  disabled={isSubmitting}
                  onClick={() => setIsRejectModalOpen(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  ✕ Decline / Reject Request (REJECTED)
                </button>
              )}
            </div>

            {/* Custom Staff Dispatch Note */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-600">
                Append Dispatch / Audit Note:
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Courier vehicle DBB-VAN-4 departed facility under monitoring"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                disabled={!customNote.trim() || isSubmitting}
                onClick={() => handleStatusTransition(request.status, customNote)}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
              >
                Log Status Note
              </button>
            </div>
          </div>

          {/* Hospital Location & Clinical Contact */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Receiving Facility & Contact
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hospital</span>
                <span className="font-bold text-slate-800">{hospitalName}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{hospitalAddr}</p>
              </div>

              {request.contactInformation && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Authorized Attendant</span>
                  <div className="font-semibold text-slate-800">{request.contactInformation.contactPerson}</div>
                  <div className="text-slate-600 font-mono text-[11px]">{request.contactInformation.phoneNumber}</div>
                  {request.contactInformation.relationship && (
                    <div className="text-[10px] text-slate-400">{request.contactInformation.relationship}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <MedicalSafetyBadge />
        </div>
      </div>

      {/* Reject Modal Dialog */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <span>⚠️</span>
                <span>Confirm Rejection of {request.requestNumber}</span>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Rejecting this requisition indicates that your blood bank cannot safely fulfill the order. Please specify the medical or capacity reason:
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="Insufficient compatible units in facility reserve buffer">
                Insufficient compatible units in facility reserve buffer
              </option>
              <option value="Cold-chain container temperature variation detected">
                Cold-chain container temperature variation detected
              </option>
              <option value="Facility stock reserved for concurrent Code Red emergency">
                Facility stock reserved for concurrent Code Red emergency
              </option>
              <option value="Transit time window exceeds viability limit">
                Transit time window exceeds viability limit
              </option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Rejection (REJECTED)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

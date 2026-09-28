import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, RequestStatus, UrgencyLevel } from '../../types/bloodbridge';
import { BLOOD_GROUPS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface BloodBankIncomingRequestsViewProps {
  onSelectRequest: (id: string) => void;
  onOpenDashboard: () => void;
}

export const BloodBankIncomingRequestsView: React.FC<BloodBankIncomingRequestsViewProps> = ({
  onSelectRequest,
  onOpenDashboard
}) => {
  const {
    requests,
    updateRequestStatus,
    bloodBanks,
    activeBloodBankId,
    setActiveBloodBankId,
    refreshRequests,
    isLoading
  } = useBloodBridge();

  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Insufficient compatible units in reserve buffer');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const currentBank = bloodBanks.find(b => b.id === activeBloodBankId) || bloodBanks[0];

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (urgencyFilter !== 'ALL' && req.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (bloodGroupFilter !== 'ALL' && req.bloodGroup !== bloodGroupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = req.requestNumber.toLowerCase().includes(q);
      const matchHosp = req.hospitalName.toLowerCase().includes(q);
      const matchBg = req.bloodGroup.toLowerCase().includes(q);
      const matchPatient = req.patientName.toLowerCase().includes(q);
      if (!matchNum && !matchHosp && !matchBg && !matchPatient) return false;
    }
    return true;
  });

  const handleAction = async (requestId: string, status: RequestStatus, note?: string) => {
    setIsProcessing(true);
    try {
      await updateRequestStatus(requestId, status, note);
    } catch (err) {
      console.error('Failed to update request:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingRequestId) return;
    setIsProcessing(true);
    try {
      await updateRequestStatus(
        rejectingRequestId,
        'REJECTED',
        `Requisition declined by ${currentBank.name}: ${rejectReason}`
      );
      setRejectingRequestId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Incoming Requisitions & Fulfillment Queue
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-0.5">
            Hospital & Patient Requisition Stream
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review demand stream, accept allocations, reserve units in cold storage, and confirm dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refreshRequests()}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            title="Refresh Requisitions"
          >
            <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Requisitions:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search REQ ID, Hospital, Patient..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Urgency Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Urgency Priority:
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="ROUTINE">Routine Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Request Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="ALL">All 10 Lifecycle States</option>
              <option value="CREATED">CREATED</option>
              <option value="SEARCHING">SEARCHING</option>
              <option value="MATCHED">MATCHED</option>
              <option value="PENDING_CONFIRMATION">PENDING_CONFIRMATION</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="RESERVED">RESERVED</option>
              <option value="FULFILLED">FULFILLED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          {/* Blood Group Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Blood Group:
            </label>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="ALL">All Blood Groups</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Found <strong>{filteredRequests.length}</strong> matching requisitions</span>
          {(urgencyFilter !== 'ALL' || statusFilter !== 'ALL' || bloodGroupFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setUrgencyFilter('ALL');
                setStatusFilter('ALL');
                setBloodGroupFilter('ALL');
                setSearchQuery('');
              }}
              className="text-rose-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Requests Table / Card View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <span className="text-3xl">📭</span>
            <div className="text-sm font-bold text-slate-800">No requests match the selected filters</div>
            <p className="text-xs text-slate-400">Try adjusting your urgency, status, or blood group search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Request & Patient</th>
                  <th className="py-3.5 px-4">Blood Group & Component</th>
                  <th className="py-3.5 px-4">Units Required</th>
                  <th className="py-3.5 px-4">Request Location</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => {
                  const isCritical = req.urgency === 'CRITICAL';
                  const loc = typeof req.location === 'object' && 'address' in req.location ? req.location : null;
                  const hospitalName = req.hospitalName || loc?.hospitalName || 'Regional Hospital';
                  const hospitalAddr = loc?.address || req.city || 'San Francisco, CA';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Request ID & Patient */}
                      <td className="py-3.5 px-4 font-medium">
                        <button
                          onClick={() => onSelectRequest(req.id)}
                          className="font-mono font-bold text-slate-900 hover:text-rose-600 transition-colors block text-left"
                        >
                          {req.requestNumber}
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                          {req.patientName}
                        </div>
                      </td>

                      {/* Blood Group & Component */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-base font-black text-rose-700">
                            {req.bloodGroup}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {req.component}
                          </span>
                        </div>
                      </td>

                      {/* Units Required */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {req.unitsRequired || req.unitsNeeded} <span className="text-[11px] font-sans font-normal text-slate-400">units</span>
                        </div>
                        <div className="text-[10px] text-purple-700 font-medium">
                          Allocated: {req.unitsAllocated}
                        </div>
                      </td>

                      {/* Request Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {hospitalName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {hospitalAddr}
                        </div>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                          isCritical
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : req.urgency === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>}
                          <span>{req.urgency}</span>
                        </span>
                      </td>

                      {/* Created Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <div>{formatTimeAgo(req.createdAt)}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Current Status */}
                      <td className="py-3.5 px-4">
                        <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border inline-block ${
                          req.status === 'FULFILLED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'RESERVED'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : req.status === 'ACCEPTED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : req.status === 'REJECTED' || req.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Actions: Accept, Reject, Reserve, Fulfill */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Accept Action */}
                          {(req.status === 'CREATED' || req.status === 'SEARCHING' || req.status === 'MATCHED' || req.status === 'PENDING_CONFIRMATION') && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleAction(req.id, 'ACCEPTED', `Confirmed and accepted by ${currentBank.name}`)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
                              title="Accept requisition and commit facility inventory"
                            >
                              Accept
                            </button>
                          )}

                          {/* 2. Reserve Action */}
                          {(req.status === 'ACCEPTED' || req.status === 'MATCHED') && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleAction(req.id, 'RESERVED', `Cold chain units locked in reserve at ${currentBank.name}`)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
                              title="Lock compatible units in cold-chain storage"
                            >
                              Reserve
                            </button>
                          )}

                          {/* 3. Fulfill Action */}
                          {(req.status === 'RESERVED' || req.status === 'ACCEPTED') && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleAction(req.id, 'FULFILLED', `Units dispatched, crossmatched, and received at ${hospitalName}`)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
                              title="Confirm fulfillment and final crossmatch delivery"
                            >
                              Fulfill
                            </button>
                          )}

                          {/* 4. Reject Action */}
                          {req.status !== 'FULFILLED' && req.status !== 'REJECTED' && req.status !== 'CANCELLED' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => setRejectingRequestId(req.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-semibold rounded-lg text-xs transition-colors"
                              title="Reject requisition due to safety or capacity constraints"
                            >
                              Reject
                            </button>
                          )}

                          {/* 5. View Details */}
                          <button
                            onClick={() => onSelectRequest(req.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                            title="Inspect complete requisition dossier"
                          >
                            Details ➔
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-lg">⚠️</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Decline / Reject Blood Requisition
                </h3>
              </div>
              <button
                onClick={() => setRejectingRequestId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the clinical justification for rejecting requisition <strong>{rejectingRequestId}</strong>. This status transition will be permanently recorded in the system audit log.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Rejection Justification:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Insufficient compatible units in reserve buffer">
                    Insufficient compatible units in reserve buffer
                  </option>
                  <option value="Cold-chain temperature excursion in storage container">
                    Cold-chain temperature excursion in storage container
                  </option>
                  <option value="Facility reserve prioritized for active Code Red trauma">
                    Facility reserve prioritized for active Code Red trauma
                  </option>
                  <option value="Requested component shelf-life expired">
                    Requested component shelf-life expired
                  </option>
                  <option value="Logistical transport transit window exceeded">
                    Logistical transport transit window exceeded
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isProcessing ? 'Recording Rejection...' : 'Confirm Rejection (REJECTED)'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MedicalSafetyBadge />
    </div>
  );
};

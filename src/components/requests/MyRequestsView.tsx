import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { RequestStatus, UrgencyLevel, BloodGroup } from '../../types/bloodbridge';
import { BLOOD_GROUPS } from '../../utils/mockData';
import { RequestStatusBadge } from '../common/RequestStatusBadge';

interface MyRequestsViewProps {
  onOpenCreateRequest: () => void;
  onOpenRequestDetails: (id: string) => void;
  onOpenRequestTracking: (id: string) => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({
  onOpenCreateRequest,
  onOpenRequestDetails,
  onOpenRequestTracking
}) => {
  const { requests, setSelectedRequestId, refreshRequests, isLoading, errorMessage } = useBloodBridge();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('ALL');

  const statusOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'CREATED', label: 'Created' },
    { value: 'SEARCHING', label: 'Searching' },
    { value: 'MATCHED', label: 'Matched' },
    { value: 'PENDING_CONFIRMATION', label: 'Pending Confirmation' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'RESERVED', label: 'Reserved' },
    { value: 'FULFILLED', label: 'Fulfilled' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' }
  ];

  const urgencyOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: 'All Urgencies' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'ROUTINE', label: 'Routine' }
  ];

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    if (filterUrgency !== 'ALL' && req.urgency !== filterUrgency) return false;
    if (filterBloodGroup !== 'ALL' && req.bloodGroup !== filterBloodGroup) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = req.requestNumber.toLowerCase().includes(q);
      const matchPatient = req.patientName.toLowerCase().includes(q);
      const matchHosp = req.hospitalName.toLowerCase().includes(q);
      const matchDiag = req.clinicalReason.toLowerCase().includes(q);
      return matchNum || matchPatient || matchHosp || matchDiag;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Requisition Registry
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Blood Requisitions Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View, filter, track status transitions, and inspect matching details across all 10 protocol stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => refreshRequests()}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>{isLoading ? 'Refreshing...' : '↻ Refresh'}</span>
          </button>

          <button
            onClick={onOpenCreateRequest}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
          >
            + New Requisition
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <span>✕ {errorMessage}</span>
          <button onClick={() => refreshRequests()} className="text-red-700 underline font-bold">Retry</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by ID, patient, hospital..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Status Filter (10 States) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Protocol Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Urgency
            </label>
            <select
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              {urgencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Blood Group Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Blood Type
            </label>
            <select
              value={filterBloodGroup}
              onChange={e => setFilterBloodGroup(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-rose-700"
            >
              <option value="ALL">All Types</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick status chips row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px] shrink-0">Quick Filter:</span>
          {['ALL', 'CREATED', 'SEARCHING', 'MATCHED', 'ACCEPTED', 'RESERVED', 'FULFILLED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Requisitions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Requisitions Found: {filteredRequests.length}
          </span>
          <span className="text-[11px] text-slate-400">
            Total System Requisitions: {requests.length}
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
              ∅
            </div>
            <div className="text-sm font-bold text-slate-800">No blood requisitions match your criteria</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, status filters, or create a new clinical requisition.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenCreateRequest}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                + Create Blood Request
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map(req => {
              const isCritical = req.urgency === 'CRITICAL';

              return (
                <div
                  key={req.id}
                  className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{req.requestNumber}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-xs font-bold text-rose-700">
                        {req.bloodGroup} · {req.component}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <RequestStatusBadge status={req.status} />
                      {isCritical && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded animate-pulse">
                          CRITICAL
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-900">
                      {req.hospitalName}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Patient: <span className="font-medium text-slate-700">{req.patientName}</span>
                      {' · '}Reason: <span className="text-slate-600">{req.clinicalReason}</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Required by: {new Date(req.requiredDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' · '}Contact: {req.contactInformation.contactPerson} ({req.contactInformation.phoneNumber})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <div className="text-right mr-3">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {req.unitsAllocated} / {req.unitsRequired || req.unitsNeeded} units
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {req.unitsAllocated >= (req.unitsRequired || req.unitsNeeded) ? 'Fully Matched' : 'Allocation Pending'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRequestId(req.id);
                        onOpenRequestDetails(req.id);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRequestId(req.id);
                        onOpenRequestTracking(req.id);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                    >
                      Track ➔
                    </button>
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

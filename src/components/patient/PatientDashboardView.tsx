import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { RequestStatusBadge } from '../common/RequestStatusBadge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface PatientDashboardViewProps {
  onOpenCreateRequest: () => void;
  onOpenMyRequests: () => void;
  onOpenRequestDetails: (id: string) => void;
  onOpenRequestTracking: (id: string) => void;
}

export const PatientDashboardView: React.FC<PatientDashboardViewProps> = ({
  onOpenCreateRequest,
  onOpenMyRequests,
  onOpenRequestDetails,
  onOpenRequestTracking
}) => {
  const { requests, currentUser, setSelectedRequestId } = useBloodBridge();

  // Filter requests relevant to patients
  const patientRequests = requests.filter(r => r.requesterRole === 'PATIENT' || r.patientName.includes('Patient'));

  const activeRequests = patientRequests.filter(
    r => ['CREATED', 'SEARCHING', 'MATCHED', 'PENDING_CONFIRMATION', 'ACCEPTED', 'RESERVED'].includes(r.status)
  );

  const completedRequests = patientRequests.filter(r => r.status === 'FULFILLED');
  const pendingRequests = patientRequests.filter(r => ['CREATED', 'SEARCHING', 'MATCHED', 'PENDING_CONFIRMATION'].includes(r.status));
  const criticalRequests = patientRequests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED');

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Patient Portal · Blood Request Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track your blood requisitions, monitor cold-chain delivery progress, and coordinate directly with hospital blood banks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenMyRequests}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            My Requests ({patientRequests.length})
          </button>
          <button
            onClick={onOpenCreateRequest}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
          >
            + Create Blood Request
          </button>
        </div>
      </div>

      {/* Emergency Indicator Banner */}
      {criticalRequests.length > 0 && (
        <div className="p-4 bg-red-600 text-white rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <div>
              <div className="font-bold text-sm">
                CRITICAL EMERGENCY REQUISITION ACTIVE ({criticalRequests.length})
              </div>
              <div className="text-xs text-red-100 mt-0.5">
                Urgent cold-chain matching and blood courier transit in progress for your critical request.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedRequestId(criticalRequests[0].id);
              onOpenRequestTracking(criticalRequests[0].id);
            }}
            className="px-3 py-1.5 bg-white text-red-700 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors shadow-xs shrink-0"
          >
            Track Emergency Delivery ➔
          </button>
        </div>
      )}

      {/* Dashboard KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Active Requests</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {activeRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">In matching, reserve or transit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Pending Confirmation</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting facility confirmation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Completed / Transfused</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {completedRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Successfully fulfilled</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Network Protocol</div>
          <div className="text-xs font-bold text-rose-700 mt-2">
            100% Deterministic Match
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">ABO / Rh antigen verified</div>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Recent Requests Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Blood Requisitions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates on unit allocation, blood bank reservations, and transport status.
            </p>
          </div>
          <button
            onClick={onOpenMyRequests}
            className="text-xs text-rose-600 font-semibold hover:underline"
          >
            View All ({patientRequests.length}) ➔
          </button>
        </div>

        {patientRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            You have not submitted any blood requests yet. Click "+ Create Blood Request" to begin.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patientRequests.slice(0, 4).map(req => (
              <div
                key={req.id}
                className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{req.requestNumber}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono text-xs font-bold text-rose-700">
                      {req.bloodGroup} · {req.component}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <RequestStatusBadge status={req.status} />
                  </div>
                  <div className="text-xs font-medium text-slate-800 mt-1">
                    {req.hospitalName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Required by: {new Date(req.requiredDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' · '}Indication: {req.clinicalReason}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right mr-2">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {req.unitsAllocated} / {req.unitsRequired || req.unitsNeeded} units
                    </div>
                    <div className="text-[10px] text-slate-400">Allocated</div>
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
                    Track Status ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

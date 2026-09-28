import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { RequestStatus } from '../../types/bloodbridge';
import { RequestStatusBadge } from '../common/RequestStatusBadge';
import { BloodBridgeMap } from '../map/BloodBridgeMap';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface RequestTrackingViewProps {
  requestId: string | null;
  onBack: () => void;
  onOpenDetails: (id: string) => void;
}

export const RequestTrackingView: React.FC<RequestTrackingViewProps> = ({
  requestId,
  onBack,
  onOpenDetails
}) => {
  const { requests, auditLogs } = useBloodBridge();

  const request = requests.find(r => r.id === requestId);

  if (!request) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Tracking Information Unavailable</h2>
        <p className="text-xs text-slate-500">
          The requested requisition ID was not found in the live tracking telemetry pipeline.
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

  // 10-state progression stages
  const pipelineStages: {
    status: RequestStatus;
    title: string;
    description: string;
  }[] = [
    {
      status: 'CREATED',
      title: 'Requisition Created & Validated',
      description: 'Form validated, clinical parameters logged, ABO/Rh criteria verified.'
    },
    {
      status: 'SEARCHING',
      title: 'Deterministic Inventory Search',
      description: 'Algorithm querying local blood banks for exact and compatible units.'
    },
    {
      status: 'MATCHED',
      title: 'Compatible Blood Identified',
      description: 'Units located in facility cold storage meeting safety protocols.'
    },
    {
      status: 'PENDING_CONFIRMATION',
      title: 'Facility Allocation Hold',
      description: 'Units placed on temporary hold awaiting blood bank technician sign-off.'
    },
    {
      status: 'ACCEPTED',
      title: 'Requisition Accepted & Courier Booked',
      description: 'Blood bank confirmed order; temperature-controlled courier dispatched.'
    },
    {
      status: 'RESERVED',
      title: 'Units Locked in Cold Storage',
      description: 'Units bagged, tagged with recipient ID, and ready for transit handover.'
    },
    {
      status: 'FULFILLED',
      title: 'Delivered & Cross-Matched',
      description: 'Received at destination hospital, verified by lab, and transfused.'
    }
  ];

  // Helper to determine step state
  const getStepIndex = (status: RequestStatus): number => {
    switch (status) {
      case 'CREATED': return 0;
      case 'SEARCHING': return 1;
      case 'MATCHED': return 2;
      case 'PENDING_CONFIRMATION': return 3;
      case 'ACCEPTED': return 4;
      case 'RESERVED': return 5;
      case 'FULFILLED': return 6;
      case 'CANCELLED':
      case 'REJECTED':
      case 'EXPIRED':
        return -1;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(request.status);
  const isTerminalNegative = ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(request.status);

  // Filter audit logs for this request
  const relevantLogs = auditLogs.filter(l => l.requestId === request.id || l.details.includes(request.requestNumber));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to List</span>
        </button>

        <button
          onClick={() => onOpenDetails(request.id)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          View Full Details
        </button>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">{request.requestNumber}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">{request.patientName}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Live Cold-Chain Tracking & Status Pipeline
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <RequestStatusBadge status={request.status} size="md" />
          </div>
        </div>

        {/* Cold-Chain Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-900 text-white">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cold Storage Temp</span>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>+3.8 °C</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Compliant (2°C - 6°C)</div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estimated Arrival</span>
            <div className="text-xl font-mono font-bold text-white mt-1">
              ~{request.estimatedArrivalMin || 14} min
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct hospital courier</div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Allocated Units</span>
            <div className="text-xl font-mono font-bold text-rose-400 mt-1">
              {request.unitsAllocated} / {request.unitsRequired || request.unitsNeeded} units
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{request.bloodGroup} · {request.component}</div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Courier Bag Tag</span>
            <div className="text-xs font-mono font-semibold text-slate-200 mt-1.5 truncate">
              #MED-CC-{request.requestNumber.slice(-4)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tamper-evident locked</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <MedicalSafetyBadge />

          {/* Special Terminal Status Banner if Cancelled/Rejected/Expired */}
          {isTerminalNegative && (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-xs text-gray-800 space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span>
                <span>REQUISITION {request.status}</span>
              </div>
              <p className="text-[11px] text-gray-600">
                This requisition has ceased active tracking because it was {request.status.toLowerCase()}.
                {request.additionalNotes ? ` Note: ${request.additionalNotes}` : ''}
              </p>
            </div>
          )}

          {/* Visual 10-State Pipeline Progression */}
          {!isTerminalNegative && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Protocol Fulfillment Pipeline
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {pipelineStages.map((stage, idx) => {
                  const isDone = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;

                  let circleClasses = 'bg-slate-200 text-slate-500 border-2 border-white';
                  if (isDone) circleClasses = 'bg-emerald-600 text-white shadow-xs';
                  else if (isCurrent) circleClasses = 'bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse';

                  return (
                    <div key={stage.status} className="relative flex items-start gap-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 -ml-6.5 z-10 ${circleClasses}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>

                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isCurrent ? 'text-rose-700' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                            {stage.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded uppercase">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Geospatial Route Map */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Geospatial Route
                </h2>
                <p className="text-[11px] text-slate-500">
                  Tracking route from matched blood bank facility to {request.hospitalName}
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                GPS Transponder Linked
              </span>
            </div>

            <div className="h-72 rounded-xl overflow-hidden border border-slate-200">
              <BloodBridgeMap highlightRequestId={request.id} />
            </div>
          </div>

          {/* Audit Timestamp Trail */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Telemetry & Event Audit Log
            </h2>

            {relevantLogs.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                Created at {new Date(request.createdAt).toLocaleString()}. Protocol status: {request.status}.
              </div>
            ) : (
              <div className="space-y-2">
                {relevantLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-800 text-[11px]">{log.action}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{log.details}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Logged by: {log.performedBy} ({log.role})</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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

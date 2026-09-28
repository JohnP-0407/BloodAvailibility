import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodBridgeMap } from '../map/BloodBridgeMap';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface DashboardOverviewProps {
  onOpenNewRequisition: () => void;
  onOpenAiAssistant: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenNewRequisition,
  onOpenAiAssistant
}) => {
  const {
    userRole,
    setUserRole,
    setActiveTab,
    requests,
    bloodBanks,
    donors,
    setSelectedRequestId
  } = useBloodBridge();

  const criticalRequests = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED' && r.status !== 'CANCELLED'
  );

  let totalAvailableUnits = 0;
  bloodBanks.forEach(b => {
    Object.values(b.inventory).forEach(inv => {
      totalAvailableUnits += inv.unitsAvailable;
    });
  });

  const availableDonors = donors.filter(d => d.isEligible && d.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Emergency Callout */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Smart Blood Availability & Emergency Coordination
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Centralized Blood Network
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Connecting patients, hospitals, blood banks, and verified donors in real-time. Deterministic compatibility matching, cold chain tracking, and automated emergency donor broadcasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenAiAssistant}
            className="px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>AI Dispatch Assistant</span>
          </button>

          <button
            onClick={onOpenNewRequisition}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
          >
            + Create Blood Requisition
          </button>
        </div>
      </div>

      {/* Critical Emergency Banner if active */}
      {criticalRequests.length > 0 && (
        <div className="p-4 bg-red-600 text-white rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <div>
              <div className="font-bold text-sm">
                {criticalRequests.length} CODE RED REQUISITION{criticalRequests.length > 1 ? 'S' : ''} ACTIVE
              </div>
              <div className="text-xs text-red-100 mt-0.5">
                Immediate uncrossmatched transfusion requirements in transit across metro hospitals.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('requests')}
            className="px-3 py-1.5 bg-white text-red-700 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors shrink-0 shadow-xs"
          >
            View Active Code Red Requisitions ➔
          </button>
        </div>
      )}

      {/* Key Network Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Available Inventory</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {totalAvailableUnits} units
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 4 verified blood banks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Active Requisitions</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {requests.filter(r => r.status !== 'FULFILLED').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">In matching, reserve or transit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Registered Donors Ready</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {availableDonors} eligible
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Passed 56-day cooldown</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Mean Transit Response</div>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            17.4 min
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Order to hospital delivery</div>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Map & Live Feed Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Map Preview */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Geospatial Inventory & Transit Corridor
              </h2>
              <p className="text-[11px] text-slate-500">Live positions of blood banks, trauma centers, and courier routes</p>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Expand Full Map ➔
            </button>
          </div>

          <div className="h-[360px] rounded-lg overflow-hidden border border-slate-100">
            <BloodBridgeMap compact={true} />
          </div>
        </div>

        {/* Live Requisition Queue */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Requisitions ({requests.length})
              </h2>
              <p className="text-[11px] text-slate-500">Deterministic source matching updates</p>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              View All ➔
            </button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px]">
            {requests.slice(0, 5).map(req => (
              <div
                key={req.id}
                onClick={() => {
                  setSelectedRequestId(req.id);
                  setActiveTab('requests');
                }}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/60 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{req.requestNumber}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {req.urgency}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 mt-1 truncate">
                  {req.hospitalName}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span className="font-mono font-bold text-rose-700">
                    {req.bloodGroup} {req.component} ({req.unitsAllocated}/{req.unitsNeeded}u)
                  </span>
                  <span className="font-semibold text-slate-700">
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Navigation Cards for Hackathon Evaluator Quick Access */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Hackathon Role-Based Prototype Navigation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between the 5 user roles to test platform workflows:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            onClick={() => {
              setUserRole('PATIENT');
              setActiveTab('requests');
            }}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-slate-400 ${
              userRole === 'PATIENT' ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400' : 'bg-white border-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-slate-900">1. Patient</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Submit blood request, check local bank inventory, track real-time delivery pipeline.
            </div>
            <span className="text-[10px] text-rose-600 font-bold mt-2 block">Evaluate Mode ➔</span>
          </div>

          <div
            onClick={() => {
              setUserRole('HOSPITAL');
              setActiveTab('requests');
            }}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-slate-400 ${
              userRole === 'HOSPITAL' ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400' : 'bg-white border-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-slate-900">2. Hospital</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Emergency Code Red requisition, ICU multi-unit batching, AI clinical note parsing.
            </div>
            <span className="text-[10px] text-rose-600 font-bold mt-2 block">Evaluate Mode ➔</span>
          </div>

          <div
            onClick={() => {
              setUserRole('BLOOD_BANK_STAFF');
              setActiveTab('inventory');
            }}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-slate-400 ${
              userRole === 'BLOOD_BANK_STAFF' ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400' : 'bg-white border-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-slate-900">3. Blood Bank</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Manage 8 blood groups across 5 components, threshold warnings, reserve & dispatch.
            </div>
            <span className="text-[10px] text-rose-600 font-bold mt-2 block">Evaluate Mode ➔</span>
          </div>

          <div
            onClick={() => {
              setUserRole('DONOR');
              setActiveTab('donor-portal');
            }}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-slate-400 ${
              userRole === 'DONOR' ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400' : 'bg-white border-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-slate-900">4. Donor</div>
            <div className="text-[11px] text-slate-500 mt-1">
              56-day clinical cooldown check, digital donor badge, live emergency SOS alerts feed.
            </div>
            <span className="text-[10px] text-rose-600 font-bold mt-2 block">Evaluate Mode ➔</span>
          </div>

          <div
            onClick={() => {
              setUserRole('ADMIN');
              setActiveTab('admin-panel');
            }}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-slate-400 ${
              userRole === 'ADMIN' ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400' : 'bg-white border-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-slate-900">5. Admin</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Deterministic audit logs, mass casualty stress simulation, synthetic data reset.
            </div>
            <span className="text-[10px] text-rose-600 font-bold mt-2 block">Evaluate Mode ➔</span>
          </div>
        </div>
      </div>
    </div>
  );
};

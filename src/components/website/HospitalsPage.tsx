import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';

interface HospitalsPageProps {
  onOpenRequisition: () => void;
  onOpenHospitalPortal: () => void;
  onOpenAiAssistant: () => void;
}

export const HospitalsPage: React.FC<HospitalsPageProps> = ({
  onOpenRequisition,
  onOpenHospitalPortal,
  onOpenAiAssistant
}) => {
  const { hospitals, requests } = useBloodBridge();

  const activeHospitalOrders = requests.filter(
    (r) => r.status !== 'FULFILLED' && r.status !== 'CANCELLED'
  );

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
            <span>🏥 Clinical Trauma & Emergency Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Rapid Blood Requisitions For Emergency Trauma & Surgery.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate wasted minutes in massive hemorrhage protocols. BloodBridge aggregates certified blood bank inventories across the regional trauma grid to deliver compatible PRBC, platelets, and plasma directly to your operating room.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenRequisition}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>🚨 Create Clinical Requisition</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-5 py-3 bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold rounded-lg text-sm border border-purple-400/30 transition-all flex items-center gap-2"
            >
              <span>⚡ Parse Inbound Paramedic Note</span>
            </button>

            <button
              onClick={onOpenHospitalPortal}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-sm border border-slate-700 transition-all"
            >
              Enter Hospital ER Portal →
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
            ⚡
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Massive Transfusion Protocol (MTP)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated multi-unit bundling (1:1:1 ratio of PRBC, Platelets, and FFP) for polytrauma and post-partum hemorrhage, multi-sourced from up to 3 regional blood banks simultaneously.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
            🚚
          </div>
          <h3 className="text-base font-bold text-slate-900">
            GPS Cold-Chain Live Tracking
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Real-time telemetry showing courier vehicle coordinates, active insulated box temperatures (2°C–6°C or -18°C), and predictive arrival countdowns for OR prep.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <h3 className="text-base font-bold text-slate-900">
            100% Deterministic Safety
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Never risk an ABO mismatch. Hardcoded clinical rules ensure absolute compliance with cross-match protocols. No AI hallucinations or statistical guesswork in hematology.
          </p>
        </div>
      </div>

      {/* Verified Partner Hospitals Directory */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Regional Grid
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Verified Trauma Centers & Medical Facilities
            </h2>
            <p className="text-xs text-slate-500">
              Currently connected to the BloodBridge real-time dispatch and delivery routing network.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-mono font-bold text-slate-700">
              {hospitals.length} Hospitals Connected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="p-5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{hosp.name}</h4>
                  <div className="text-[11px] text-slate-500">{hosp.address}, {hosp.city}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                  {hosp.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">ER Trauma Desk:</span>
                  <span className="font-mono font-semibold">{hosp.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Coordinates:</span>
                  <span className="font-mono text-[11px]">{hosp.location.lat.toFixed(4)}, {hosp.location.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Requisition Queue Teaser */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <h3 className="text-sm font-bold text-slate-900">
              Active Hospital Requisitions Across Grid ({activeHospitalOrders.length})
            </h3>
          </div>
          <button
            onClick={onOpenHospitalPortal}
            className="text-xs text-blue-700 hover:text-blue-900 font-bold"
          >
            Manage in Hospital Portal →
          </button>
        </div>

        <div className="space-y-2">
          {activeHospitalOrders.slice(0, 3).map((req) => (
            <div
              key={req.id}
              className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                  {req.bloodGroup} {req.component}
                </span>
                <div>
                  <span className="font-bold text-slate-800">{req.hospitalName}</span>
                  <span className="text-slate-400 text-[11px] ml-2">· {req.clinicalReason}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900">
                  {req.unitsAllocated} / {req.unitsRequired || req.unitsNeeded || 1} units
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

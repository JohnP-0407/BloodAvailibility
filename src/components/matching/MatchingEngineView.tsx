import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent, UrgencyLevel } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { RBC_COMPATIBILITY_MAP, PLASMA_COMPATIBILITY_MAP, getCompatibleDonorGroups } from '../../utils/compatibility';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

export const MatchingEngineView: React.FC = () => {
  const {
    hospitals,
    previewMatching,
    createBloodRequest,
    setSelectedRequestId,
    setActiveTab
  } = useBloodBridge();

  const [testBloodGroup, setTestBloodGroup] = useState<BloodGroup>('O-');
  const [testComponent, setTestComponent] = useState<BloodComponent>('PRBC');
  const [testUnits, setTestUnits] = useState<number>(3);
  const [testHospitalId, setTestHospitalId] = useState(hospitals[0]?.id || 'hosp-01');
  const [testUrgency, setTestUrgency] = useState<UrgencyLevel>('CRITICAL');

  const matchPreview = previewMatching(testBloodGroup, testComponent, testUnits, testHospitalId);
  const compatibleGroups = getCompatibleDonorGroups(testBloodGroup, testComponent);
  const selectedHospital = hospitals.find(h => h.id === testHospitalId) || hospitals[0];

  const handleExecuteRequisition = async () => {
    const newReq = await createBloodRequest({
      patientName: `Demo Patient (${testBloodGroup} Requisition)`,
      hospitalId: testHospitalId,
      requesterRole: 'HOSPITAL',
      bloodGroup: testBloodGroup,
      component: testComponent,
      unitsRequired: testUnits,
      unitsNeeded: testUnits,
      urgency: testUrgency,
      clinicalReason: `Matching engine evaluation for ${testUnits} units ${testBloodGroup} ${testComponent}`,
      notes: 'Executed via interactive matching engine console'
    });

    setSelectedRequestId(newReq.id);
    setActiveTab('my-requests');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Deterministic Source Matching Engine
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Multi-Stage Fallback</span>
            <span aria-hidden="true">·</span>
            <span>Distance-Weighted Priority</span>
            <span aria-hidden="true">·</span>
            <span>Donor SOS Trigger</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Engine Protocol:</span>
          <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded">
            ABO/Rh DETERMINISTIC v2.4
          </span>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Interactive Simulation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Column */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Requisition Simulation Parameters</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate demand scenarios to observe deterministic source allocation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recipient Blood Group
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setTestBloodGroup(bg)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg transition-colors ${
                    testBloodGroup === bg
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Component Type
            </label>
            <select
              value={testComponent}
              onChange={e => setTestComponent(e.target.value as BloodComponent)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              {BLOOD_COMPONENTS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Units Needed
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={testUnits}
              onChange={e => setTestUnits(parseInt(e.target.value, 10))}
              className="w-full accent-rose-600"
            />
            <div className="flex justify-between font-mono text-xs font-bold text-slate-700 mt-1">
              <span>1 unit</span>
              <span className="text-rose-700 text-sm">{testUnits} units</span>
              <span>8 units</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requesting Hospital Location
            </label>
            <select
              value={testHospitalId}
              onChange={e => setTestHospitalId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urgency Classification
            </label>
            <select
              value={testUrgency}
              onChange={e => setTestUrgency(e.target.value as UrgencyLevel)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="CRITICAL">CRITICAL (Immediate)</option>
              <option value="HIGH">HIGH (Acute)</option>
              <option value="MEDIUM">MEDIUM (Elective)</option>
              <option value="ROUTINE">ROUTINE (Standard)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExecuteRequisition}
              className="w-full py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              Create Live Requisition from Simulation ➔
            </button>
          </div>
        </div>

        {/* Step-by-Step Resolution Column */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Deterministic Allocation Breakdown
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Destination: {selectedHospital.name}</span>
                <span aria-hidden="true">·</span>
                <span>Requirement: {testUnits} units of {testBloodGroup} {testComponent}</span>
              </div>
            </div>

            {/* Allocation Meter */}
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-slate-900">
                {matchPreview.unitsAllocated} / {testUnits} Allocated
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {matchPreview.unmetUnits === 0 ? (
                  <span className="text-emerald-700">100% Demand Met ✓</span>
                ) : (
                  <span className="text-red-700">{matchPreview.unmetUnits} units short (Donor SOS)</span>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Compatibility Badge Strip */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Protocol Allowed Donor Groups for {testBloodGroup} ({testComponent}):
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {compatibleGroups.map(bg => (
                <span
                  key={bg}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    bg === testBloodGroup
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-800'
                  }`}
                >
                  {bg} {bg === testBloodGroup ? '(Exact)' : '(Compatible)'}
                </span>
              ))}
            </div>
          </div>

          {/* Allocation Stages */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800">Deterministic Resolution Stages:</div>

            {matchPreview.matchedSteps.length === 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                No matching units in local blood banks or registered available donors. System triggers regional emergency network escalation.
              </div>
            ) : (
              matchPreview.matchedSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{step.sourceName}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {step.sourceType === 'BLOOD_BANK' ? 'Blood Bank Reserve' : 'Eligible Registered Donor'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Stage: <span className="font-semibold text-slate-700">{step.stage}</span> · Blood Group:{' '}
                        <span className="font-mono font-bold text-rose-700">{step.bloodGroupOffered}</span> · Distance:{' '}
                        <span className="font-mono">{step.distanceKm} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      +{step.unitsAllocated} unit{step.unitsAllocated > 1 ? 's' : ''}
                    </div>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {step.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Donor SOS Trigger if Shortfall */}
          {matchPreview.unmetUnits > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                <span>Automated Donor Emergency SOS Broadcast Triggered</span>
              </div>
              <p className="text-xs text-amber-800">
                Because local blood bank inventory has {matchPreview.unmetUnits} units shortfall for {testBloodGroup}, the system initiates emergency push notifications and SMS alerts to nearby registered eligible donors.
              </p>
              <div className="text-[11px] text-amber-900 font-semibold">
                {matchPreview.eligibleDonorsFound.length} compatible eligible donors identified within metro response radius.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Compatibility Matrix Reference Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Authoritative Medical ABO / Rh Compatibility Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Static clinical reference applied by BloodBridge. RBC (PRBC) vs Plasma (FFP) rules differ due to antigen-antibody dynamics.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold text-slate-700">Recipient Blood Group</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">PRBC / Whole Blood Allowed Donors</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Plasma (FFP) Allowed Donors</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Clinical Distinction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BLOOD_GROUPS.map(bg => {
                const rbcDonors = RBC_COMPATIBILITY_MAP[bg];
                const plasmaDonors = PLASMA_COMPATIBILITY_MAP[bg];

                return (
                  <tr key={bg} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-700 text-sm">
                      {bg}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {rbcDonors.join(', ')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {plasmaDonors.join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {bg === 'O-' && <span className="text-red-700 font-semibold">Universal RBC Donor (No A/B/Rh antigens)</span>}
                      {bg === 'AB+' && <span className="text-blue-700 font-semibold">Universal RBC Recipient</span>}
                      {bg === 'AB-' && <span className="text-blue-700 font-semibold">Universal Plasma Donor</span>}
                      {bg !== 'O-' && bg !== 'AB+' && bg !== 'AB-' && <span>Standard type-specific match prioritized</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

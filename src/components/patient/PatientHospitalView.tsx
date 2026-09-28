import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent, UrgencyLevel, BloodRequest } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface PatientHospitalViewProps {
  onOpenAiAssistant: () => void;
  onSelectMapRoute?: (requestId: string) => void;
}

export const PatientHospitalView: React.FC<PatientHospitalViewProps> = ({
  onOpenAiAssistant,
  onSelectMapRoute
}) => {
  const {
    userRole,
    requests,
    hospitals,
    createBloodRequest,
    updateRequestStatus,
    selectedRequestId,
    setSelectedRequestId,
    setActiveTab
  } = useBloodBridge();

  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');

  // Form state
  const [patientName, setPatientName] = useState('Demo Patient 201');
  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || 'hosp-01');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<BloodComponent>('PRBC');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [clinicalReason, setClinicalReason] = useState(
    'Acute trauma admission with extensive blood loss, requiring immediate transfusion protocol'
  );
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = await createBloodRequest({
      patientName,
      hospitalId,
      requesterRole: userRole === 'PATIENT' ? 'PATIENT' : 'HOSPITAL',
      bloodGroup,
      component,
      unitsNeeded,
      urgency,
      clinicalReason,
      notes
    });

    setSuccessMessage(`Requisition ${newReq.requestNumber} logged and deterministically processed!`);
    setSelectedRequestId(newReq.id);
    setActiveSubTab('LIST');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleQuickCodeRed = async () => {
    const newReq = await createBloodRequest({
      patientName: 'Demo Code Red Trauma',
      hospitalId: hospitalId || hospitals[0].id,
      requesterRole: 'HOSPITAL',
      bloodGroup: 'O-',
      component: 'PRBC',
      unitsNeeded: 2,
      urgency: 'CRITICAL',
      clinicalReason: 'CODE RED EMERGENCY: Immediate uncrossmatched O- negative packed red cells requisitioned',
      notes: 'Automated 1-click critical trauma activation'
    });

    setSelectedRequestId(newReq.id);
    setSuccessMessage(`CODE RED Requisition ${newReq.requestNumber} activated!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const filteredRequests = requests.filter(r => {
    if (filterUrgency === 'ALL') return true;
    return r.urgency === filterUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {userRole === 'PATIENT' ? 'Patient Blood Request & Tracking' : 'Hospital Emergency Blood Requisitions'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Verified Clinical Network</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic ABO / Rh Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Cold-Chain Transit</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAiAssistant}
            className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            <span>AI Dispatch Parser</span>
          </button>

          <button
            onClick={handleQuickCodeRed}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>1-Click Code Red (O-)</span>
          </button>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveSubTab('LIST')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'LIST' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Requisitions ({requests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('CREATE')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'CREATE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Create Requisition
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Main Content Area */}
      {activeSubTab === 'CREATE' ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">New Clinical Blood Requisition</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Matches are computed deterministically against blood bank inventory and verified donors.
              </p>
            </div>
            <button
              onClick={onOpenAiAssistant}
              className="text-xs text-purple-700 font-semibold hover:underline"
            >
              Parse from clinical notes with AI ➔
            </button>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Identifier (Synthetic)
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Hospital
                </label>
                <select
                  value={hospitalId}
                  onChange={e => setHospitalId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {hospitals.map(hosp => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name} (Level {hosp.traumaCenterLevel} Trauma)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Component
                </label>
                <select
                  value={component}
                  onChange={e => setComponent(e.target.value as BloodComponent)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                  type="number"
                  min={1}
                  max={10}
                  value={unitsNeeded}
                  onChange={e => setUnitsNeeded(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Classification
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Life Threat / Stat Transfusion)</option>
                  <option value="HIGH">HIGH (Acute Bleeding / Impending Surgery)</option>
                  <option value="MEDIUM">MEDIUM (Elective Surgery / Planned Infusion)</option>
                  <option value="ROUTINE">ROUTINE (Standard Restocking)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Indication / Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={clinicalReason}
                  onChange={e => setClinicalReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Ruptured abdominal aortic aneurysm, severe anemia"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Handling / Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Deliver directly to Operating Room 3; Leucodepleted preferred"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <MedicalSafetyBadge />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveSubTab('LIST')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Submit Requisition & Execute Matching Engine ➔
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Requisition List & Tracker View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Column */}
          <div className="lg:col-span-7 space-y-3">
            {/* Filter bar */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-600 mr-1">Filter Priority:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(level => (
                  <button
                    key={level}
                    onClick={() => setFilterUrgency(level)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      filterUrgency === level
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Showing {filteredRequests.length} requisitions
              </span>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                No blood requisitions matching this filter.
              </div>
            ) : (
              filteredRequests.map(req => {
                const isSelected = req.id === selectedRequestId;
                const isCritical = req.urgency === 'CRITICAL';

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{req.requestNumber}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            isCritical ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.bloodGroup} · {req.component}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 mt-1">{req.hospitalName}</div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{req.clinicalReason}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-bold text-slate-900">
                          {req.unitsAllocated} / {req.unitsNeeded} units
                        </div>
                        <div className="text-[11px] font-semibold mt-1">
                          {req.status === 'FULFILLED' && <span className="text-emerald-700">Fulfilled ✓</span>}
                          {req.status === 'ACCEPTED' && <span className="text-blue-700">Accepted ➔</span>}
                          {req.status === 'RESERVED' && <span className="text-purple-700">Reserved</span>}
                          {req.status === 'MATCHED' && <span className="text-amber-700">Matched</span>}
                          {(req.status === 'SEARCHING' || req.status === 'CREATED') && <span className="text-red-700">Searching</span>}
                        </div>
                      </div>
                    </div>

                    {/* Metadata line adhering to zero-pill discipline */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                      <span>Priority: {req.urgency}</span>
                      <span aria-hidden="true">·</span>
                      <span>Logged: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span aria-hidden="true">·</span>
                      <span>Patient: {req.patientName}</span>
                      {req.donorAlertsSent ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-700 font-medium">{req.donorAlertsSent} Donor SOS Dispatched</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details & Live Fulfillment Pipeline Column */}
          <div className="lg:col-span-5">
            {selectedRequest ? (
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5 sticky top-20 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="font-mono text-xs font-bold text-slate-900">{selectedRequest.requestNumber}</div>
                    <div className="text-xs text-slate-500">Live Coordination Tracker</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    selectedRequest.urgency === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedRequest.urgency}
                  </span>
                </div>

                {/* Patient & Hospital Info */}
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div><span className="font-semibold text-slate-900">Destination:</span> {selectedRequest.hospitalName}</div>
                  <div><span className="font-semibold text-slate-900">Patient:</span> {selectedRequest.patientName}</div>
                  <div><span className="font-semibold text-slate-900">Clinical Reason:</span> {selectedRequest.clinicalReason}</div>
                  {selectedRequest.notes && (
                    <div className="text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                      {selectedRequest.notes}
                    </div>
                  )}
                </div>

                {/* Fulfillment Status Progress Pipeline */}
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-3">Fulfillment Protocol Pipeline</div>
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {/* Stage 1 */}
                    <div className="flex items-start gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold z-10 shrink-0">
                        ✓
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900">Deterministic ABO Protocol Evaluated</div>
                        <div className="text-[11px] text-slate-500">
                          Compatible donors: {selectedRequest.bloodGroup} RBC rules verified
                        </div>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="flex items-start gap-3 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 shrink-0 ${
                        selectedRequest.unitsAllocated > 0 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {selectedRequest.unitsAllocated > 0 ? '✓' : '…'}
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900">
                          Inventory Match: {selectedRequest.unitsAllocated}/{selectedRequest.unitsNeeded} units allocated
                        </div>
                        {selectedRequest.matchedSources.map((s, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 mt-0.5">
                            • {s.unitsAllocated}u from {s.sourceName} ({s.distanceKm}km, {s.bloodGroupOffered})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="flex items-start gap-3 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 shrink-0 ${
                        selectedRequest.status === 'ACCEPTED' || selectedRequest.status === 'RESERVED' || selectedRequest.status === 'FULFILLED'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedRequest.status === 'ACCEPTED' || selectedRequest.status === 'RESERVED' || selectedRequest.status === 'FULFILLED' ? '✓' : '3'}
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900">Cold Chain Courier Dispatch</div>
                        <div className="text-[11px] text-slate-500">
                          {selectedRequest.status === 'ACCEPTED' || selectedRequest.status === 'RESERVED'
                            ? `In transit to hospital (ETA: ~${selectedRequest.estimatedArrivalMin || 15} mins)`
                            : selectedRequest.status === 'FULFILLED'
                            ? 'Delivered and verified at hospital blood bank'
                            : 'Awaiting dispatch confirmation'}
                        </div>
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div className="flex items-start gap-3 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 shrink-0 ${
                        selectedRequest.status === 'FULFILLED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedRequest.status === 'FULFILLED' ? '✓' : '4'}
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900">Bedside Transfusion / Fulfillment</div>
                        <div className="text-[11px] text-slate-500">
                          {selectedRequest.status === 'FULFILLED' ? 'Transfusion completed' : 'Pending delivery'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                  {selectedRequest.status !== 'ACCEPTED' && selectedRequest.status !== 'RESERVED' && selectedRequest.status !== 'FULFILLED' && (
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'ACCEPTED', 'Courier vehicle departed under temperature control')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      Confirm Acceptance & Dispatch ➔
                    </button>
                  )}

                  {(selectedRequest.status === 'ACCEPTED' || selectedRequest.status === 'RESERVED') && (
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'FULFILLED', 'Received and crossmatched at hospital blood bank')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      Confirm Receipt / Transfusion ✓
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (onSelectMapRoute) onSelectMapRoute(selectedRequest.id);
                      setActiveTab('map');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    View Map Route 📍
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                Select any requisition on the left to track its live cold chain status and fulfillment details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

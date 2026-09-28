import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { RequestStatusBadge } from '../common/RequestStatusBadge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface HospitalDashboardViewProps {
  onOpenCreateRequest: () => void;
  onOpenMyRequests: () => void;
  onOpenRequestDetails: (id: string) => void;
  onOpenRequestTracking: (id: string) => void;
}

export const HospitalDashboardView: React.FC<HospitalDashboardViewProps> = ({
  onOpenCreateRequest,
  onOpenMyRequests,
  onOpenRequestDetails,
  onOpenRequestTracking
}) => {
  const {
    requests,
    hospitals,
    currentUser,
    createBloodRequest,
    setSelectedRequestId
  } = useBloodBridge();

  const currentHospital = hospitals.find(h => h.id === currentUser.hospitalId) || hospitals[0];

  const hospitalRequests = requests.filter(r => r.hospitalId === currentHospital.id || r.requesterRole === 'HOSPITAL');

  const activeRequests = hospitalRequests.filter(
    r => ['CREATED', 'SEARCHING', 'MATCHED', 'PENDING_CONFIRMATION', 'ACCEPTED', 'RESERVED'].includes(r.status)
  );
  const pendingConfirmation = hospitalRequests.filter(r => ['SEARCHING', 'MATCHED', 'PENDING_CONFIRMATION'].includes(r.status));
  const completedRequests = hospitalRequests.filter(r => r.status === 'FULFILLED');
  const criticalEmergencyCount = hospitalRequests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED').length;

  const handle1ClickCodeRed = async () => {
    try {
      const created = await createBloodRequest({
        patientName: 'Emergency Trauma Admission (Code Red)',
        hospitalId: currentHospital.id,
        hospitalName: currentHospital.name,
        requesterRole: 'HOSPITAL',
        bloodGroup: 'O-',
        component: 'PRBC',
        unitsRequired: 2,
        urgency: 'CRITICAL',
        requiredDateTime: new Date(Date.now() + 15 * 60000).toISOString(),
        location: {
          hospitalName: currentHospital.name,
          address: currentHospital.address,
          lat: currentHospital.location.lat,
          lng: currentHospital.location.lng
        },
        contactInformation: {
          contactPerson: currentUser.name,
          phoneNumber: currentHospital.contactNumber,
          relationship: 'Emergency Resuscitation Team'
        },
        clinicalReason: 'CODE RED EMERGENCY: Massive acute hemorrhage, uncrossmatched emergency blood requirement',
        additionalNotes: 'Deliver STAT directly to Trauma Resuscitation Bay 1'
      });
      setSelectedRequestId(created.id);
      onOpenRequestTracking(created.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hospital Trauma Center Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {currentHospital.name} · Level {currentHospital.traumaCenterLevel} Trauma Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Clinical Blood Requisition Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Operating Room, ICU, and Emergency Department blood unit batch requisition and cold chain telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handle1ClickCodeRed}
            className="px-4 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>1-Click Code Red (O-)</span>
          </button>

          <button
            onClick={onOpenCreateRequest}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            + Standard Requisition
          </button>
        </div>
      </div>

      {/* Emergency Indicators */}
      {criticalEmergencyCount > 0 && (
        <div className="p-4 bg-red-600 text-white rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <div>
              <div className="font-bold text-sm">
                {criticalEmergencyCount} ACTIVE CRITICAL TRAUMA TRANSFUSIONS IN TRANSIT
              </div>
              <div className="text-xs text-red-100 mt-0.5">
                Priority cold chain couriers inbound from verified blood banks to {currentHospital.name}.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenMyRequests}
            className="px-3 py-1.5 bg-white text-red-700 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors shadow-xs shrink-0"
          >
            View Active Code Reds ➔
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Active Hospital Requisitions</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {activeRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">OR / ICU active orders</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Pending Confirmation</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {pendingConfirmation.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting facility lock</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Fulfilled Transfusions</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {completedRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cross-matched & verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Trauma Priority Status</div>
          <div className="text-xs font-bold text-red-600 mt-2">
            Priority Cold-Chain Transit
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Average courier response: ~14m</div>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Recent Requests Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Hospital Department Requisition Stream</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking across operating theaters and intensive care units.
            </p>
          </div>
          <button
            onClick={onOpenMyRequests}
            className="text-xs text-rose-600 font-semibold hover:underline"
          >
            All Requisitions ({hospitalRequests.length}) ➔
          </button>
        </div>

        {hospitalRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active requisitions logged for {currentHospital.name}. Click "+ Standard Requisition" or "1-Click Code Red".
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {hospitalRequests.slice(0, 5).map(req => (
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
                    {req.urgency === 'CRITICAL' && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                        CODE RED
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-800 mt-1">
                    Patient: {req.patientName} · {req.clinicalReason}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Contact: {req.contactInformation.contactPerson} ({req.contactInformation.phoneNumber})
                    {' · '}Required by: {new Date(req.requiredDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

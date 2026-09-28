import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent, UrgencyLevel } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface CreateBloodRequestViewProps {
  onSuccess: (requestId: string) => void;
  onCancel: () => void;
  onOpenAiAssistant: () => void;
  initialBloodGroup?: BloodGroup;
  initialComponent?: BloodComponent;
}

export const CreateBloodRequestView: React.FC<CreateBloodRequestViewProps> = ({
  onSuccess,
  onCancel,
  onOpenAiAssistant,
  initialBloodGroup,
  initialComponent
}) => {
  const { hospitals, currentUser, userRole, createBloodRequest } = useBloodBridge();

  // Form Fields
  const [patientName, setPatientName] = useState('Demo Patient 202');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(initialBloodGroup || 'O-');
  const [component, setComponent] = useState<BloodComponent>(initialComponent || 'PRBC');
  const [unitsRequired, setUnitsRequired] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  
  // Format default required date/time to 4 hours from now
  const defaultDateTime = new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16);
  const [requiredDateTime, setRequiredDateTime] = useState<string>(defaultDateTime);

  const [selectedHospitalId, setSelectedHospitalId] = useState(
    currentUser.hospitalId || hospitals[0]?.id || 'hosp-01'
  );
  
  const [contactPerson, setContactPerson] = useState(currentUser.name || 'Duty Medical Officer');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 012-7001');
  const [email, setEmail] = useState(currentUser.email || 'coordinator@demohospital.org');
  const [relationship, setRelationship] = useState(
    userRole === 'HOSPITAL' ? 'Attending Physician' : 'Family / Guardian'
  );

  const [clinicalReason, setClinicalReason] = useState(
    'Acute trauma admission with extensive hemorrhagic shock'
  );
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!patientName.trim()) {
      errors.patientName = 'Patient identifier is required.';
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      errors.bloodGroup = 'Please select a valid clinical blood group.';
    }

    if (!unitsRequired || isNaN(unitsRequired) || unitsRequired < 1 || unitsRequired > 10) {
      errors.unitsRequired = 'Units required must be an integer between 1 and 10.';
    }

    if (!requiredDateTime) {
      errors.requiredDateTime = 'Please specify the required date and time.';
    }

    if (!contactPerson.trim()) {
      errors.contactPerson = 'Contact person name is required.';
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Emergency phone number is required.';
    } else if (phoneNumber.trim().length < 7) {
      errors.phoneNumber = 'Please enter a valid phone number (at least 7 digits).';
    }

    if (!clinicalReason.trim()) {
      errors.clinicalReason = 'Clinical reason / diagnosis is required for medical requisition audit.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    const hosp = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

    try {
      const created = await createBloodRequest({
        patientName: patientName.trim(),
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        requesterRole: userRole === 'HOSPITAL' ? 'HOSPITAL' : 'PATIENT',
        bloodGroup,
        component,
        unitsRequired,
        urgency,
        requiredDateTime: new Date(requiredDateTime).toISOString(),
        location: {
          hospitalName: hosp.name,
          address: hosp.address,
          lat: hosp.location.lat,
          lng: hosp.location.lng
        },
        contactInformation: {
          contactPerson: contactPerson.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          relationship: relationship.trim()
        },
        clinicalReason: clinicalReason.trim(),
        additionalNotes: additionalNotes.trim()
      });

      onSuccess(created.id);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit requisition to backend API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              {userRole === 'HOSPITAL' ? 'Hospital Requisition' : 'Patient Blood Requisition'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Create Blood Requisition
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Matches are calculated deterministically against verified blood bank inventories and registered donors.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          <span>Parse with AI Dispatch</span>
        </button>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <span>✕ {submitError}</span>
          <button onClick={() => setSubmitError(null)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Section 1: Patient & Location */}
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            1. Patient & Destination Hospital
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Identifier / Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={e => {
                  setPatientName(e.target.value);
                  if (formErrors.patientName) setFormErrors({ ...formErrors, patientName: '' });
                }}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  formErrors.patientName ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="e.g. Demo Patient 104"
              />
              {formErrors.patientName && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.patientName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Hospital Location <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedHospitalId}
                onChange={e => setSelectedHospitalId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                {hospitals.map(hosp => (
                  <option key={hosp.id} value={hosp.id}>
                    {hosp.name} (Level {hosp.traumaCenterLevel} Trauma)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Blood Specifications */}
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            2. Blood Specification & Required Units
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group <span className="text-red-600">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={e => {
                  setBloodGroup(e.target.value as BloodGroup);
                  if (formErrors.bloodGroup) setFormErrors({ ...formErrors, bloodGroup: '' });
                }}
                className={`w-full text-xs p-2.5 border rounded-lg font-mono font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  formErrors.bloodGroup ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {formErrors.bloodGroup && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.bloodGroup}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Component <span className="text-red-600">*</span>
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
                Units Required (1-10) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={unitsRequired}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setUnitsRequired(isNaN(val) ? 1 : val);
                  if (formErrors.unitsRequired) setFormErrors({ ...formErrors, unitsRequired: '' });
                }}
                className={`w-full text-xs p-2.5 border rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  formErrors.unitsRequired ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {formErrors.unitsRequired && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.unitsRequired}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Urgency & Timing */}
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            3. Urgency & Delivery Timing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Level <span className="text-red-600">*</span>
              </label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as UrgencyLevel)}
                className={`w-full text-xs p-2.5 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  urgency === 'CRITICAL' ? 'text-red-700 bg-red-50/50' : 'text-slate-800'
                }`}
              >
                <option value="CRITICAL">CRITICAL (Immediate Life Threat / Stat Transfusion)</option>
                <option value="HIGH">HIGH (Acute Bleeding / Impending Surgical Procedure)</option>
                <option value="MEDIUM">MEDIUM (Scheduled Elective Operation)</option>
                <option value="ROUTINE">ROUTINE (Standard Ward Inventory Buffer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Date & Time <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={requiredDateTime}
                onChange={e => {
                  setRequiredDateTime(e.target.value);
                  if (formErrors.requiredDateTime) setFormErrors({ ...formErrors, requiredDateTime: '' });
                }}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono ${
                  formErrors.requiredDateTime ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {formErrors.requiredDateTime && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.requiredDateTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Contact Information */}
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            4. Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={e => {
                  setContactPerson(e.target.value);
                  if (formErrors.contactPerson) setFormErrors({ ...formErrors, contactPerson: '' });
                }}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  formErrors.contactPerson ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="e.g. Dr. Sarah Adams"
              />
              {formErrors.contactPerson && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.contactPerson}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={e => {
                  setPhoneNumber(e.target.value);
                  if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: '' });
                }}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono ${
                  formErrors.phoneNumber ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="+1 (555) 012-7001"
              />
              {formErrors.phoneNumber && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="contact@demohospital.org"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relationship / Department Title
              </label>
              <input
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. Attending Surgeon, Ward Nurse, Parent"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Clinical Indication & Notes */}
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            5. Clinical Indication & Additional Instructions
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Reason / Indication <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={clinicalReason}
                onChange={e => {
                  setClinicalReason(e.target.value);
                  if (formErrors.clinicalReason) setFormErrors({ ...formErrors, clinicalReason: '' });
                }}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  formErrors.clinicalReason ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="e.g. Acute trauma admission with extensive blood loss, requiring immediate transfusion"
              />
              {formErrors.clinicalReason && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.clinicalReason}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Notes & Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. Deliver directly to Operating Room 3; Leucodepleted filter required; Stat crossmatch"
              />
            </div>
          </div>
        </div>

        <MedicalSafetyBadge />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            {isSubmitting ? 'Validating & Submitting...' : 'Submit Blood Requisition ➔'}
          </button>
        </div>
      </form>
    </div>
  );
};

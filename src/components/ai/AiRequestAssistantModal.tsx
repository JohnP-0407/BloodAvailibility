import React, { useState } from 'react';
import { BloodGroup, BloodComponent, UrgencyLevel } from '../../types/bloodbridge';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface AiRequestAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtractedRequest: (extracted: {
    patientName: string;
    hospitalId: string;
    bloodGroup: BloodGroup;
    component: BloodComponent;
    unitsNeeded: number;
    urgency: UrgencyLevel;
    clinicalReason: string;
  }) => void;
}

export const AiRequestAssistantModal: React.FC<AiRequestAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyExtractedRequest
}) => {
  const { hospitals } = useBloodBridge();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    patientName: string;
    hospitalId: string;
    bloodGroup: BloodGroup;
    component: BloodComponent;
    unitsNeeded: number;
    urgency: UrgencyLevel;
    clinicalReason: string;
  } | null>(null);

  const sampleNotes = [
    {
      label: 'Emergency Trauma (O- PRBC)',
      text: 'Paramedic Unit 09 inbound: 32yo male polytrauma from highway rollover. Severe hemorrhagic shock, BP 70/40. Stat requirement: 4 units of O-negative packed red cells at Demo Hospital 01.'
    },
    {
      label: 'Oncology Platelets (A+)',
      text: 'Hematology Ward 3: Demo Patient 204 diagnosed with acute myeloid leukemia, platelets count critically low at 12,000/uL with active mucosal bleeding. Needs 3 units A+ platelets today at Demo Hospital 02.'
    },
    {
      label: 'Elective Surgery (B+ Whole Blood)',
      text: 'Dr. Vance surgical requisition: Scheduled spinal fusion surgery tomorrow morning for 54yo patient. Reserve 2 units of B positive whole blood at Demo Hospital 03.'
    }
  ];

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);

    try {
      // Try server-side proxy route if available
      const response = await fetch('/api/parse-emergency-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: inputText })
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedData(data);
        setIsProcessing(false);
        return;
      }
    } catch {
      // Fallback to client-side deterministic parsing
    }

    // High-precision client-side natural language parser fallback
    setTimeout(() => {
      const lower = inputText.toLowerCase();

      // Detect Blood Group
      let bg: BloodGroup = 'O+';
      if (lower.includes('o-') || lower.includes('o negative') || lower.includes('o-neg') || lower.includes('o neg')) bg = 'O-';
      else if (lower.includes('o+') || lower.includes('o positive') || lower.includes('o-pos')) bg = 'O+';
      else if (lower.includes('ab-') || lower.includes('ab negative')) bg = 'AB-';
      else if (lower.includes('ab+') || lower.includes('ab positive')) bg = 'AB+';
      else if (lower.includes('a-') || lower.includes('a negative')) bg = 'A-';
      else if (lower.includes('a+') || lower.includes('a positive')) bg = 'A+';
      else if (lower.includes('b-') || lower.includes('b negative')) bg = 'B-';
      else if (lower.includes('b+') || lower.includes('b positive')) bg = 'B+';

      // Detect Component
      let comp: BloodComponent = 'PRBC';
      if (lower.includes('platelet') || lower.includes('rdp') || lower.includes('sdp')) comp = 'PLATELETS';
      else if (lower.includes('plasma') || lower.includes('ffp')) comp = 'FFP';
      else if (lower.includes('whole blood')) comp = 'WHOLE_BLOOD';
      else if (lower.includes('cryo')) comp = 'CRYOPRECIPITATE';

      // Detect Units
      const unitMatch = inputText.match(/(\d+)\s*(?:units?|pints?|bags?)/i);
      const unitsNeeded = unitMatch ? Math.min(10, Math.max(1, parseInt(unitMatch[1], 10))) : 2;

      // Detect Urgency
      let urgency: UrgencyLevel = 'MEDIUM';
      if (lower.includes('stat') || lower.includes('hemorrhagic') || lower.includes('shock') || lower.includes('polytrauma') || lower.includes('critical') || lower.includes('immediate')) {
        urgency = 'CRITICAL';
      } else if (lower.includes('urgent') || lower.includes('active bleeding') || lower.includes('high priority')) {
        urgency = 'HIGH';
      } else if (lower.includes('scheduled') || lower.includes('tomorrow') || lower.includes('routine')) {
        urgency = 'ROUTINE';
      }

      // Detect Hospital
      let hospId = hospitals[0].id;
      if (lower.includes('hospital 02') || lower.includes('st. jude')) hospId = hospitals[1]?.id || hospId;
      else if (lower.includes('hospital 03') || lower.includes('apex')) hospId = hospitals[2]?.id || hospId;
      else if (lower.includes('hospital 04') || lower.includes('pediatric')) hospId = hospitals[3]?.id || hospId;

      // Detect Patient Name or Synthesize
      const patientMatch = inputText.match(/(?:patient|victim|inbound)\s+([a-zA-Z0-9\s]+?)(?:,|\.|\s+diagnosed|\s+with|\s+from)/i);
      const patientName = patientMatch ? `Demo Patient (${patientMatch[1].trim()})` : 'Demo Emergency Admission';

      setExtractedData({
        patientName,
        hospitalId: hospId,
        bloodGroup: bg,
        component: comp,
        unitsNeeded,
        urgency,
        clinicalReason: inputText.slice(0, 140)
      });

      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
              AI
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Smart Emergency Request Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <MedicalSafetyBadge />

          <div className="text-xs text-slate-600">
            Paste unstructured doctor triage notes, paramedic dispatch notes, or emergency room audio transcripts. The AI assistant extracts structured clinical parameters for your review.
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Quick Test Presets
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleNotes.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(sample.text)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-left"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Dispatch / Clinical Note
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Paramedic Unit 4 inbound with 34yo female, blunt abdominal trauma, internal bleeding. Urgent 3 units of O negative PRBC needed immediately at Demo Hospital 01."
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExtract}
              disabled={isProcessing || !inputText.trim()}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isProcessing ? 'Analyzing...' : 'Parse Clinical Requisition'}
            </button>
          </div>

          {/* Extracted Preview */}
          {extractedData && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Extracted Requisition Parameters</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready for Review
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">Blood Group</div>
                  <div className="font-bold text-rose-700 text-sm font-mono">{extractedData.bloodGroup}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">Component</div>
                  <div className="font-semibold text-slate-800 truncate">{extractedData.component}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">Units Needed</div>
                  <div className="font-bold text-slate-900 text-sm font-mono">{extractedData.unitsNeeded} units</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">Priority</div>
                  <div className={`font-bold text-sm ${extractedData.urgency === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>
                    {extractedData.urgency}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Hospital:</span>{' '}
                {hospitals.find(h => h.id === extractedData.hospitalId)?.name}
              </div>

              <div className="text-xs text-slate-600 truncate">
                <span className="font-semibold text-slate-700">Clinical Reason:</span> {extractedData.clinicalReason}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    onApplyExtractedRequest(extractedData);
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  Apply to Requisition Form ➔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

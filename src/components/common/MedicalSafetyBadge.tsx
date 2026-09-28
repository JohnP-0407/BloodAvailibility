import React from 'react';

interface MedicalSafetyBadgeProps {
  compact?: boolean;
}

export const MedicalSafetyBadge: React.FC<MedicalSafetyBadgeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        <span>Deterministic Clinical Safety Guardrail Enforced</span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
        ✓
      </div>
      <div>
        <div className="font-semibold text-emerald-950">Deterministic Medical Compatibility Protocol Verified</div>
        <div className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
          Blood compatibility and donor eligibility are strictly calculated using hardcoded clinical matrices (ABO / Rh antigen protocols and interval cooldown algorithms). No probabilistic AI model is ever permitted to determine compatibility or medical safety.
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { RBC_COMPATIBILITY_MAP, PLASMA_COMPATIBILITY_MAP, isBloodCompatible } from '../../utils/compatibility';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

export const CompatibilityView: React.FC = () => {
  const [selectedRecipient, setSelectedRecipient] = useState<BloodGroup>('O-');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('PRBC');

  const compatibleDonors = selectedComponent === 'FFP' || selectedComponent === 'CRYOPRECIPITATE'
    ? PLASMA_COMPATIBILITY_MAP[selectedRecipient]
    : RBC_COMPATIBILITY_MAP[selectedRecipient];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Deterministic Clinical Compatibility Protocol
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Authoritative ABO / Rh Antigen Matrices</span>
            <span aria-hidden="true">·</span>
            <span>Zero Generative AI In Compatibility</span>
            <span aria-hidden="true">·</span>
            <span>RBC vs Plasma Differentiation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Validation:</span>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            AABB / WHO ALIGNED
          </span>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Interactive Compatibility Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Interactive Recipient Selector</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select recipient type and component to test deterministic compatibility rules.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recipient Blood Group
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedRecipient(bg)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg transition-colors ${
                    selectedRecipient === bg
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Blood Component
            </label>
            <div className="space-y-1">
              {BLOOD_COMPONENTS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedComponent(c.id)}
                  className={`w-full p-2 text-left rounded-lg text-xs font-medium transition-colors ${
                    selectedComponent === c.id
                      ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">{c.label}</div>
                  <div className="text-[10px] text-slate-400">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Output */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Compatible Donors for Recipient <span className="font-mono text-rose-700">{selectedRecipient}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Component: {selectedComponent === 'FFP' || selectedComponent === 'CRYOPRECIPITATE' ? 'Plasma / Cryoprecipitate' : 'Red Blood Cells / Whole Blood'}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              {compatibleDonors.length} of 8 Blood Types Safe
            </span>
          </div>

          {/* Donor Compatibility Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BLOOD_GROUPS.map(donorBg => {
              const compatible = isBloodCompatible(selectedRecipient, donorBg, selectedComponent);
              const isExact = donorBg === selectedRecipient;

              return (
                <div
                  key={donorBg}
                  className={`p-3.5 rounded-xl border transition-all ${
                    compatible
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black">{donorBg}</span>
                    <span className="text-xs font-bold">
                      {compatible ? '✓ SAFE' : '✕ INCOMPATIBLE'}
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold mt-1">
                    {isExact
                      ? 'Exact Group Match'
                      : compatible
                      ? 'Clinically Safe Alternative'
                      : 'Severe Hemolytic Reaction Risk'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Biological Explanation Note */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
            <div className="font-bold text-slate-900">Clinical Mechanism:</div>
            {selectedComponent === 'FFP' || selectedComponent === 'CRYOPRECIPITATE' ? (
              <p className="leading-relaxed text-slate-600">
                In plasma transfusions, donor antibodies against recipient red blood cell antigens dictate safety. Therefore, <span className="font-bold text-slate-900">AB plasma is the universal donor</span> because it contains neither anti-A nor anti-B antibodies, whereas group O plasma contains both anti-A and anti-B and can only safely be given to group O recipients.
              </p>
            ) : (
              <p className="leading-relaxed text-slate-600">
                In cellular RBC transfusions, recipient antibodies will attack donor red cells presenting unfamiliar antigens. Therefore, <span className="font-bold text-slate-900">O-negative is the universal donor</span> because its red blood cells lack A, B, and Rh (D) antigens, while <span className="font-bold text-slate-900">AB-positive is the universal recipient</span> as it has no circulating antibodies against A, B, or Rh antigens.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

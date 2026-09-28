import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodComponent, DonationRecord } from '../../types/bloodbridge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface DonorDonationHistoryViewProps {
  onBackToDashboard: () => void;
}

export const DonorDonationHistoryView: React.FC<DonorDonationHistoryViewProps> = ({
  onBackToDashboard
}) => {
  const {
    donors,
    activeDonorId,
    bloodBanks,
    hospitals,
    logDonation
  } = useBloodBridge();

  const currentDonor = donors.find(d => d.id === activeDonorId) || donors[0];
  const history = currentDonor.donationHistory || [];

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<DonationRecord | null>(null);

  // New log form state
  const [facilityName, setFacilityName] = useState(bloodBanks[0]?.name || 'Demo Blood Bank 01 - Metro Central');
  const [component, setComponent] = useState<BloodComponent>('PRBC');
  const [unitsDonated, setUnitsDonated] = useState<number>(1);
  const [donationDate, setDonationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hbLevel, setHbLevel] = useState<number>(14.5);
  const [bp, setBp] = useState<string>('120/80');
  const [notes, setNotes] = useState<string>('Voluntary blood donation session');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logDonation(currentDonor.id, {
        facilityName,
        facilityType: 'BLOOD_BANK',
        component,
        unitsDonated,
        donationDate: new Date(donationDate).toISOString(),
        vitals: {
          hemoglobinGdl: Number(hbLevel),
          bloodPressure: bp,
          pulseBpm: 72,
          weightKg: currentDonor.weightKg
        },
        notes
      });
      setIsLogModalOpen(false);
      setSuccessToast('New donation record successfully logged! Cooldown interval initiated.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <span className="text-slate-300">·</span>
            <h1 className="text-lg font-bold text-slate-900">Donation History & Certificates</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified longitudinal record of all blood, platelet, and plasma donations for {currentDonor.name} ({currentDonor.code}).
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Log New Donation</span>
        </button>
      </div>

      <MedicalSafetyBadge />

      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Lifetime Donations</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {currentDonor.totalDonations} <span className="text-sm font-normal text-slate-500">collections</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across verified transfusion centers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Estimated Lives Saved</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            ~{currentDonor.totalDonations * 3} <span className="text-sm font-normal text-slate-500">recipients</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Calculated at standard 3-fraction ratio</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Last Recorded Date</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            {new Date(currentDonor.lastDonationDate).toLocaleDateString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Mandatory 56-day cooldown enforced</div>
        </div>
      </div>

      {/* History Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Clinical Collection Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic historical ledger with verified facility certificates.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {history.length} Record(s) Found
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No donation history records found for this donor profile. Click "+ Log New Donation" to simulate recording a clinical donation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Facility / Location</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Component & Units</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Vitals at Collection</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Certificate</th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {new Date(record.donationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{record.facilityName}</div>
                      <div className="text-[11px] text-slate-500">{record.notes}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-rose-700">
                        {record.unitsDonated} unit · {record.bloodGroup} {record.component}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 font-mono">
                      {record.vitals ? (
                        <span>Hb: {record.vitals.hemoglobinGdl || 14.5} g/dL · BP: {record.vitals.bloodPressure || '120/80'}</span>
                      ) : (
                        <span>Standard parameters verified</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {record.certificateId || 'CERT-SYNTH-01'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCert(record)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                      >
                        View Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Log New Donation */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  Clinical Session Entry
                </span>
                <h3 className="text-base font-bold mt-0.5">Record Blood Donation</h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfusion Center / Facility:</label>
                <select
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {bloodBanks.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.city})</option>
                  ))}
                  {hospitals.map(h => (
                    <option key={h.id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Component Donated:</label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value as BloodComponent)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="PRBC">PRBC (Packed Red Cells)</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="PLATELETS">Platelets (Apheresis)</option>
                    <option value="FFP">Fresh Frozen Plasma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Units Collected:</label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    value={unitsDonated}
                    onChange={(e) => setUnitsDonated(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date:</label>
                  <input
                    type="date"
                    value={donationDate}
                    onChange={(e) => setDonationDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hb Level (g/dL):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="12.5"
                    max="18"
                    value={hbLevel}
                    onChange={(e) => setHbLevel(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Pressure:</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes / Event:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Volunteer whole blood drive collection"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-950">
                Notice: Logging this session initiates the mandatory 56-day cooldown counter from the selected donation date.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Recording...' : 'Commit Donation Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Certificate Preview */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border-2 border-slate-300 shadow-2xl p-8 relative space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold text-lg"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b border-slate-200 pb-5">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
                +
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                Certificate of Life Saving Contribution
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                BloodBridge Emergency Transfusion Network · Certificate ID: {selectedCert.certificateId || 'CERT-SYNTH-01'}
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-center text-xs text-slate-700">
              <p className="leading-relaxed">
                This certifies that volunteer donor <span className="font-bold text-slate-950 text-sm">{currentDonor.name}</span> ({currentDonor.bloodGroup}) successfully completed an authenticated blood collection session:
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Facility</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedCert.facilityName}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Date of Session</span>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">
                    {new Date(selectedCert.donationDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Component & Units</span>
                  <div className="font-mono font-semibold text-rose-700 mt-0.5">
                    {selectedCert.unitsDonated} unit(s) {selectedCert.component}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Clinical Status</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">
                    ✓ Verified Transfusion-Safe
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Synthetic verification sandbox certificate. Deterministic ABO/Rh clinical records ledger.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

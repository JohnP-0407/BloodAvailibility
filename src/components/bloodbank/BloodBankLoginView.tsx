import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface BloodBankLoginViewProps {
  onSuccess?: () => void;
}

export const BloodBankLoginView: React.FC<BloodBankLoginViewProps> = ({ onSuccess }) => {
  const { login, bloodBanks } = useBloodBridge();

  const [selectedBankId, setSelectedBankId] = useState<string>(bloodBanks[0]?.id || 'bb-01');
  const [staffName, setStaffName] = useState<string>('Dr. Marcus Vance');
  const [staffRole, setStaffRole] = useState<string>('Chief Transfusionist');
  const [badgeId, setBadgeId] = useState<string>('BB-TECH-9014');
  const [stationPin, setStationPin] = useState<string>('4421');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedBank = bloodBanks.find(b => b.id === selectedBankId) || bloodBanks[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!staffName.trim()) {
      setErrorMessage('Staff full name is required for clinical audit compliance.');
      return;
    }
    if (!badgeId.trim()) {
      setErrorMessage('Please provide an authorized clinical badge identifier.');
      return;
    }

    login('BLOOD_BANK_STAFF', {
      id: `user-${badgeId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${staffName} (${staffRole})`,
      email: `${staffName.toLowerCase().replace(/[^a-z]/g, '.')}@${selectedBank.code.toLowerCase()}.org`,
      bloodBankId: selectedBank.id
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  const handleQuickStaffLogin = (preset: {
    bankId: string;
    name: string;
    role: string;
    badgeId: string;
  }) => {
    const targetBank = bloodBanks.find(b => b.id === preset.bankId) || bloodBanks[0];
    login('BLOOD_BANK_STAFF', {
      id: `user-${preset.badgeId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${preset.name} (${preset.role})`,
      email: `${preset.name.toLowerCase().replace(/[^a-z]/g, '.')}@${targetBank.code.toLowerCase()}.org`,
      bloodBankId: targetBank.id
    });
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Blood Bank Clinical Console · Member 2 Portal</span>
          </div>
          <h1 className="text-xl font-black mt-1 tracking-tight">Blood Bank Staff Authentication</h1>
          <p className="text-xs text-slate-300 mt-1">
            Access facility inventory records, process incoming emergency requisitions, and manage reserve units.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-medium flex items-center justify-between">
              <span>✕ {errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
            </div>
          )}

          {/* Quick Sandbox Profiles */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">1-Click Test Personas (Sandbox):</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Immediate Auth</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickStaffLogin({
                  bankId: 'bb-01',
                  name: 'Dr. Marcus Vance',
                  role: 'Chief Transfusionist',
                  badgeId: 'BB-TECH-9014'
                })}
                className="text-left p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  Dr. Marcus Vance
                </div>
                <div className="text-[11px] text-slate-500">Chief Transfusionist · Metro Central (DBB-01)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickStaffLogin({
                  bankId: 'bb-02',
                  name: 'Rachel Hayes',
                  role: 'Senior Transfusion Technologist',
                  badgeId: 'BB-TECH-8821'
                })}
                className="text-left p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  Rachel Hayes
                </div>
                <div className="text-[11px] text-slate-500">Trauma Specialist · City Trauma Regional (DBB-02)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickStaffLogin({
                  bankId: 'bb-03',
                  name: 'Samir Patel',
                  role: 'Quality & Cold Chain Lead',
                  badgeId: 'BB-TECH-7140'
                })}
                className="text-left p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  Samir Patel
                </div>
                <div className="text-[11px] text-slate-500">Quality Lead · RedCross Life Center (DBB-03)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickStaffLogin({
                  bankId: 'bb-04',
                  name: 'Elena Torres',
                  role: 'Inventory Coordinator',
                  badgeId: 'BB-TECH-6209'
                })}
                className="text-left p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  Elena Torres
                </div>
                <div className="text-[11px] text-slate-500">Inventory Coordinator · Suburban General (DBB-04)</div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              Or Sign In With Facility Station Credentials
            </span>
          </div>

          {/* Custom Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Blood Bank Facility *
              </label>
              <select
                value={selectedBankId}
                onChange={e => setSelectedBankId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold bg-white"
              >
                {bloodBanks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — {b.city}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Operating Hours: {selectedBank?.operatingHours} · Emergency Line: {selectedBank?.contactNumber}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Member Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Dr. Marcus Vance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role / Clinical Designation *
                </label>
                <select
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Chief Transfusionist">Chief Transfusionist</option>
                  <option value="Senior Transfusion Technologist">Senior Transfusion Technologist</option>
                  <option value="Quality Control Specialist">Quality Control Specialist</option>
                  <option value="Cold-Chain Logistics Officer">Cold-Chain Logistics Officer</option>
                  <option value="Duty Blood Bank Attendant">Duty Blood Bank Attendant</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Station Badge ID *
                </label>
                <input
                  type="text"
                  required
                  value={badgeId}
                  onChange={e => setBadgeId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  placeholder="BB-TECH-9014"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Security Station PIN
                </label>
                <input
                  type="password"
                  value={stationPin}
                  onChange={e => setStationPin(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  placeholder="••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              Sign In To Facility Inventory Console ➔
            </button>
          </form>

          <MedicalSafetyBadge />
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { UserRole } from '../../types/bloodbridge';

export const LoginView: React.FC = () => {
  const { login, hospitals, bloodBanks, donors } = useBloodBridge();
  const [selectedRole, setSelectedRole] = useState<'PATIENT' | 'HOSPITAL' | 'BLOOD_BANK_STAFF' | 'DONOR' | 'ADMIN'>('PATIENT');
  
  // Patient state
  const [patientName, setPatientName] = useState('Demo Patient 101');
  const [patientEmail, setPatientEmail] = useState('patient101@example.com');
  const [patientPhone, setPatientPhone] = useState('+1 (555) 019-9941');

  // Hospital state
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id || 'hosp-01');
  const [staffName, setStaffName] = useState('Dr. Sarah Adams');
  const [staffRoleTitle, setStaffRoleTitle] = useState('Lead Trauma Surgeon');
  const [staffEmail, setStaffEmail] = useState('s.adams@demohospital01.org');

  // Blood bank state
  const [selectedBankId, setSelectedBankId] = useState(bloodBanks[0]?.id || 'bb-01');
  const [bankStaffName, setBankStaffName] = useState('Dr. Marcus Vance');
  const [bankStaffRole, setBankStaffRole] = useState('Chief Transfusionist');
  const [bankStaffEmail, setBankStaffEmail] = useState('m.vance@metrobloodbank.org');

  // Donor state
  const [selectedDonorId, setSelectedDonorId] = useState(donors[0]?.id || 'donor-01');
  const [donorName, setDonorName] = useState(donors[0]?.name || 'Demo Donor 001');
  const [donorEmail, setDonorEmail] = useState(donors[0]?.email || 'donor001@example.com');

  // Admin state
  const [adminName, setAdminName] = useState('SysAdmin Sarah Miller');
  const [adminEmail, setAdminEmail] = useState('admin@bloodbridge.org');

  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (selectedRole === 'PATIENT') {
      if (!patientName.trim()) {
        setAuthError('Please enter a patient name.');
        return;
      }
      login('PATIENT', {
        name: patientName,
        email: patientEmail,
        patientId: `DP-${Math.floor(Math.random() * 800) + 100}`
      });
    } else if (selectedRole === 'HOSPITAL') {
      if (!staffName.trim()) {
        setAuthError('Please enter authorized hospital staff name.');
        return;
      }
      login('HOSPITAL', {
        name: `${staffName} (${staffRoleTitle})`,
        email: staffEmail,
        hospitalId: selectedHospitalId
      });
    } else if (selectedRole === 'BLOOD_BANK_STAFF') {
      if (!bankStaffName.trim()) {
        setAuthError('Please enter blood bank staff name.');
        return;
      }
      login('BLOOD_BANK_STAFF', {
        name: `${bankStaffName} (${bankStaffRole})`,
        email: bankStaffEmail,
        bloodBankId: selectedBankId
      });
    } else if (selectedRole === 'DONOR') {
      const activeDonor = donors.find(d => d.id === selectedDonorId) || donors[0];
      login('DONOR', {
        id: activeDonor.id,
        name: activeDonor.name,
        email: activeDonor.email || donorEmail,
        donorId: activeDonor.id
      });
    } else {
      login('ADMIN', {
        name: adminName,
        email: adminEmail
      });
    }
  };

  const handleQuickDemo = (role: 'PATIENT' | 'HOSPITAL' | 'BLOOD_BANK_STAFF' | 'DONOR' | 'ADMIN') => {
    if (role === 'PATIENT') {
      login('PATIENT', {
        name: 'Demo Patient 101',
        email: 'patient101@example.com',
        patientId: 'DP-101'
      });
    } else if (role === 'HOSPITAL') {
      login('HOSPITAL', {
        name: 'Dr. Sarah Adams (Trauma Team Lead)',
        email: 's.adams@demohospital01.org',
        hospitalId: 'hosp-01'
      });
    } else if (role === 'BLOOD_BANK_STAFF') {
      login('BLOOD_BANK_STAFF', {
        name: 'Dr. Marcus Vance (Chief Transfusionist)',
        email: 'm.vance@metrobloodbank.org',
        bloodBankId: 'bb-01'
      });
    } else if (role === 'DONOR') {
      const donor = donors[0];
      login('DONOR', {
        id: donor.id,
        name: donor.name,
        email: donor.email || 'donor001@example.com',
        donorId: donor.id
      });
    } else {
      login('ADMIN', {
        name: 'SysAdmin Sarah Miller',
        email: 'admin@bloodbridge.org'
      });
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>BloodBridge Security Portal</span>
          </div>
          <h1 className="text-xl font-black mt-1">Authenticate Session</h1>
          <p className="text-xs text-slate-300 mt-1">
            Access Patient, Hospital, or Blood Bank Requisition Console with synthetic credentials.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-medium flex items-center justify-between">
              <span>✕ {authError}</span>
              <button onClick={() => setAuthError(null)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
            </div>
          )}

          {/* Role Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Your Access Role:
            </label>
            <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedRole('PATIENT')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  selectedRole === 'PATIENT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤</span>
                <span className="truncate">Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('HOSPITAL')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  selectedRole === 'HOSPITAL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏥</span>
                <span className="truncate">Hospital</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('BLOOD_BANK_STAFF')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  selectedRole === 'BLOOD_BANK_STAFF'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🩸</span>
                <span className="truncate">Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('DONOR')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  selectedRole === 'DONOR'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>❤️</span>
                <span className="truncate">Donor</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('ADMIN')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  selectedRole === 'ADMIN'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚙️</span>
                <span className="truncate">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRole === 'PATIENT' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name (Synthetic)
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    placeholder="e.g. Demo Patient 101"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </>
            ) : selectedRole === 'HOSPITAL' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hospital Facility
                  </label>
                  <select
                    value={selectedHospitalId}
                    onChange={e => setSelectedHospitalId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} (Level {h.traumaCenterLevel} Trauma)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Staff Member Name
                    </label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={e => setStaffName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department / Clinical Title
                    </label>
                    <input
                      type="text"
                      required
                      value={staffRoleTitle}
                      onChange={e => setStaffRoleTitle(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Hospital Email
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </>
            ) : selectedRole === 'BLOOD_BANK_STAFF' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Bank Facility
                  </label>
                  <select
                    value={selectedBankId}
                    onChange={e => setSelectedBankId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  >
                    {bloodBanks.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Staff Member Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bankStaffName}
                      onChange={e => setBankStaffName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Designation
                    </label>
                    <input
                      type="text"
                      required
                      value={bankStaffRole}
                      onChange={e => setBankStaffRole(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility Staff Email
                  </label>
                  <input
                    type="email"
                    required
                    value={bankStaffEmail}
                    onChange={e => setBankStaffEmail(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </>
            ) : selectedRole === 'DONOR' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Registered Donor Profile
                  </label>
                  <select
                    value={selectedDonorId}
                    onChange={e => {
                      const id = e.target.value;
                      setSelectedDonorId(id);
                      const d = donors.find(x => x.id === id);
                      if (d) {
                        setDonorName(d.name);
                        setDonorEmail(d.email || `${d.code.toLowerCase()}@example.com`);
                      }
                    }}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  >
                    {donors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.bloodGroup} · {d.code} · {d.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Donor Name
                    </label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Donor Email
                    </label>
                    <input
                      type="email"
                      required
                      value={donorEmail}
                      onChange={e => setDonorEmail(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Administrator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Administrator Email (Privileged)
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              Sign In to {
                selectedRole === 'PATIENT' ? 'Patient Portal' :
                selectedRole === 'HOSPITAL' ? 'Hospital Portal' :
                selectedRole === 'BLOOD_BANK_STAFF' ? 'Blood Bank Console' :
                selectedRole === 'DONOR' ? 'Donor Hub' :
                'Admin Management Console'
              } ➔
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-3 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              1-Click Fast Sandbox Logins:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('PATIENT')}
                className="p-2 text-xs text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="font-bold text-slate-800">Patient</div>
                <div className="text-[10px] text-slate-500 truncate">DP-101</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('HOSPITAL')}
                className="p-2 text-xs text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="font-bold text-slate-800">Hospital</div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Adams</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('BLOOD_BANK_STAFF')}
                className="p-2 text-xs text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="font-bold text-slate-800">Blood Bank</div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('DONOR')}
                className="p-2 text-xs text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="font-bold text-slate-800">Donor</div>
                <div className="text-[10px] text-slate-500 truncate">Demo 001 (O-)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="p-2 text-xs text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="font-bold text-slate-800">Admin</div>
                <div className="text-[10px] text-slate-500 truncate">SysAdmin Sarah</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

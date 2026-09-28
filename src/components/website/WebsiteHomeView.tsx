import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent } from '../../types/bloodbridge';
import { RBC_COMPATIBILITY_MAP } from '../../utils/compatibility';

interface WebsiteHomeViewProps {
  onOpenRequisition: (preset?: { group?: BloodGroup; comp?: BloodComponent }) => void;
  onOpenFindBlood: () => void;
  onOpenDonate: () => void;
  onOpenCompatibility: () => void;
  onOpenHospitalPortal: () => void;
  onOpenBloodBankPortal: () => void;
  onOpenAiAssistant: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const WebsiteHomeView: React.FC<WebsiteHomeViewProps> = ({
  onOpenRequisition,
  onOpenFindBlood,
  onOpenDonate,
  onOpenCompatibility,
  onOpenHospitalPortal,
  onOpenBloodBankPortal,
  onOpenAiAssistant
}) => {
  const { bloodBanks, requests, donors } = useBloodBridge();

  // Quick finder state
  const [quickGroup, setQuickGroup] = useState<BloodGroup>('O-');
  const [quickComp, setQuickComp] = useState<BloodComponent>('PRBC');

  // Compatibility teaser state
  const [testBloodGroup, setTestBloodGroup] = useState<BloodGroup>('O-');

  // Calculate live numbers
  let totalGridUnits = 0;
  bloodBanks.forEach((b) => {
    Object.values(b.inventory || {}).forEach((inv) => {
      totalGridUnits += inv.unitsAvailable;
    });
  });

  const availableDonorsCount = donors.filter((d) => d.isEligible && d.status === 'AVAILABLE').length;

  // Filter matching banks for quick finder
  const matchingInventory = bloodBanks
    .map((bank, index) => {
      const invKey = `${quickGroup}_${quickComp}`;
      const item = bank.inventory ? bank.inventory[invKey] : undefined;
      return {
        bank,
        unitsAvailable: item ? item.unitsAvailable : 0,
        unitsReserved: item ? item.unitsReserved : 0,
        distanceKm: 1.8 + index * 1.4
      };
    })
    .sort((a, b) => b.unitsAvailable - a.unitsAvailable);

  const compatibleDonorsForTest = RBC_COMPATIBILITY_MAP[testBloodGroup] || [testBloodGroup];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>24/7 Regional Emergency Blood Coordination Grid</span>
            <span aria-hidden="true" className="text-rose-500">·</span>
            <span className="text-white font-mono font-bold">18 Min Avg Response</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Every Second Matters.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-300 to-amber-200">
              Connecting Verified Blood
            </span><br />
            With Critical Care in Real-Time.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            BloodBridge synchronizes accredited trauma centers, certified cold-chain repositories, and verified on-call volunteer donors with 100% deterministic ABO/Rh compatibility matching.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenRequisition({ group: 'O-', comp: 'PRBC' })}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-rose-600/30 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <span>🚨 Request Emergency Blood</span>
              <span className="text-xs bg-rose-700 px-2 py-0.5 rounded font-mono">Code Red</span>
            </button>

            <button
              onClick={onOpenFindBlood}
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>🔍 Find Live Stock Near You</span>
            </button>

            <button
              onClick={onOpenDonate}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 transition-all"
            >
              <span>💉 Volunteer to Donate</span>
            </button>
          </div>

          {/* Paramedic Assistant Shortcut */}
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
            <span>Inbound trauma call?</span>
            <button
              onClick={onOpenAiAssistant}
              className="text-purple-300 hover:text-purple-200 font-semibold underline underline-offset-2 flex items-center gap-1"
            >
              <span>⚡ Fast-parse unstructured paramedic notes</span>
            </button>
          </div>
        </div>

        {/* Live Grid Metrics Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-300">
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {totalGridUnits}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Available Units in Grid
            </div>
            <div className="text-[11px] text-slate-500">Live verified cold-chain</div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
              18 min
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Avg Emergency Delivery
            </div>
            <div className="text-[11px] text-slate-500">Trauma bay wheels-up</div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {availableDonorsCount}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Standby Donors On-Call
            </div>
            <div className="text-[11px] text-slate-500">Instant geofenced alert</div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">
              100%
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Deterministic Safety
            </div>
            <div className="text-[11px] text-slate-500">Zero probabilistic AI</div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Live Blood Stock Quick-Finder Widget */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
              <span>Instant Public Locator</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Real-Time Cold-Chain Telemetry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Check Verified Blood Availability Across Regional Repositories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select your required blood group and component to inspect verified unit reserves in the Bay Area trauma network.
            </p>
          </div>

          <button
            onClick={onOpenFindBlood}
            className="shrink-0 text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
          >
            <span>Open Advanced Search</span>
            <span>→</span>
          </button>
        </div>

        {/* Interactive Selectors */}
        <div className="space-y-4 pt-2">
          {/* Blood Group Selectors */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Blood Group
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setQuickGroup(bg)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    quickGroup === bg
                      ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-rose-300'
                  }`}
                >
                  {bg}
                  {bg === 'O-' && <span className="block text-[9px] opacity-75 font-normal">Univ. RBC</span>}
                  {bg === 'AB+' && <span className="block text-[9px] opacity-75 font-normal">Univ. Plasma</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Component Selector */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Blood Component
            </span>
            <div className="flex flex-wrap gap-2">
              {(['PRBC', 'PLATELETS', 'FFP', 'WHOLE_BLOOD', 'CRYOPRECIPITATE'] as BloodComponent[]).map((comp) => (
                <button
                  key={comp}
                  onClick={() => setQuickComp(comp)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    quickComp === comp
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Match Results Table */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Verified Repositories with {quickGroup} {quickComp}</span>
            <span className="font-mono text-slate-500">Live Cold Chain Temperature: 2°C–6°C</span>
          </div>

          <div className="divide-y divide-slate-200">
            {matchingInventory.slice(0, 3).map((item) => (
              <div
                key={item.bank.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.bank.name}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                      Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.bank.address} · Approx. <strong className="text-slate-700">{item.distanceKm} km</strong> from City Center
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-lg font-black text-rose-600">
                      {item.unitsAvailable} <span className="text-xs text-slate-500 font-normal font-sans">units ready</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.unitsReserved} units reserved
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenRequisition({ group: quickGroup, comp: quickComp })}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The 4-Step Life-Saving Lifecycle */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Engineered For Speed & Safety
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How The BloodBridge Network Operates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Eliminating fragmented phone calls with a real-time, automated emergency supply chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black font-mono text-rose-100 absolute top-4 right-4 select-none">
              01
            </span>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <h3 className="text-base font-bold text-slate-900">
              1. Rapid Requisition
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Attending physicians, trauma surgeons, or patient families initiate an emergency request specifying patient details, required component, and urgency tier.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black font-mono text-blue-100 absolute top-4 right-4 select-none">
              02
            </span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              🧬
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2. Deterministic Match
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our hardcoded matching engine scans the entire regional repository grid in &lt;50ms, identifying exact ABO/Rh matches and safe iso-compatible components.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black font-mono text-emerald-100 absolute top-4 right-4 select-none">
              03
            </span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              ❄️
            </div>
            <h3 className="text-base font-bold text-slate-900">
              3. Cold-Chain Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Immediate electronic lock reserves the units. Certified temperature-controlled medical couriers receive automated dispatch with live GPS route optimization.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black font-mono text-purple-100 absolute top-4 right-4 select-none">
              04
            </span>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              📢
            </div>
            <h3 className="text-base font-bold text-slate-900">
              4. Standby Mobilization
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If local repository stocks fall below critical safety thresholds, automated geofenced alerts instantly notify nearby eligible voluntary donors to replenish supply.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive ABO/Rh Compatibility Teaser */}
      <section className="bg-gradient-to-r from-rose-950 to-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-rose-900 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Immunohematology Rules
            </span>
            <h2 className="text-2xl font-black text-white">
              Deterministic Blood Compatibility
            </h2>
            <p className="text-xs text-slate-300">
              Select a recipient blood group to test safe donor types calculated by clinical antigen rules.
            </p>
          </div>

          <button
            onClick={onOpenCompatibility}
            className="px-4 py-2 bg-white text-rose-950 font-bold text-xs rounded-lg hover:bg-rose-50 transition-colors shrink-0"
          >
            Explore Complete Compatibility Guide →
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setTestBloodGroup(bg)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  testBloodGroup === bg
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">
                Recipient Type: <strong className="text-white text-sm font-mono">{testBloodGroup}</strong>
              </span>
              <span className="text-xs text-emerald-400 font-semibold mt-1 block">
                Can safely receive Packed Red Blood Cells (PRBC) from:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {compatibleDonorsForTest.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded font-mono font-bold text-xs"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6 space-y-1">
              {testBloodGroup === 'O-' && (
                <div className="text-rose-300 font-semibold">
                  ★ Universal Red Cell Donor: O- cells have neither A, B, nor Rh antigens.
                </div>
              )}
              {testBloodGroup === 'AB+' && (
                <div className="text-blue-300 font-semibold">
                  ★ Universal Red Cell Recipient: Can safely receive red cells from all 8 blood groups!
                </div>
              )}
              <div className="text-[11px] text-slate-500">
                Rule verified against AABB Standards for Blood Banks & Transfusion Services.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Who We Serve (Three Dedicated Audience Pillars) */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Tailored For Healthcare Stakeholders
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Integrated Solutions For Every Role
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Hospitals */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-blue-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl">
                🏥
              </div>
              <h3 className="text-lg font-black text-slate-900">
                For Trauma Hospitals & ERs
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct integration with emergency department intake. Automatic Massive Transfusion Protocol (MTP) bundling, live courier telemetry, and guaranteed deterministic compatibility.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>1-click Code Red emergency orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Multi-source fulfillment from nearby banks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Paramedic note parsing assistant</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenHospitalPortal}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Access Hospital Trauma Portal</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 2: Blood Banks */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-emerald-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
                🧪
              </div>
              <h3 className="text-lg font-black text-slate-900">
                For Blood Banks & Repositories
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized inventory ledger with automated expiry countdowns, cold-chain temperature telemetry, instant electronic reservation locks, and donor recruitment coordination.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Continuous 2°C–6°C cold-chain tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Wastage prevention & dynamic re-allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Fast batch stock update interface</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenBloodBankPortal}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Access Blood Bank Console</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 3: Donors */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-rose-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
                ❤️
              </div>
              <h3 className="text-lg font-black text-slate-900">
                For Volunteer Donors
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join our life-saving on-call standby registry. Receive notifications only when your specific blood group is needed, track your 56-day cooldown interval, and earn digital donation certificates.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Standby alerts for emergency shortages</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Strict donor privacy (contact masked)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>56-day clinical interval reminders</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenDonate}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Register as Volunteer Donor</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Medical Governance & Trust Guarantee */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              AABB & WHO Aligned Safety Framework
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            Zero Guesswork. Zero Probabilistic AI in Transfusion Medicine.
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In transfusion medicine, acute hemolytic reactions can be catastrophic. That is why BloodBridge enforces a strict architectural policy: AI is strictly limited to clerical note parsing. All compatibility calculations, donor interval cooldowns, and crossmatching logic are hardcoded deterministically from clinical immunohematology rules.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              FDA 21 CFR Part 606 Ready
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Strict 56-Day Cooldown Algorithms
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Continuous Cold-Chain Logging
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Masked Donor Contact Protection
            </span>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Help Save Lives Today?
          </h2>
          <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
            Whether you are an emergency hospital looking to streamline blood requisitions or a compassionate citizen ready to donate, BloodBridge is here 24/7.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onOpenRequisition()}
            className="px-6 py-3.5 bg-white text-rose-900 hover:bg-rose-50 font-black text-sm rounded-xl shadow-lg transition-all"
          >
            Create Emergency Blood Requisition
          </button>
          <button
            onClick={onOpenDonate}
            className="px-6 py-3.5 bg-rose-900/60 hover:bg-rose-900 text-white font-bold text-sm rounded-xl border border-rose-400/40 transition-all"
          >
            Register As An On-Call Donor
          </button>
        </div>
      </section>
    </div>
  );
};

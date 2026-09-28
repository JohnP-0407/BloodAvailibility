import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface AdminDashboardViewProps {
  onOpenUsers: () => void;
  onOpenBloodBanks: () => void;
  onOpenVerification: () => void;
  onOpenAnalytics: () => void;
  onOpenAuditLogs: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onOpenUsers,
  onOpenBloodBanks,
  onOpenVerification,
  onOpenAnalytics,
  onOpenAuditLogs
}) => {
  const {
    bloodBanks,
    hospitals,
    donors,
    requests,
    systemUsers,
    shortageReport,
    triggerScenario
  } = useBloodBridge();

  const [notification, setNotification] = useState<string | null>(null);

  const fulfilledCount = requests.filter(r => r.status === 'FULFILLED').length;
  const activeCount = requests.filter(r => r.status !== 'FULFILLED' && r.status !== 'CANCELLED' && r.status !== 'REJECTED').length;
  const pendingCount = requests.filter(r => r.status === 'SEARCHING' || r.status === 'PENDING_CONFIRMATION').length;
  const fulfillmentRate = requests.length > 0 ? Math.round((fulfilledCount / requests.length) * 100) : 100;
  const verifiedBankCount = bloodBanks.filter(b => b.verified).length;

  const handleTrigger = (scenario: 'MASS_CASUALTY' | 'PLATELET_CRISIS' | 'DONOR_MOBILIZATION' | 'RESET_DEMO', label: string) => {
    triggerScenario(scenario);
    setNotification(`Executed Scenario: ${label}`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              System Administration & Platform Command
            </h1>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Deterministic Rules Engine Active
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Network Oversight</span>
            <span aria-hidden="true">·</span>
            <span>AABB & WHO Aligned Protocols</span>
            <span aria-hidden="true">·</span>
            <span>Tamper-Evident Safety Ledger</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAnalytics}
            className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            System Analytics ➔
          </button>
        </div>
      </div>

      <MedicalSafetyBadge />

      {notification && (
        <div className="p-3 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-between shadow-md">
          <span>⚡ {notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Shortage Alert Banner if any groups critical */}
      {shortageReport && shortageReport.criticalGroups.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              <span>INVENTORY SHORTAGE INDICATOR: {shortageReport.criticalGroups.join(', ')} RESERVES LOW</span>
            </div>
            <p className="text-amber-800 text-[11px]">
              Calculated by deterministic burn rate formula. Estimated buffer &le; 3 days in regional trauma network.
            </p>
          </div>

          <button
            onClick={onOpenAnalytics}
            className="px-3 py-1 font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg shadow-xs whitespace-nowrap"
          >
            Inspect Shortage Report ➔
          </button>
        </div>
      )}

      {/* Metric Cards adhering to SaaS constitution */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Registered Users</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {systemUsers.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across patients, hospitals & staff
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Role accounts</span>
            <button onClick={onOpenUsers} className="text-rose-600 hover:text-rose-800 font-semibold">
              Manage Users ➔
            </button>
          </div>
        </div>

        {/* Total Donors */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Volunteer Donors</span>
            <div className="text-2xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
              {donors.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {donors.filter(d => d.availability !== 'UNAVAILABLE').length} on active standby
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Community roster</span>
            <button onClick={onOpenUsers} className="text-rose-600 hover:text-rose-800 font-semibold">
              View Roster ➔
            </button>
          </div>
        </div>

        {/* Blood Banks & Verification */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Blood Banks</span>
            <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
              {bloodBanks.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {verifiedBankCount} of {bloodBanks.length} verified & compliant
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">100% Cold Chain</span>
            <button onClick={onOpenVerification} className="text-rose-600 hover:text-rose-800 font-semibold">
              Verification ➔
            </button>
          </div>
        </div>

        {/* Active & Pending Requisitions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Requisitions</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {activeCount} <span className="text-sm font-normal text-slate-500">({pendingCount} pending)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {fulfillmentRate}% lifetime fulfillment rate
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">{fulfilledCount} fulfilled</span>
            <button onClick={onOpenAnalytics} className="text-rose-600 hover:text-rose-800 font-semibold">
              Analytics ➔
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Stress-Testing Console */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Demo Sandbox Scenario Stress-Testing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trigger live surges to evaluate deterministic matching, blood-bank reserve exhaustion, and donor SOS broadcasts.
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Interactive Test Suite
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleTrigger('MASS_CASUALTY', 'Mass Casualty Highway Collision')}
            className="p-3.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-left transition-colors group cursor-pointer"
          >
            <div className="text-xs font-bold text-red-900 group-hover:text-red-950 flex items-center justify-between">
              <span>Mass Casualty Event</span>
              <span>➔</span>
            </div>
            <div className="text-[11px] text-red-700 mt-1 leading-relaxed">
              Simulates highway collision: 4 units O- PRBC. Exhausts local stock and triggers donor alerts.
            </div>
          </button>

          <button
            onClick={() => handleTrigger('PLATELET_CRISIS', 'Regional Dengue / Platelet Shortage')}
            className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-colors group cursor-pointer"
          >
            <div className="text-xs font-bold text-amber-900 group-hover:text-amber-950 flex items-center justify-between">
              <span>Platelet Surge Crisis</span>
              <span>➔</span>
            </div>
            <div className="text-[11px] text-amber-800 mt-1 leading-relaxed">
              Simulates oncology surge: 5 units platelets requested at Westside Pediatric Center.
            </div>
          </button>

          <button
            onClick={() => handleTrigger('DONOR_MOBILIZATION', 'Community Donor Mobilization')}
            className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors group cursor-pointer"
          >
            <div className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950 flex items-center justify-between">
              <span>Donor Mobilization</span>
              <span>➔</span>
            </div>
            <div className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
              Nearby registered volunteers respond and accept open hospital emergency broadcasts.
            </div>
          </button>

          <button
            onClick={() => handleTrigger('RESET_DEMO', 'Reset Sandbox State')}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-left transition-colors group cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Reset Sandbox</span>
              <span>↺</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Restores baseline synthetic data for blood banks, hospitals, requests, and users.
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Blood Banks Status & Recent System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Blood Banks Quick Overview */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Affiliated Blood Banks</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cold-chain certified facilities</p>
            </div>
            <button onClick={onOpenBloodBanks} className="text-xs font-semibold text-rose-600 hover:text-rose-800">
              Manage Banks ➔
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {bloodBanks.map(bank => (
              <div key={bank.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{bank.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{bank.code}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {bank.address}, {bank.city} · {bank.operatingHours}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                    bank.verified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {bank.verified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Hospital Trauma Hubs Overview */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Trauma Centers & Hospitals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct emergency requisition endpoints</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{hospitals.length} Connected</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {hospitals.map(hosp => (
              <div key={hosp.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{hosp.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{hosp.code}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Level {hosp.traumaCenterLevel} Trauma Center · {hosp.address}
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-600">
                  {hosp.contactNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

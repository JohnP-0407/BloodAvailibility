import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';

interface BloodBanksPageProps {
  onOpenBloodBankLogin: () => void;
  onOpenInventorySearch: () => void;
}

export const BloodBanksPage: React.FC<BloodBanksPageProps> = ({
  onOpenBloodBankLogin,
  onOpenInventorySearch
}) => {
  const { bloodBanks } = useBloodBridge();

  let totalGridUnits = 0;
  bloodBanks.forEach((b) => {
    Object.values(b.inventory || {}).forEach((inv) => {
      totalGridUnits += inv.unitsAvailable;
    });
  });

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
            <span>🧪 Regional Cold-Chain Repositories</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Accredited Blood Banks & Cold-Chain Logistics Grid.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            BloodBridge synchronizes licensed regional blood repositories, automated inventory audits, temperature-controlled cryo-storage, and immediate reserve dispatch to prevent wastage and eliminate acute shortages.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenBloodBankLogin}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>🧪 Blood Bank Staff Portal Login</span>
            </button>

            <button
              onClick={onOpenInventorySearch}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-sm border border-slate-700 transition-all"
            >
              Explore Public Stock Search →
            </button>
          </div>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {bloodBanks.length}
          </div>
          <div className="text-xs font-bold text-slate-800">Accredited Repositories</div>
          <div className="text-[11px] text-slate-500">Licensed AABB/FDA compliant centers</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {totalGridUnits}
          </div>
          <div className="text-xs font-bold text-slate-800">Total Units in Reserve</div>
          <div className="text-[11px] text-slate-500">PRBC, Platelets, FFP & Whole Blood</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            2°C - 6°C
          </div>
          <div className="text-xs font-bold text-slate-800">PRBC Cold-Chain Standard</div>
          <div className="text-[11px] text-slate-500">Continuous telemetry sensor monitoring</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">
            -18°C
          </div>
          <div className="text-xs font-bold text-slate-800">Plasma Cryo-Freezer Target</div>
          <div className="text-[11px] text-slate-500">Rapid thawing for emergency coagulation</div>
        </div>
      </div>

      {/* Blood Bank Directory */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Network Facilities
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Connected Blood Repositories
            </h2>
            <p className="text-xs text-slate-500">
              Each facility maintains synchronized inventory counts and direct electronic dispatch channels with regional trauma centers.
            </p>
          </div>

          <button
            onClick={onOpenBloodBankLogin}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-100"
          >
            Staff Direct Access ➔
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bloodBanks.map((bank) => {
            let bankUnits = 0;
            Object.values(bank.inventory || {}).forEach((inv) => {
              bankUnits += inv.unitsAvailable;
            });

            return (
              <div
                key={bank.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      {bank.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                    {bank.name}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {bank.address}, {bank.city}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Reserve Stock:</span>
                    <span className="font-mono font-bold text-slate-900">{bankUnits} units</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Operating Hours:</span>
                    <span className="font-mono text-[11px] text-slate-700">{bank.operatingHours}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Direct Contact:</span>
                    <span className="font-mono text-emerald-700 font-semibold">{bank.contactNumber}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

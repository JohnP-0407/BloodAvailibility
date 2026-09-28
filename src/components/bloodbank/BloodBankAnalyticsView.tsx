import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface BloodBankAnalyticsViewProps {
  onBackToDashboard: () => void;
  onOpenInventory: () => void;
  onOpenStockUpdate: () => void;
}

export const BloodBankAnalyticsView: React.FC<BloodBankAnalyticsViewProps> = ({
  onBackToDashboard,
  onOpenInventory,
  onOpenStockUpdate
}) => {
  const { bloodBanks, activeBloodBankId, requests } = useBloodBridge();

  const currentBank = bloodBanks.find(b => b.id === activeBloodBankId) || bloodBanks[0];

  // 1. Prepare ABO/Rh distribution data for PRBC
  const aboDistributionData = BLOOD_GROUPS.map(bg => {
    const key = `${bg}_PRBC`;
    const item = currentBank.inventory[key];
    const units = item ? item.unitsAvailable : 0;
    const threshold = item ? item.criticalThreshold : 5;
    return {
      bloodGroup: bg,
      units,
      threshold,
      isLow: units <= threshold
    };
  });

  // 2. Prepare component volume data
  const componentDistributionData = BLOOD_COMPONENTS.map(comp => {
    let totalUnits = 0;
    BLOOD_GROUPS.forEach(bg => {
      const key = `${bg}_${comp.id}`;
      const item = currentBank.inventory[key];
      if (item) totalUnits += item.unitsAvailable;
    });
    return {
      name: comp.label.split(' ')[0],
      fullName: comp.label,
      value: totalUnits
    };
  });

  const COLORS = ['#e11d48', '#f97316', '#3b82f6', '#8b5cf6', '#10b981'];

  // 3. Requisition outflow calculation
  const bankRequests = requests.filter(r =>
    r.matchedSources?.some(s => s.sourceType === 'BLOOD_BANK' && s.sourceId === currentBank.id)
  );

  const emergencyCount = bankRequests.filter(r => r.urgency === 'CRITICAL').length;
  const routineCount = bankRequests.filter(r => r.urgency !== 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Facility Analytics & Inventory Intelligence
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-0.5">
            Blood Bank Inventory Analytics · {currentBank.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cold-chain capacity metrics, group reserves, and demand velocity integration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenInventory}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Live Inventory Grid ➔
          </button>
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Integration Notice Banner */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="font-bold flex items-center gap-1.5">
            <span>📡 Demand Analytics Engine Integration</span>
            <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.2 rounded font-semibold uppercase">
              Member 3/4 Shared Contract
            </span>
          </div>
          <p className="text-purple-800 text-[11px]">
            This analytics view receives synthetic telemetry from the BloodBridge core matching and demand forecasting engine.
          </p>
        </div>
        <button
          onClick={onOpenStockUpdate}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-2xs"
        >
          Adjust Safety Buffers
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: ABO/Rh PRBC Available Stock vs Buffer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                ABO/Rh Red Blood Cell (PRBC) Inventory Levels
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current available units per blood group (red bars represent stock at or below safety buffer).
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">PRBC</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aboDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: any, name: any) => [`${value} units`, name === 'units' ? 'Available' : 'Threshold']}
                />
                <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                  {aboDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isLow ? '#ef4444' : '#e11d48'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-600 inline-block"></span>
              <span>Healthy Inventory Buffer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
              <span>Low / Critical Buffer Warning</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Component Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Component Reserve Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total units across PRBC, Whole Blood, Platelets, FFP, and Cryoprecipitate.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">All Groups</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={componentDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {componentDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} units`, item.payload.fullName]}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cold Chain & Expiry Viability Risk Monitors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Component Viability & Shelf-Life Telemetry
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Platelet Concentrates</span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">High Turnover</span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900">4-5 Days</div>
            <p className="text-[11px] text-slate-500">
              Stored under continuous agitation at +20°C to +24°C. Rapid depletion risk during surgical surges.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Packed Red Blood Cells</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Cold Chain</span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900">28-42 Days</div>
            <p className="text-[11px] text-slate-500">
              Maintained strictly between +2°C and +6°C. Monitored for hemolysis and donor phenotype compliance.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Fresh Frozen Plasma & Cryo</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Ultra-Cold</span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900">Up to 12 Months</div>
            <p className="text-[11px] text-slate-500">
              Preserved at ≤ -18°C. Requires rapid controlled water bath thaw prior to transfusion dispatch.
            </p>
          </div>
        </div>
      </div>

      <MedicalSafetyBadge />
    </div>
  );
};

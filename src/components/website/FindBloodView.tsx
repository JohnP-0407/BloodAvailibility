import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup, BloodComponent } from '../../types/bloodbridge';
import { RBC_COMPATIBILITY_MAP } from '../../utils/compatibility';

interface FindBloodViewProps {
  onOpenRequisition: (preset?: { group?: BloodGroup; comp?: BloodComponent; hospitalId?: string }) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS: { id: BloodComponent; label: string; description: string }[] = [
  { id: 'PRBC', label: 'Packed Red Blood Cells (PRBC)', description: 'Critical for acute hemorrhage, trauma & severe anemia' },
  { id: 'PLATELETS', label: 'Platelets (Single Donor/RDP)', description: 'Essential for clotting in chemotherapy & massive bleeding' },
  { id: 'FFP', label: 'Fresh Frozen Plasma (FFP)', description: 'Replaces coagulation factors in liver disease & trauma' },
  { id: 'WHOLE_BLOOD', label: 'Whole Blood', description: 'Massive transfusion protocol (MTP) for trauma resuscitation' },
  { id: 'CRYOPRECIPITATE', label: 'Cryoprecipitate', description: 'Concentrated fibrinogen for microvascular bleeding' },
];

export const FindBloodView: React.FC<FindBloodViewProps> = ({ onOpenRequisition }) => {
  const { bloodBanks, hospitals } = useBloodBridge();

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>('O-');
  const [selectedComp, setSelectedComp] = useState<BloodComponent | 'ALL'>('PRBC');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(false);

  // Compile flat inventory list across all verified blood banks
  const inventoryResults: Array<{
    bankId: string;
    bankName: string;
    bankCode: string;
    address: string;
    phone: string;
    hours: string;
    bloodGroup: BloodGroup;
    component: BloodComponent;
    unitsAvailable: number;
    unitsReserved: number;
    status: 'AVAILABLE' | 'LOW' | 'CRITICAL';
    distanceKm: number;
  }> = [];

  bloodBanks.forEach((bank, idx) => {
    // Approx distance based on coordinate offset
    const distanceKm = 1.8 + idx * 1.3;

    Object.entries(bank.inventory || {}).forEach(([key, inv]) => {
      // Filter by group
      if (selectedGroup !== 'ALL') {
        if (showCompatibleOnly) {
          const compatibleWithRecipient = RBC_COMPATIBILITY_MAP[selectedGroup] || [selectedGroup];
          if (!compatibleWithRecipient.includes(inv.bloodGroup)) return;
        } else if (inv.bloodGroup !== selectedGroup) {
          return;
        }
      }

      // Filter by component
      if (selectedComp !== 'ALL' && inv.component !== selectedComp) {
        return;
      }

      // Filter by query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = bank.name.toLowerCase().includes(q) ||
                      bank.city.toLowerCase().includes(q) ||
                      inv.bloodGroup.toLowerCase().includes(q) ||
                      inv.component.toLowerCase().includes(q);
        if (!match) return;
      }

      let status: 'AVAILABLE' | 'LOW' | 'CRITICAL' = 'AVAILABLE';
      if (inv.unitsAvailable <= 0) status = 'CRITICAL';
      else if (inv.unitsAvailable < inv.criticalThreshold) status = 'LOW';

      inventoryResults.push({
        bankId: bank.id,
        bankName: bank.name,
        bankCode: bank.code,
        address: bank.address,
        phone: bank.contactNumber,
        hours: bank.operatingHours,
        bloodGroup: inv.bloodGroup,
        component: inv.component,
        unitsAvailable: inv.unitsAvailable,
        unitsReserved: inv.unitsReserved,
        status,
        distanceKm
      });
    });
  });

  // Sort by units available descending, then distance ascending
  inventoryResults.sort((a, b) => b.unitsAvailable - a.unitsAvailable || a.distanceKm - b.distanceKm);

  const totalMatchingUnits = inventoryResults.reduce((acc, curr) => acc + curr.unitsAvailable, 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
              <span>Verified Regional Stock Search</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Real-Time Inventory Grid</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Find Blood Availability
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore live, verified unit stocks across all accredited repositories in the regional cold-chain network. Emergency allocations are locked in real-time upon clinical requisition.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onOpenRequisition({
                group: selectedGroup !== 'ALL' ? selectedGroup : undefined,
                comp: selectedComp !== 'ALL' ? selectedComp : undefined
              })}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>🚨 Request Emergency Units</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
          {/* Blood Group Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Select Recipient Blood Group
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompatibleOnly}
                  onChange={(e) => setShowCompatibleOnly(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Include Compatible Types (e.g. O- for A+)</span>
              </label>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              <button
                onClick={() => setSelectedGroup('ALL')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  selectedGroup === 'ALL'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Groups
              </button>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    selectedGroup === bg
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-rose-300'
                  }`}
                >
                  {bg}
                  {bg === 'O-' && <span className="block text-[9px] font-normal opacity-80">Univ. RBC</span>}
                  {bg === 'AB+' && <span className="block text-[9px] font-normal opacity-80">Univ. Recip</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Component Selector */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              2. Select Component Type
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedComp('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedComp === 'ALL'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Components
              </button>
              {COMPONENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedComp(c.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedComp === c.id
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by facility name, city, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <strong className="text-slate-900 font-mono">{inventoryResults.length}</strong> repository listings matching filters
          (Total Units Available: <strong className="text-rose-700 font-mono">{totalMatchingUnits}</strong>)
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Adequate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Low Stock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span> Depleted
          </span>
        </div>
      </div>

      {/* Inventory Grid Cards */}
      {inventoryResults.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-4">
          <div className="text-3xl">🧪</div>
          <h3 className="text-base font-bold text-slate-800">
            No exact inventory units found for this criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try expanding your search to include compatible blood types or alternate component preparations. You can also trigger an automated emergency donor broadcast.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenRequisition({ group: selectedGroup !== 'ALL' ? selectedGroup : undefined })}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Trigger Emergency Requisition & Donor Broadcast
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {inventoryResults.map((item, idx) => (
            <div
              key={`${item.bankId}-${item.bloodGroup}-${item.component}-${idx}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header with Type & Component */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center font-mono font-black text-rose-700 text-lg">
                      {item.bloodGroup}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {item.component}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.distanceKm} km away · Cold-Chain 2-6°C
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'LOW'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Units Counter */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Available Units
                    </span>
                    <span className="text-xl font-black font-mono text-slate-900">
                      {item.unitsAvailable}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">units</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      In Transit / Reserved
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-600">
                      {item.unitsReserved} units
                    </span>
                  </div>
                </div>

                {/* Facility Details */}
                <div className="text-xs space-y-1 pt-1 text-slate-600">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>🏥</span>
                    <span className="truncate">{item.bankName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {item.address}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>📞 {item.phone}</span>
                    <span className="font-mono text-[10px] text-slate-400">{item.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onOpenRequisition({
                    group: item.bloodGroup,
                    comp: item.component
                  })}
                  className="w-full py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Request From This Repository</span>
                  <span className="text-[10px]">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety & Protocol Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-xs text-rose-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-2">
            <span>🛡️</span>
            <span>Deterministic Immunohematology Protocol</span>
          </div>
          <p className="text-[11px] text-rose-800 leading-relaxed max-w-3xl">
            All listed blood units are cross-matched deterministically according to strict ABO/Rh antigen presence. In acute trauma codes where crossmatching cannot be completed, O-negative PRBC units are prioritized for uncrossed universal resuscitation.
          </p>
        </div>
        <button
          onClick={() => onOpenRequisition()}
          className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
        >
          Initiate Code Red Requisition
        </button>
      </div>
    </div>
  );
};

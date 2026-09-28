import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodComponent, BloodGroup } from '../../types/bloodbridge';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface BloodBankDashboardViewProps {
  onOpenInventory: () => void;
  onOpenStockUpdate: (initialGroup?: BloodGroup, initialComp?: BloodComponent) => void;
  onOpenIncomingRequests: () => void;
  onOpenRequestDetails: (id: string) => void;
  onOpenAnalytics: () => void;
}

export const BloodBankDashboardView: React.FC<BloodBankDashboardViewProps> = ({
  onOpenInventory,
  onOpenStockUpdate,
  onOpenIncomingRequests,
  onOpenRequestDetails,
  onOpenAnalytics
}) => {
  const {
    bloodBanks,
    activeBloodBankId,
    setActiveBloodBankId,
    currentUser,
    userRole,
    requests,
    auditLogs
  } = useBloodBridge();

  const currentBank = bloodBanks.find(b => b.id === activeBloodBankId) || bloodBanks[0];
  const isAssignedBank = userRole === 'BLOOD_BANK_STAFF' && currentUser.bloodBankId === currentBank.id;

  // 1. Calculate Total Available & Reserved Units
  let totalAvailableUnits = 0;
  let totalReservedUnits = 0;
  const lowStockItems: {
    bloodGroup: BloodGroup;
    component: BloodComponent;
    unitsAvailable: number;
    threshold: number;
    status: 'LOW' | 'CRITICAL' | 'UNAVAILABLE';
  }[] = [];

  Object.values(currentBank.inventory).forEach(inv => {
    totalAvailableUnits += inv.unitsAvailable || 0;
    totalReservedUnits += inv.unitsReserved || 0;
    
    if (inv.unitsAvailable <= 0) {
      lowStockItems.push({
        bloodGroup: inv.bloodGroup,
        component: inv.component,
        unitsAvailable: 0,
        threshold: inv.criticalThreshold,
        status: 'UNAVAILABLE'
      });
    } else if (inv.unitsAvailable <= inv.criticalThreshold) {
      lowStockItems.push({
        bloodGroup: inv.bloodGroup,
        component: inv.component,
        unitsAvailable: inv.unitsAvailable,
        threshold: inv.criticalThreshold,
        status: 'CRITICAL'
      });
    } else if (inv.unitsAvailable <= Math.round(inv.criticalThreshold * 1.5)) {
      lowStockItems.push({
        bloodGroup: inv.bloodGroup,
        component: inv.component,
        unitsAvailable: inv.unitsAvailable,
        threshold: inv.criticalThreshold,
        status: 'LOW'
      });
    }
  });

  // Unique blood groups with low/critical PRBC or general stock
  const lowStockGroups = Array.from(new Set(lowStockItems.map(i => i.bloodGroup)));

  // 2. Pending & Emergency Requests
  // Requisitions that involve this blood bank or are pending matching/dispatch
  const pendingRequests = requests.filter(
    r => r.status === 'CREATED' || r.status === 'SEARCHING' || r.status === 'MATCHED' || r.status === 'PENDING_CONFIRMATION' || r.status === 'ACCEPTED' || r.status === 'RESERVED'
  );

  const emergencyRequests = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED' && r.status !== 'CANCELLED' && r.status !== 'REJECTED'
  );

  // 3. Recently updated inventory items
  const recentInventoryItems = Object.values(currentBank.inventory)
    .sort((a, b) => {
      const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 6);

  // Universal O- RBC stock status
  const universalRbcItem = currentBank.inventory['O-_PRBC'];
  const isUniversalRbcCritical = universalRbcItem ? universalRbcItem.unitsAvailable <= universalRbcItem.criticalThreshold : false;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Facility Selector Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Blood Bank Clinical Operations Command
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {currentBank.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="font-mono font-semibold text-slate-700">Code: {currentBank.code}</span>
            <span aria-hidden="true">·</span>
            <span>{currentBank.address}, {currentBank.city}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Cold-Chain Certified (+2°C to +6°C)
            </span>
          </div>
        </div>

        {/* Facility Selector & Quick Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Facility:</label>
            <select
              value={currentBank.id}
              onChange={(e) => setActiveBloodBankId(e.target.value)}
              className="text-xs font-bold bg-white p-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {bloodBanks.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onOpenStockUpdate()}
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>+</span>
            <span>Update Stock</span>
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner if O- is Low */}
      {isUniversalRbcCritical && (
        <div className="p-4 bg-red-500/10 border border-red-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-900">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-red-700">
                CRITICAL SHORTFALL WARNING: Universal O- PRBC
              </div>
              <p className="text-xs text-red-800 font-medium mt-0.5">
                O- Negative PRBC units are at {universalRbcItem?.unitsAvailable || 0} units (buffer minimum: {universalRbcItem?.criticalThreshold || 5}). Uncrossmatched emergency transfusions may be impacted.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenStockUpdate('O-', 'PRBC')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs shrink-0"
          >
            Restock O- Immediately ➔
          </button>
        </div>
      )}

      {/* 5 Core Required Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Total Available Units */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Total Available Units</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
            {totalAvailableUnits}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all 8 blood groups</div>
        </div>

        {/* Metric 2: Blood Groups with Low Stock */}
        <div className={`p-4 rounded-xl border shadow-2xs ${
          lowStockGroups.length > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="text-xs font-semibold text-amber-800">Low Stock Groups</div>
          <div className="text-2xl font-black font-mono text-amber-900 mt-1 tabular-nums flex items-baseline gap-1.5">
            <span>{lowStockGroups.length}</span>
            <span className="text-xs font-normal text-amber-700 font-sans">groups</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5 truncate">
            {lowStockGroups.length > 0 ? lowStockGroups.join(', ') : 'All buffers healthy'}
          </div>
        </div>

        {/* Metric 3: Pending Requests */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Pending Requests</div>
          <div className="text-2xl font-black font-mono text-blue-700 mt-1 tabular-nums">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting dispatch/fulfillment</div>
        </div>

        {/* Metric 4: Emergency Requests */}
        <div className={`p-4 rounded-xl border shadow-2xs ${
          emergencyRequests.length > 0 ? 'bg-red-50/60 border-red-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span>Emergency Requests</span>
          </div>
          <div className="text-2xl font-black font-mono text-red-700 mt-1 tabular-nums">
            {emergencyRequests.length}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">Critical trauma priority</div>
        </div>

        {/* Metric 5: Reserved Units Buffer */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-slate-500">Reserved Units</div>
          <div className="text-2xl font-black font-mono text-purple-700 mt-1 tabular-nums">
            {totalReservedUnits}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Locked for outgoing couriers</div>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenInventory}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-left group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-base">🩸</span>
            <span className="text-xs text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-2 group-hover:text-rose-600">Full Inventory</div>
          <div className="text-[11px] text-slate-400">View all 8 ABO/Rh groups</div>
        </button>

        <button
          onClick={() => onOpenStockUpdate()}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-left group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-base">⚖️</span>
            <span className="text-xs text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-2 group-hover:text-rose-600">Stock Update</div>
          <div className="text-[11px] text-slate-400">Add or adjust unit totals</div>
        </button>

        <button
          onClick={onOpenIncomingRequests}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-left group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-base">📥</span>
            <span className="text-xs text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-2 group-hover:text-rose-600">Incoming Requests</div>
          <div className="text-[11px] text-slate-400">{pendingRequests.length} active requisitions</div>
        </button>

        <button
          onClick={onOpenAnalytics}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-left group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-base">📊</span>
            <span className="text-xs text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-2 group-hover:text-rose-600">Bank Analytics</div>
          <div className="text-[11px] text-slate-400">Distribution & trends</div>
        </button>
      </div>

      {/* Two Column Layout: Emergency/Pending Requests vs Recently Updated Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Dispatch & Incoming Requests (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Active Dispatch & Emergency Requisitions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Orders requiring blood bank confirmation, reserve lock, or courier release.
                </p>
              </div>
              <button
                onClick={onOpenIncomingRequests}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 whitespace-nowrap"
              >
                View All ({pendingRequests.length}) ➔
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active or emergency blood requisitions at this time.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingRequests.slice(0, 5).map(req => {
                  const isCritical = req.urgency === 'CRITICAL';
                  return (
                    <div key={req.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{req.requestNumber}</span>
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-mono text-xs font-bold rounded border border-rose-200">
                            {req.bloodGroup} {req.component}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCritical ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span className="font-medium text-slate-800">{req.hospitalName}</span>
                          <span className="text-slate-400"> · </span>
                          <span>Units: <strong className="text-slate-900 font-mono">{req.unitsRequired || req.unitsNeeded}</strong></span>
                          <span className="text-slate-400"> · </span>
                          <span className="text-[11px] text-slate-500">
                            Status: <strong className="text-slate-700">{req.status}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => onOpenRequestDetails(req.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
                        >
                          Review & Action ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Blood Groups with Low Stock Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Low Stock Groups & Threshold Monitors
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Items currently near or below safety buffer capacity.
                </p>
              </div>
              <button
                onClick={onOpenInventory}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                Inspect Grid ➔
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl font-medium">
                ✓ All 8 blood groups have adequate inventory buffers above critical thresholds.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {lowStockItems.slice(0, 6).map((item, idx) => (
                  <div
                    key={`${item.bloodGroup}_${item.component}_${idx}`}
                    className="p-3 bg-red-50/50 border border-red-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-base font-black text-rose-700">{item.bloodGroup}</span>
                        <span className="text-xs font-medium text-slate-600">{item.component}</span>
                      </div>
                      <div className="text-[11px] text-red-700 mt-0.5">
                        Available: <strong className="font-mono">{item.unitsAvailable}</strong> / Buffer: {item.threshold}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenStockUpdate(item.bloodGroup, item.component)}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                    >
                      Restock +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recently Updated Inventory & Facility Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recently Updated Inventory */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recently Updated Inventory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest verified stock adjustments at {currentBank.code}.
                </p>
              </div>
              <button
                onClick={() => onOpenStockUpdate()}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                + New Entry
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentInventoryItems.map((item) => {
                const formattedTime = item.lastUpdated 
                  ? new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Earlier';

                return (
                  <div key={`${item.bloodGroup}_${item.component}`} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-slate-900">{item.bloodGroup}</span>
                        <span className="text-xs text-slate-500">{item.component}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Updated at {formattedTime}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {item.unitsAvailable} <span className="text-[10px] font-sans font-normal text-slate-400">units</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        item.status === 'CRITICAL' || item.status === 'UNAVAILABLE'
                          ? 'bg-red-100 text-red-700'
                          : item.status === 'LOW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status || 'AVAILABLE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Facility Identity & Contact Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Assigned Facility Metadata
            </div>
            <div>
              <div className="text-base font-bold">{currentBank.name}</div>
              <p className="text-xs text-slate-300 mt-1">{currentBank.address}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Operating Schedule:</span>
                <span className="font-medium text-slate-200">{currentBank.operatingHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cold-Chain Line:</span>
                <span className="font-mono font-medium text-slate-200">{currentBank.contactNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Geospatial Coordinates:</span>
                <span className="font-mono text-slate-300">
                  {currentBank.location.lat.toFixed(4)}, {currentBank.location.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <MedicalSafetyBadge />
        </div>
      </div>
    </div>
  );
};

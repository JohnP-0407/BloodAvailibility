import React, { useState } from 'react';
import { BloodBridgeMap } from './BloodBridgeMap';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup } from '../../types/bloodbridge';
import { BLOOD_GROUPS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

export const FullMapView: React.FC = () => {
  const { requests, selectedRequestId, setSelectedRequestId, bloodBanks, hospitals, donors } = useBloodBridge();
  const [filterBloodGroup, setFilterBloodGroup] = useState<BloodGroup | 'ALL'>('ALL');

  const activeEmergencyRequests = requests.filter(
    r => (r.urgency === 'CRITICAL' || r.urgency === 'HIGH') && r.status !== 'FULFILLED'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Live Geospatial Blood Network Map
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Leaflet & OpenStreetMap</span>
            <span aria-hidden="true">·</span>
            <span>Cold-Chain Transit Path</span>
            <span aria-hidden="true">·</span>
            <span>Donor Density Clusters</span>
          </div>
        </div>

        {/* Blood Group Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Filter Type:</label>
          <select
            value={filterBloodGroup}
            onChange={e => setFilterBloodGroup(e.target.value as BloodGroup | 'ALL')}
            className="text-xs font-mono font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Column */}
        <div className="lg:col-span-8 h-[600px] rounded-xl overflow-hidden shadow-xs border border-slate-200">
          <BloodBridgeMap
            highlightRequestId={selectedRequestId}
            filterBloodGroup={filterBloodGroup}
          />
        </div>

        {/* Sidebar Column: Active Emergencies & Facility Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Transit Routes ({activeEmergencyRequests.length})
              </h2>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            </div>

            {activeEmergencyRequests.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">
                No active critical transit routes at this moment.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {activeEmergencyRequests.map(req => {
                  const isSelected = req.id === selectedRequestId;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-50/80 border-rose-400 ring-1 ring-rose-400'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-rose-700">{req.bloodGroup} {req.component}</span>
                        <span className="text-[10px] text-red-600">{req.urgency}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">
                        {req.hospitalName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>Allocated: {req.unitsAllocated}/{req.unitsRequired || req.unitsNeeded || 1}u</span>
                        <span className="text-blue-700 font-medium">Click to track ➔</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Directory Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Metro Corridor Infrastructure
            </h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Blood Banks (Cold Chain):</span>
                <span className="font-mono font-bold text-slate-900">{bloodBanks.length} facilities</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Hospital Trauma Centers:</span>
                <span className="font-mono font-bold text-slate-900">{hospitals.length} centers</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Active Registered Donors:</span>
                <span className="font-mono font-bold text-slate-900">{donors.length} donors</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Locations and coordinates are synthetic sandbox data representing the metro healthcare corridor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

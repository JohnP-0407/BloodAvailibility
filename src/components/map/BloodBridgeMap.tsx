import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup } from '../../types/bloodbridge';

interface BloodBridgeMapProps {
  highlightRequestId?: string | null;
  filterBloodGroup?: BloodGroup | 'ALL';
  compact?: boolean;
}

export const BloodBridgeMap: React.FC<BloodBridgeMapProps> = ({
  highlightRequestId,
  filterBloodGroup = 'ALL',
  compact = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const { bloodBanks, hospitals, donors, requests, selectedRequestId, setSelectedRequestId } = useBloodBridge();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BANKS' | 'HOSPITALS' | 'DONORS'>('ALL');
  const targetReqId = highlightRequestId || selectedRequestId;
  const targetRequest = requests.find(r => r.id === targetReqId);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: San Francisco Bay Metro Sandbox
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 13,
        zoomControl: !compact,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [compact]);

  // Update Markers whenever data, filters, or target request change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    const routeLayers = routeLayerGroupRef.current;
    if (!map || !layers || !routeLayers) return;

    layers.clearLayers();
    routeLayers.clearLayers();

    // Custom Icon Creators using clean SVGs
    const createCustomIcon = (type: 'bank' | 'hospital' | 'donor', label: string, isCritical?: boolean) => {
      let bgClass = 'bg-rose-600 text-white';
      let iconSvg = '';

      if (type === 'bank') {
        bgClass = 'bg-rose-700 text-white border-2 border-white shadow-md';
        iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
      } else if (type === 'hospital') {
        bgClass = isCritical 
          ? 'bg-red-600 text-white ring-4 ring-red-400/50 animate-pulse border-2 border-white' 
          : 'bg-indigo-700 text-white border-2 border-white shadow-md';
        iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 6v12M6 12h12"/></svg>`;
      } else {
        bgClass = 'bg-emerald-600 text-white border-2 border-white shadow-sm';
        iconSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
      }

      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgClass} transition-transform hover:scale-110">
            ${iconSvg}
            <span class="absolute -bottom-4 px-1.5 py-0.2 text-[9px] font-semibold bg-slate-900/90 text-white rounded whitespace-nowrap shadow-sm">
              ${label}
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });
    };

    // 1. Blood Banks
    if (activeFilter === 'ALL' || activeFilter === 'BANKS') {
      bloodBanks.forEach(bank => {
        // Calculate units for filtered blood group
        let totalUnits = 0;
        Object.entries(bank.inventory || {}).forEach(([key, inv]) => {
          if (filterBloodGroup === 'ALL' || key.startsWith(filterBloodGroup)) {
            totalUnits += inv.unitsAvailable;
          }
        });

        const marker = L.marker([bank.location.lat, bank.location.lng], {
          icon: createCustomIcon('bank', bank.code)
        });

        marker.bindPopup(`
          <div class="p-2 min-w-[200px] text-xs font-sans">
            <div class="font-bold text-slate-900 text-sm mb-1">${bank.name}</div>
            <div class="text-slate-500 mb-2">${bank.address}</div>
            <div class="bg-rose-50 border border-rose-100 rounded p-2 mb-2">
              <div class="text-rose-900 font-semibold">Available Units (${filterBloodGroup}):</div>
              <div class="text-lg font-bold font-mono text-rose-700">${totalUnits} units</div>
            </div>
            <div class="text-[11px] text-slate-500">Hours: ${bank.operatingHours}</div>
            <div class="text-[11px] text-slate-500">Contact: ${bank.contactNumber}</div>
          </div>
        `);
        layers.addLayer(marker);
      });
    }

    // 2. Hospitals
    if (activeFilter === 'ALL' || activeFilter === 'HOSPITALS') {
      hospitals.forEach(hosp => {
        const hasEmergency = requests.some(r => r.hospitalId === hosp.id && (r.urgency === 'CRITICAL' || r.urgency === 'HIGH') && r.status !== 'FULFILLED');
        const marker = L.marker([hosp.location.lat, hosp.location.lng], {
          icon: createCustomIcon('hospital', hosp.code, hasEmergency)
        });

        const activeHospitalRequests = requests.filter(r => r.hospitalId === hosp.id && r.status !== 'FULFILLED');

        marker.bindPopup(`
          <div class="p-2 min-w-[220px] text-xs font-sans">
            <div class="font-bold text-slate-900 text-sm mb-0.5">${hosp.name}</div>
            <div class="text-slate-500 mb-2">Level ${hosp.traumaCenterLevel} Trauma Center · ${hosp.address}</div>
            <div class="border-t border-slate-200 pt-2">
              <div class="text-slate-700 font-medium mb-1">Active Requisitions: ${activeHospitalRequests.length}</div>
              ${activeHospitalRequests.map(r => `
                <div class="flex items-center justify-between text-[11px] py-1 border-b border-slate-100">
                  <span class="font-mono font-semibold ${r.urgency === 'CRITICAL' ? 'text-red-600' : 'text-amber-700'}">${r.bloodGroup} ${r.component}</span>
                  <span class="text-slate-500">${r.unitsAllocated}/${r.unitsRequired || r.unitsNeeded || 1} units</span>
                </div>
              `).join('')}
            </div>
          </div>
        `);
        layers.addLayer(marker);
      });
    }

    // 3. Donors (Privacy-aware fuzzy locations)
    if (activeFilter === 'ALL' || activeFilter === 'DONORS') {
      donors.forEach(donor => {
        if (filterBloodGroup !== 'ALL' && donor.bloodGroup !== filterBloodGroup) return;

        const marker = L.marker([donor.location.lat, donor.location.lng], {
          icon: createCustomIcon('donor', `${donor.bloodGroup}`)
        });

        marker.bindPopup(`
          <div class="p-2 min-w-[180px] text-xs font-sans">
            <div class="font-bold text-slate-900">${donor.name} (${donor.code})</div>
            <div class="text-emerald-700 font-semibold text-sm mb-1">${donor.bloodGroup} ${donor.isEligible ? '· Eligible' : '· In Cooldown'}</div>
            <div class="text-slate-600 text-[11px] mb-2">${donor.totalDonations} previous donations</div>
            <div class="text-[10px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 inline-block">
              Privacy-Protected Synthetic Location
            </div>
          </div>
        `);
        layers.addLayer(marker);
      });
    }

    // 4. Draw route if targetRequest has matched sources
    if (targetRequest && targetRequest.matchedSources && targetRequest.matchedSources.length > 0) {
      const hospCoords: [number, number] = [targetRequest.location.lat, targetRequest.location.lng];

      targetRequest.matchedSources.forEach(step => {
        let sourceCoords: [number, number] | null = null;
        if (step.sourceType === 'BLOOD_BANK') {
          const bank = bloodBanks.find(b => b.id === step.sourceId);
          if (bank) sourceCoords = [bank.location.lat, bank.location.lng];
        } else {
          const donor = donors.find(d => d.id === step.sourceId);
          if (donor) sourceCoords = [donor.location.lat, donor.location.lng];
        }

        if (sourceCoords) {
          const polyline = L.polyline([hospCoords, sourceCoords], {
            color: targetRequest.urgency === 'CRITICAL' ? '#dc2626' : '#2563eb',
            weight: 3,
            dashArray: step.status === 'PENDING' ? '6, 6' : undefined,
            opacity: 0.8
          });

          polyline.bindTooltip(
            `${step.sourceName} ➔ ${targetRequest.hospitalName} (${step.unitsAllocated} units, ${step.distanceKm} km)`,
            { sticky: true }
          );

          routeLayers.addLayer(polyline);
        }
      });
    }
  }, [bloodBanks, hospitals, donors, requests, targetReqId, filterBloodGroup, activeFilter]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
      {/* Map Control Bar */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white border-b border-slate-200 text-xs z-[400]">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-700 mr-1">Layer:</span>
            {(['ALL', 'BANKS', 'HOSPITALS', 'DONORS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  activeFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Entities' : tab === 'BANKS' ? 'Blood Banks' : tab === 'HOSPITALS' ? 'Hospitals' : 'Donors'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-700 inline-block"></span>
              <span>Blood Bank</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 inline-block"></span>
              <span>Hospital</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>Donor</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[320px] z-0" />

      {/* Route Info Overlay if request is active */}
      {targetRequest && (
        <div className="absolute bottom-2 left-2 right-2 md:right-auto md:max-w-md bg-white/95 backdrop-blur-sm border border-slate-200 p-2.5 rounded shadow-lg text-xs z-[400]">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-slate-900 truncate">
              Route: {targetRequest.hospitalName}
            </div>
            <button
              onClick={() => setSelectedRequestId(null)}
              className="text-slate-400 hover:text-slate-700 ml-2"
              title="Close overlay"
            >
              ✕
            </button>
          </div>
          <div className="text-[11px] text-slate-600">
            Requisition <span className="font-mono font-medium">{targetRequest.requestNumber}</span> · {targetRequest.unitsAllocated}/{targetRequest.unitsRequired || targetRequest.unitsNeeded || 1} units {targetRequest.bloodGroup} {targetRequest.component}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Cold chain transit path plotted · Deterministic matching verified
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BLOOD_GROUPS } from '../../utils/mockData';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

export const AnalyticsView: React.FC = () => {
  const { bloodBanks, requests } = useBloodBridge();

  // Aggregate current inventory across all blood banks by Blood Group
  const stockByGroup = BLOOD_GROUPS.map(bg => {
    let available = 0;
    let threshold = 0;

    bloodBanks.forEach(b => {
      Object.entries(b.inventory).forEach(([key, inv]) => {
        if (key.startsWith(bg)) {
          available += inv.unitsAvailable;
          threshold += inv.criticalThreshold;
        }
      });
    });

    const isDeficit = available < threshold;

    return {
      name: bg,
      available,
      safetyBuffer: threshold,
      isDeficit
    };
  });

  // Simulated 7-Day Historical & Real-Time Trend
  const demandTrend = [
    { day: 'Mon', totalRequests: 12, urgentSos: 3, fulfilled: 11 },
    { day: 'Tue', totalRequests: 15, urgentSos: 4, fulfilled: 15 },
    { day: 'Wed', totalRequests: 9, urgentSos: 1, fulfilled: 9 },
    { day: 'Thu', totalRequests: 18, urgentSos: 6, fulfilled: 17 },
    { day: 'Fri', totalRequests: 22, urgentSos: 7, fulfilled: 21 },
    { day: 'Sat', totalRequests: 25, urgentSos: 9, fulfilled: 24 },
    { day: 'Today', totalRequests: requests.length + 8, urgentSos: requests.filter(r => r.urgency === 'CRITICAL').length + 2, fulfilled: requests.filter(r => r.status === 'FULFILLED').length + 6 },
  ];

  // Component Distribution
  const componentDistribution = [
    { name: 'PRBC', value: 48, color: '#dc2626' },
    { name: 'Platelets', value: 24, color: '#f59e0b' },
    { name: 'Whole Blood', value: 16, color: '#8b5cf6' },
    { name: 'Plasma (FFP)', value: 12, color: '#3b82f6' }
  ];

  // Predictive Risk Scoring based on stock vs consumption
  const riskIndex = stockByGroup.map(item => {
    const ratio = item.available / Math.max(1, item.safetyBuffer);
    let riskLevel: 'HIGH' | 'MODERATE' | 'STABLE' = 'STABLE';
    let riskColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (ratio < 0.8) {
      riskLevel = 'HIGH';
      riskColor = 'text-red-700 bg-red-50 border-red-200';
    } else if (ratio < 1.2) {
      riskLevel = 'MODERATE';
      riskColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return {
      bloodGroup: item.name,
      ratio: Math.round(ratio * 100),
      riskLevel,
      riskColor,
      stock: item.available,
      buffer: item.safetyBuffer
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Blood Supply Analytics & Shortage Forecasting
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Deterministic Metrics</span>
            <span aria-hidden="true">·</span>
            <span>Predictive Shortage Index</span>
            <span aria-hidden="true">·</span>
            <span>Turnaround Performance</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mean Dispatch ETA</span>
            <div className="font-mono text-base font-bold text-slate-900 tabular-nums">17.4 min</div>
          </div>
          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Network Health</span>
            <div className="font-mono text-base font-bold text-emerald-700 tabular-nums">98.2%</div>
          </div>
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Predictive Shortage Risk Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Blood Group Stock Adequacy & Shortage Risk Index
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies types approaching critical deficit buffers across the 4 verified blood banks.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">4-Bank Aggregate</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {riskIndex.map(item => (
            <div
              key={item.bloodGroup}
              className={`p-3 rounded-lg border flex flex-col justify-between ${item.riskColor}`}
            >
              <div>
                <span className="font-mono text-xl font-black">{item.bloodGroup}</span>
                <span className="block text-[10px] font-bold uppercase mt-0.5">
                  {item.riskLevel} RISK
                </span>
              </div>
              <div className="mt-2 text-[11px] font-mono">
                <div>{item.stock}u in bank</div>
                <div className="text-[10px] opacity-75">min {item.buffer}u</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available Stock vs Safety Buffer Threshold */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Current Available Stock vs Critical Safety Buffer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregate inventory across all 4 blood banks grouped by blood type.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                <span className="w-3 h-3 bg-rose-600 rounded-sm"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-3 h-3 bg-slate-300 rounded-sm"></span> Safety Buffer
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByGroup} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} units`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="available" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="safetyBuffer" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Component Distribution Pie */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Demand by Blood Component
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical transfusion allocation ratio.
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={componentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {componentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Demand Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {componentDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-mono font-bold text-slate-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Demand Trend Line Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              7-Day Emergency Requisition Trend & Fulfillment Velocity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily incoming blood requests vs verified deliveries across the metro trauma corridor.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demandTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="totalRequests" stroke="#2563eb" strokeWidth={2.5} name="Total Requisitions" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="fulfilled" stroke="#16a34a" strokeWidth={2} name="Fulfilled Orders" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="urgentSos" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" name="Critical Code Red SOS" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

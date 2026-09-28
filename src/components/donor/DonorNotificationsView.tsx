import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface DonorNotificationsViewProps {
  onBackToDashboard: () => void;
  onOpenEmergencyRequests: () => void;
  onSelectRequestDetails?: (requestId: string) => void;
}

export const DonorNotificationsView: React.FC<DonorNotificationsViewProps> = ({
  onBackToDashboard,
  onOpenEmergencyRequests,
  onSelectRequestDetails
}) => {
  const {
    notifications,
    markNotificationAsRead,
    clearNotifications,
    activeDonorId,
    donors
  } = useBloodBridge();

  const currentDonor = donors.find(d => d.id === activeDonorId) || donors[0];
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CRITICAL' && (n.type === 'CRITICAL' || n.title.toLowerCase().includes('emergency') || n.title.toLowerCase().includes('urgent'))) return true;
    if (filterType === 'UPDATES' && (n.type === 'INFO' || n.type === 'SUCCESS')) return true;
    if (filterType === 'UNREAD' && !n.read) return true;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <span className="text-slate-300">·</span>
            <h1 className="text-lg font-bold text-slate-900">Donor Notifications Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time emergency broadcast alerts, hospital responses, and status changes for {currentDonor.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <MedicalSafetyBadge />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs w-fit">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'CRITICAL', label: 'Emergency Requisitions' },
          { id: 'UPDATES', label: 'Status Updates & Responses' },
          { id: 'UNREAD', label: 'Unread Only' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              filterType === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-sm font-bold text-slate-800">No Notifications in This Filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are up to date! As hospitals create requisitions matching {currentDonor.bloodGroup}, alerts will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map(item => {
            const isCrit = item.type === 'CRITICAL';
            const isSuccess = item.type === 'SUCCESS';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  !item.read ? 'bg-white border-slate-300 shadow-xs ring-1 ring-slate-900/5' : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        isCrit ? 'bg-red-600 animate-ping' : isSuccess ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}></span>
                      <span className="font-bold text-xs text-slate-900">{item.title}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!item.read && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!item.read && (
                      <button
                        onClick={() => markNotificationAsRead(item.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold"
                      >
                        Mark Read
                      </button>
                    )}

                    {item.requestId && (
                      <button
                        onClick={() => {
                          markNotificationAsRead(item.id);
                          if (onSelectRequestDetails) {
                            onSelectRequestDetails(item.requestId!);
                          } else {
                            onOpenEmergencyRequests();
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                      >
                        View Requisition ➔
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

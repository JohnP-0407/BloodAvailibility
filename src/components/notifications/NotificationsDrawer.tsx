import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRequest?: (requestId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectRequest
}) => {
  const {
    notifications,
    markNotificationAsRead,
    clearNotifications,
    setSelectedRequestId,
    setActiveTab
  } = useBloodBridge();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <h2 className="text-sm font-bold text-slate-900">
              System Notifications
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {notifications.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm"
              title="Close panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No active notifications. Requisition updates and cold-chain dispatch alerts will appear here.
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.requestId) {
                    setSelectedRequestId(notif.requestId);
                    if (onSelectRequest) onSelectRequest(notif.requestId);
                    setActiveTab('request-details');
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  notif.read
                    ? 'bg-white border-slate-200 opacity-75'
                    : notif.type === 'CRITICAL'
                    ? 'bg-red-50/80 border-red-200 shadow-xs'
                    : 'bg-rose-50/40 border-rose-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                    )}
                    <span>{notif.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0 font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.requestId && (
                  <div className="mt-2 text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                    <span>View Requisition Details ➔</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
          Prototype notifications simulate real-time hospital dispatch events.
        </div>
      </div>
    </div>
  );
};

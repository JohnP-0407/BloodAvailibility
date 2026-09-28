import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { UserRole, SystemUser } from '../../types/bloodbridge';
import { MedicalSafetyBadge } from '../common/MedicalSafetyBadge';

interface AdminUsersViewProps {
  onBackToDashboard: () => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  onBackToDashboard
}) => {
  const {
    systemUsers,
    updateUserStatus
  } = useBloodBridge();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [statusModalUser, setStatusModalUser] = useState<SystemUser | null>(null);
  const [targetStatus, setTargetStatus] = useState<'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ACTIVE');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredUsers = systemUsers.filter(user => {
    if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchFacility = user.associatedFacility?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchFacility) return false;
    }
    return true;
  });

  const handleUpdateStatus = async () => {
    if (!statusModalUser) return;
    try {
      await updateUserStatus(statusModalUser.id, targetStatus);
      setFeedback(`User ${statusModalUser.name} status updated to ${targetStatus}`);
      setStatusModalUser(null);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

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
            <h1 className="text-lg font-bold text-slate-900">User Account Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional clinical accounts, blood-bank operators, doctors, patients, and volunteer donors.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          {filteredUsers.length} of {systemUsers.length} Users Listed
        </div>
      </div>

      <MedicalSafetyBadge />

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="HOSPITAL">Hospital Staff</option>
            <option value="BLOOD_BANK_STAFF">Blood Bank Staff</option>
            <option value="DONOR">Volunteer Donors</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-slate-700">User / Account</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Role</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Associated Facility</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Last Active</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {user.associatedFacility || 'General Network'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`font-semibold text-xs ${
                        user.status === 'ACTIVE'
                          ? 'text-emerald-700'
                          : user.status === 'PENDING'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}>
                        ● {user.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                      {user.lastActive}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => {
                          setStatusModalUser(user);
                          setTargetStatus(user.status);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Slideover / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  User Account Specifications
                </span>
                <h3 className="text-base font-bold mt-0.5">{selectedUser.name}</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Account ID:</span>
                <span className="font-mono text-slate-800 text-right">{selectedUser.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-800 text-right">{selectedUser.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">System Role:</span>
                <span className="font-bold text-slate-800 text-right">{selectedUser.role}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Facility / Department:</span>
                <span className="text-slate-800 text-right">{selectedUser.associatedFacility || 'General Registry'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Account Status:</span>
                <span className="font-bold text-emerald-700 text-right">{selectedUser.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1">
                <span className="text-slate-500">Registered On:</span>
                <span className="font-mono text-slate-800 text-right">
                  {new Date(selectedUser.registeredAt).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-800 text-white">
              <div className="text-xs uppercase font-bold text-rose-300">Admin Action</div>
              <h3 className="text-base font-bold mt-0.5">Modify Account Status</h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Update account access status for <span className="font-bold text-slate-900">{statusModalUser.name}</span>:
              </p>

              <div className="space-y-2">
                {(['ACTIVE', 'PENDING', 'SUSPENDED'] as const).map(st => (
                  <label
                    key={st}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      targetStatus === st ? 'border-rose-600 bg-rose-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{st}</span>
                    <input
                      type="radio"
                      name="accountStatus"
                      value={st}
                      checked={targetStatus === st}
                      onChange={() => setTargetStatus(st)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-200">
                Note: Destructive account deletions are disallowed by design to safeguard regulatory audit trails.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

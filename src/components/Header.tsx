import React, { useState } from 'react';
import { useBloodBridge } from '../context/BloodBridgeContext';
import { UserRole } from '../types/bloodbridge';

interface HeaderProps {
  onOpenAiAssistant?: () => void;
  onOpenNotifications?: () => void;
}

const PUBLIC_WEBSITE_TABS = [
  'home',
  'find-blood',
  'donate-blood',
  'hospitals-info',
  'bloodbanks-info',
  'compatibility',
  'about-safety'
];

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const {
    userRole,
    setUserRole,
    currentUser,
    activeTab,
    setActiveTab,
    requests,
    unreadNotificationCount
  } = useBloodBridge();

  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isWebsiteView = PUBLIC_WEBSITE_TABS.includes(activeTab);

  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'FULFILLED' && r.status !== 'CANCELLED'
  ).length;

  const roleOptions: { role: UserRole; label: string; portalTab: string; desc: string }[] = [
    { role: 'PATIENT', label: 'Patient & Family', portalTab: 'patient-dashboard', desc: 'Track requisitions & blood delivery' },
    { role: 'HOSPITAL', label: 'Hospital Trauma Desk', portalTab: 'hospital-dashboard', desc: 'Code Red intake & MTP requests' },
    { role: 'BLOOD_BANK_STAFF', label: 'Blood Bank Console', portalTab: 'bloodbank-dashboard', desc: 'Cold-chain stock & allocations' },
    { role: 'DONOR', label: 'Donor Dashboard', portalTab: 'donor-dashboard', desc: 'Standby alerts & 56-day cooldown' },
    { role: 'ADMIN', label: 'Network Admin', portalTab: 'admin-dashboard', desc: 'Audit ledger & grid monitoring' }
  ];

  const handleSelectPortal = (role: UserRole, portalTab: string) => {
    setUserRole(role);
    setActiveTab(portalTab);
    setIsPortalDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* 24/7 Trauma Emergency Hotline Top Ribbon */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 sm:px-6 text-[11px] border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px]">
              24/7 Regional Emergency Hotline:
            </span>
            <span className="font-mono font-bold text-white text-xs">1-800-555-BLOOD</span>
            <span className="hidden md:inline text-slate-500">· Bay Area Trauma Grid Operational</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="hidden sm:inline">Avg Emergency Delivery: <strong className="text-white font-mono">18 min</strong></span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Cold-Chain 100% Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
            className="text-left flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-rose-700 transition-colors">
              🩸
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                Blood<span className="text-rose-600">Bridge</span>
              </span>
              <span className="text-[9px] tracking-wider text-slate-500 font-bold uppercase block">
                Emergency Blood Network
              </span>
            </div>
          </button>

          {/* If inside an internal clinical portal, provide an escape hatch back to public website */}
          {!isWebsiteView && (
            <button
              onClick={() => setActiveTab('home')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 rounded-lg transition-all"
            >
              <span>← Public Website</span>
            </button>
          )}

          {/* Primary Public Website Navigation (Visible on website mode) */}
          {isWebsiteView ? (
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('home')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'home' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => setActiveTab('find-blood')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'find-blood' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Find Blood
              </button>

              <button
                onClick={() => setActiveTab('donate-blood')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'donate-blood' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Donate Blood
              </button>

              <button
                onClick={() => setActiveTab('compatibility')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'compatibility' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Compatibility
              </button>

              <button
                onClick={() => setActiveTab('hospitals-info')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'hospitals-info' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Hospitals & ER
              </button>

              <button
                onClick={() => setActiveTab('bloodbanks-info')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'bloodbanks-info' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Blood Banks
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'map' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Live Map
              </button>

              <button
                onClick={() => setActiveTab('about-safety')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'about-safety' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                About & Safety
              </button>
            </nav>
          ) : (
            /* Portal-Specific Navigation Tabs when inside a Portal */
            <nav className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600">
              {userRole === 'BLOOD_BANK_STAFF' && (
                <>
                  <button onClick={() => setActiveTab('bloodbank-dashboard')} className={activeTab === 'bloodbank-dashboard' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Console</button>
                  <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Inventory</button>
                  <button onClick={() => setActiveTab('incoming-requests')} className={activeTab === 'incoming-requests' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Incoming Orders</button>
                  <button onClick={() => setActiveTab('stock-update')} className={activeTab === 'stock-update' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Update Stock</button>
                  <button onClick={() => setActiveTab('bloodbank-analytics')} className={activeTab === 'bloodbank-analytics' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Analytics</button>
                </>
              )}
              {userRole === 'HOSPITAL' && (
                <>
                  <button onClick={() => setActiveTab('hospital-dashboard')} className={activeTab === 'hospital-dashboard' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Trauma Desk</button>
                  <button onClick={() => setActiveTab('my-requests')} className={activeTab === 'my-requests' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Requisitions</button>
                  <button onClick={() => setActiveTab('create-request')} className={activeTab === 'create-request' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>+ New Request</button>
                  <button onClick={() => setActiveTab('map')} className={activeTab === 'map' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Transit Map</button>
                </>
              )}
              {userRole === 'PATIENT' && (
                <>
                  <button onClick={() => setActiveTab('patient-dashboard')} className={activeTab === 'patient-dashboard' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>My Portal</button>
                  <button onClick={() => setActiveTab('my-requests')} className={activeTab === 'my-requests' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Blood Requests</button>
                  <button onClick={() => setActiveTab('create-request')} className={activeTab === 'create-request' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>+ Request Units</button>
                </>
              )}
              {userRole === 'DONOR' && (
                <>
                  <button onClick={() => setActiveTab('donor-dashboard')} className={activeTab === 'donor-dashboard' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Dashboard</button>
                  <button onClick={() => setActiveTab('donor-profile')} className={activeTab === 'donor-profile' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Profile & Specs</button>
                  <button onClick={() => setActiveTab('donor-availability')} className={activeTab === 'donor-availability' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Standby Status</button>
                  <button onClick={() => setActiveTab('donor-emergency-requests')} className={activeTab === 'donor-emergency-requests' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Emergency Calls</button>
                  <button onClick={() => setActiveTab('donor-history')} className={activeTab === 'donor-history' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Certificates</button>
                </>
              )}
              {userRole === 'ADMIN' && (
                <>
                  <button onClick={() => setActiveTab('admin-dashboard')} className={activeTab === 'admin-dashboard' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Command</button>
                  <button onClick={() => setActiveTab('admin-users')} className={activeTab === 'admin-users' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Users</button>
                  <button onClick={() => setActiveTab('admin-bloodbanks')} className={activeTab === 'admin-bloodbanks' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Repositories</button>
                  <button onClick={() => setActiveTab('admin-verification')} className={activeTab === 'admin-verification' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Accreditation</button>
                  <button onClick={() => setActiveTab('admin-analytics')} className={activeTab === 'admin-analytics' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Demand Analytics</button>
                  <button onClick={() => setActiveTab('admin-audit')} className={activeTab === 'admin-audit' ? 'text-rose-600 font-bold' : 'hover:text-slate-900'}>Audit Ledger</button>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Critical Requests Badge */}
          {criticalCount > 0 && (
            <button
              onClick={() => setActiveTab(
                userRole === 'BLOOD_BANK_STAFF' ? 'incoming-requests' :
                userRole === 'DONOR' ? 'donor-emergency-requests' :
                'my-requests'
              )}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold hover:bg-rose-200 transition-colors"
              title="View Critical Requisitions"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>{criticalCount} Critical</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={userRole === 'DONOR' ? () => setActiveTab('donor-notifications') : onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Notifications"
          >
            <span className="text-base">🔔</span>
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Portal Access Dropdown / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 transition-all shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden sm:inline">
                {isWebsiteView ? 'Staff & Portals' : `${roleOptions.find(r => r.role === userRole)?.label || userRole}`}
              </span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {/* Dropdown Menu */}
            {isPortalDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs"
                onMouseLeave={() => setIsPortalDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Access Clinical & Operational Portals
                  </span>
                </div>

                <div className="py-1">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.role}
                      onClick={() => handleSelectPortal(opt.role, opt.portalTab)}
                      className={`w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-colors ${
                        userRole === opt.role && !isWebsiteView ? 'bg-rose-50 text-rose-900' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-sm mt-0.5">
                        {opt.role === 'HOSPITAL' ? '🏥' : opt.role === 'BLOOD_BANK_STAFF' ? '🧪' : opt.role === 'DONOR' ? '❤️' : opt.role === 'ADMIN' ? '⚙️' : '👤'}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{opt.label}</div>
                        <div className="text-[11px] text-slate-500">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100 px-3 pb-1">
                  <button
                    onClick={() => { setActiveTab('home'); setIsPortalDropdownOpen(false); }}
                    className="w-full text-center py-1.5 text-xs text-rose-600 font-bold hover:underline"
                  >
                    ← Return to Public Website
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary High-Priority CTA: Emergency Requisition */}
          <button
            onClick={() => setActiveTab('create-request')}
            className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>🚨</span>
            <span className="hidden sm:inline">Emergency</span>
            <span>Request</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle navigation menu"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 text-xs font-semibold text-slate-700 shadow-md">
          <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider pb-1">
            Website Pages
          </div>
          <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">Home</button>
          <button onClick={() => { setActiveTab('find-blood'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">Find Blood Availability</button>
          <button onClick={() => { setActiveTab('donate-blood'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">Donate Blood (Volunteer Guide)</button>
          <button onClick={() => { setActiveTab('compatibility'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">ABO/Rh Compatibility Matrix</button>
          <button onClick={() => { setActiveTab('hospitals-info'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">For Hospitals & ER</button>
          <button onClick={() => { setActiveTab('bloodbanks-info'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">For Blood Banks</button>
          <button onClick={() => { setActiveTab('map'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">Live Cold-Chain Map</button>
          <button onClick={() => { setActiveTab('about-safety'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1.5 hover:text-rose-600">About & Medical Safety</button>

          <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider pt-3 pb-1 border-t border-slate-100">
            Clinical Portals
          </div>
          <div className="grid grid-cols-2 gap-2">
            {roleOptions.map((opt) => (
              <button
                key={opt.role}
                onClick={() => handleSelectPortal(opt.role, opt.portalTab)}
                className="p-2 rounded bg-slate-50 border border-slate-200 text-left hover:bg-rose-50"
              >
                <div className="font-bold text-slate-900">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

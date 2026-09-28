import React from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';

interface WebsiteFooterProps {
  onNavigate: (tab: string) => void;
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({ onNavigate }) => {
  const { userRole, setUserRole } = useBloodBridge();

  const handlePortalSwitch = (role: 'PATIENT' | 'HOSPITAL' | 'BLOOD_BANK_STAFF' | 'DONOR' | 'ADMIN', tab: string) => {
    setUserRole(role);
    onNavigate(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
      {/* 24/7 Emergency Ribbon */}
      <div className="bg-rose-950/70 border-b border-rose-900/50 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[11px] text-rose-300">
              Regional Trauma Coordination Desk:
            </span>
            <span className="font-mono font-bold text-white text-sm">1-800-555-BLOOD (25663)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Active Bay Area Trauma Grid</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              100% Operational
            </span>
            <span aria-hidden="true">·</span>
            <span>Avg Response: 18 min</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Organization & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                🩸
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block">
                  Blood<span className="text-rose-500">Bridge</span>
                </span>
                <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase block">
                  Emergency Blood & Donor Network
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              BloodBridge is a centralized, real-time emergency blood availability platform connecting accredited trauma centers, certified blood banks, and verified voluntary donors with deterministic ABO/Rh compatibility matching.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-[11px]">Emergency Email:</span>
                <span className="text-slate-300 font-mono">dispatch@bloodbridge.org</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-[11px]">HQ Campus:</span>
                <span className="text-slate-300">San Francisco Medical Center Grid, CA</span>
              </div>
            </div>
          </div>

          {/* Column 2: Public Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Explore Network
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('find-blood'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Find Blood Availability
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('donate-blood'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Volunteer Donor Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('compatibility'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  ABO/Rh Compatibility Matrix
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Live Cold-Chain Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('about-safety'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  About & Medical Safety
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Clinical Partners
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => { onNavigate('hospitals-info'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  For Hospitals & ER
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('bloodbanks-info'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  For Blood Banks
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('create-request'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  + Code Red Requisition
                </button>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block pt-1">
                  Accredited by AABB & Regional Health Services
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Operational Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Staff & User Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => handlePortalSwitch('PATIENT', 'patient-dashboard')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Patient / Family Portal</span>
                  <span className="text-[10px] text-slate-500 font-mono">→</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePortalSwitch('HOSPITAL', 'hospital-dashboard')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Hospital Trauma Desk</span>
                  <span className="text-[10px] text-slate-500 font-mono">→</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePortalSwitch('BLOOD_BANK_STAFF', 'bloodbank-dashboard')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Blood Bank Console</span>
                  <span className="text-[10px] text-slate-500 font-mono">→</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePortalSwitch('DONOR', 'donor-dashboard')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Donor Dashboard</span>
                  <span className="text-[10px] text-slate-500 font-mono">→</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePortalSwitch('ADMIN', 'admin-dashboard')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full text-slate-500"
                >
                  <span>Network Admin Console</span>
                  <span className="text-[10px] text-slate-600 font-mono">→</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Safety Notice */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">
              Medical Governance & Algorithmic Safety Guarantee:
            </p>
            <p className="text-[11px] text-slate-500 max-w-3xl leading-relaxed">
              Blood compatibility matching and donor interval eligibility on BloodBridge are calculated strictly using deterministic clinical immunohematology algorithms adhering to AABB and FDA 21 CFR Part 606 standards. Probabilistic AI is never utilized for clinical eligibility or cross-match decisions.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
              AABB Compliant
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
              HIPAA Secure
            </span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} BloodBridge Emergency Health Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about-safety')} className="hover:text-slate-300">
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('about-safety')} className="hover:text-slate-300">
              Terms of Medical Service
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('compatibility')} className="hover:text-slate-300">
              Clinical Guidelines
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

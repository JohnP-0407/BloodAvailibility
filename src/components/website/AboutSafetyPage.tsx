import React from 'react';

interface AboutSafetyPageProps {
  onOpenCompatibility: () => void;
  onOpenDonate: () => void;
}

export const AboutSafetyPage: React.FC<AboutSafetyPageProps> = ({
  onOpenCompatibility,
  onOpenDonate
}) => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Transparency & Clinical Governance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About BloodBridge & Our Medical Safety Charter
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          BloodBridge was built with one paramount purpose: to ensure that when a human life hangs in the balance, verified compatible blood arrives at the hospital trauma bay without delay, error, or guesswork.
        </p>
      </div>

      {/* The Medical Safety Charter */}
      <div className="bg-rose-950 text-white p-8 sm:p-10 rounded-2xl border border-rose-900 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              The BloodBridge Medical Safety Guarantee
            </h2>
            <span className="text-xs text-rose-300 font-medium">
              Deterministic Immunohematology Standard
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-rose-100/90 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="text-rose-400">1.</span> Absolute Prohibition on Generative / Probabilistic AI
            </h3>
            <p>
              In transfusion medicine, a single ABO incompatibility can induce acute hemolytic transfusion reactions (AHTR) and fatal intravascular lysis. BloodBridge enforces a strict architectural invariant: AI models are strictly prohibited from evaluating blood compatibility, calculating donor eligibility, or modifying clinical rules.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="text-rose-400">2.</span> Hardcoded AABB / WHO Deterministic Rule Matrices
            </h3>
            <p>
              All cross-match validations, compatible donor identification, and 56-day clinical cooldowns are computed deterministically using standard immunohematology matrices. Every calculation can be audited and traced line-by-line.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="text-rose-400">3.</span> Verified Cold-Chain Custody
            </h3>
            <p>
              Blood products lose biological efficacy rapidly if temperature borders are violated. Packed Red Blood Cells (PRBC) must be maintained strictly between 2°C and 6°C, while platelets require continuous gentle agitation at 20°C–24°C. Our dispatch network requires continuous temperature logging.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="text-rose-400">4.</span> Donor Privacy & Zero Commercial Brokering
            </h3>
            <p>
              BloodBridge is 100% committed to voluntary, non-remunerated blood donation. Personal contact numbers are masked with cryptographic tokens. We do not sell user data or charge patient families blood broker fees.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-rose-900 flex items-center justify-between">
          <span className="text-[11px] text-rose-300 font-mono">
            Medical Safety Specification: MED-SPEC-REV-4.1
          </span>
          <button
            onClick={onOpenCompatibility}
            className="px-4 py-2 bg-white text-rose-950 font-bold rounded-lg text-xs hover:bg-rose-100 transition-colors"
          >
            Review Compatibility Matrix →
          </button>
        </div>
      </div>

      {/* Why BloodBridge Was Built */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            The Critical Challenge
          </span>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            Traditional Blood Coordination Relies on Phone Calls and Fragmented Silos.
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            During major obstetric hemorrhages or multi-car trauma collisions, ICU charge nurses and blood bank technicians routinely spend 45 to 90 minutes making manual phone calls across multiple municipal hospitals to locate rare blood groups.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            BloodBridge replaces this fractured manual process with a synchronized, automated regional grid. An emergency requisition locks units across verified repositories in less than 200 milliseconds, dispatches temperature-controlled transport, and triggers voluntary standby donor alerts.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Our 4 Core System Metrics</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">Dispatch Speed</span>
                <span className="block text-[11px] text-slate-500">Average time from order to courier wheels up</span>
              </div>
              <span className="text-lg font-black font-mono text-rose-600">18 min</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">Fulfillment Rate</span>
                <span className="block text-[11px] text-slate-500">Critical trauma requisitions met in full</span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-600">98.4%</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">Transfusion Safety</span>
                <span className="block text-[11px] text-slate-500">Cross-match mismatch rate</span>
              </div>
              <span className="text-lg font-black font-mono text-blue-600">0.00%</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">Active Repositories</span>
                <span className="block text-[11px] text-slate-500">Verified regional facilities</span>
              </div>
              <span className="text-lg font-black font-mono text-purple-600">8 Centers</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-xl font-black text-slate-900">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              Can patients or family members request blood directly?
            </h4>
            <p className="leading-relaxed">
              Yes. Patients and family members can submit requisitions indicating their treating hospital, physician contact, and required component. BloodBridge matches units from accredited repositories and dispatches directly to the hospital blood bank for crossmatching.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              How do emergency donor standby alerts work?
            </h4>
            <p className="leading-relaxed">
              When a local hospital experiences a blood shortfall that cannot be satisfied from cold-chain repository inventory, our system broadcasts an urgent standby request to compatible, eligible donors within a 15-km radius.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              How often can I donate blood?
            </h4>
            <p className="leading-relaxed">
              Whole blood donors must observe a minimum 56-day (8-week) recovery interval between donations. Apheresis platelet donors may donate every 7 days (up to 24 times per year). Our system tracks this interval automatically.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              What does "Universal Donor" really mean?
            </h4>
            <p className="leading-relaxed">
              O-negative red blood cells lack A, B, and Rh antigens, making them safe for almost any patient in acute emergencies. Conversely, AB-positive plasma lacks anti-A and anti-B antibodies, making AB donors universal for plasma.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-slate-900 text-white p-8 rounded-xl text-center space-y-4">
        <h3 className="text-2xl font-black">
          Be The Reason Someone Goes Home Today.
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Join our verified standby volunteer donor registry or partner with us as an accredited healthcare trauma facility.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={onOpenDonate}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
          >
            Register As A Volunteer Donor
          </button>
        </div>
      </div>
    </div>
  );
};

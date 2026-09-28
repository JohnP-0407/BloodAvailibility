import React, { useState } from 'react';
import { useBloodBridge } from '../../context/BloodBridgeContext';
import { BloodGroup } from '../../types/bloodbridge';

interface DonateBloodWebsiteViewProps {
  onDonorRegisteredSuccess: (donorId: string) => void;
  onNavigateToDonorPortal: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const DonateBloodWebsiteView: React.FC<DonateBloodWebsiteViewProps> = ({
  onDonorRegisteredSuccess,
  onNavigateToDonorPortal
}) => {
  const { registerDonor, hospitals, bloodBanks } = useBloodBridge();

  // Eligibility Quiz State
  const [quizAge, setQuizAge] = useState<boolean | null>(null);
  const [quizWeight, setQuizWeight] = useState<boolean | null>(null);
  const [quizInterval, setQuizInterval] = useState<boolean | null>(null);
  const [quizHealth, setQuizHealth] = useState<boolean | null>(null);

  // Registration Form State
  const [donorName, setDonorName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [weightKg, setWeightKg] = useState<number>(68);
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [email, setEmail] = useState('');
  const [preferredHospitalId, setPreferredHospitalId] = useState(hospitals[0]?.id || 'hosp-01');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isQuizComplete = quizAge !== null && quizWeight !== null && quizInterval !== null && quizHealth !== null;
  const isEligible = quizAge === true && quizWeight === true && quizInterval === true && quizHealth === true;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !contactNumber.trim()) {
      setErrorMessage('Please provide your name and phone number so we can alert you in an emergency.');
      return;
    }

    if (weightKg < 50) {
      setErrorMessage('Clinical safety regulations require donors to weigh at least 50 kg (110 lbs).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newDonor = await registerDonor({
        name: donorName,
        bloodGroup,
        age,
        gender,
        weightKg,
        contactNumber,
        city,
        email: email || `${donorName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
        preferredHospitalId,
        location: {
          lat: 37.7749 + (Math.random() - 0.5) * 0.04,
          lng: -122.4194 + (Math.random() - 0.5) * 0.04
        }
      });

      setSuccessMessage(`Welcome to BloodBridge, ${donorName}! Your volunteer registration was successful (Donor Code: ${newDonor.code}). You have been added to our live emergency standby network.`);
      onDonorRegisteredSuccess(newDonor.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-slate-900 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-bold uppercase tracking-wider border border-rose-400/30">
            <span>💉 Life-Saving Volunteer Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Give Blood. Save Lives.<br />
            <span className="text-rose-300">Answer The Emergency Call.</span>
          </h1>

          <p className="text-sm sm:text-base text-rose-100 leading-relaxed max-w-2xl">
            A single donation can save up to 3 lives. Through BloodBridge, your donation doesn't sit idle on a back shelf—our real-time grid connects you directly to emergency surgeries, pediatric trauma wards, and cancer chemotherapy units in your community.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <a
              href="#registration-form"
              className="px-6 py-3 bg-white text-rose-900 font-black rounded-lg text-sm hover:bg-rose-50 transition-all shadow-md"
            >
              Register as Volunteer Donor
            </a>
            <button
              onClick={onNavigateToDonorPortal}
              className="px-6 py-3 bg-rose-700/60 hover:bg-rose-700 text-white font-bold rounded-lg text-sm border border-rose-400/40 transition-all"
            >
              Existing Donor Dashboard →
            </button>
          </div>
        </div>

        {/* Decorative Blood Drop Graphic */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none text-[240px] select-none">
          🩸
        </div>
      </div>

      {/* Core Impact Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">1 = 3</div>
          <div className="text-xs font-bold text-slate-800">Lives Saved Per Donation</div>
          <div className="text-[11px] text-slate-500">Red cells, plasma, and platelets are separated for multiple patients</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">56 Days</div>
          <div className="text-xs font-bold text-slate-800">Mandatory Recovery Cooldown</div>
          <div className="text-[11px] text-slate-500">Protects donor iron levels and ensures clinical safety</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">5 Days</div>
          <div className="text-xs font-bold text-slate-800">Platelet Shelf Life</div>
          <div className="text-[11px] text-slate-500">Why constant voluntary platelet donations are urgently needed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">100%</div>
          <div className="text-xs font-bold text-slate-800">Voluntary & Altruistic</div>
          <div className="text-[11px] text-slate-500">Zero blood brokering fees. Direct community support</div>
        </div>
      </div>

      {/* Interactive 60-Second Eligibility Quiz */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Quick Pre-Screening
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Am I Eligible to Donate? (60-Second Check)
            </h2>
            <p className="text-xs text-slate-600">
              Answer 4 simple clinical questions to verify your eligibility according to standard blood banking guidelines.
            </p>
          </div>

          {isQuizComplete && (
            <div
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
                isEligible
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span>{isEligible ? '✅ You Are Clinically Eligible!' : '⚠️ Cooldown / Eligibility Notice'}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Question 1: Age */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              1. Are you at least 17 years of age?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuizAge(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizAge === true
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Yes (17+)
              </button>
              <button
                type="button"
                onClick={() => setQuizAge(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizAge === false
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                No (&lt;17)
              </button>
            </div>
          </div>

          {/* Question 2: Weight */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              2. Do you weigh at least 50 kg (110 lbs)?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuizWeight(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizWeight === true
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Yes (&ge;50 kg)
              </button>
              <button
                type="button"
                onClick={() => setQuizWeight(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizWeight === false
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                No (&lt;50 kg)
              </button>
            </div>
          </div>

          {/* Question 3: Interval */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              3. Has it been &ge;56 days since your last whole blood donation?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuizInterval(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizInterval === true
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Yes / First-Time Donor
              </button>
              <button
                type="button"
                onClick={() => setQuizInterval(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizInterval === false
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                No (&lt;56 Days Ago)
              </button>
            </div>
          </div>

          {/* Question 4: Health */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              4. Are you feeling well today with no active cold, flu, or fever?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuizHealth(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizHealth === true
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Yes (Feeling Healthy)
              </button>
              <button
                type="button"
                onClick={() => setQuizHealth(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                  quizHealth === false
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                No (Currently Unwell)
              </button>
            </div>
          </div>
        </div>

        {isQuizComplete && !isEligible && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold">Medical Note:</span>
            <p>
              Based on your answers, you may currently be within a clinical recovery cooldown or temporary deferral period. You are still encouraged to register on standby—our system will automatically notify you once your 56-day cooldown has elapsed!
            </p>
          </div>
        )}
      </div>

      {/* Registration Section */}
      <div id="registration-form" className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Join The Network
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Volunteer Donor Registration
          </h2>
          <p className="text-xs text-slate-600">
            Sign up in under 60 seconds. Your contact details remain strictly confidential and are only accessed during critical, geofenced hospital alerts.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="font-bold text-sm">🎉 {successMessage}</div>
            <button
              onClick={onNavigateToDonorPortal}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 transition-colors"
            >
              Open Your Donor Profile & Standby Dashboard →
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Phone (Emergency SMS Alerts) *
              </label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 019-2831"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Never shared publicly. Displays masked (e.g. +1 555 ***-**01) to protect privacy.
              </span>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Blood Group (ABO/Rh) *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg} {bg === 'O-' ? '(Universal RBC Donor)' : bg === 'AB+' ? '(Universal Plasma Donor)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex.morgan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Age & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="17"
                  max="75"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="50"
                  max="160"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Preferred Hospital Center */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Trauma Center or Blood Bank
              </label>
              <select
                value={preferredHospitalId}
                onChange={(e) => setPreferredHospitalId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500 max-w-md">
              By submitting, you agree to receive urgent life-saving donation standby notifications when matching blood shortfalls occur.
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-sm rounded-lg shadow-sm transition-all"
            >
              {isSubmitting ? 'Registering...' : 'Complete Volunteer Registration'}
            </button>
          </div>
        </form>
      </div>

      {/* Preparation & Care Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xl">💧</div>
          <h3 className="text-sm font-bold text-slate-900">1. Hydrate Beforehand</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Drink an extra 16 oz (500 ml) of water before your appointment. Proper hydration helps maintain healthy blood volume and ensures a rapid, comfortable collection.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xl">🥗</div>
          <h3 className="text-sm font-bold text-slate-900">2. Eat an Iron-Rich Meal</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Have a nutritious meal containing iron (spinach, beans, lean meats) 2-3 hours before donating. Avoid fatty foods which can interfere with clinical blood testing.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xl">🪪</div>
          <h3 className="text-sm font-bold text-slate-900">3. Rest & Recover</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Relax for 10-15 minutes after donation with a light snack. Avoid strenuous exercise or heavy lifting for the rest of the day while your plasma regenerates.
          </p>
        </div>
      </div>
    </div>
  );
};

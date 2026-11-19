import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  UserPlus,
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { LOGIN_ARTWORK_URL } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import { RvedhaLogo } from './RvedhaLogo';
import { ResilientImage } from './ResilientImage';

type PortalMode = 'patient-signin' | 'patient-register' | 'doctor-signin';

export function LoginPage() {
  const {
    state,
    loginAsPatient,
    registerNewPatient,
    loginPatientWithGoogle,
    loginAsDoctor,
    replayIntro,
  } = useRvedha();

  const [portalMode, setPortalMode] = useState<PortalMode>('patient-signin');

  // Patient sign-in state
  const [patientIdentifier, setPatientIdentifier] = useState('ananya.s@example.in');
  const [patientPassword, setPatientPassword] = useState('VedhaPatient@2026');

  // Patient registration state
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState('32');
  const [regGender, setRegGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Doctor sign-in state
  const [doctorIdentifier, setDoctorIdentifier] = useState('arjun.iyer@rvedha.in');
  const [doctorPassword, setDoctorPassword] = useState('VedhaDoctor@2026');

  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isDoctorPortal = portalMode === 'doctor-signin';

  const switchPortal = (next: PortalMode) => {
    setPortalMode(next);
    setAuthError(null);
    setForgotOpen(false);
    setResetSent(false);
  };

  const handlePatientSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginAsPatient(patientIdentifier, patientPassword);
    if (!res.ok) setAuthError(res.error || 'Unable to sign in.');
  };

  const handlePatientCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = registerNewPatient({
      fullName: regName,
      age: Number(regAge) || 30,
      gender: regGender,
      phone: regPhone,
      email: regEmail,
      address: regAddress,
      password: regPassword,
    });
    if (!res.ok) setAuthError(res.error || 'Could not register account.');
  };

  const handleDoctorSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginAsDoctor(doctorIdentifier, doctorPassword);
    if (!res.ok) setAuthError(res.error || 'Doctor authentication failed.');
  };

  const handleGooglePatientSignIn = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      loginPatientWithGoogle(
        cred.user.displayName || 'Patient Member',
        cred.user.email || 'patient@rvedha.in'
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Google Sign-In could not complete in this preview window.';
      setAuthError(`${msg} Use your Patient demo credentials or Create Account.`);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07111F] text-[#F4F6F9] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-[#C7CED8]/16 bg-[#101D2E] shadow-[0_32px_90px_-24px_rgba(0,0,0,0.85)] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Suite + Portal Selection Cards */}
        <div className="relative lg:col-span-5 min-h-[300px] lg:min-h-[680px] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#C7CED8]/14 bg-[#07111F]">
          <ResilientImage
            src={LOGIN_ARTWORK_URL}
            alt="R VEDHA luxury clinical architecture"
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(7,17,31,0.58) 0%, rgba(7,17,31,0.48) 42%, rgba(7,17,31,0.95) 100%)',
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-9">
            <div className="flex items-center justify-between gap-3">
              <RvedhaLogo showSubtitle subtitle="DUAL ACCESS PORTAL" />
              <button
                type="button"
                onClick={replayIntro}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#C7CED8]/25 bg-[#07111F]/75 px-3 py-1.5 text-[11px] font-medium text-[#C7CED8] hover:border-[#C8A96B]/60 hover:text-[#F4F6F9] transition cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-[#C8A96B]" />
                <span>Replay Intro</span>
              </button>
            </div>

            <div className="mt-10 lg:mt-0 space-y-5">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] text-[#C8A96B] uppercase">
                  Select Your Portal
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl font-semibold leading-tight text-[#F4F6F9] mt-1">
                  Tailored Care for Patients. Precision Control for Doctors.
                </h2>
              </div>

              {/* Two Distinct Interactive Role Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    switchPortal(
                      portalMode === 'patient-register' ? 'patient-register' : 'patient-signin'
                    )
                  }
                  className={`w-full text-left rounded-2xl border p-4 transition cursor-pointer ${
                    !isDoctorPortal
                      ? 'border-[#C7CED8]/60 bg-[#122236]/95 shadow-[0_14px_30px_-14px_rgba(199,206,216,0.35)]'
                      : 'border-[#C7CED8]/18 bg-[#07111F]/70 hover:border-[#C7CED8]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-[#C7CED8]/30 bg-[#172B44] flex items-center justify-center text-[#F4F6F9]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F4F6F9]">Patient Login</p>
                        <p className="text-[11px] text-[#8C9BAE]">
                          Book visits, reschedule & manage care
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition ${
                        !isDoctorPortal ? 'text-[#C7CED8]' : 'text-[#8C9BAE]/50'
                      }`}
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => switchPortal('doctor-signin')}
                  className={`w-full text-left rounded-2xl border p-4 transition cursor-pointer ${
                    isDoctorPortal
                      ? 'border-[#C8A96B]/75 bg-[#122236]/95 shadow-[0_14px_30px_-14px_rgba(200,169,107,0.45)]'
                      : 'border-[#C7CED8]/18 bg-[#07111F]/70 hover:border-[#C8A96B]/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-[#C8A96B]/45 bg-[#C8A96B]/12 flex items-center justify-center text-[#C8A96B]">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F4F6F9]">Doctor Portal</p>
                        <p className="text-[11px] text-[#8C9BAE]">
                          Clinical schedule, approvals & slots
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition ${
                        isDoctorPortal ? 'text-[#C8A96B]' : 'text-[#8C9BAE]/50'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Auth Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-11 flex flex-col justify-between bg-[#101D2E]">
          <div>
            {/* Role Mode Header + Segmented Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#C7CED8]/12">
              <div>
                <p
                  className={`text-[11px] font-semibold tracking-[0.2em] uppercase ${
                    isDoctorPortal ? 'text-[#C8A96B]' : 'text-[#C7CED8]'
                  }`}
                >
                  {portalMode === 'doctor-signin'
                    ? 'Attending Specialist Access'
                    : portalMode === 'patient-register'
                      ? 'New Patient Registration'
                      : 'Patient Care Portal'}
                </p>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9] mt-1">
                  {portalMode === 'doctor-signin'
                    ? 'Doctor Sign In'
                    : portalMode === 'patient-register'
                      ? 'Create Patient Account'
                      : 'Welcome Back'}
                </h1>
              </div>

              {!isDoctorPortal && (
                <div className="inline-flex rounded-xl border border-[#C7CED8]/18 bg-[#07111F] p-1 self-start">
                  <button
                    type="button"
                    onClick={() => switchPortal('patient-signin')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                      portalMode === 'patient-signin'
                        ? 'bg-[#C7CED8] text-[#07111F] font-semibold'
                        : 'text-[#8C9BAE] hover:text-[#F4F6F9]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchPortal('patient-register')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                      portalMode === 'patient-register'
                        ? 'bg-[#C7CED8] text-[#07111F] font-semibold'
                        : 'text-[#8C9BAE] hover:text-[#F4F6F9]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>

            {authError && (
              <div className="mb-5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 leading-relaxed">
                {authError}
              </div>
            )}

            {/* Forgot Password Flow */}
            {forgotOpen ? (
              <div className="rvedha-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-semibold text-[#F4F6F9]">
                    {isDoctorPortal ? 'Recover Doctor Credentials' : 'Reset Patient Password'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(false);
                      setResetSent(false);
                    }}
                    className="text-xs text-[#C8A96B] hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
                <p className="text-xs text-[#8C9BAE] leading-relaxed">
                  {isDoctorPortal
                    ? 'Enter your registered Doctor Email or Doctor ID (e.g., RV-DOC-101) to dispatch clinical access recovery.'
                    : 'Enter your registered Patient Email or mobile number to receive a recovery link.'}
                </p>
                <input
                  type="text"
                  value={resetTarget}
                  onChange={(e) => setResetTarget(e.target.value)}
                  placeholder={
                    isDoctorPortal ? 'arjun.iyer@rvedha.in or RV-DOC-101' : 'ananya.s@example.in'
                  }
                  className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
                />
                {resetSent ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Recovery instructions dispatched to{' '}
                      {resetTarget || (isDoctorPortal ? doctorIdentifier : patientIdentifier)}.
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="rvedha-gold-btn w-full rounded-xl py-2.5 text-sm font-semibold cursor-pointer min-h-[44px]"
                  >
                    Send Recovery Link
                  </button>
                )}
              </div>
            ) : portalMode === 'patient-signin' ? (
              /* PATIENT SIGN IN FORM */
              <form onSubmit={handlePatientSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={patientIdentifier}
                      onChange={(e) => setPatientIdentifier(e.target.value)}
                      placeholder="ananya.s@example.in or +91 98401 44210"
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F]/90 pl-10 pr-4 py-3 text-sm text-[#F4F6F9] placeholder-[#8C9BAE]/60 focus:border-[#C7CED8] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F]/90 pl-10 pr-11 py-3 text-sm text-[#F4F6F9] focus:border-[#C7CED8] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C9BAE] hover:text-[#F4F6F9] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => switchPortal('patient-register')}
                    className="text-[#C7CED8] hover:text-[#F4F6F9] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>New patient? Create account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-[#C8A96B] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="rvedha-gold-btn w-full rounded-xl py-3 text-sm font-semibold cursor-pointer min-h-[46px]"
                  >
                    Sign In to Patient Portal
                  </button>

                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={handleGooglePatientSignIn}
                    className="rvedha-silver-btn w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium cursor-pointer min-h-[44px] disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.31 0 3.25 2.69 1.25 6.61l3.67 2.85C5.79 6.84 8.64 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.52-1.14 2.81-2.43 3.67l3.73 2.9c2.18-2.01 3.72-4.97 3.72-8.81z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M4.92 14.54c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L1.25 7.51C.45 9.1 0 10.89 0 12.75s.45 3.65 1.25 5.24l3.67-3.45z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.73-2.9c-1.08.72-2.45 1.16-4.2 1.16-3.36 0-6.21-1.84-7.08-4.46l-3.67 2.85C3.25 21.31 7.31 24 12 24z"
                      />
                    </svg>
                    <span>{googleLoading ? 'Connecting...' : 'Continue with Google (Patient)'}</span>
                  </button>
                </div>

                {/* Demo Quick Switcher for Testing Patients */}
                <div className="pt-3 border-t border-[#C7CED8]/12">
                  <p className="text-[11px] text-[#8C9BAE] mb-2">
                    Demo patient accounts (tap to autofill):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {state.patients.slice(0, 3).map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => {
                          setPatientIdentifier(pat.email);
                          setPatientPassword(pat.password);
                        }}
                        className="rounded-lg border border-[#C7CED8]/20 bg-[#07111F] px-2.5 py-1.5 text-[11px] text-[#C7CED8] hover:border-[#C8A96B]/60 transition cursor-pointer"
                      >
                        {pat.fullName}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : portalMode === 'patient-register' ? (
              /* NEW PATIENT REGISTRATION FORM */
              <form onSubmit={handlePatientCreateAccount} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g., Meenakshi Sundaram"
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98400 11223"
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="patient@example.in"
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#C7CED8] mb-1">Age</label>
                    <input
                      type="number"
                      min={1}
                      max={115}
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#C7CED8] mb-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as 'Female' | 'Male' | 'Other')}
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2.5 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                      City / Address
                    </label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Chennai, India"
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                      Create Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rvedha-gold-btn w-full rounded-xl py-3 text-sm font-semibold cursor-pointer min-h-[46px] mt-2"
                >
                  Create Patient Account & Sign In
                </button>
              </form>
            ) : (
              /* DOCTOR PORTAL SIGN IN FORM */
              <form onSubmit={handleDoctorSignIn} className="space-y-4">
                <div className="rounded-xl border border-[#C8A96B]/30 bg-[#C8A96B]/8 px-4 py-3 flex items-center gap-3 text-xs text-[#E3C88E]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#C8A96B]" />
                  <span>
                    Isolated Clinical Portal — Access is scoped strictly to your assigned specialist roster.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">
                    Doctor Email or Doctor ID
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-[#C8A96B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={doctorIdentifier}
                      onChange={(e) => setDoctorIdentifier(e.target.value)}
                      placeholder="arjun.iyer@rvedha.in or RV-DOC-101"
                      className="w-full rounded-xl border border-[#C8A96B]/30 bg-[#07111F]/90 pl-10 pr-4 py-3 text-sm text-[#F4F6F9] placeholder-[#8C9BAE]/60 focus:border-[#C8A96B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">
                    Clinical Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      placeholder="Enter doctor password"
                      className="w-full rounded-xl border border-[#C8A96B]/30 bg-[#07111F]/90 pl-10 pr-11 py-3 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C9BAE] hover:text-[#F4F6F9] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8C9BAE]">Verified specialist credentials required</span>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-[#C8A96B] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="rvedha-gold-btn w-full rounded-xl py-3 text-sm font-semibold cursor-pointer min-h-[46px]"
                >
                  Secure Doctor Portal Access
                </button>

                {/* Quick Specialist Credentials for Demo Testing */}
                <div className="pt-3 border-t border-[#C7CED8]/12">
                  <p className="text-[11px] text-[#8C9BAE] mb-2">
                    Demo specialist accounts (tap to autofill):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {state.doctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setDoctorIdentifier(doc.email);
                          setDoctorPassword(doc.password);
                        }}
                        className="rounded-lg border border-[#C7CED8]/20 bg-[#07111F] px-2.5 py-1.5 text-[11px] text-[#C7CED8] hover:border-[#C8A96B]/60 transition cursor-pointer"
                      >
                        {doc.name} ({doc.doctorCode})
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 pt-5 border-t border-[#C7CED8]/12 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#8C9BAE]">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#C8A96B]" />
              Role-Protected Clinical Session
            </span>
            <span>R VEDHA · Dual Portal Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}

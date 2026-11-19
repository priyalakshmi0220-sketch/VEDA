import React, { useState } from 'react';
import {
  BellRing,
  CalendarCog,
  CheckCircle2,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { PATIENT_DEFAULT_AVATAR } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import { ResilientImage } from './ResilientImage';

export function ProfileSettingsPage() {
  const {
    state,
    currentPatient,
    currentDoctor,
    updateOwnPatientProfile,
    updateOwnDoctorProfile,
    updateNotificationPrefs,
    updateCalendarPrefs,
    updateSecurityPrefs,
    replayIntro,
    resetDemoData,
    logout,
  } = useRvedha();

  const isDoctor = state.activeRole === 'doctor';

  // Editable form state synced to active user
  const [patientForm, setPatientForm] = useState({
    fullName: currentPatient?.fullName || '',
    phone: currentPatient?.phone || '',
    email: currentPatient?.email || '',
    address: currentPatient?.address || '',
    age: String(currentPatient?.age || 30),
    bloodGroup: currentPatient?.bloodGroup || 'O+',
  });

  const [doctorForm, setDoctorForm] = useState({
    name: currentDoctor?.name || '',
    qualification: currentDoctor?.qualification || '',
    specialty: currentDoctor?.specialty || '',
    location: currentDoctor?.location || '',
    feeInr: String(currentDoctor?.feeInr || 1500),
    bio: currentDoctor?.bio || '',
  });

  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDoctor) {
      updateOwnDoctorProfile({
        name: doctorForm.name,
        qualification: doctorForm.qualification,
        specialty: doctorForm.specialty,
        location: doctorForm.location,
        feeInr: Number(doctorForm.feeInr) || 1500,
        bio: doctorForm.bio,
      });
    } else {
      updateOwnPatientProfile({
        fullName: patientForm.fullName,
        phone: patientForm.phone,
        email: patientForm.email,
        address: patientForm.address,
        age: Number(patientForm.age) || 30,
        bloodGroup: patientForm.bloodGroup,
      });
    }
    setSavedBanner('Profile settings updated successfully.');
    setTimeout(() => setSavedBanner(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#8C9BAE] mt-1">
          {isDoctor
            ? 'Manage your specialist profile, notification preferences, and calendar defaults.'
            : 'Keep your personal health contact details, notifications, and preferences up to date.'}
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="rvedha-card rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#C7CED8]/14">
          <div className="flex items-center gap-4">
            <ResilientImage
              src={isDoctor ? currentDoctor?.avatarUrl : PATIENT_DEFAULT_AVATAR}
              alt={isDoctor ? currentDoctor?.name || 'Doctor' : currentPatient?.fullName || 'Patient'}
              fallbackLabel={isDoctor ? currentDoctor?.name : currentPatient?.fullName}
              className="h-20 w-20 rounded-2xl object-cover border border-[#C8A96B]/40"
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#C8A96B] uppercase tabular-nums">
                <UserCheck className="w-3.5 h-3.5" />
                {isDoctor ? currentDoctor?.doctorCode : currentPatient?.id}
              </span>
              <h2 className="font-heading text-2xl font-bold text-[#F4F6F9] mt-0.5">
                {isDoctor ? currentDoctor?.name : currentPatient?.fullName}
              </h2>
              <p className="text-xs text-[#8C9BAE]">
                {isDoctor
                  ? `${currentDoctor?.department} · ${currentDoctor?.email}`
                  : `${currentPatient?.email} · ${currentPatient?.phone}`}
              </p>
            </div>
          </div>

          {savedBanner && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/12 px-3.5 py-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedBanner}</span>
            </div>
          )}
        </div>

        {isDoctor ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Full Name</label>
              <input
                type="text"
                value={doctorForm.name}
                onChange={(e) => setDoctorForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Qualification</label>
              <input
                type="text"
                value={doctorForm.qualification}
                onChange={(e) => setDoctorForm((p) => ({ ...p, qualification: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Specialty</label>
              <input
                type="text"
                value={doctorForm.specialty}
                onChange={(e) => setDoctorForm((p) => ({ ...p, specialty: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                value={doctorForm.feeInr}
                onChange={(e) => setDoctorForm((p) => ({ ...p, feeInr: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Suite Location</label>
              <input
                type="text"
                value={doctorForm.location}
                onChange={(e) => setDoctorForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Clinical Bio</label>
              <textarea
                rows={2}
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm((p) => ({ ...p, bio: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2 text-sm text-[#F4F6F9]"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Full Name</label>
              <input
                type="text"
                value={patientForm.fullName}
                onChange={(e) => setPatientForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Mobile Number</label>
              <input
                type="tel"
                value={patientForm.phone}
                onChange={(e) => setPatientForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Email Address</label>
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Age</label>
              <input
                type="number"
                value={patientForm.age}
                onChange={(e) => setPatientForm((p) => ({ ...p, age: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Blood Group</label>
              <input
                type="text"
                value={patientForm.bloodGroup}
                onChange={(e) => setPatientForm((p) => ({ ...p, bloodGroup: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Address</label>
              <input
                type="text"
                value={patientForm.address}
                onChange={(e) => setPatientForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rvedha-gold-btn rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
          >
            Save Profile Changes
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications & Calendar Preferences */}
        <div className="rvedha-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#C7CED8]/12">
            <BellRing className="w-5 h-5 text-[#C8A96B]" />
            <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
              Alert Preferences
            </h3>
          </div>
          <div className="space-y-3">
            {(
              [
                ['newAppointmentAlerts', 'Appointment booking alerts'],
                ['rescheduleAlerts', 'Rescheduling updates'],
                ['cancellationAlerts', 'Cancellation notifications'],
                ['reminderAlerts', 'Upcoming appointment reminders'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/65 px-4 py-3 cursor-pointer"
              >
                <span className="text-xs font-medium text-[#F4F6F9]">{label}</span>
                <input
                  type="checkbox"
                  checked={state.notificationPrefs[key]}
                  onChange={(e) => updateNotificationPrefs({ [key]: e.target.checked })}
                  className="h-4 w-4 accent-[#C8A96B]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Calendar & Session Controls */}
        <div className="rvedha-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#C7CED8]/12">
            <CalendarCog className="w-5 h-5 text-[#C8A96B]" />
            <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
              Calendar & Session Controls
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                Default Calendar View
              </label>
              <select
                value={state.calendarPrefs.defaultView}
                onChange={(e) =>
                  updateCalendarPrefs({
                    defaultView: e.target.value as 'month' | 'week' | 'day',
                  })
                }
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2.5 text-xs text-[#F4F6F9]"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                Start Day of Week
              </label>
              <select
                value={state.calendarPrefs.startDayOfWeek}
                onChange={(e) =>
                  updateCalendarPrefs({
                    startDayOfWeek: e.target.value as 'Monday' | 'Sunday',
                  })
                }
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2.5 text-xs text-[#F4F6F9]"
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/65 px-4 py-3 cursor-pointer">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#F4F6F9]">
              <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
              Two-Factor Authentication (2FA)
            </span>
            <input
              type="checkbox"
              checked={state.securityPrefs.twoFactorEnabled}
              onChange={(e) => updateSecurityPrefs({ twoFactorEnabled: e.target.checked })}
              className="h-4 w-4 accent-[#C8A96B]"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={replayIntro}
              className="rvedha-silver-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Replay 10s Intro</span>
            </button>
            <button
              type="button"
              onClick={resetDemoData}
              className="rvedha-silver-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Reset Demo Data</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/35 bg-rose-500/12 px-4 py-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 cursor-pointer min-h-[42px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account / Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
  Stethoscope,
} from 'lucide-react';
import { formatIsoDate } from '../data/demoData';
import { useRvedha, type BookingConfirmation } from '../context/RvedhaContext';
import type { ConsultationType, DepartmentName } from '../types/rvedha';
import { ResilientImage } from './ResilientImage';
import { StatusBadge } from './StatusBadge';

const DEPARTMENTS: Array<'ALL' | DepartmentName> = [
  'ALL',
  'Cardiology',
  'General Medicine',
  'Dermatology',
  'Neurology',
  'Orthopedics',
];

export function PatientBookAppointmentPage() {
  const {
    state,
    isDateAvailableForDoctor,
    getAvailableSlotsForDoctor,
    bookAppointment,
    setActiveSection,
  } = useRvedha();

  const todayIso = formatIsoDate(new Date());

  const [selectedDept, setSelectedDept] = useState<'ALL' | DepartmentName>('ALL');
  const [selectedDoctorId, setSelectedDoctorId] = useState(state.doctors[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('In-Person');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const filteredDoctors = useMemo(() => {
    return selectedDept === 'ALL'
      ? state.doctors
      : state.doctors.filter((d) => d.department === selectedDept);
  }, [state.doctors, selectedDept]);

  const activeDoctor = useMemo(() => {
    return (
      filteredDoctors.find((d) => d.id === selectedDoctorId) ||
      filteredDoctors[0] ||
      state.doctors[0]
    );
  }, [filteredDoctors, selectedDoctorId, state.doctors]);

  const dateAvailability = activeDoctor
    ? isDateAvailableForDoctor(activeDoctor.id, selectedDate)
    : { available: false, reason: 'Select a doctor' };

  const availableSlots = activeDoctor
    ? getAvailableSlotsForDoctor(activeDoctor.id, selectedDate)
    : [];

  const effectiveSlot =
    selectedSlot && availableSlots.includes(selectedSlot) ? selectedSlot : availableSlots[0] || '';

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!activeDoctor) {
      setErrorMsg('Please select a doctor.');
      return;
    }
    if (!dateAvailability.available) {
      setErrorMsg(dateAvailability.reason || 'Selected date is unavailable.');
      return;
    }
    if (!effectiveSlot) {
      setErrorMsg('Please select an available time slot.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please enter your symptoms or reason for consultation.');
      return;
    }

    const res = bookAppointment({
      doctorId: activeDoctor.id,
      date: selectedDate,
      time: effectiveSlot,
      consultationType,
      reason,
      notes,
    });

    if (!res.ok || !res.confirmation) {
      setErrorMsg(res.error || 'Unable to confirm appointment.');
      return;
    }
    setConfirmation(res.confirmation);
  };

  if (confirmation) {
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="rvedha-card print-only-card rounded-3xl p-7 sm:p-10 space-y-6">
          <div className="text-center space-y-3 pb-6 border-b border-[#C7CED8]/14">
            <div className="h-14 w-14 mx-auto rounded-2xl border border-emerald-400/35 bg-emerald-500/12 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-[#C8A96B]">R VEDHA · Booking Confirmation</p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
              Appointment Booked Successfully
            </h1>
            <div className="flex justify-center pt-1">
              <StatusBadge status={confirmation.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 p-4">
              <span className="text-[#8C9BAE] block">Appointment ID</span>
              <span className="text-base font-bold text-[#C8A96B] tabular-nums mt-1 block">
                {confirmation.bookingRef}
              </span>
            </div>
            <div className="rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 p-4">
              <span className="text-[#8C9BAE] block">Patient Name & ID</span>
              <span className="text-sm font-semibold text-[#F4F6F9] mt-1 block">
                {confirmation.patientName} ({confirmation.patientId})
              </span>
            </div>
            <div className="rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 p-4">
              <span className="text-[#8C9BAE] block">Specialist</span>
              <span className="text-sm font-semibold text-[#F4F6F9] mt-1 block">
                {confirmation.doctorName}
              </span>
              <span className="text-[11px] text-[#8C9BAE]">{confirmation.department}</span>
            </div>
            <div className="rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 p-4">
              <span className="text-[#8C9BAE] block">Date & Time</span>
              <span className="text-sm font-semibold text-[#F4F6F9] tabular-nums mt-1 block">
                {confirmation.date} · {confirmation.time}
              </span>
              <span className="text-[11px] text-[#8C9BAE]">
                {confirmation.consultationType} · Fee ₹{confirmation.feeInr}
              </span>
            </div>
          </div>

          <div className="no-print flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rvedha-silver-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-[#C8A96B]" />
              <span>Print Confirmation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('my-appointments')}
              className="rvedha-gold-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold cursor-pointer min-h-[44px]"
            >
              <span>Go to My Appointments</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
          Book New Appointment
        </h1>
        <p className="text-xs sm:text-sm text-[#8C9BAE] mt-1">
          Choose your specialization, inspect live specialist availability, and confirm your slot.
        </p>
      </div>

      {/* Step 1: Choose Department */}
      <div className="rvedha-card rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-[#C8A96B]">01. Choose Department or Specialization</p>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => {
                setSelectedDept(dept);
                const nextMatch =
                  dept === 'ALL'
                    ? state.doctors[0]
                    : state.doctors.find((d) => d.department === dept);
                if (nextMatch) setSelectedDoctorId(nextMatch.id);
                setSelectedSlot('');
              }}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedDept === dept
                  ? 'rvedha-gold-btn font-semibold'
                  : 'border border-[#C7CED8]/18 bg-[#07111F] text-[#C7CED8] hover:border-[#C8A96B]/55'
              }`}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Steps 2 & 3: Select Doctor + View Doctor Profile & Availability */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rvedha-card rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-[#C8A96B]">02. Select Specialist</p>
            <div className="space-y-3">
              {filteredDoctors.map((doc) => {
                const isSelected = activeDoctor?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedDoctorId(doc.id);
                      setSelectedSlot('');
                    }}
                    className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition cursor-pointer ${
                      isSelected
                        ? 'border-[#C8A96B] bg-[#172B44]/85'
                        : 'border-[#C7CED8]/14 bg-[#07111F]/65 hover:border-[#C7CED8]/35'
                    }`}
                  >
                    <ResilientImage
                      src={doc.avatarUrl}
                      alt={doc.name}
                      fallbackLabel={doc.name}
                      className="h-14 w-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#F4F6F9] truncate">{doc.name}</p>
                        <span className="text-xs font-semibold text-[#C8A96B] tabular-nums shrink-0">
                          ₹{doc.feeInr}
                        </span>
                      </div>
                      <p className="text-xs text-[#C7CED8] truncate">
                        {doc.department} · {doc.experienceYears} yrs exp
                      </p>
                      <p className="text-[11px] text-[#8C9BAE] truncate mt-0.5">
                        {doc.status} · {doc.availableDays.join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Doctor Profile & Availability Summary */}
          {activeDoctor && (
            <div className="rvedha-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-[#C8A96B]">
                03. Doctor Profile & Live Availability
              </p>
              <div className="flex items-start gap-3">
                <Stethoscope className="w-4 h-4 text-[#C8A96B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#F4F6F9]">
                    {activeDoctor.name} — {activeDoctor.qualification}
                  </p>
                  <p className="text-xs text-[#8C9BAE] mt-1 leading-relaxed">{activeDoctor.bio}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-2 border-t border-[#C7CED8]/12">
                <div className="flex items-center gap-2 text-[#C7CED8]">
                  <CalendarDays className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>{activeDoctor.availableDays.join(' · ')}</span>
                </div>
                <div className="flex items-center gap-2 text-[#C7CED8] tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>
                    {activeDoctor.workingHoursStart} – {activeDoctor.workingHoursEnd} (
                    {activeDoctor.consultationDurationMin}m)
                  </span>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 text-[#8C9BAE]">
                  <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>{activeDoctor.location}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Steps 4–7: Date, Live Slots, Symptoms & Confirm Booking */}
        <form onSubmit={handleConfirmBooking} className="lg:col-span-6 rvedha-card rounded-2xl p-5 sm:p-6 space-y-5 h-fit">
          {errorMsg && (
            <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#C8A96B] mb-2">
              04. Select Available Date
            </label>
            <input
              type="date"
              min={todayIso}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot('');
              }}
              className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums focus:border-[#C8A96B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C8A96B] mb-2">
              05. Select Available Time Slot ({availableSlots.length} open)
            </label>
            {!dateAvailability.available ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                {dateAvailability.reason}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                All slots for {activeDoctor?.name} on {selectedDate} are booked. Please pick another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => {
                  const active = effectiveSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl py-2.5 px-2 text-xs font-semibold tabular-nums transition cursor-pointer min-h-[42px] ${
                        active
                          ? 'rvedha-gold-btn'
                          : 'border border-[#C7CED8]/20 bg-[#07111F] text-[#C7CED8] hover:border-[#C8A96B]/60'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#C8A96B]">
              06. Symptoms & Consultation Details
            </p>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                Consultation Mode
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] focus:border-[#C8A96B] focus:outline-none"
              >
                <option value="In-Person">In-Person Consultation</option>
                <option value="Video Consultation">Video Consultation</option>
                <option value="Executive Checkup">Executive Checkup</option>
                <option value="Follow-Up">Follow-Up</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                Symptoms or Consultation Reason *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms, duration, or checkup purpose..."
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] placeholder-[#8C9BAE]/60 focus:border-[#C8A96B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">
                Additional Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Existing prescriptions, lab reports, accessibility needs..."
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] placeholder-[#8C9BAE]/60 focus:border-[#C8A96B] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!dateAvailability.available || !effectiveSlot}
            className="rvedha-gold-btn w-full rounded-xl py-3 text-sm font-semibold cursor-pointer min-h-[46px] disabled:opacity-50"
          >
            07. Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}

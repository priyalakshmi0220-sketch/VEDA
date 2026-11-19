import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Eye,
  PlusCircle,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { formatIsoDate } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import type { Appointment } from '../types/rvedha';
import { StatusBadge } from './StatusBadge';

export function PatientAppointmentsPage({
  mode,
}: {
  mode: 'all' | 'upcoming' | 'history';
}) {
  const {
    state,
    currentPatient,
    globalSearch,
    setActiveSection,
    cancelAppointment,
    rescheduleAppointment,
    isDateAvailableForDoctor,
    getAvailableSlotsForDoctor,
  } = useRvedha();

  const [localSearch, setLocalSearch] = useState('');
  const [detailApt, setDetailApt] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const todayIso = formatIsoDate(new Date());

  const myAppointments = useMemo(() => {
    if (!currentPatient) return [];
    const base = state.appointments.filter((a) => a.patientId === currentPatient.id);
    const scoped =
      mode === 'upcoming'
        ? base.filter((a) => a.status !== 'Completed' && a.status !== 'Cancelled')
        : mode === 'history'
          ? base.filter((a) => a.status === 'Completed' || a.status === 'Cancelled')
          : base;

    const q = (localSearch || globalSearch).trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter((a) =>
      `${a.doctorName} ${a.doctorSpecialty} ${a.department} ${a.bookingRef} ${a.date} ${a.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [state.appointments, currentPatient, mode, localSearch, globalSearch]);

  const pageTitle =
    mode === 'upcoming'
      ? 'Upcoming Appointments'
      : mode === 'history'
        ? 'Appointment History'
        : 'My Appointments';

  const openReschedule = (apt: Appointment) => {
    setModalError(null);
    setRescheduleTarget(apt);
    setNewDate(apt.date >= todayIso ? apt.date : todayIso);
    setNewTime('');
  };

  const rescheduleDateCheck = rescheduleTarget
    ? isDateAvailableForDoctor(rescheduleTarget.doctorId, newDate)
    : { available: false };

  const rescheduleAvailableSlots = rescheduleTarget
    ? getAvailableSlotsForDoctor(rescheduleTarget.doctorId, newDate)
    : [];

  const chosenRescheduleTime =
    newTime && rescheduleAvailableSlots.includes(newTime)
      ? newTime
      : rescheduleAvailableSlots[0] || '';

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    const res = cancelAppointment(cancelTarget.id);
    if (res.ok) {
      setFeedbackBanner(
        `Appointment ${cancelTarget.bookingRef} has been cancelled and the time slot has been released.`
      );
    }
    setCancelTarget(null);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !newDate || !chosenRescheduleTime) {
      setModalError('Select a valid date and available time slot.');
      return;
    }
    const res = rescheduleAppointment(rescheduleTarget.id, newDate, chosenRescheduleTime);
    if (!res.ok) {
      setModalError(res.error || 'Could not reschedule appointment.');
      return;
    }
    setRescheduleTarget(null);
    setFeedbackBanner('Your appointment has been successfully rescheduled.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#8C9BAE] mt-1">
            Inspect booking references, reschedule slots seamlessly, or cancel upcoming visits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('book-appointment')}
          className="rvedha-gold-btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer min-h-[44px] whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {feedbackBanner && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/12 px-4 py-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="rvedha-card rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by doctor, specialization, date, or Appointment ID..."
            className="w-full rounded-xl border border-[#C7CED8]/18 bg-[#07111F] pl-10 pr-4 py-2.5 text-xs text-[#F4F6F9] placeholder-[#8C9BAE]/70 focus:border-[#C8A96B] focus:outline-none"
          />
        </div>
      </div>

      {/* Appointments Grid */}
      {myAppointments.length === 0 ? (
        <div className="rvedha-card rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm font-medium text-[#F4F6F9]">No appointments found here.</p>
          <p className="text-xs text-[#8C9BAE]">
            Ready to consult a specialist? Reserve a time slot in seconds.
          </p>
          <button
            type="button"
            onClick={() => setActiveSection('book-appointment')}
            className="rvedha-gold-btn rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myAppointments.map((apt) => {
            const canModify = apt.status !== 'Completed' && apt.status !== 'Cancelled';
            return (
              <div
                key={apt.id}
                className="rvedha-card rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-[#C8A96B] tabular-nums">
                        ID: {apt.bookingRef}
                      </p>
                      <h2 className="font-heading text-2xl font-bold text-[#F4F6F9] mt-0.5">
                        {apt.doctorName}
                      </h2>
                      <p className="text-xs text-[#C7CED8]">
                        {apt.doctorSpecialty} · {apt.department}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/65 p-3.5 text-xs">
                    <div>
                      <span className="text-[11px] text-[#8C9BAE] block">Appointment Date</span>
                      <span className="font-semibold text-[#F4F6F9] tabular-nums">{apt.date}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#8C9BAE] block">Appointment Time</span>
                      <span className="font-semibold text-[#C8A96B] tabular-nums">{apt.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#C7CED8]/12">
                  <button
                    type="button"
                    onClick={() => setDetailApt(apt)}
                    className="rvedha-silver-btn inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium cursor-pointer min-h-[40px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>View Details</span>
                  </button>

                  {canModify && (
                    <>
                      <button
                        type="button"
                        onClick={() => openReschedule(apt)}
                        className="rvedha-silver-btn inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium cursor-pointer min-h-[40px]"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>Reschedule Appointment</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancelTarget(apt)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/20 cursor-pointer min-h-[40px]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Appointment</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {detailApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm p-4">
          <div className="rvedha-card w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#C7CED8]/14">
              <div>
                <p className="text-xs font-semibold text-[#C8A96B] tabular-nums">
                  {detailApt.bookingRef}
                </p>
                <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                  {detailApt.doctorName}
                </h3>
                <p className="text-xs text-[#C7CED8]">
                  {detailApt.doctorSpecialty} ({detailApt.department})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailApt(null)}
                className="h-8 w-8 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#8C9BAE] hover:text-[#F4F6F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8C9BAE]">Current Status</span>
              <StatusBadge status={detailApt.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#07111F]/65 border border-[#C7CED8]/12 p-3.5 text-xs">
              <div>
                <span className="text-[#8C9BAE] block">Date</span>
                <span className="font-semibold text-[#F4F6F9] tabular-nums">{detailApt.date}</span>
              </div>
              <div>
                <span className="text-[#8C9BAE] block">Time</span>
                <span className="font-semibold text-[#C8A96B] tabular-nums">{detailApt.time}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#8C9BAE] block">Consultation Type</span>
                <span className="font-semibold text-[#F4F6F9]">{detailApt.consultationType}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[#8C9BAE] block">Consultation Reason</span>
              <p className="rounded-xl bg-[#07111F]/70 border border-[#C7CED8]/12 p-3 text-[#F4F6F9]">
                {detailApt.reason}
              </p>
            </div>

            {detailApt.consultationNotes && (
              <div className="space-y-1 text-xs">
                <span className="text-[#C8A96B] font-semibold block">Doctor Consultation Notes</span>
                <p className="rounded-xl bg-[#122236] border border-[#C8A96B]/30 p-3 text-[#F4F6F9]">
                  {detailApt.consultationNotes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailApt(null)}
                className="rvedha-gold-btn rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm p-4">
          <div className="rvedha-card w-full max-w-md rounded-3xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl border border-rose-400/35 bg-rose-500/12 flex items-center justify-center text-rose-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                  Cancel Appointment
                </h3>
                <p className="text-xs text-[#C7CED8] mt-1">
                  Are you sure you want to cancel this appointment?
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-[#F4F6F9]">
                {cancelTarget.doctorName} · {cancelTarget.bookingRef}
              </p>
              <p className="text-[#8C9BAE] tabular-nums">
                {cancelTarget.date} at {cancelTarget.time}
              </p>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rvedha-silver-btn rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-xl border border-rose-400/50 bg-rose-500/20 px-4 py-2.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/30 cursor-pointer min-h-[42px]"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm p-4">
          <div className="rvedha-card w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#C7CED8]/14">
              <div>
                <p className="text-xs font-semibold text-[#C8A96B] tabular-nums">
                  {rescheduleTarget.bookingRef}
                </p>
                <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-[#8C9BAE]">{rescheduleTarget.doctorName}</p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="h-8 w-8 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#8C9BAE] hover:text-[#F4F6F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">
                  Select New Date
                </label>
                <input
                  type="date"
                  min={todayIso}
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewTime('');
                  }}
                  className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums focus:border-[#C8A96B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">
                  Available Time Slots ({rescheduleAvailableSlots.length})
                </label>
                {!rescheduleDateCheck.available ? (
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    {rescheduleDateCheck.reason}
                  </p>
                ) : rescheduleAvailableSlots.length === 0 ? (
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    No open slots left on {newDate}. Select another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {rescheduleAvailableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setNewTime(slot)}
                        className={`rounded-xl py-2 px-2 text-xs font-semibold tabular-nums transition cursor-pointer ${
                          chosenRescheduleTime === slot
                            ? 'rvedha-gold-btn'
                            : 'border border-[#C7CED8]/20 bg-[#07111F] text-[#C7CED8] hover:border-[#C8A96B]/55'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="rvedha-silver-btn rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rescheduleDateCheck.available || !chosenRescheduleTime}
                  className="rvedha-gold-btn rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Confirm Rescheduling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

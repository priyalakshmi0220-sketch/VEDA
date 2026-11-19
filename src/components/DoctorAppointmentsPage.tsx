import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  Check,
  CheckCheck,
  FileText,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { formatIsoDate } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import type { Appointment } from '../types/rvedha';
import { StatusBadge } from './StatusBadge';

type DoctorTab = 'today' | 'upcoming' | 'completed' | 'cancelled';

export function DoctorAppointmentsPage() {
  const {
    state,
    currentDoctor,
    globalSearch,
    confirmAppointmentAsDoctor,
    completeAppointmentAsDoctor,
    cancelAppointment,
    rescheduleAppointment,
    saveConsultationNotes,
    isDateAvailableForDoctor,
    getAvailableSlotsForDoctor,
  } = useRvedha();

  const [activeTab, setActiveTab] = useState<DoctorTab>('today');
  const [localSearch, setLocalSearch] = useState('');
  const [banner, setBanner] = useState<string | null>(null);

  const [notesModalApt, setNotesModalApt] = useState<Appointment | null>(null);
  const [notesText, setNotesText] = useState('');
  const [completeAfterNotes, setCompleteAfterNotes] = useState(false);

  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const todayIso = formatIsoDate(new Date());

  const doctorAppointments = useMemo(() => {
    if (!currentDoctor) return [];
    // Strict doctor isolation: only appointments belonging to currentDoctor
    const mine = state.appointments.filter((a) => a.doctorId === currentDoctor.id);

    const byTab = mine.filter((a) => {
      if (activeTab === 'today') return a.date === todayIso;
      if (activeTab === 'upcoming')
        return a.date >= todayIso && a.status !== 'Completed' && a.status !== 'Cancelled';
      if (activeTab === 'completed') return a.status === 'Completed';
      return a.status === 'Cancelled';
    });

    const q = (localSearch || globalSearch).trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((a) =>
      `${a.patientName} ${a.patientId} ${a.bookingRef} ${a.reason} ${a.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [state.appointments, currentDoctor, activeTab, todayIso, localSearch, globalSearch]);

  const tabCounts = useMemo(() => {
    if (!currentDoctor) return { today: 0, upcoming: 0, completed: 0, cancelled: 0 };
    const mine = state.appointments.filter((a) => a.doctorId === currentDoctor.id);
    return {
      today: mine.filter((a) => a.date === todayIso).length,
      upcoming: mine.filter(
        (a) => a.date >= todayIso && a.status !== 'Completed' && a.status !== 'Cancelled'
      ).length,
      completed: mine.filter((a) => a.status === 'Completed').length,
      cancelled: mine.filter((a) => a.status === 'Cancelled').length,
    };
  }, [state.appointments, currentDoctor, todayIso]);

  const openNotesModal = (apt: Appointment, markCompleted: boolean) => {
    setNotesModalApt(apt);
    setNotesText(apt.consultationNotes || '');
    setCompleteAfterNotes(markCompleted);
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesModalApt) return;
    if (completeAfterNotes) {
      completeAppointmentAsDoctor(notesModalApt.id, notesText);
      setBanner(`Consultation ${notesModalApt.bookingRef} marked as Completed with notes saved.`);
    } else {
      saveConsultationNotes(notesModalApt.id, notesText);
      setBanner(`Consultation notes updated for ${notesModalApt.bookingRef}.`);
    }
    setNotesModalApt(null);
  };

  const openReschedule = (apt: Appointment) => {
    setModalError(null);
    setRescheduleTarget(apt);
    setNewDate(apt.date >= todayIso ? apt.date : todayIso);
    setNewTime('');
  };

  const rescheduleDateCheck =
    rescheduleTarget && currentDoctor
      ? isDateAvailableForDoctor(currentDoctor.id, newDate)
      : { available: false };

  const availableSlots =
    rescheduleTarget && currentDoctor
      ? getAvailableSlotsForDoctor(currentDoctor.id, newDate)
      : [];

  const chosenTime =
    newTime && availableSlots.includes(newTime) ? newTime : availableSlots[0] || '';

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !newDate || !chosenTime) {
      setModalError('Select an available date and time slot.');
      return;
    }
    const res = rescheduleAppointment(rescheduleTarget.id, newDate, chosenTime);
    if (!res.ok) {
      setModalError(res.error || 'Could not reschedule.');
      return;
    }
    setRescheduleTarget(null);
    setBanner(`Appointment ${rescheduleTarget.bookingRef} rescheduled to ${newDate} at ${chosenTime}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
          Assigned Patient Appointments
        </h1>
        <p className="text-xs sm:text-sm text-[#8C9BAE] mt-1">
          Review patient consultation reasons, approve pending slots, complete visits, and record notes.
        </p>
      </div>

      {banner && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-400/35 bg-emerald-500/12 px-4 py-3 text-xs text-emerald-200">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="rvedha-card rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['today', `Today (${tabCounts.today})`],
              ['upcoming', `Upcoming (${tabCounts.upcoming})`],
              ['completed', `Completed (${tabCounts.completed})`],
              ['cancelled', `Cancelled (${tabCounts.cancelled})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === id
                  ? 'rvedha-gold-btn font-semibold'
                  : 'border border-[#C7CED8]/18 bg-[#07111F] text-[#C7CED8] hover:border-[#C8A96B]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search patient name, ID, reason..."
            className="w-full rounded-xl border border-[#C7CED8]/18 bg-[#07111F] pl-10 pr-3 py-2 text-xs text-[#F4F6F9] placeholder-[#8C9BAE]/70 focus:border-[#C8A96B] focus:outline-none"
          />
        </div>
      </div>

      {/* Appointment Cards */}
      {doctorAppointments.length === 0 ? (
        <div className="rvedha-card rounded-2xl p-10 text-center text-xs text-[#8C9BAE]">
          No appointments in the {activeTab} view.
        </div>
      ) : (
        <div className="space-y-4">
          {doctorAppointments.map((apt) => {
            const activeVisit = apt.status !== 'Completed' && apt.status !== 'Cancelled';
            return (
              <div
                key={apt.id}
                className="rvedha-card rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-lg border border-[#C8A96B]/35 bg-[#07111F] px-2.5 py-1 text-xs font-semibold text-[#C8A96B] tabular-nums">
                      {apt.date} · {apt.time}
                    </span>
                    <StatusBadge status={apt.status} />
                    <span className="text-xs text-[#8C9BAE] tabular-nums">{apt.bookingRef}</span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#F4F6F9]">
                      {apt.patientName}{' '}
                      <span className="text-xs font-normal text-[#8C9BAE]">
                        ({apt.patientId}
                        {apt.patientAge ? ` · ${apt.patientAge}y` : ''}
                        {apt.patientGender ? ` · ${apt.patientGender}` : ''})
                      </span>
                    </h2>
                    <p className="text-xs text-[#8C9BAE] mt-0.5 tabular-nums">
                      {apt.patientPhone} · {apt.patientEmail} · {apt.consultationType}
                    </p>
                  </div>

                  <p className="text-xs text-[#C7CED8]">
                    <span className="text-[#8C9BAE]">Reason: </span>
                    {apt.reason}
                  </p>

                  {apt.consultationNotes && (
                    <p className="text-xs text-[#E3C88E] bg-[#07111F]/65 rounded-xl px-3 py-2 border border-[#C8A96B]/25">
                      Clinical Notes: {apt.consultationNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {apt.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        confirmAppointmentAsDoctor(apt.id);
                        setBanner(`Confirmed appointment ${apt.bookingRef}. Patient notified.`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer min-h-[40px]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                  )}

                  {activeVisit && (
                    <>
                      <button
                        type="button"
                        onClick={() => openNotesModal(apt, true)}
                        className="rvedha-gold-btn inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer min-h-[40px]"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Complete Visit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openReschedule(apt)}
                        className="rvedha-silver-btn inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium cursor-pointer min-h-[40px]"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          cancelAppointment(apt.id);
                          setBanner(`Cancelled ${apt.bookingRef} and released time slot.`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/20 cursor-pointer min-h-[40px]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => openNotesModal(apt, false)}
                    className="rvedha-silver-btn inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium cursor-pointer min-h-[40px]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>Notes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Consultation Notes Modal */}
      {notesModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm p-4">
          <div className="rvedha-card w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#C7CED8]/14">
              <div>
                <p className="text-xs font-semibold text-[#C8A96B] tabular-nums">
                  {notesModalApt.bookingRef}
                </p>
                <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                  {completeAfterNotes ? 'Complete Consultation & Add Notes' : 'Consultation Notes'}
                </h3>
                <p className="text-xs text-[#8C9BAE]">{notesModalApt.patientName}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotesModalApt(null)}
                className="h-8 w-8 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#8C9BAE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <textarea
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Enter diagnosis summary, prescribed medications, or follow-up advice..."
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] p-3.5 text-sm text-[#F4F6F9] placeholder-[#8C9BAE]/60 focus:border-[#C8A96B] focus:outline-none"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNotesModalApt(null)}
                  className="rvedha-silver-btn rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rvedha-gold-btn rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer"
                >
                  {completeAfterNotes ? 'Complete & Save Notes' : 'Save Clinical Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm p-4">
          <div className="rvedha-card w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#C7CED8]/14">
              <div>
                <p className="text-xs font-semibold text-[#C8A96B] tabular-nums">
                  {rescheduleTarget.bookingRef}
                </p>
                <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                  Reschedule Patient Slot
                </h3>
                <p className="text-xs text-[#8C9BAE]">{rescheduleTarget.patientName}</p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="h-8 w-8 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#8C9BAE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">New Date</label>
                <input
                  type="date"
                  min={todayIso}
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewTime('');
                  }}
                  className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C7CED8] mb-1.5">
                  Available Slots ({availableSlots.length})
                </label>
                {!rescheduleDateCheck.available ? (
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    {rescheduleDateCheck.reason}
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    No open slots on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setNewTime(slot)}
                        className={`rounded-xl py-2 px-2 text-xs font-semibold tabular-nums transition cursor-pointer ${
                          chosenTime === slot
                            ? 'rvedha-gold-btn'
                            : 'border border-[#C7CED8]/20 bg-[#07111F] text-[#C7CED8]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="rvedha-silver-btn rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rescheduleDateCheck.available || !chosenTime}
                  className="rvedha-gold-btn rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

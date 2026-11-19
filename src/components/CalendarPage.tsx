import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDaysIso, formatIsoDate } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import type { Appointment } from '../types/rvedha';
import { StatusBadge } from './StatusBadge';

export function CalendarPage() {
  const {
    state,
    t,
    currentPatient,
    currentDoctor,
    rescheduleAppointment,
    confirmAppointmentAsDoctor,
    cancelAppointment,
    isDateAvailableForDoctor,
    getAvailableSlotsForDoctor,
  } = useRvedha();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>(
    state.calendarPrefs.defaultView
  );
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [quickRescheduleDate, setQuickRescheduleDate] = useState('');
  const [quickRescheduleTime, setQuickRescheduleTime] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const isDoctor = state.activeRole === 'doctor';

  // Strict role isolation on calendar events
  const scopedAppointments = useMemo(() => {
    if (isDoctor && currentDoctor) {
      return state.appointments.filter((a) => a.doctorId === currentDoctor.id);
    }
    if (!isDoctor && currentPatient) {
      return state.appointments.filter((a) => a.patientId === currentPatient.id);
    }
    return [];
  }, [state.appointments, isDoctor, currentDoctor, currentPatient]);

  const statusChipStyles: Record<Appointment['status'], string> = {
    Confirmed: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
    Pending: 'border-[#C8A96B]/45 bg-[#C8A96B]/18 text-[#E6CD97]',
    Rescheduled: 'border-indigo-300/40 bg-indigo-400/15 text-indigo-200',
    Completed: 'border-sky-300/40 bg-sky-400/15 text-sky-200',
    Cancelled: 'border-rose-400/35 bg-rose-500/12 text-rose-300 line-through opacity-75',
  };

  const monthDays = useMemo(() => {
    const year = cursorDate.getFullYear();
    const month = cursorDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday =
      state.calendarPrefs.startDayOfWeek === 'Monday'
        ? (firstDay.getDay() + 6) % 7
        : firstDay.getDay();

    const gridStart = new Date(year, month, 1 - startWeekday);
    return Array.from({ length: 35 }, (_, idx) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + idx);
      return {
        date: d,
        iso: formatIsoDate(d),
        inCurrentMonth: d.getMonth() === month,
      };
    });
  }, [cursorDate, state.calendarPrefs.startDayOfWeek]);

  const weekDays = useMemo(() => {
    const base = new Date(cursorDate);
    const offset =
      state.calendarPrefs.startDayOfWeek === 'Monday'
        ? (base.getDay() + 6) % 7
        : base.getDay();
    const start = new Date(base);
    start.setDate(base.getDate() - offset);
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      return { date: d, iso: formatIsoDate(d) };
    });
  }, [cursorDate, state.calendarPrefs.startDayOfWeek]);

  const navigateStep = (dir: -1 | 1) => {
    const d = new Date(cursorDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursorDate(d);
  };

  const todayIso = formatIsoDate(new Date());
  const cursorIso = formatIsoDate(cursorDate);
  const headerMonthLabel = cursorDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const dayHeaders =
    state.calendarPrefs.startDayOfWeek === 'Monday'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const openAptModal = (apt: Appointment) => {
    setModalError(null);
    setSelectedApt(apt);
    setQuickRescheduleDate(apt.date >= todayIso ? apt.date : todayIso);
    setQuickRescheduleTime('');
  };

  const selectedRescheduleCheck = selectedApt
    ? isDateAvailableForDoctor(selectedApt.doctorId, quickRescheduleDate)
    : { available: false };

  const selectedRescheduleSlots = selectedApt
    ? getAvailableSlotsForDoctor(selectedApt.doctorId, quickRescheduleDate)
    : [];

  const chosenRescheduleSlot =
    quickRescheduleTime && selectedRescheduleSlots.includes(quickRescheduleTime)
      ? quickRescheduleTime
      : selectedRescheduleSlots[0] || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
            {t.calendar.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8C9BAE] mt-1">{t.calendar.subtitle}</p>
        </div>

        <div className="inline-flex rounded-xl border border-[#C7CED8]/20 bg-[#101D2E] p-1 self-start">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition cursor-pointer ${
                viewMode === mode
                  ? 'bg-[#C8A96B] text-[#07111F] font-semibold'
                  : 'text-[#8C9BAE] hover:text-[#F4F6F9]'
              }`}
            >
              {t.calendar[mode]}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-400/35 bg-emerald-500/12 px-4 py-3 text-xs text-emerald-200">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="rvedha-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateStep(-1)}
            className="h-9 w-9 rounded-xl border border-[#C7CED8]/20 bg-[#07111F] flex items-center justify-center text-[#C7CED8] hover:border-[#C8A96B] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-heading text-2xl font-bold text-[#F4F6F9] min-w-[180px] text-center">
            {viewMode === 'day' ? cursorIso : headerMonthLabel}
          </h2>
          <button
            type="button"
            onClick={() => navigateStep(1)}
            className="h-9 w-9 rounded-xl border border-[#C7CED8]/20 bg-[#07111F] flex items-center justify-center text-[#C7CED8] hover:border-[#C8A96B] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursorDate(new Date())}
            className="rvedha-silver-btn rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer"
          >
            {t.calendar.today}
          </button>
        </div>

        <p className="text-xs text-[#8C9BAE]">
          {isDoctor ? 'Showing your assigned clinical schedule' : 'Showing your personal bookings'}
        </p>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="rvedha-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#C7CED8]/14 bg-[#07111F]/70">
            {dayHeaders.map((dayName) => (
              <div
                key={dayName}
                className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#8C9BAE]"
              >
                {dayName}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-[#C7CED8]/10">
            {monthDays.map((cell) => {
              const dayApts = scopedAppointments.filter((a) => a.date === cell.iso);
              const isToday = cell.iso === todayIso;
              return (
                <div
                  key={cell.iso}
                  className={`min-h-[108px] sm:min-h-[124px] p-2 ${
                    cell.inCurrentMonth ? 'bg-[#101D2E]/50' : 'bg-[#07111F]/60 opacity-50'
                  } ${isToday ? 'ring-1 ring-inset ring-[#C8A96B]/60 bg-[#122236]/80' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        isToday ? 'text-[#C8A96B]' : 'text-[#C7CED8]'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="text-[10px] text-[#8C9BAE] tabular-nums">
                        {dayApts.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayApts.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => openAptModal(apt)}
                        className={`w-full text-left rounded-lg border px-1.5 py-1 text-[10px] font-medium truncate cursor-pointer ${statusChipStyles[apt.status]}`}
                      >
                        <span className="tabular-nums font-bold">{apt.time}</span> ·{' '}
                        {isDoctor ? apt.patientName : apt.doctorName}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayApts = scopedAppointments.filter((a) => a.date === day.iso);
            const isToday = day.iso === todayIso;
            return (
              <div
                key={day.iso}
                className={`rvedha-card rounded-2xl p-3 min-h-[220px] ${
                  isToday ? 'border-[#C8A96B]/60' : ''
                }`}
              >
                <div className="pb-2 mb-3 border-b border-[#C7CED8]/12 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F4F6F9]">
                    {day.date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' })}
                  </span>
                  {isToday && <span className="text-[10px] font-semibold text-[#C8A96B]">Today</span>}
                </div>
                <div className="space-y-2">
                  {dayApts.map((apt) => (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => openAptModal(apt)}
                      className={`w-full text-left rounded-xl border p-2.5 text-[11px] space-y-1 cursor-pointer ${statusChipStyles[apt.status]}`}
                    >
                      <div className="font-bold tabular-nums">{apt.time}</div>
                      <div className="font-semibold truncate">
                        {isDoctor ? apt.patientName : apt.doctorName}
                      </div>
                      <div className="opacity-80 truncate">{apt.status}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="rvedha-card rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#C7CED8]/14">
            <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
              Daily Agenda · {cursorIso}
            </h3>
            <button
              type="button"
              onClick={() => setCursorDate(new Date(addDaysIso(cursorDate, 1)))}
              className="text-xs text-[#C8A96B] hover:underline cursor-pointer"
            >
              Next Day
            </button>
          </div>

          {scopedAppointments.filter((a) => a.date === cursorIso).length === 0 ? (
            <p className="py-10 text-center text-xs text-[#8C9BAE]">
              No appointments scheduled for {cursorIso}.
            </p>
          ) : (
            scopedAppointments
              .filter((a) => a.date === cursorIso)
              .map((apt) => (
                <button
                  key={apt.id}
                  type="button"
                  onClick={() => openAptModal(apt)}
                  className="w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 p-4 hover:border-[#C8A96B]/50 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-[#C8A96B] tabular-nums">
                        {apt.time}
                      </span>
                      <span className="text-sm font-semibold text-[#F4F6F9]">
                        {isDoctor ? apt.patientName : apt.doctorName}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C9BAE] mt-1">
                      {apt.bookingRef} · {apt.department} · {apt.reason}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </button>
              ))
          )}
        </div>
      )}

      {/* Click Appointment Detail & Action Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm p-4">
          <div className="rvedha-card w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#C7CED8]/14">
              <div>
                <p className="text-[11px] font-semibold text-[#C8A96B] tabular-nums">
                  {selectedApt.bookingRef}
                </p>
                <h3 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                  {isDoctor ? selectedApt.patientName : selectedApt.doctorName}
                </h3>
                <p className="text-xs text-[#8C9BAE]">
                  {selectedApt.department} · {selectedApt.date} at {selectedApt.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                className="h-8 w-8 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#8C9BAE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {modalError}
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8C9BAE]">Status</span>
              <StatusBadge status={selectedApt.status} />
            </div>

            <p className="rounded-xl bg-[#07111F]/70 border border-[#C7CED8]/12 p-3 text-xs text-[#C7CED8]">
              {selectedApt.reason}
            </p>

            {selectedApt.status !== 'Completed' && selectedApt.status !== 'Cancelled' && (
              <>
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-[#8C9BAE] mb-1">
                      Reschedule Date
                    </label>
                    <input
                      type="date"
                      min={todayIso}
                      value={quickRescheduleDate}
                      onChange={(e) => {
                        setQuickRescheduleDate(e.target.value);
                        setQuickRescheduleTime('');
                      }}
                      className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2 text-xs text-[#F4F6F9] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8C9BAE] mb-1">
                      Available Slots ({selectedRescheduleSlots.length})
                    </label>
                    {!selectedRescheduleCheck.available ? (
                      <p className="text-xs text-amber-200">{selectedRescheduleCheck.reason}</p>
                    ) : selectedRescheduleSlots.length === 0 ? (
                      <p className="text-xs text-amber-200">No slots open on this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        {selectedRescheduleSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setQuickRescheduleTime(slot)}
                            className={`rounded-lg py-1.5 text-[11px] font-semibold tabular-nums cursor-pointer ${
                              chosenRescheduleSlot === slot
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
                </div>

                <div className="flex flex-wrap justify-between gap-2 pt-3 border-t border-[#C7CED8]/12">
                  <div className="flex gap-2">
                    {isDoctor && selectedApt.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => {
                          confirmAppointmentAsDoctor(selectedApt.id);
                          setSelectedApt(null);
                          setBanner(`Confirmed ${selectedApt.bookingRef}.`);
                        }}
                        className="rounded-xl border border-emerald-400/35 bg-emerald-500/12 px-3 py-2 text-xs font-semibold text-emerald-300 cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        cancelAppointment(selectedApt.id);
                        setSelectedApt(null);
                        setBanner(`Cancelled ${selectedApt.bookingRef}.`);
                      }}
                      className="rounded-xl border border-rose-400/35 bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedRescheduleCheck.available || !chosenRescheduleSlot}
                    onClick={() => {
                      const res = rescheduleAppointment(
                        selectedApt.id,
                        quickRescheduleDate,
                        chosenRescheduleSlot
                      );
                      if (!res.ok) {
                        setModalError(res.error || 'Reschedule failed.');
                        return;
                      }
                      setSelectedApt(null);
                      setBanner('Your appointment has been successfully rescheduled.');
                    }}
                    className="rvedha-gold-btn rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Reschedule
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

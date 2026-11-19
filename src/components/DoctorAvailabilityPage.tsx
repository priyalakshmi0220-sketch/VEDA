import React, { useMemo, useState } from 'react';
import { Ban, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import { formatIsoDate } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import type { Doctor, TimeSlotItem } from '../types/rvedha';

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DoctorAvailabilityPage() {
  const {
    state,
    currentDoctor,
    updateOwnDoctorProfile,
    addDoctorSlot,
    updateDoctorSlot,
    deleteDoctorSlot,
    addBlockedDate,
    removeBlockedDate,
  } = useRvedha();

  const [selectedDate, setSelectedDate] = useState(formatIsoDate(new Date()));
  const [newTime, setNewTime] = useState('05:30 PM');
  const [newState, setNewState] = useState<TimeSlotItem['state']>('Available');
  const [blockDateInput, setBlockDateInput] = useState(formatIsoDate(new Date()));
  const [blockReason, setBlockReason] = useState('Clinical Conference / Personal Leave');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!currentDoctor) return null;

  const mySlotsForDate = useMemo(() => {
    const explicit = state.timeSlots.filter(
      (s) => s.doctorId === currentDoctor.id && s.date === selectedDate
    );
    if (explicit.length > 0) return explicit;

    // Preview default slots merged with active bookings for dates without custom slots yet
    return currentDoctor.defaultSlots.map((time, idx) => {
      const bookedApt = state.appointments.find(
        (a) =>
          a.doctorId === currentDoctor.id &&
          a.date === selectedDate &&
          a.time === time &&
          a.status !== 'Cancelled'
      );
      return {
        id: `preview-${idx}`,
        doctorId: currentDoctor.id,
        date: selectedDate,
        time,
        durationMin: currentDoctor.consultationDurationMin,
        state: bookedApt ? ('Booked' as const) : ('Available' as const),
        appointmentId: bookedApt?.id,
        isTemplatePreview: true,
      };
    });
  }, [state.timeSlots, state.appointments, currentDoctor, selectedDate]);

  const myBlockedDates = state.blockedDates.filter(
    (b) => b.doctorId === currentDoctor.id || b.doctorId === 'ALL'
  );

  const toggleWorkingDay = (day: string) => {
    const hasDay = currentDoctor.availableDays.includes(day);
    const updated = hasDay
      ? currentDoctor.availableDays.filter((d) => d !== day)
      : [...currentDoctor.availableDays, day];
    updateOwnDoctorProfile({ availableDays: updated });
    setFeedback('Working days updated and synced to Patient Booking.');
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = addDoctorSlot(
      selectedDate,
      newTime,
      currentDoctor.consultationDurationMin,
      newState
    );
    if (!res.ok) {
      setErrorMsg(res.error || 'Could not add slot.');
      return;
    }
    setFeedback(`Added ${newTime.toUpperCase()} (${newState}) for ${selectedDate}.`);
  };

  const handleBlockDate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = addBlockedDate(blockDateInput, blockReason);
    if (!res.ok) {
      setErrorMsg(res.error || 'Could not block date.');
      return;
    }
    setFeedback(`Blocked ${blockDateInput}. Patients cannot book on this date.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
          Schedule & Availability Control
        </h1>
        <p className="text-xs sm:text-sm text-[#8C9BAE] mt-1">
          Changes made here immediately update patient-facing slot availability and prevent double bookings.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-500/12 px-4 py-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Working Days, Hours, Duration & Leave Status */}
      <div className="rvedha-card rounded-2xl p-6 space-y-5">
        <h2 className="font-heading text-2xl font-bold text-[#F4F6F9]">
          Weekly Working Hours & Clinical Status
        </h2>

        <div>
          <label className="block text-xs font-medium text-[#C7CED8] mb-2">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {ALL_WEEKDAYS.map((day) => {
              const active = currentDoctor.availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkingDay(day)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer min-h-[40px] ${
                    active
                      ? 'rvedha-gold-btn'
                      : 'border border-[#C7CED8]/20 bg-[#07111F] text-[#8C9BAE]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#C7CED8] mb-1">
              Available From
            </label>
            <input
              type="text"
              value={currentDoctor.workingHoursStart}
              onChange={(e) => updateOwnDoctorProfile({ workingHoursStart: e.target.value })}
              className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#C7CED8] mb-1">
              Available Until
            </label>
            <input
              type="text"
              value={currentDoctor.workingHoursEnd}
              onChange={(e) => updateOwnDoctorProfile({ workingHoursEnd: e.target.value })}
              className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#C7CED8] mb-1">
              Consultation Duration
            </label>
            <select
              value={currentDoctor.consultationDurationMin}
              onChange={(e) =>
                updateOwnDoctorProfile({ consultationDurationMin: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9] tabular-nums"
            >
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#C7CED8] mb-1">
              Current Status / Leave
            </label>
            <select
              value={currentDoctor.status}
              onChange={(e) =>
                updateOwnDoctorProfile({ status: e.target.value as Doctor['status'] })
              }
              className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2.5 text-sm text-[#F4F6F9]"
            >
              <option value="Available">Available</option>
              <option value="In Consultation">In Consultation</option>
              <option value="On Leave">On Leave (Pause Bookings)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Time Slot Matrix + Add Slot / Block Dates */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 rvedha-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold text-[#F4F6F9]">
              Time Slots for {selectedDate}
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3.5 py-2 text-xs text-[#F4F6F9] tabular-nums"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mySlotsForDate.map((slot) => {
              const isTemplate = 'isTemplatePreview' in slot;
              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/70 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <Clock
                      className={`w-4 h-4 ${
                        slot.state === 'Available'
                          ? 'text-emerald-400'
                          : slot.state === 'Booked'
                            ? 'text-[#C8A96B]'
                            : 'text-[#8C9BAE]'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#F4F6F9] tabular-nums">
                        {slot.time} —{' '}
                        <span
                          className={
                            slot.state === 'Available'
                              ? 'text-emerald-300'
                              : slot.state === 'Booked'
                                ? 'text-[#C8A96B]'
                                : 'text-[#8C9BAE]'
                          }
                        >
                          {slot.state}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#8C9BAE] tabular-nums">
                        {slot.durationMin} mins {isTemplate ? '· Template' : ''}
                      </p>
                    </div>
                  </div>

                  {!isTemplate && (
                    <div className="flex items-center gap-1.5">
                      <select
                        disabled={slot.state === 'Booked'}
                        value={slot.state}
                        onChange={(e) => {
                          const res = updateDoctorSlot(slot.id, {
                            state: e.target.value as TimeSlotItem['state'],
                          });
                          if (!res.ok && res.error) setErrorMsg(res.error);
                        }}
                        className="rounded-lg border border-[#C7CED8]/20 bg-[#122236] px-2 py-1 text-[11px] text-[#F4F6F9] disabled:opacity-60"
                      >
                        <option value="Available">Available</option>
                        <option value="Break">Break</option>
                        {slot.state === 'Booked' && <option value="Booked">Booked</option>}
                      </select>
                      {slot.state !== 'Booked' && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = deleteDoctorSlot(slot.id);
                            if (!res.ok && res.error) setErrorMsg(res.error);
                          }}
                          className="h-7 w-7 rounded-lg border border-[#C7CED8]/15 flex items-center justify-center text-[#8C9BAE] hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <form onSubmit={handleAddSlot} className="rvedha-card rounded-2xl p-5 space-y-4">
            <h3 className="font-heading text-xl font-bold text-[#F4F6F9]">Create Time Slot</h3>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Time</label>
              <input
                type="text"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g., 05:30 PM"
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2 text-xs text-[#F4F6F9] tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Slot Type</label>
              <select
                value={newState}
                onChange={(e) => setNewState(e.target.value as TimeSlotItem['state'])}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2 text-xs text-[#F4F6F9]"
              >
                <option value="Available">Available for Booking</option>
                <option value="Break">Clinical Break</option>
              </select>
            </div>
            <button
              type="submit"
              className="rvedha-gold-btn w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slot to {selectedDate}</span>
            </button>
          </form>

          <form onSubmit={handleBlockDate} className="rvedha-card rounded-2xl p-5 space-y-4">
            <h3 className="font-heading text-xl font-bold text-[#F4F6F9]">
              Block Dates / Mark Leave
            </h3>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Date</label>
              <input
                type="date"
                value={blockDateInput}
                onChange={(e) => setBlockDateInput(e.target.value)}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2 text-xs text-[#F4F6F9] tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#C7CED8] mb-1">Reason</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full rounded-xl border border-[#C7CED8]/20 bg-[#07111F] px-3 py-2 text-xs text-[#F4F6F9]"
              />
            </div>
            <button
              type="submit"
              className="rvedha-silver-btn w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
            >
              <Ban className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Block Unavailable Date</span>
            </button>

            <div className="space-y-2 pt-2 border-t border-[#C7CED8]/12">
              {myBlockedDates.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/70 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#F4F6F9] tabular-nums">{b.date}</p>
                    <p className="text-[11px] text-[#8C9BAE]">{b.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlockedDate(b.id)}
                    className="text-rose-300 hover:underline text-[11px] cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

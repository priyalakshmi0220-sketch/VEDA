import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import { formatIsoDate } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import { ResilientImage } from './ResilientImage';
import { StatusBadge } from './StatusBadge';

export function DoctorDashboard() {
  const {
    state,
    currentDoctor,
    setActiveSection,
    confirmAppointmentAsDoctor,
  } = useRvedha();

  if (!currentDoctor) return null;

  const todayIso = formatIsoDate(new Date());
  const myAppointments = state.appointments.filter((a) => a.doctorId === currentDoctor.id);

  const todayList = myAppointments.filter((a) => a.date === todayIso);
  const upcomingList = myAppointments.filter(
    (a) => a.date >= todayIso && a.status !== 'Completed' && a.status !== 'Cancelled'
  );
  const completedList = myAppointments.filter((a) => a.status === 'Completed');
  const cancelledList = myAppointments.filter((a) => a.status === 'Cancelled');
  const pendingList = myAppointments.filter((a) => a.status === 'Pending');

  const stats = [
    {
      label: "Today's Appointments",
      value: todayList.length,
      icon: CalendarCheck,
      tone: 'text-[#C8A96B]',
    },
    {
      label: 'Upcoming Appointments',
      value: upcomingList.length,
      icon: CalendarClock,
      tone: 'text-[#C7CED8]',
    },
    {
      label: 'Completed Consultations',
      value: completedList.length,
      icon: CheckCircle2,
      tone: 'text-emerald-300',
    },
    {
      label: 'Cancelled Appointments',
      value: cancelledList.length,
      icon: XCircle,
      tone: 'text-rose-300',
    },
    {
      label: 'Pending Requests',
      value: pendingList.length,
      icon: Clock,
      tone: 'text-[#E3C88E]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Clinical Header Summary */}
      <div className="rvedha-card rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <ResilientImage
            src={currentDoctor.avatarUrl}
            alt={currentDoctor.name}
            fallbackLabel={currentDoctor.name}
            className="h-16 w-16 rounded-2xl object-cover border border-[#C8A96B]/40 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold text-[#C8A96B] tabular-nums">
              {currentDoctor.doctorCode} · {currentDoctor.department} · {currentDoctor.status}
            </p>
            <h1 className="font-heading text-3xl font-bold text-[#F4F6F9]">
              {currentDoctor.name}
            </h1>
            <p className="text-xs text-[#8C9BAE] mt-0.5">
              {currentDoctor.qualification} · {currentDoctor.location}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setActiveSection('calendar')}
            className="rvedha-silver-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
          >
            <CalendarDays className="w-4 h-4 text-[#C8A96B]" />
            <span>Open Calendar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('availability')}
            className="rvedha-gold-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer min-h-[42px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Manage Availability</span>
          </button>
        </div>
      </div>

      {/* 5 Required Clinical Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rvedha-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#8C9BAE]">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.tone}`} />
              </div>
              <p className="text-3xl font-bold text-[#F4F6F9] tabular-nums">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Split: Today's Queue + Pending Approvals */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 rvedha-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                Today’s Clinical Roster
              </h2>
              <p className="text-xs text-[#8C9BAE] tabular-nums">{todayIso}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('appointments')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#C8A96B] hover:underline cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayList.length === 0 ? (
            <div className="rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/60 p-8 text-center text-xs text-[#8C9BAE]">
              No appointments on your roster for {todayIso}.
            </div>
          ) : (
            <div className="space-y-3">
              {todayList.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 px-4 py-3.5"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <span className="rounded-lg border border-[#C8A96B]/35 bg-[#122236] px-2.5 py-1.5 text-xs font-semibold text-[#C8A96B] tabular-nums shrink-0">
                      {apt.time}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F4F6F9] truncate">
                        {apt.patientName} · {apt.bookingRef}
                      </p>
                      <p className="text-xs text-[#8C9BAE] truncate">{apt.reason}</p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-5 rvedha-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-[#F4F6F9]">
              Pending Approval Queue
            </h2>
            <span className="text-xs font-semibold text-[#C8A96B] tabular-nums">
              {pendingList.length} pending
            </span>
          </div>

          {pendingList.length === 0 ? (
            <div className="rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/60 p-8 text-center text-xs text-[#8C9BAE]">
              All consultation requests have been reviewed.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-xl border border-[#C8A96B]/30 bg-[#07111F]/70 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#F4F6F9]">{apt.patientName}</p>
                      <p className="text-xs text-[#C8A96B] tabular-nums">
                        {apt.date} · {apt.time} · {apt.consultationType}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-xs text-[#8C9BAE]">{apt.reason}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => confirmAppointmentAsDoctor(apt.id)}
                      className="rvedha-gold-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold cursor-pointer min-h-[38px]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Appointment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('appointments')}
                      className="rvedha-silver-btn rounded-xl px-3 py-2 text-xs font-medium cursor-pointer min-h-[38px]"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

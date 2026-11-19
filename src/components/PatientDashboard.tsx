import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  MapPin,
  PlusCircle,
  Stethoscope,
  User,
} from 'lucide-react';
import { formatIsoDate, PATIENT_DEFAULT_AVATAR } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import { ResilientImage } from './ResilientImage';
import { StatusBadge } from './StatusBadge';

export function PatientDashboard() {
  const { state, currentPatient, setActiveSection } = useRvedha();

  if (!currentPatient) return null;

  const todayIso = formatIsoDate(new Date());
  const myAppointments = state.appointments.filter((a) => a.patientId === currentPatient.id);
  const upcoming = myAppointments.filter(
    (a) => a.status !== 'Completed' && a.status !== 'Cancelled' && a.date >= todayIso
  );
  const completed = myAppointments.filter((a) => a.status === 'Completed');
  const nextVisit = [...upcoming].sort((a, b) => a.date.localeCompare(b.date))[0];
  const availableDoctors = state.doctors.filter((d) => d.status === 'Available');

  return (
    <div className="space-y-6">
      {/* Welcoming Patient Header & Primary CTA */}
      <div className="rvedha-card rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <ResilientImage
            src={PATIENT_DEFAULT_AVATAR}
            alt={currentPatient.fullName}
            fallbackLabel={currentPatient.fullName}
            className="h-16 w-16 rounded-2xl object-cover border border-[#C7CED8]/25 shrink-0"
          />
          <div>
            <p className="text-xs font-medium text-[#C8A96B] tabular-nums">
              Patient ID: {currentPatient.id}
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9] mt-0.5">
              {currentPatient.fullName}
            </h1>
            <p className="text-xs text-[#8C9BAE] mt-1">
              {currentPatient.age} yrs · {currentPatient.gender} · {currentPatient.phone} ·{' '}
              {currentPatient.address}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('book-appointment')}
          className="rvedha-gold-btn inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold cursor-pointer min-h-[46px] whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Patient Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveSection('upcoming')}
          className="rvedha-card rounded-2xl p-5 text-left hover:border-[#C8A96B]/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8C9BAE]">Upcoming Visits</span>
            <CalendarClock className="w-4 h-4 text-[#C8A96B]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#F4F6F9] tabular-nums">{upcoming.length}</p>
          <p className="mt-1 text-[11px] text-[#C7CED8]">Confirmed, pending & rescheduled</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('history')}
          className="rvedha-card rounded-2xl p-5 text-left hover:border-[#C8A96B]/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8C9BAE]">Completed Visits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#F4F6F9] tabular-nums">{completed.length}</p>
          <p className="mt-1 text-[11px] text-[#C7CED8]">Consultations with clinical notes</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('book-appointment')}
          className="rvedha-card rounded-2xl p-5 text-left hover:border-[#C8A96B]/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8C9BAE]">Available Specialists</span>
            <Stethoscope className="w-4 h-4 text-[#C7CED8]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#F4F6F9] tabular-nums">
            {availableDoctors.length}
          </p>
          <p className="mt-1 text-[11px] text-[#C7CED8]">Ready for consultation booking</p>
        </button>
      </div>

      {/* Main Split: Next Scheduled Visit + Upcoming List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rvedha-card rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div>
            <p className="text-xs font-semibold text-[#C8A96B]">Next Scheduled Consultation</p>
            {nextVisit ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#F4F6F9]">
                      {nextVisit.doctorName}
                    </h2>
                    <p className="text-xs text-[#C7CED8]">{nextVisit.doctorSpecialty}</p>
                  </div>
                  <StatusBadge status={nextVisit.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#C7CED8]/14 bg-[#07111F]/65 p-4 text-xs">
                  <div>
                    <span className="text-[11px] text-[#8C9BAE] block">Date</span>
                    <span className="font-semibold text-[#F4F6F9] tabular-nums mt-0.5 block">
                      {nextVisit.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C9BAE] block">Time Slot</span>
                    <span className="font-semibold text-[#C8A96B] tabular-nums mt-0.5 block">
                      {nextVisit.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C9BAE] block">Appointment ID</span>
                    <span className="font-semibold text-[#F4F6F9] tabular-nums mt-0.5 block">
                      {nextVisit.bookingRef}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C9BAE] block">Visit Mode</span>
                    <span className="font-semibold text-[#F4F6F9] mt-0.5 block">
                      {nextVisit.consultationType}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/60 p-6 text-center space-y-3">
                <CalendarCheck className="w-8 h-8 text-[#C8A96B] mx-auto" />
                <p className="text-xs text-[#8C9BAE]">
                  You have no upcoming appointments scheduled right now.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveSection('my-appointments')}
            className="rvedha-silver-btn w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold cursor-pointer min-h-[42px]"
          >
            <span>Manage My Appointments</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C8A96B]" />
          </button>
        </div>

        {/* Upcoming Appointments Preview */}
        <div className="lg:col-span-7 rvedha-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-[#F4F6F9]">
              Your Upcoming Appointments
            </h2>
            <button
              type="button"
              onClick={() => setActiveSection('upcoming')}
              className="text-xs font-medium text-[#C8A96B] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/60 p-8 text-center text-xs text-[#8C9BAE]">
              No upcoming visits found. Click Book New Appointment to choose a doctor and slot.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#C7CED8]/12 bg-[#07111F]/65 px-4 py-3.5"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#F4F6F9]">{apt.doctorName}</span>
                      <span className="text-xs text-[#8C9BAE]">· {apt.department}</span>
                    </div>
                    <p className="text-xs text-[#C8A96B] tabular-nums mt-1">
                      {apt.date} · {apt.time} · {apt.bookingRef}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[#C7CED8]/12 flex items-center justify-between text-xs text-[#8C9BAE]">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C8A96B]" />
              Need to update contact details?
            </span>
            <button
              type="button"
              onClick={() => setActiveSection('profile')}
              className="text-[#C8A96B] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              Profile Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

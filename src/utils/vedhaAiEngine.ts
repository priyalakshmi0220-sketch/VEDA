import { formatIsoDate } from '../data/demoData';
import type { RvedhaState } from '../types/rvedha';

export interface VedhaAiReply {
  text: string;
  highlights?: Array<{ label: string; value: string }>;
}

export function runVedhaAiQuery(query: string, state: RvedhaState): VedhaAiReply {
  const q = query.trim().toLowerCase();
  const todayIso = formatIsoDate(new Date());

  // Role-scoped Patient Intelligence (cannot inspect other patients' private visits)
  if (state.activeRole === 'patient') {
    const myAppointments = state.appointments.filter(
      (a) => a.patientId === state.activePatientId
    );
    const myUpcoming = myAppointments.filter(
      (a) => a.status !== 'Completed' && a.status !== 'Cancelled' && a.date >= todayIso
    );
    const myHistory = myAppointments.filter(
      (a) => a.status === 'Completed' || a.status === 'Cancelled'
    );
    const availableDoctors = state.doctors.filter((d) => d.status === 'Available');

    if (q.includes('upcoming') || q.includes('my appointment') || q.includes('next visit')) {
      if (myUpcoming.length === 0) {
        return {
          text: 'You have no upcoming scheduled visits right now. Use Book Appointment to reserve a new consultation.',
          highlights: [{ label: 'Upcoming Visits', value: '0 scheduled' }],
        };
      }
      const list = myUpcoming
        .slice(0, 4)
        .map((a) => `• ${a.date} · ${a.time} — ${a.doctorName} (${a.department}, ${a.status})`)
        .join('\n');
      return {
        text: `You have ${myUpcoming.length} upcoming appointment(s):\n${list}`,
        highlights: [
          { label: 'Upcoming Visits', value: String(myUpcoming.length) },
          { label: 'Next Date', value: `${myUpcoming[0].date} · ${myUpcoming[0].time}` },
        ],
      };
    }

    if (q.includes('history') || q.includes('past') || q.includes('completed')) {
      return {
        text: `You have ${myHistory.length} completed or cancelled consultation(s) on record (${myHistory.filter((a) => a.status === 'Completed').length} completed).`,
        highlights: [
          { label: 'Total Visits Logged', value: String(myAppointments.length) },
          { label: 'Completed', value: String(myHistory.filter((a) => a.status === 'Completed').length) },
        ],
      };
    }

    if (q.includes('doctor') || q.includes('specialist')) {
      return {
        text: `${availableDoctors.length} specialists are currently available for booking: ${availableDoctors
          .map((d) => `${d.name} (${d.department} · ₹${d.feeInr})`)
          .join(', ')}.`,
        highlights: [
          { label: 'Available Doctors', value: `${availableDoctors.length} / ${state.doctors.length}` },
        ],
      };
    }

    if (q.includes('slot') || q.includes('cardiology') || q.includes('next available')) {
      const targetDoc =
        state.doctors.find((d) => q.includes(d.department.toLowerCase())) || availableDoctors[0];
      const openSlots = state.timeSlots.filter(
        (s) => s.doctorId === targetDoc?.id && s.date >= todayIso && s.state === 'Available'
      );
      if (openSlots.length === 0) {
        return {
          text: `No open slots are currently pre-listed for ${targetDoc?.name || 'selected doctor'} in this window. Check Book Appointment for other dates.`,
        };
      }
      return {
        text: `Next open slot with ${targetDoc.name} (${targetDoc.department}): ${openSlots[0].date} at ${openSlots[0].time}. Fee: ₹${targetDoc.feeInr} (${targetDoc.consultationDurationMin} mins).`,
        highlights: [
          { label: 'Specialist', value: targetDoc.name },
          { label: 'Earliest Slot', value: `${openSlots[0].date} · ${openSlots[0].time}` },
        ],
      };
    }

    return {
      text: `You have ${myUpcoming.length} upcoming appointment(s) and ${availableDoctors.length} specialists available today. Ask me "Show my upcoming appointments", "Which doctors are available?", or "Find the next available Cardiology slot".`,
      highlights: [
        { label: 'Upcoming', value: String(myUpcoming.length) },
        { label: 'Available Specialists', value: String(availableDoctors.length) },
      ],
    };
  }

  // Role-scoped Doctor Intelligence (strictly restricted to activeDoctorId)
  const myDoc = state.doctors.find((d) => d.id === state.activeDoctorId);
  const docAppointments = state.appointments.filter((a) => a.doctorId === state.activeDoctorId);
  const todayDocApts = docAppointments.filter((a) => a.date === todayIso);
  const pendingDocApts = docAppointments.filter((a) => a.status === 'Pending');
  const upcomingDocApts = docAppointments.filter(
    (a) => a.date >= todayIso && a.status !== 'Completed' && a.status !== 'Cancelled'
  );
  const myTodaySlots = state.timeSlots.filter(
    (s) => s.doctorId === state.activeDoctorId && s.date === todayIso
  );
  const bookedToday = myTodaySlots.filter((s) => s.state === 'Booked');
  const openToday = myTodaySlots.filter((s) => s.state === 'Available');

  if (q.includes('pending')) {
    if (pendingDocApts.length === 0) {
      return {
        text: 'You have 0 pending appointment requests awaiting confirmation.',
        highlights: [{ label: 'Pending Queue', value: '0 items' }],
      };
    }
    return {
      text: `You have ${pendingDocApts.length} pending request(s) assigned to you:\n${pendingDocApts
        .slice(0, 5)
        .map((a) => `• ${a.bookingRef}: ${a.patientName} (${a.date} at ${a.time}) — ${a.reason}`)
        .join('\n')}`,
      highlights: [{ label: 'Pending Requests', value: String(pendingDocApts.length) }],
    };
  }

  if (q.includes('slot') || q.includes('booked')) {
    return {
      text: `Today (${todayIso}), you have ${bookedToday.length} booked slot(s) and ${openToday.length} open slot(s): ${openToday
        .map((s) => s.time)
        .join(', ') || 'None open today'}.`,
      highlights: [
        { label: 'Booked Today', value: String(bookedToday.length) },
        { label: 'Open Today', value: String(openToday.length) },
      ],
    };
  }

  if (q.includes('today')) {
    if (todayDocApts.length === 0) {
      return {
        text: `You have no appointments scheduled for today (${todayIso}).`,
      };
    }
    return {
      text: `Your clinical roster for ${todayIso} (${todayDocApts.length} appointments):\n${todayDocApts
        .map((a) => `• ${a.time} — ${a.patientName} (${a.status})`)
        .join('\n')}`,
      highlights: [
        { label: "Today's Roster", value: `${todayDocApts.length} patients` },
        { label: 'Pending', value: String(todayDocApts.filter((a) => a.status === 'Pending').length) },
      ],
    };
  }

  return {
    text: `${myDoc?.name || 'Doctor'}, you currently have ${todayDocApts.length} appointment(s) today, ${upcomingDocApts.length} total upcoming, and ${pendingDocApts.length} awaiting confirmation.`,
    highlights: [
      { label: 'Today', value: String(todayDocApts.length) },
      { label: 'Upcoming', value: String(upcomingDocApts.length) },
      { label: 'Pending', value: String(pendingDocApts.length) },
    ],
  };
}

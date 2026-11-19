import React, { createContext, useContext, useEffect, useState } from 'react';
import { createInitialDemoState, formatIsoDate } from '../data/demoData';
import { TRANSLATIONS, type TranslationBundle } from '../i18n/translations';
import type {
  Appointment,
  AppointmentStatus,
  BlockedDate,
  CalendarPreferences,
  ConsultationType,
  DepartmentName,
  Doctor,
  LanguageCode,
  NavSection,
  NotificationItem,
  NotificationPreferences,
  PatientRecord,
  RvedhaState,
  SecurityPreferences,
  TimeSlotItem,
} from '../types/rvedha';
import { runVedhaAiQuery } from '../utils/vedhaAiEngine';

const STORAGE_KEY = 'rvedha_dual_portal_state_v2';
const INTRO_SEEN_KEY = 'rvedha_intro_seen_session';

export interface PatientRegistrationPayload {
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  email: string;
  password: string;
  address: string;
  bloodGroup?: string;
}

export interface BookAppointmentPayload {
  doctorId: string;
  date: string;
  time: string;
  consultationType: ConsultationType;
  reason: string;
  notes?: string;
}

export interface BookingConfirmation {
  bookingRef: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: DepartmentName;
  specialty: string;
  date: string;
  time: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  feeInr: number;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface RvedhaContextValue {
  state: RvedhaState;
  t: TranslationBundle;
  currentPatient: PatientRecord | null;
  currentDoctor: Doctor | null;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  showIntro: boolean;
  dismissIntro: () => void;
  replayIntro: () => void;
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;

  // Dual Login & Registration
  loginAsPatient: (identifier: string, password: string) => AuthResult;
  registerNewPatient: (payload: PatientRegistrationPayload) => AuthResult;
  loginPatientWithGoogle: (name: string, email: string) => void;
  loginAsDoctor: (identifier: string, password: string) => AuthResult;
  logout: () => void;

  // Language
  setLanguage: (lang: LanguageCode) => void;

  // Availability & Slot resolution (shared live source of truth)
  isDateAvailableForDoctor: (doctorId: string, dateIso: string) => { available: boolean; reason?: string };
  getAvailableSlotsForDoctor: (doctorId: string, dateIso: string) => string[];

  // Patient + Doctor Appointment Operations (role-enforced)
  bookAppointment: (payload: BookAppointmentPayload) => { ok: boolean; confirmation?: BookingConfirmation; error?: string };
  cancelAppointment: (appointmentId: string) => ActionResult;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => ActionResult;
  confirmAppointmentAsDoctor: (appointmentId: string) => ActionResult;
  completeAppointmentAsDoctor: (appointmentId: string, consultationNotes?: string) => ActionResult;
  saveConsultationNotes: (appointmentId: string, notes: string) => ActionResult;

  // Doctor Availability Management (scoped to activeDoctorId)
  updateOwnDoctorProfile: (patch: Partial<Doctor>) => void;
  updateOwnPatientProfile: (patch: Partial<PatientRecord>) => void;
  addDoctorSlot: (date: string, time: string, durationMin: number, slotState: TimeSlotItem['state']) => ActionResult;
  updateDoctorSlot: (slotId: string, patch: Partial<TimeSlotItem>) => ActionResult;
  deleteDoctorSlot: (slotId: string) => ActionResult;
  addBlockedDate: (date: string, reason: string) => ActionResult;
  removeBlockedDate: (blockedId: string) => void;

  // Notifications & Preferences
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  updateNotificationPrefs: (patch: Partial<NotificationPreferences>) => void;
  updateCalendarPrefs: (patch: Partial<CalendarPreferences>) => void;
  updateSecurityPrefs: (patch: Partial<SecurityPreferences>) => void;

  // Vedha AI
  sendAiMessage: (promptText: string) => void;
  clearAiMessages: () => void;
  resetDemoData: () => void;
}

const RvedhaContext = createContext<RvedhaContextValue | null>(null);

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function loadPersistedState(): RvedhaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialDemoState();
    const parsed = JSON.parse(raw) as Partial<RvedhaState>;
    const fresh = createInitialDemoState();
    return {
      ...fresh,
      ...parsed,
      notificationPrefs: { ...fresh.notificationPrefs, ...(parsed.notificationPrefs || {}) },
      calendarPrefs: { ...fresh.calendarPrefs, ...(parsed.calendarPrefs || {}) },
      securityPrefs: { ...fresh.securityPrefs, ...(parsed.securityPrefs || {}) },
      doctors: Array.isArray(parsed.doctors) && parsed.doctors.length > 0 ? parsed.doctors : fresh.doctors,
      patients: Array.isArray(parsed.patients) && parsed.patients.length > 0 ? parsed.patients : fresh.patients,
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : fresh.appointments,
      timeSlots: Array.isArray(parsed.timeSlots) ? parsed.timeSlots : fresh.timeSlots,
      blockedDates: Array.isArray(parsed.blockedDates) ? parsed.blockedDates : fresh.blockedDates,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : fresh.notifications,
      chatMessages: Array.isArray(parsed.chatMessages) && parsed.chatMessages.length > 0 ? parsed.chatMessages : fresh.chatMessages,
    };
  } catch {
    return createInitialDemoState();
  }
}

export function RvedhaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RvedhaState>(loadPersistedState);
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  const dismissIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // ignore
    }
  };

  const replayIntro = () => setShowIntro(true);

  const currentPatient =
    state.activeRole === 'patient' && state.activePatientId
      ? state.patients.find((p) => p.id === state.activePatientId) || null
      : null;

  const currentDoctor =
    state.activeRole === 'doctor' && state.activeDoctorId
      ? state.doctors.find((d) => d.id === state.activeDoctorId) || null
      : null;

  const makeNotification = (
    recipientRole: 'patient' | 'doctor',
    recipientId: string,
    category: NotificationItem['category'],
    title: string,
    message: string
  ): NotificationItem => ({
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recipientRole,
    recipientId,
    category,
    title,
    message,
    timestamp: 'Just now',
    read: false,
  });

  // 1. Authentication
  const loginAsPatient = (identifier: string, password: string): AuthResult => {
    const cleanId = identifier.trim().toLowerCase();
    const digitsOnly = identifier.replace(/\D/g, '');
    if (!cleanId || !password.trim()) {
      return { ok: false, error: 'Please enter your email or mobile number and password.' };
    }

    const found = state.patients.find((p) => {
      const phoneDigits = p.phone.replace(/\D/g, '');
      const matchesEmail = p.email.toLowerCase() === cleanId;
      const matchesPatientId = p.id.toLowerCase() === cleanId;
      const matchesPhone =
        digitsOnly.length >= 6 &&
        (phoneDigits === digitsOnly || phoneDigits.endsWith(digitsOnly));
      return matchesEmail || matchesPatientId || matchesPhone;
    });

    if (!found) {
      return {
        ok: false,
        error: 'No patient account found for that email or mobile number. You can create a new account or select a demo patient.',
      };
    }

    if (found.password !== password) {
      return { ok: false, error: 'Incorrect password. Please try again or use Forgot password.' };
    }

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      activeRole: 'patient',
      activePatientId: found.id,
      activeDoctorId: null,
      authMethod: 'demo',
    }));
    setActiveSection('dashboard');
    setGlobalSearch('');
    return { ok: true };
  };

  const registerNewPatient = (payload: PatientRegistrationPayload): AuthResult => {
    const emailClean = payload.email.trim().toLowerCase();
    if (!payload.fullName.trim() || !payload.phone.trim() || !emailClean || payload.password.length < 6) {
      return {
        ok: false,
        error: 'Full name, mobile number, valid email, and password (min 6 chars) are required.',
      };
    }

    const duplicate = state.patients.find((p) => p.email.toLowerCase() === emailClean);
    if (duplicate) {
      return { ok: false, error: 'An account with this email already exists. Please sign in instead.' };
    }

    const newPatientId = `RV-2026-${1049 + state.patients.length}`;
    const newPatient: PatientRecord = {
      id: newPatientId,
      fullName: payload.fullName.trim(),
      age: Number(payload.age) || 30,
      gender: payload.gender,
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      password: payload.password,
      address: payload.address.trim() || 'India',
      bloodGroup: payload.bloodGroup || 'O+',
      createdAt: formatIsoDate(new Date()),
    };

    const welcomeNotif = makeNotification(
      'patient',
      newPatientId,
      'appointment',
      'Welcome to R VEDHA',
      `Your Patient ID ${newPatientId} is active. You can now book appointments with any available specialist.`
    );

    setState((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      notifications: [welcomeNotif, ...prev.notifications],
      isAuthenticated: true,
      activeRole: 'patient',
      activePatientId: newPatientId,
      activeDoctorId: null,
      authMethod: 'demo',
    }));
    setActiveSection('dashboard');
    return { ok: true };
  };

  const loginPatientWithGoogle = (name: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = state.patients.find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        activeRole: 'patient',
        activePatientId: existing.id,
        activeDoctorId: null,
        authMethod: 'google',
      }));
      setActiveSection('dashboard');
      return;
    }

    const newPatientId = `RV-2026-${1049 + state.patients.length}`;
    const newPatient: PatientRecord = {
      id: newPatientId,
      fullName: name || 'Valued Patient',
      age: 32,
      gender: 'Other',
      phone: '+91 98400 00000',
      email,
      password: 'GoogleAuthUser',
      address: 'India',
      createdAt: formatIsoDate(new Date()),
    };

    setState((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      isAuthenticated: true,
      activeRole: 'patient',
      activePatientId: newPatientId,
      activeDoctorId: null,
      authMethod: 'google',
    }));
    setActiveSection('dashboard');
  };

  const loginAsDoctor = (identifier: string, password: string): AuthResult => {
    const clean = identifier.trim().toLowerCase();
    if (!clean || !password.trim()) {
      return { ok: false, error: 'Please enter your Doctor Email or Doctor ID and password.' };
    }

    const found = state.doctors.find(
      (d) => d.email.toLowerCase() === clean || d.doctorCode.toLowerCase() === clean
    );

    if (!found) {
      return { ok: false, error: 'Doctor credentials not recognized in the R VEDHA clinical directory.' };
    }

    if (found.password !== password) {
      return { ok: false, error: 'Incorrect clinical portal password.' };
    }

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      activeRole: 'doctor',
      activeDoctorId: found.id,
      activePatientId: null,
      authMethod: 'demo',
    }));
    setActiveSection('dashboard');
    setGlobalSearch('');
    return { ok: true };
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      activeRole: null,
      activePatientId: null,
      activeDoctorId: null,
    }));
    setActiveSection('dashboard');
    setAiDrawerOpen(false);
    setGlobalSearch('');
  };

  const setLanguage = (lang: LanguageCode) => {
    setState((prev) => ({ ...prev, language: lang }));
  };

  // 2. Real-time Slot & Availability Helpers
  const isDateAvailableForDoctor = (
    doctorId: string,
    dateIso: string
  ): { available: boolean; reason?: string } => {
    const doc = state.doctors.find((d) => d.id === doctorId);
    if (!doc) return { available: false, reason: 'Doctor not found.' };

    if (doc.status === 'On Leave') {
      return { available: false, reason: `${doc.name} is currently marked On Leave.` };
    }

    const blocked = state.blockedDates.find(
      (b) => b.date === dateIso && (b.doctorId === 'ALL' || b.doctorId === doctorId)
    );
    if (blocked) {
      return { available: false, reason: `Blocked: ${blocked.reason}` };
    }

    const parsed = new Date(`${dateIso}T00:00:00`);
    const weekday = WEEKDAY_LABELS[parsed.getDay()];
    if (!doc.availableDays.includes(weekday)) {
      return {
        available: false,
        reason: `${doc.name} does not consult on ${weekday} (${doc.availableDays.join(', ')}).`,
      };
    }

    return { available: true };
  };

  const getAvailableSlotsForDoctor = (doctorId: string, dateIso: string): string[] => {
    const check = isDateAvailableForDoctor(doctorId, dateIso);
    if (!check.available) return [];

    const doc = state.doctors.find((d) => d.id === doctorId);
    if (!doc) return [];

    const configuredForDate = state.timeSlots.filter(
      (s) => s.doctorId === doctorId && s.date === dateIso
    );

    const bookedTimesFromAppointments = new Set(
      state.appointments
        .filter((a) => a.doctorId === doctorId && a.date === dateIso && a.status !== 'Cancelled')
        .map((a) => a.time)
    );

    if (configuredForDate.length > 0) {
      return configuredForDate
        .filter((s) => s.state === 'Available' && !bookedTimesFromAppointments.has(s.time))
        .map((s) => s.time);
    }

    return doc.defaultSlots.filter((time) => !bookedTimesFromAppointments.has(time));
  };

  // 3. Appointment Lifecycle Operations (Synchronized + Role-Protected)
  const bookAppointment = (
    payload: BookAppointmentPayload
  ): { ok: boolean; confirmation?: BookingConfirmation; error?: string } => {
    if (state.activeRole !== 'patient' || !currentPatient) {
      return { ok: false, error: 'Only signed-in patients can book appointments here.' };
    }

    const doctor = state.doctors.find((d) => d.id === payload.doctorId);
    if (!doctor) {
      return { ok: false, error: 'Selected specialist does not exist.' };
    }

    const dateCheck = isDateAvailableForDoctor(doctor.id, payload.date);
    if (!dateCheck.available) {
      return { ok: false, error: dateCheck.reason || 'Doctor unavailable on this date.' };
    }

    const openSlots = getAvailableSlotsForDoctor(doctor.id, payload.date);
    if (!openSlots.includes(payload.time)) {
      return {
        ok: false,
        error: `The ${payload.time} slot on ${payload.date} is no longer available. Please pick another time.`,
      };
    }

    const bookingRef = `RV-APT-${Math.floor(8855 + Math.random() * 1100)}`;
    const todayIso = formatIsoDate(new Date());
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      bookingRef,
      patientId: currentPatient.id,
      patientName: currentPatient.fullName,
      patientAge: currentPatient.age,
      patientGender: currentPatient.gender,
      patientPhone: currentPatient.phone,
      patientEmail: currentPatient.email,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      department: doctor.department,
      date: payload.date,
      time: payload.time,
      consultationType: payload.consultationType,
      status: 'Pending',
      reason: payload.reason.trim() || 'Clinical consultation',
      notes: payload.notes?.trim(),
      createdAt: todayIso,
    };

    const patientNotif = makeNotification(
      'patient',
      currentPatient.id,
      'booking',
      'Appointment Booked',
      `Booking ${bookingRef} with ${doctor.name} for ${payload.date} at ${payload.time} is submitted (Pending doctor confirmation).`
    );

    const doctorNotif = makeNotification(
      'doctor',
      doctor.id,
      'booking',
      'New Appointment Booking',
      `${currentPatient.fullName} (${bookingRef}) booked ${payload.date} at ${payload.time} — ${newApt.reason}.`
    );

    setState((prev) => {
      let updatedExistingSlot = false;
      const updatedSlots = prev.timeSlots.map((slot) => {
        if (slot.doctorId === doctor.id && slot.date === payload.date && slot.time === payload.time) {
          updatedExistingSlot = true;
          return { ...slot, state: 'Booked' as const, appointmentId: newApt.id };
        }
        return slot;
      });

      if (!updatedExistingSlot) {
        updatedSlots.push({
          id: `slot-${doctor.id}-${payload.date}-${Date.now()}`,
          doctorId: doctor.id,
          date: payload.date,
          time: payload.time,
          durationMin: doctor.consultationDurationMin,
          state: 'Booked',
          appointmentId: newApt.id,
        });
      }

      return {
        ...prev,
        appointments: [newApt, ...prev.appointments],
        timeSlots: updatedSlots,
        notifications: [patientNotif, doctorNotif, ...prev.notifications],
      };
    });

    return {
      ok: true,
      confirmation: {
        bookingRef,
        patientId: currentPatient.id,
        patientName: currentPatient.fullName,
        doctorName: doctor.name,
        department: doctor.department,
        specialty: doctor.specialty,
        date: payload.date,
        time: payload.time,
        consultationType: payload.consultationType,
        status: 'Pending',
        feeInr: doctor.feeInr,
      },
    };
  };

  const verifyAppointmentOwnership = (apt: Appointment): boolean => {
    if (state.activeRole === 'patient') {
      return apt.patientId === state.activePatientId;
    }
    if (state.activeRole === 'doctor') {
      return apt.doctorId === state.activeDoctorId;
    }
    return false;
  };

  const cancelAppointment = (appointmentId: string): ActionResult => {
    const target = state.appointments.find((a) => a.id === appointmentId);
    if (!target) return { ok: false, error: 'Appointment not found.' };
    if (!verifyAppointmentOwnership(target)) {
      return { ok: false, error: 'Access denied for this appointment.' };
    }
    if (target.status === 'Completed') {
      return { ok: false, error: 'Completed appointments cannot be cancelled.' };
    }
    if (target.status === 'Cancelled') {
      return { ok: false, error: 'Appointment is already cancelled.' };
    }

    const cancelledBy = state.activeRole === 'doctor' ? target.doctorName : target.patientName;
    const pNotif = makeNotification(
      'patient',
      target.patientId,
      'cancellation',
      'Appointment Cancelled',
      `Appointment ${target.bookingRef} with ${target.doctorName} (${target.date} · ${target.time}) was cancelled.`
    );
    const dNotif = makeNotification(
      'doctor',
      target.doctorId,
      'cancellation',
      'Appointment Cancelled',
      `${target.patientName} (${target.bookingRef}) for ${target.date} at ${target.time} was cancelled by ${cancelledBy}. Slot is now open.`
    );

    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'Cancelled' as const } : a
      ),
      timeSlots: prev.timeSlots.map((slot) => {
        if (
          slot.doctorId === target.doctorId &&
          slot.date === target.date &&
          slot.time === target.time
        ) {
          return { ...slot, state: 'Available' as const, appointmentId: undefined };
        }
        return slot;
      }),
      notifications: [pNotif, dNotif, ...prev.notifications],
    }));

    return { ok: true };
  };

  const rescheduleAppointment = (
    appointmentId: string,
    newDate: string,
    newTime: string
  ): ActionResult => {
    const target = state.appointments.find((a) => a.id === appointmentId);
    if (!target) return { ok: false, error: 'Appointment not found.' };
    if (!verifyAppointmentOwnership(target)) {
      return { ok: false, error: 'Access denied for this appointment.' };
    }
    if (target.status === 'Completed' || target.status === 'Cancelled') {
      return { ok: false, error: 'Completed or cancelled appointments cannot be rescheduled.' };
    }

    if (target.date === newDate && target.time === newTime) {
      return { ok: false, error: 'Please pick a different date or time slot.' };
    }

    const available = getAvailableSlotsForDoctor(target.doctorId, newDate);
    if (!available.includes(newTime)) {
      return {
        ok: false,
        error: `${newTime} on ${newDate} is unavailable or booked. Choose an available slot.`,
      };
    }

    const pNotif = makeNotification(
      'patient',
      target.patientId,
      'reschedule',
      'Appointment Rescheduled',
      `Your appointment ${target.bookingRef} with ${target.doctorName} has been rescheduled to ${newDate} at ${newTime}.`
    );
    const dNotif = makeNotification(
      'doctor',
      target.doctorId,
      'reschedule',
      'Appointment Rescheduled',
      `${target.patientName} (${target.bookingRef}) moved from ${target.date} ${target.time} to ${newDate} at ${newTime}.`
    );

    setState((prev) => {
      const doctor = prev.doctors.find((d) => d.id === target.doctorId);
      let newSlotFound = false;

      const updatedSlots = prev.timeSlots.map((slot) => {
        // Release old slot
        if (
          slot.doctorId === target.doctorId &&
          slot.date === target.date &&
          slot.time === target.time
        ) {
          return { ...slot, state: 'Available' as const, appointmentId: undefined };
        }
        // Occupy new slot
        if (slot.doctorId === target.doctorId && slot.date === newDate && slot.time === newTime) {
          newSlotFound = true;
          return { ...slot, state: 'Booked' as const, appointmentId: target.id };
        }
        return slot;
      });

      if (!newSlotFound) {
        updatedSlots.push({
          id: `slot-${target.doctorId}-${newDate}-${Date.now()}`,
          doctorId: target.doctorId,
          date: newDate,
          time: newTime,
          durationMin: doctor?.consultationDurationMin || 30,
          state: 'Booked',
          appointmentId: target.id,
        });
      }

      return {
        ...prev,
        appointments: prev.appointments.map((a) =>
          a.id === appointmentId
            ? { ...a, date: newDate, time: newTime, status: 'Rescheduled' as const }
            : a
        ),
        timeSlots: updatedSlots,
        notifications: [pNotif, dNotif, ...prev.notifications],
      };
    });

    return { ok: true };
  };

  const confirmAppointmentAsDoctor = (appointmentId: string): ActionResult => {
    const target = state.appointments.find((a) => a.id === appointmentId);
    if (!target || state.activeRole !== 'doctor' || target.doctorId !== state.activeDoctorId) {
      return { ok: false, error: 'Only the assigned doctor can confirm this appointment.' };
    }

    const pNotif = makeNotification(
      'patient',
      target.patientId,
      'appointment',
      'Appointment Confirmed',
      `${target.doctorName} confirmed your appointment ${target.bookingRef} for ${target.date} at ${target.time}.`
    );

    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'Confirmed' as const } : a
      ),
      notifications: [pNotif, ...prev.notifications],
    }));
    return { ok: true };
  };

  const completeAppointmentAsDoctor = (
    appointmentId: string,
    consultationNotes?: string
  ): ActionResult => {
    const target = state.appointments.find((a) => a.id === appointmentId);
    if (!target || state.activeRole !== 'doctor' || target.doctorId !== state.activeDoctorId) {
      return { ok: false, error: 'Only the assigned doctor can complete this consultation.' };
    }

    const pNotif = makeNotification(
      'patient',
      target.patientId,
      'appointment',
      'Consultation Completed',
      `Your visit ${target.bookingRef} with ${target.doctorName} is complete. Summary notes are now available.`
    );

    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'Completed' as const,
              consultationNotes:
                consultationNotes !== undefined ? consultationNotes : a.consultationNotes,
            }
          : a
      ),
      notifications: [pNotif, ...prev.notifications],
    }));
    return { ok: true };
  };

  const saveConsultationNotes = (appointmentId: string, notes: string): ActionResult => {
    const target = state.appointments.find((a) => a.id === appointmentId);
    if (!target || state.activeRole !== 'doctor' || target.doctorId !== state.activeDoctorId) {
      return { ok: false, error: 'Access denied.' };
    }
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId ? { ...a, consultationNotes: notes } : a
      ),
    }));
    return { ok: true };
  };

  // 4. Doctor Availability & Profile Controls (strictly own profile)
  const updateOwnDoctorProfile = (patch: Partial<Doctor>) => {
    if (state.activeRole !== 'doctor' || !state.activeDoctorId) return;
    setState((prev) => ({
      ...prev,
      doctors: prev.doctors.map((d) => (d.id === prev.activeDoctorId ? { ...d, ...patch } : d)),
    }));
  };

  const updateOwnPatientProfile = (patch: Partial<PatientRecord>) => {
    if (state.activeRole !== 'patient' || !state.activePatientId) return;
    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) =>
        p.id === prev.activePatientId ? { ...p, ...patch } : p
      ),
    }));
  };

  const addDoctorSlot = (
    date: string,
    time: string,
    durationMin: number,
    slotState: TimeSlotItem['state']
  ): ActionResult => {
    if (state.activeRole !== 'doctor' || !state.activeDoctorId || !currentDoctor) {
      return { ok: false, error: 'Unauthorized.' };
    }
    const cleanTime = time.trim().toUpperCase();
    const exists = state.timeSlots.some(
      (s) => s.doctorId === currentDoctor.id && s.date === date && s.time === cleanTime
    );
    if (exists) {
      return { ok: false, error: `A slot at ${cleanTime} already exists on ${date}.` };
    }

    const newSlot: TimeSlotItem = {
      id: `slot-${currentDoctor.id}-${date}-${Date.now()}`,
      doctorId: currentDoctor.id,
      date,
      time: cleanTime,
      durationMin,
      state: slotState,
    };

    setState((prev) => {
      // Ensure date has remaining default slots seeded first if it had none yet
      const alreadyHasDate = prev.timeSlots.some(
        (s) => s.doctorId === currentDoctor.id && s.date === date
      );
      const seededDefaults: TimeSlotItem[] = alreadyHasDate
        ? []
        : currentDoctor.defaultSlots
            .filter((t) => t !== cleanTime)
            .map((t, i) => ({
              id: `slot-${currentDoctor.id}-${date}-seed-${i}`,
              doctorId: currentDoctor.id,
              date,
              time: t,
              durationMin: currentDoctor.consultationDurationMin,
              state: prev.appointments.some(
                (a) =>
                  a.doctorId === currentDoctor.id &&
                  a.date === date &&
                  a.time === t &&
                  a.status !== 'Cancelled'
              )
                ? ('Booked' as const)
                : ('Available' as const),
            }));

      return {
        ...prev,
        timeSlots: [...prev.timeSlots, ...seededDefaults, newSlot],
      };
    });

    return { ok: true };
  };

  const updateDoctorSlot = (slotId: string, patch: Partial<TimeSlotItem>): ActionResult => {
    const slot = state.timeSlots.find((s) => s.id === slotId);
    if (!slot || state.activeRole !== 'doctor' || slot.doctorId !== state.activeDoctorId) {
      return { ok: false, error: 'Unauthorized.' };
    }
    if (slot.state === 'Booked' && patch.state && patch.state !== 'Booked') {
      return {
        ok: false,
        error: 'This slot has an active patient booking. Cancel or reschedule the appointment instead.',
      };
    }
    setState((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((s) => (s.id === slotId ? { ...s, ...patch } : s)),
    }));
    return { ok: true };
  };

  const deleteDoctorSlot = (slotId: string): ActionResult => {
    const slot = state.timeSlots.find((s) => s.id === slotId);
    if (!slot || state.activeRole !== 'doctor' || slot.doctorId !== state.activeDoctorId) {
      return { ok: false, error: 'Unauthorized.' };
    }
    if (slot.state === 'Booked') {
      return { ok: false, error: 'Cannot delete a booked slot with an active appointment.' };
    }
    setState((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((s) => s.id !== slotId),
    }));
    return { ok: true };
  };

  const addBlockedDate = (date: string, reason: string): ActionResult => {
    if (state.activeRole !== 'doctor' || !state.activeDoctorId) {
      return { ok: false, error: 'Unauthorized.' };
    }
    const duplicate = state.blockedDates.some(
      (b) => b.doctorId === state.activeDoctorId && b.date === date
    );
    if (duplicate) return { ok: false, error: 'This date is already blocked.' };

    const blk: BlockedDate = {
      id: `blk-${Date.now()}`,
      doctorId: state.activeDoctorId,
      date,
      reason: reason.trim() || 'Leave / Unavailable',
    };
    setState((prev) => ({
      ...prev,
      blockedDates: [...prev.blockedDates, blk],
    }));
    return { ok: true };
  };

  const removeBlockedDate = (blockedId: string) => {
    if (state.activeRole !== 'doctor' || !state.activeDoctorId) return;
    setState((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter(
        (b) => !(b.id === blockedId && b.doctorId === prev.activeDoctorId)
      ),
    }));
  };

  // 5. Notifications & Preferences
  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    const activeId = state.activeRole === 'patient' ? state.activePatientId : state.activeDoctorId;
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.recipientRole === prev.activeRole && n.recipientId === activeId
          ? { ...n, read: true }
          : n
      ),
    }));
  };

  const deleteNotification = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  };

  const updateNotificationPrefs = (patch: Partial<NotificationPreferences>) => {
    setState((prev) => ({
      ...prev,
      notificationPrefs: { ...prev.notificationPrefs, ...patch },
    }));
  };

  const updateCalendarPrefs = (patch: Partial<CalendarPreferences>) => {
    setState((prev) => ({
      ...prev,
      calendarPrefs: { ...prev.calendarPrefs, ...patch },
    }));
  };

  const updateSecurityPrefs = (patch: Partial<SecurityPreferences>) => {
    setState((prev) => ({
      ...prev,
      securityPrefs: { ...prev.securityPrefs, ...patch },
    }));
  };

  // 6. Vedha AI
  const sendAiMessage = (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || !state.activeRole) return;
    const userId =
      state.activeRole === 'patient'
        ? state.activePatientId || 'patient'
        : state.activeDoctorId || 'doctor';
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setState((prev) => {
      const reply = runVedhaAiQuery(trimmed, prev);
      return {
        ...prev,
        chatMessages: [
          ...prev.chatMessages,
          {
            id: `u-${Date.now()}`,
            roleScope: prev.activeRole!,
            userId,
            sender: 'user',
            text: trimmed,
            timestamp: nowLabel,
          },
          {
            id: `a-${Date.now() + 1}`,
            roleScope: prev.activeRole!,
            userId,
            sender: 'assistant',
            text: reply.text,
            timestamp: nowLabel,
            highlights: reply.highlights,
          },
        ],
      };
    });
  };

  const clearAiMessages = () => {
    setState((prev) => ({
      ...prev,
      chatMessages: prev.chatMessages.filter(
        (m) =>
          m.roleScope !== prev.activeRole ||
          m.id.startsWith('ai-welcome')
      ),
    }));
  };

  const resetDemoData = () => {
    const fresh = createInitialDemoState();
    setState((prev) => ({
      ...fresh,
      isAuthenticated: prev.isAuthenticated,
      activeRole: prev.activeRole,
      activePatientId: prev.activePatientId,
      activeDoctorId: prev.activeDoctorId,
      language: prev.language,
    }));
  };

  const t = TRANSLATIONS[state.language] || TRANSLATIONS.en;

  return (
    <RvedhaContext.Provider
      value={{
        state,
        t,
        currentPatient,
        currentDoctor,
        activeSection,
        setActiveSection,
        globalSearch,
        setGlobalSearch,
        showIntro,
        dismissIntro,
        replayIntro,
        aiDrawerOpen,
        setAiDrawerOpen,
        loginAsPatient,
        registerNewPatient,
        loginPatientWithGoogle,
        loginAsDoctor,
        logout,
        setLanguage,
        isDateAvailableForDoctor,
        getAvailableSlotsForDoctor,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        confirmAppointmentAsDoctor,
        completeAppointmentAsDoctor,
        saveConsultationNotes,
        updateOwnDoctorProfile,
        updateOwnPatientProfile,
        addDoctorSlot,
        updateDoctorSlot,
        deleteDoctorSlot,
        addBlockedDate,
        removeBlockedDate,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        updateNotificationPrefs,
        updateCalendarPrefs,
        updateSecurityPrefs,
        sendAiMessage,
        clearAiMessages,
        resetDemoData,
      }}
    >
      {children}
    </RvedhaContext.Provider>
  );
}

export function useRvedha(): RvedhaContextValue {
  const ctx = useContext(RvedhaContext);
  if (!ctx) {
    throw new Error('useRvedha must be used inside RvedhaProvider');
  }
  return ctx;
}

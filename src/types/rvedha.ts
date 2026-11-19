export type LanguageCode = 'en' | 'ta' | 'ml' | 'te' | 'hi';

export type UserRole = 'patient' | 'doctor';

export type PatientNavSection =
  | 'dashboard'
  | 'book-appointment'
  | 'my-appointments'
  | 'upcoming'
  | 'history'
  | 'calendar'
  | 'notifications'
  | 'ai-assistant'
  | 'profile';

export type DoctorNavSection =
  | 'dashboard'
  | 'appointments'
  | 'calendar'
  | 'availability'
  | 'notifications'
  | 'ai-assistant'
  | 'profile';

export type NavSection = PatientNavSection | DoctorNavSection;

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Rescheduled'
  | 'Completed'
  | 'Cancelled';

export type ConsultationType =
  | 'In-Person'
  | 'Video Consultation'
  | 'Follow-Up'
  | 'Executive Checkup';

export type DepartmentName =
  | 'Cardiology'
  | 'General Medicine'
  | 'Dermatology'
  | 'Neurology'
  | 'Orthopedics';

export interface Doctor {
  id: string;
  doctorCode: string; // e.g., RV-DOC-101
  email: string;
  password: string;
  name: string;
  department: DepartmentName;
  specialty: string;
  qualification: string;
  experienceYears: number;
  feeInr: number;
  consultationDurationMin: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  availableDays: string[];
  defaultSlots: string[];
  breakWindows: string[];
  status: 'Available' | 'In Consultation' | 'On Leave';
  avatarUrl: string;
  bio: string;
  location: string;
}

export interface TimeSlotItem {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:00 AM"
  durationMin: number;
  state: 'Available' | 'Booked' | 'Break';
  appointmentId?: string;
}

export interface BlockedDate {
  id: string;
  doctorId: string | 'ALL';
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface PatientRecord {
  id: string; // e.g., RV-2026-1041
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  email: string;
  password: string;
  address: string;
  bloodGroup?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  bookingRef: string; // Appointment ID shown to patients & doctors
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'Female' | 'Male' | 'Other';
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  department: DepartmentName;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "09:30 AM"
  consultationType: ConsultationType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  consultationNotes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: 'patient' | 'doctor';
  recipientId: string; // patientId or doctorId
  category: 'appointment' | 'booking' | 'reschedule' | 'cancellation' | 'reminder' | 'schedule';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationPreferences {
  newAppointmentAlerts: boolean;
  cancellationAlerts: boolean;
  rescheduleAlerts: boolean;
  dailySummaryEmail: boolean;
  reminderAlerts: boolean;
  aiAssistantNotifications: boolean;
}

export interface CalendarPreferences {
  defaultView: 'month' | 'week' | 'day';
  startDayOfWeek: 'Monday' | 'Sunday';
  reminderLeadMinutes: number;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  biometricQuickUnlock: boolean;
}

export interface ChatMessage {
  id: string;
  roleScope: UserRole;
  userId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  highlights?: Array<{ label: string; value: string }>;
}

export interface RvedhaState {
  isAuthenticated: boolean;
  activeRole: UserRole | null;
  activePatientId: string | null;
  activeDoctorId: string | null;
  authMethod: 'demo' | 'google';
  language: LanguageCode;
  notificationPrefs: NotificationPreferences;
  calendarPrefs: CalendarPreferences;
  securityPrefs: SecurityPreferences;
  doctors: Doctor[];
  patients: PatientRecord[];
  appointments: Appointment[];
  timeSlots: TimeSlotItem[];
  blockedDates: BlockedDate[];
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];
}

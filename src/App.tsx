import { RvedhaProvider, useRvedha } from './context/RvedhaContext';
import { IntroOverlay } from './components/IntroOverlay';
import { LoginPage } from './components/LoginPage';
import { DashboardShell } from './components/DashboardShell';
import { PatientDashboard } from './components/PatientDashboard';
import { PatientBookAppointmentPage } from './components/PatientBookAppointmentPage';
import { PatientAppointmentsPage } from './components/PatientAppointmentsPage';
import { DoctorDashboard } from './components/DoctorDashboard';
import { DoctorAppointmentsPage } from './components/DoctorAppointmentsPage';
import { DoctorAvailabilityPage } from './components/DoctorAvailabilityPage';
import { CalendarPage } from './components/CalendarPage';
import { NotificationsPage } from './components/NotificationsPage';
import { AiAssistantPage, VedhaAiFloatingWidget } from './components/VedhaAiAssistant';
import { ProfileSettingsPage } from './components/ProfileSettingsPage';

function RvedhaRouter() {
  const { state, activeSection } = useRvedha();

  if (!state.isAuthenticated || !state.activeRole) {
    return (
      <>
        <IntroOverlay />
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <IntroOverlay />
      <DashboardShell>
        {/* Strict Role-Based Routing: Patient Portal */}
        {state.activeRole === 'patient' && (
          <>
            {activeSection === 'dashboard' && <PatientDashboard />}
            {activeSection === 'book-appointment' && <PatientBookAppointmentPage />}
            {activeSection === 'my-appointments' && <PatientAppointmentsPage mode="all" />}
            {activeSection === 'upcoming' && <PatientAppointmentsPage mode="upcoming" />}
            {activeSection === 'history' && <PatientAppointmentsPage mode="history" />}
            {activeSection === 'calendar' && <CalendarPage />}
            {activeSection === 'notifications' && <NotificationsPage />}
            {activeSection === 'ai-assistant' && <AiAssistantPage />}
            {activeSection === 'profile' && <ProfileSettingsPage />}
          </>
        )}

        {/* Strict Role-Based Routing: Doctor Portal */}
        {state.activeRole === 'doctor' && (
          <>
            {activeSection === 'dashboard' && <DoctorDashboard />}
            {activeSection === 'appointments' && <DoctorAppointmentsPage />}
            {activeSection === 'calendar' && <CalendarPage />}
            {activeSection === 'availability' && <DoctorAvailabilityPage />}
            {activeSection === 'notifications' && <NotificationsPage />}
            {activeSection === 'ai-assistant' && <AiAssistantPage />}
            {activeSection === 'profile' && <ProfileSettingsPage />}
          </>
        )}

        <VedhaAiFloatingWidget />
      </DashboardShell>
    </>
  );
}

export default function App() {
  return (
    <RvedhaProvider>
      <RvedhaRouter />
    </RvedhaProvider>
  );
}

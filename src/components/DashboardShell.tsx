import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Bot,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  UserCircle2,
  X,
} from 'lucide-react';
import { PATIENT_DEFAULT_AVATAR } from '../data/demoData';
import { useRvedha } from '../context/RvedhaContext';
import type { DoctorNavSection, LanguageCode, NavSection, PatientNavSection } from '../types/rvedha';
import { RvedhaLogo } from './RvedhaLogo';
import { ResilientImage } from './ResilientImage';

interface DashboardShellProps {
  children: React.ReactNode;
}

const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const {
    state,
    t,
    currentPatient,
    currentDoctor,
    activeSection,
    setActiveSection,
    globalSearch,
    setGlobalSearch,
    markNotificationRead,
    markAllNotificationsRead,
    setLanguage,
    logout,
  } = useRvedha();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isDoctor = state.activeRole === 'doctor';
  const activeUserId = isDoctor ? currentDoctor?.id : currentPatient?.id;

  const scopedNotifications = state.notifications.filter(
    (n) => n.recipientRole === state.activeRole && n.recipientId === activeUserId
  );
  const unreadCount = scopedNotifications.filter((n) => !n.read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t.greetings.morning;
    if (hour >= 12 && hour < 17) return t.greetings.afternoon;
    if (hour >= 17 && hour < 21) return t.greetings.evening;
    return t.greetings.night;
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const patientNavItems: Array<{
    id: PatientNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: t.patientNav.dashboard, icon: LayoutDashboard },
    { id: 'book-appointment', label: t.patientNav['book-appointment'], icon: PlusCircle },
    { id: 'my-appointments', label: t.patientNav['my-appointments'], icon: CalendarCheck },
    { id: 'upcoming', label: t.patientNav.upcoming, icon: CalendarClock },
    { id: 'history', label: t.patientNav.history, icon: History },
    { id: 'calendar', label: t.patientNav.calendar, icon: CalendarDays },
    { id: 'notifications', label: t.patientNav.notifications, icon: Bell, badge: unreadCount },
    { id: 'ai-assistant', label: t.patientNav['ai-assistant'], icon: Bot },
    { id: 'profile', label: t.patientNav.profile, icon: UserCircle2 },
  ];

  const doctorNavItems: Array<{
    id: DoctorNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: t.doctorNav.dashboard, icon: LayoutDashboard },
    { id: 'appointments', label: t.doctorNav.appointments, icon: CalendarCheck },
    { id: 'calendar', label: t.doctorNav.calendar, icon: CalendarDays },
    { id: 'availability', label: t.doctorNav.availability, icon: Clock },
    { id: 'notifications', label: t.doctorNav.notifications, icon: Bell, badge: unreadCount },
    { id: 'ai-assistant', label: t.doctorNav['ai-assistant'], icon: Bot },
    { id: 'profile', label: t.doctorNav.profile, icon: UserCircle2 },
  ];

  const navItems = isDoctor ? doctorNavItems : patientNavItems;

  const displayName = isDoctor
    ? currentDoctor?.name || 'Doctor'
    : currentPatient?.fullName || 'Patient';

  const displayId = isDoctor
    ? `${currentDoctor?.doctorCode || ''} · ${currentDoctor?.department || ''}`
    : currentPatient?.id || '';

  const avatarSrc = isDoctor ? currentDoctor?.avatarUrl : PATIENT_DEFAULT_AVATAR;

  const handleSelectNav = (id: NavSection) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      setActiveSection(isDoctor ? 'appointments' : 'my-appointments');
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F4F6F9] flex">
      {/* Desktop Left Sidebar */}
      <aside
        className={`no-print hidden lg:flex flex-col shrink-0 border-r border-[#C7CED8]/14 bg-[#07111F] transition-all duration-300 ${
          collapsed ? 'w-[84px]' : 'w-[264px]'
        }`}
      >
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#C7CED8]/12">
          <RvedhaLogo
            compact={collapsed}
            size="md"
            showSubtitle={!collapsed}
            subtitle={isDoctor ? 'DOCTOR PORTAL' : 'PATIENT PORTAL'}
          />
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="h-8 w-8 rounded-lg border border-[#C7CED8]/18 bg-[#101D2E] flex items-center justify-center text-[#C7CED8] hover:border-[#C8A96B]/60 hover:text-[#F4F6F9] transition cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectNav(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group relative w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#122236] text-[#F4F6F9] border border-[#C8A96B]/45'
                    : 'text-[#8C9BAE] border border-transparent hover:bg-[#101D2E] hover:text-[#F4F6F9]'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition ${
                    active ? 'text-[#C8A96B]' : 'text-[#8C9BAE] group-hover:text-[#C7CED8]'
                  }`}
                />
                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                {!collapsed && typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/45 px-2 py-0.5 text-[10px] font-semibold text-[#C8A96B] tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#C7CED8]/12">
          <button
            type="button"
            onClick={logout}
            title={collapsed ? t.patientNav.logout : undefined}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#8C9BAE] hover:bg-rose-500/10 hover:text-rose-200 border border-transparent hover:border-rose-400/25 transition cursor-pointer whitespace-nowrap ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>{isDoctor ? t.doctorNav.logout : t.patientNav.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#07111F]/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[82vw] bg-[#07111F] border-r border-[#C7CED8]/18 flex flex-col h-full">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#C7CED8]/12">
              <RvedhaLogo
                size="sm"
                showSubtitle
                subtitle={isDoctor ? 'DOCTOR PORTAL' : 'PATIENT PORTAL'}
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 w-10 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#C7CED8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition min-h-[44px] ${
                      active
                        ? 'bg-[#122236] text-[#F4F6F9] border border-[#C8A96B]/45'
                        : 'text-[#8C9BAE] hover:bg-[#101D2E] hover:text-[#F4F6F9]'
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#C8A96B]' : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="rounded-full bg-[#C8A96B]/20 px-2 py-0.5 text-[10px] text-[#C8A96B] tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-[#C7CED8]/12">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-rose-300 hover:bg-rose-500/10 min-h-[44px]"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>{isDoctor ? t.doctorNav.logout : t.patientNav.logout}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="no-print sticky top-0 z-30 border-b border-[#C7CED8]/14 bg-[#07111F]/92 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Mobile Menu + Greeting */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden h-10 w-10 rounded-xl border border-[#C7CED8]/20 bg-[#101D2E] flex items-center justify-center text-[#C7CED8] shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#F4F6F9] truncate">
                  {getGreeting()}, {displayName}
                </h2>
                <p className="text-xs text-[#8C9BAE] truncate">
                  {isDoctor ? t.greetings.doctorSubtitle : t.greetings.patientSubtitle}
                </p>
              </div>
            </div>

            {/* Right: Search, Date, Language, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <form onSubmit={handleGlobalSearchSubmit} className="hidden md:block relative w-52 xl:w-64">
                <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder={t.header.searchPlaceholder}
                  className="w-full rounded-xl border border-[#C7CED8]/18 bg-[#101D2E] pl-9 pr-3 py-2 text-xs text-[#F4F6F9] placeholder-[#8C9BAE]/70 focus:border-[#C8A96B] focus:outline-none transition"
                />
              </form>

              <div className="hidden xl:flex items-center gap-2 rounded-xl border border-[#C7CED8]/16 bg-[#101D2E] px-3 py-2 text-xs text-[#C7CED8] tabular-nums whitespace-nowrap">
                <CalendarDays className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>{formattedDate}</span>
              </div>

              {/* Language Switcher */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen((prev) => !prev)}
                  className="h-10 inline-flex items-center gap-1.5 rounded-xl border border-[#C7CED8]/18 bg-[#101D2E] px-2.5 sm:px-3 text-xs font-medium text-[#C7CED8] hover:border-[#C8A96B]/55 hover:text-[#F4F6F9] transition cursor-pointer whitespace-nowrap"
                >
                  <Globe className="w-4 h-4 text-[#C8A96B]" />
                  <span className="hidden sm:inline">{t.nativeLabel}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#C7CED8]/20 bg-[#101D2E] p-1.5 shadow-2xl z-40">
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => {
                          setLanguage(opt.code);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                          state.language === opt.code
                            ? 'bg-[#122236] text-[#C8A96B] border border-[#C8A96B]/35'
                            : 'text-[#C7CED8] hover:bg-[#122236]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={bellRef}>
                <button
                  type="button"
                  onClick={() => setBellOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative h-10 w-10 rounded-xl border border-[#C7CED8]/18 bg-[#101D2E] flex items-center justify-center text-[#C7CED8] hover:border-[#C8A96B]/55 hover:text-[#F4F6F9] transition cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#C8A96B] text-[#07111F] text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#C7CED8]/20 bg-[#101D2E] shadow-2xl z-40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#C7CED8]/14">
                      <span className="text-xs font-semibold tracking-wide text-[#F4F6F9]">
                        {t.header.notificationsTitle} ({unreadCount})
                      </span>
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-medium text-[#C8A96B] hover:underline cursor-pointer"
                      >
                        {t.header.markAllRead}
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#C7CED8]/10">
                      {scopedNotifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-[#8C9BAE]">
                          No notifications yet.
                        </div>
                      ) : (
                        scopedNotifications.slice(0, 5).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => markNotificationRead(item.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-[#122236] transition cursor-pointer ${
                              !item.read ? 'bg-[#122236]/55' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[#F4F6F9] truncate">
                                {item.title}
                              </span>
                              {!item.read && (
                                <span className="h-2 w-2 rounded-full bg-[#C8A96B] shrink-0" />
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-[#8C9BAE] line-clamp-2">
                              {item.message}
                            </p>
                            <span className="mt-1 block text-[10px] text-[#C7CED8]/60">
                              {item.timestamp}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t border-[#C7CED8]/14 p-2.5 bg-[#07111F]/60">
                      <button
                        type="button"
                        onClick={() => {
                          setBellOpen(false);
                          setActiveSection('notifications');
                        }}
                        className="w-full rounded-xl py-2 text-xs font-medium text-[#C8A96B] hover:bg-[#122236] transition cursor-pointer"
                      >
                        {t.header.viewAllNotifications}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Role Profile Avatar */}
              <button
                type="button"
                onClick={() => setActiveSection('profile')}
                className="flex items-center gap-2.5 rounded-xl border border-[#C7CED8]/18 bg-[#101D2E] p-1 pr-3 hover:border-[#C8A96B]/55 transition cursor-pointer"
              >
                <ResilientImage
                  src={avatarSrc}
                  alt={displayName}
                  fallbackLabel={displayName}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <div className="hidden sm:block text-left leading-tight max-w-[150px]">
                  <p className="text-xs font-semibold text-[#F4F6F9] truncate">{displayName}</p>
                  <p className="text-[10px] text-[#8C9BAE] truncate">{displayId}</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

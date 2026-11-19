import { useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useRvedha } from '../context/RvedhaContext';
import type { NotificationItem } from '../types/rvedha';

export function NotificationsPage() {
  const {
    state,
    t,
    currentPatient,
    currentDoctor,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useRvedha();

  const [filter, setFilter] = useState<'all' | 'unread' | NotificationItem['category']>('all');

  const activeUserId =
    state.activeRole === 'doctor' ? currentDoctor?.id : currentPatient?.id;

  const myNotifications = state.notifications.filter(
    (n) => n.recipientRole === state.activeRole && n.recipientId === activeUserId
  );

  const filtered = myNotifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.category === filter;
  });

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
            {t.notifications.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8C9BAE] mt-1">{t.notifications.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="rvedha-silver-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-[#C8A96B]" />
          <span>{t.header.markAllRead}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', `${t.notifications.all} (${myNotifications.length})`],
            ['unread', `${t.notifications.unread} (${unreadCount})`],
            ['booking', 'Bookings'],
            ['reschedule', 'Rescheduled'],
            ['cancellation', 'Cancelled'],
            ['reminder', 'Reminders'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
              filter === key
                ? 'rvedha-gold-btn font-semibold'
                : 'border border-[#C7CED8]/18 bg-[#101D2E] text-[#C7CED8] hover:border-[#C8A96B]/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rvedha-card rounded-2xl p-10 text-center text-xs text-[#8C9BAE]">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`rvedha-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.read ? 'border-[#C8A96B]/45' : 'opacity-85'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    !item.read
                      ? 'border-[#C8A96B]/45 bg-[#C8A96B]/12 text-[#C8A96B]'
                      : 'border-[#C7CED8]/18 bg-[#07111F] text-[#8C9BAE]'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#F4F6F9]">{item.title}</h3>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-[#C8A96B]" />}
                  </div>
                  <p className="text-xs text-[#C7CED8]/90 mt-1">{item.message}</p>
                  <p className="text-[11px] text-[#8C9BAE] mt-1.5">
                    {item.category.toUpperCase()} · {item.timestamp}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(item.id)}
                    className="rvedha-silver-btn rounded-xl px-3 py-1.5 text-[11px] font-medium cursor-pointer"
                  >
                    {t.notifications.markRead}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(item.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#C7CED8]/18 bg-[#07111F] px-3 py-1.5 text-[11px] text-[#8C9BAE] hover:text-rose-300 hover:border-rose-400/35 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.notifications.delete}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

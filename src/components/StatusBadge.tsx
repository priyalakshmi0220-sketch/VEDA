import { useRvedha } from '../context/RvedhaContext';
import type { AppointmentStatus } from '../types/rvedha';

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { t } = useRvedha();

  const styles: Record<AppointmentStatus, string> = {
    Confirmed: 'border-emerald-400/35 bg-emerald-500/12 text-emerald-300',
    Pending: 'border-[#C8A96B]/45 bg-[#C8A96B]/14 text-[#E3C88E]',
    Rescheduled: 'border-indigo-300/40 bg-indigo-400/15 text-indigo-200',
    Completed: 'border-sky-300/35 bg-sky-400/12 text-sky-200',
    Cancelled: 'border-rose-400/35 bg-rose-500/12 text-rose-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{t.statuses[status]}</span>
    </span>
  );
}

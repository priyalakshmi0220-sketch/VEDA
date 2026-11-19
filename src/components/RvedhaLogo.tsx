interface RvedhaLogoProps {
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitle?: string;
}

export function RvedhaLogo({
  compact = false,
  size = 'md',
  showSubtitle = false,
  subtitle = 'AI SMART APPOINTMENT MANAGEMENT',
}: RvedhaLogoProps) {
  const markSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  }[size];

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div
        className={`${markSizes} relative flex items-center justify-center rounded-xl bg-[#122236] border border-[#C7CED8]/25 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.65)] shrink-0`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path
            d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z"
            stroke="#C7CED8"
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />
          <path
            d="M18 8.5V27.5M12.5 14L18 8.5L23.5 14M13.5 22.5L18 27.5L22.5 22.5"
            stroke="#C8A96B"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="18" r="2.2" fill="#F4F6F9" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-heading font-bold tracking-[0.18em] text-[#F4F6F9] ${textSizes}`}
          >
            R VEDHA
          </span>
          {showSubtitle && (
            <span className="mt-1 text-[9px] font-medium tracking-[0.26em] text-[#C8A96B] uppercase">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

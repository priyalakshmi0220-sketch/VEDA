import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRvedha } from '../context/RvedhaContext';

const AMBIENT_PARTICLES = [
  { id: 1, left: '14%', top: '24%', size: 3, delay: 0.2, duration: 5.5 },
  { id: 2, left: '28%', top: '68%', size: 2, delay: 1.0, duration: 6.2 },
  { id: 3, left: '44%', top: '19%', size: 2.5, delay: 0.6, duration: 5.8 },
  { id: 4, left: '62%', top: '74%', size: 3, delay: 1.4, duration: 6.4 },
  { id: 5, left: '78%', top: '30%', size: 2, delay: 0.4, duration: 5.2 },
  { id: 6, left: '84%', top: '62%', size: 2.5, delay: 1.8, duration: 6.0 },
  { id: 7, left: '36%', top: '82%', size: 2, delay: 0.9, duration: 5.6 },
  { id: 8, left: '53%', top: '36%', size: 1.5, delay: 1.2, duration: 4.9 },
];

export function IntroOverlay() {
  const { showIntro, dismissIntro, t } = useRvedha();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showIntro) {
      setProgress(0);
      return;
    }

    const totalDurationMs = 10000; // ~10 seconds per specification
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / totalDurationMs) * 100);
      setProgress(pct);
      if (elapsed >= totalDurationMs) {
        dismissIntro();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [showIntro, dismissIntro]);

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          key="rvedha-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#07111F] px-6 text-center select-none"
        >
          {/* Ambient radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 44%, rgba(200, 169, 107, 0.08) 0%, rgba(18, 34, 54, 0.38) 38%, rgba(7, 17, 31, 0.98) 76%)',
            }}
          />

          {/* Subtle ambient particles */}
          {AMBIENT_PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full bg-[#C7CED8]"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                boxShadow: '0 0 12px rgba(200, 169, 107, 0.35)',
              }}
              initial={{ opacity: 0.08, y: 8 }}
              animate={{ opacity: [0.08, 0.45, 0.12], y: [-6, 6, -6] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Top Skip Intro Control */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            onClick={dismissIntro}
            className="absolute top-6 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-[#C7CED8]/25 bg-[#101D2E]/80 px-4 py-2 text-xs font-medium tracking-wider text-[#C7CED8] transition hover:border-[#C8A96B]/60 hover:text-[#F4F6F9] min-h-[40px] cursor-pointer"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C8A96B]" />
          </motion.button>

          {/* Centerpiece Sequence */}
          <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
            {/* Crest Reveal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1.1, ease: 'easeOut' }}
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C7CED8]/25 bg-[#122236]/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]"
            >
              <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8">
                <path
                  d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z"
                  stroke="#C7CED8"
                  strokeOpacity="0.6"
                  strokeWidth="1.2"
                />
                <path
                  d="M18 8.5V27.5M12.5 14L18 8.5L23.5 14M13.5 22.5L18 27.5L22.5 22.5"
                  stroke="#C8A96B"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="18" cy="18" r="2.3" fill="#F4F6F9" />
              </svg>
            </motion.div>

            {/* Thin Metallic Silver Line Draw */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.1, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 h-[1px] w-72 origin-center bg-gradient-to-r from-transparent via-[#C7CED8]/80 to-transparent sm:w-96"
            />

            {/* R VEDHA Logo Wordmark with subtle gold shimmer */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 1.2, ease: 'easeOut' }}
              className="gold-shimmer-text font-heading text-5xl font-bold tracking-[0.28em] sm:text-7xl"
            >
              R VEDHA
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 1.1, ease: 'easeOut' }}
              className="mt-4 text-xs font-medium tracking-[0.34em] text-[#C8A96B] uppercase sm:text-sm"
            >
              {t.brandSubtitle}
            </motion.p>

            {/* Elegant Loading Progress */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4, duration: 0.8 }}
              className="mt-14 w-64 sm:w-80"
            >
              <div className="mb-2.5 flex items-center justify-between text-[11px] tracking-[0.18em] text-[#8C9BAE] uppercase tabular-nums">
                <span>Initializing Clinical Suite</span>
                <span className="text-[#C7CED8]">{Math.round(progress)}%</span>
              </div>
              <div className="h-[2px] w-full overflow-hidden rounded-full bg-[#122236]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C7CED8] via-[#C8A96B] to-[#F4F6F9] transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

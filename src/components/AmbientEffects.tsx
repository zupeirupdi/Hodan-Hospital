import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const CHAPTERS = [
  { id: 'top', num: '00', label: '3D Heart' },
  { id: 'about', num: '01', label: 'Campus Gate' },
  { id: 'departments', num: '02', label: 'Departments' },
  { id: 'facilities', num: '03', label: '3D Facilities' },
  { id: 'services', num: '04', label: 'Card Tunnel' },
  { id: 'doctors', num: '05', label: 'Leadership' },
  { id: 'appointment', num: '06', label: 'Book Visit' },
  { id: 'contact', num: '07', label: 'Contact' },
];

export const CursorSpotlight: React.FC = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    setEnabled(true);
    let rafId = 0;
    let nextX = -500;
    let nextY = -500;

    const onMove = (e: PointerEvent) => {
      nextX = e.clientX;
      nextY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          setPos({ x: nextX, y: nextY });
          rafId = 0;
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(440px circle at ${pos.x}px ${pos.y}px, rgba(45, 212, 191, 0.075), transparent 70%)`,
      }}
    />
  );
};

export const ChapterScrollRail: React.FC = () => {
  const [activeId, setActiveId] = useState('top');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: 0.01 }
    );

    for (const ch of CHAPTERS) {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Page chapters"
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2.5 xl:flex"
    >
      {CHAPTERS.map((ch) => {
        const active = activeId === ch.id;
        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => jumpTo(ch.id)}
            aria-label={`Jump to ${ch.label}`}
            className="group flex items-center gap-2.5 py-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA9E24] rounded"
          >
            <span
              className={`font-mono text-[10px] tracking-wider transition-all duration-200 ${
                active
                  ? 'translate-x-0 text-[#EA9E24] opacity-100 font-semibold'
                  : 'translate-x-1 text-slate-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
              }`}
            >
              {ch.num} · {ch.label}
            </span>
            <span
              className={`block h-px transition-all duration-300 ${
                active
                  ? 'w-6 bg-[#EA9E24]'
                  : 'w-2.5 bg-white/30 group-hover:w-4 group-hover:bg-teal-300'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};

export interface LightboxMedia {
  src: string;
  title: string;
  subtitle?: string;
}

interface MediaLightboxProps {
  media: LightboxMedia | null;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ media, onClose }) => {
  useEffect(() => {
    if (!media) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [media, onClose]);

  if (!media) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={media.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040709]/92 p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl overflow-hidden rounded-[26px] border border-white/15 bg-[#0D151A] shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image preview"
          className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#080D10]/85 text-white hover:bg-white hover:text-slate-950 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[76vh] overflow-hidden bg-black">
          <img
            src={media.src}
            alt={media.title}
            referrerPolicy="no-referrer"
            className="h-full max-h-[76vh] w-full object-contain"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{media.title}</h3>
            {media.subtitle && <p className="text-xs text-slate-400">{media.subtitle}</p>}
          </div>
          <span className="text-xs text-slate-500">ESC to close</span>
        </div>
      </div>
    </div>
  );
};

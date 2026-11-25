import React, { useEffect, useState } from 'react';
import { HOSPITAL_IMAGES } from '../data/hospitalData';

export const PagePreloader: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(false);
      return;
    }

    const fadeTimer = window.setTimeout(() => setFading(true), 520);
    const hideTimer = window.setTimeout(() => setVisible(false), 900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080D10] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
          <img
            src={HOSPITAL_IMAGES.logoMark}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain"
          />
        </div>
        <p className="font-display text-sm font-medium tracking-widest text-teal-100 uppercase">
          Hodan Hospital
        </p>
        <div className="h-0.5 w-36 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[scaleX_0.55s_ease-out] bg-gradient-to-r from-[#EA9E24] via-teal-400 to-cyan-300" />
        </div>
      </div>
    </div>
  );
};

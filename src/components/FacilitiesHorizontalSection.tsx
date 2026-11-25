import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Expand, Layers } from 'lucide-react';
import { FACILITIES } from '../data/hospitalData';
import { LightboxMedia } from './AmbientEffects';

interface FacilitiesHorizontalSectionProps {
  onOpenLightbox: (media: LightboxMedia) => void;
}

export const FacilitiesHorizontalSection: React.FC<FacilitiesHorizontalSectionProps> = ({
  onOpenLightbox,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFloorSpecs, setShowFloorSpecs] = useState(true);
  const dragStartX = useRef<number | null>(null);

  const count = FACILITIES.length;
  const activeFac = FACILITIES[activeIndex] ?? FACILITIES[0];

  const stepCarousel = (dir: -1 | 1) => {
    setActiveIndex((prev) => (prev + dir + count) % count);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) > 45) {
      stepCarousel(dx < 0 ? 1 : -1);
    }
  };

  return (
    <section
      id="facilities"
      className="relative overflow-hidden border-t border-white/10 bg-[#080D10] py-24 text-white sm:py-32"
    >
      {/* Subtle architectural Teal & Gold top halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.25) 0%, rgba(234, 158, 36, 0.14) 55%, transparent 78%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Header + Spatial Floor Controls */}
        <div className="gsap-reveal flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#EA9E24] uppercase">
              03 · Virtual Wing Showroom · 3D Facilities Orbit
            </p>
            <h2 className="mt-2 font-display text-balance text-[clamp(2rem,3.8vw,3.4rem)] font-light leading-[1.08] tracking-tight text-white">
              Inside Hodan Hospital.{' '}
              <span className="font-semibold text-teal-300">Designed for Recovery.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFloorSpecs((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                showFloorSpecs
                  ? 'border-[#EA9E24]/60 bg-[#EA9E24]/15 text-[#EA9E24]'
                  : 'border-white/15 bg-[#0F181D] text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{showFloorSpecs ? 'Wing Telemetry On' : 'Wing Telemetry Off'}</span>
            </button>

            <span className="font-mono text-xs text-slate-400 tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>

            <button
              type="button"
              aria-label="Previous facility"
              onClick={() => stepCarousel(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0F181D] text-white transition-colors hover:border-[#EA9E24] hover:text-[#EA9E24] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next facility"
              onClick={() => stepCarousel(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0F181D] text-white transition-colors hover:border-[#EA9E24] hover:text-[#EA9E24] cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Architectural Floor Selector Tabs */}
        <div className="mt-7 flex flex-wrap items-center gap-2">
          {FACILITIES.map((fac, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'border-[#EA9E24] bg-[#EA9E24] text-slate-950 font-semibold shadow-sm'
                    : 'border-white/12 bg-[#0D161B] text-slate-300 hover:border-teal-400/50 hover:text-white'
                }`}
              >
                <span className="font-mono opacity-75 mr-1.5">{fac.levelBadge}</span>
                <span>{fac.title}</span>
              </button>
            );
          })}
        </div>

        {/* MotionSites "Loops Virtual Store" 3D Cylindrical Spatial Orbit Stage */}
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="relative mt-8 h-[430px] w-full select-none cursor-grab active:cursor-grabbing sm:h-[490px]"
          style={{ perspective: '1400px' }}
        >
          {/* Illuminated Showroom Floor Disc */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 left-1/2 h-24 w-[82%] max-w-[820px] -translate-x-1/2 rounded-full opacity-55 blur-xl"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.32) 0%, rgba(234, 158, 36, 0.14) 45%, transparent 74%)',
            }}
          />

          <div
            className="relative flex h-full w-full items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {FACILITIES.map((fac, idx) => {
              let offset = idx - activeIndex;
              if (offset > count / 2) offset -= count;
              if (offset < -count / 2) offset += count;

              const absOff = Math.abs(offset);
              const isCenter = offset === 0;
              const hidden = absOff > 2;

              const translateX = offset * 310;
              const translateZ = isCenter ? 80 : -absOff * 168;
              const rotateY = -offset * 25;
              const scale = isCenter ? 1 : Math.max(0.72, 1 - absOff * 0.14);
              const opacity = hidden ? 0 : isCenter ? 1 : Math.max(0.38, 0.85 - absOff * 0.22);

              return (
                <div
                  key={fac.id}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(idx);
                  }}
                  role={!isCenter ? 'button' : undefined}
                  tabIndex={!isCenter ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (!isCenter && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setActiveIndex(idx);
                    }
                  }}
                  aria-label={!isCenter ? `Focus ${fac.title}` : undefined}
                  className={`absolute w-[84vw] max-w-[460px] overflow-hidden rounded-[26px] border transition-all duration-500 ease-out sm:w-[440px] lg:w-[550px] ${
                    isCenter
                      ? 'z-20 border-[#EA9E24]/60 bg-[#0F191E] shadow-[0_32px_90px_-15px_rgba(20,184,166,0.34)]'
                      : 'z-10 border-white/15 bg-[#0B1317] cursor-pointer hover:border-teal-400/50'
                  }`}
                  style={{
                    opacity,
                    pointerEvents: hidden ? 'none' : 'auto',
                    transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  }}
                >
                  <div className="relative h-64 overflow-hidden bg-slate-950 sm:h-72">
                    <img
                      src={fac.image}
                      alt={fac.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F191E] via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 rounded-md bg-[#080D10]/85 px-2.5 py-1 font-mono text-xs font-semibold text-white">
                      {fac.levelBadge} · {String(idx + 1).padStart(2, '0')}
                    </span>

                    {isCenter && showFloorSpecs && (
                      <div className="pointer-events-none absolute top-4 right-4 rounded-md bg-[#080D10]/85 px-2.5 py-1 font-mono text-[11px] text-teal-200">
                        {fac.zone}
                      </div>
                    )}

                    {isCenter && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLightbox({
                            src: fac.image,
                            title: fac.title,
                            subtitle: `${fac.zone} — ${fac.caption}`,
                          });
                        }}
                        aria-label={`Inspect ${fac.title} full screen`}
                        className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#080D10]/85 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-slate-950 cursor-pointer"
                      >
                        <Expand className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-medium text-[#EA9E24]">{fac.zone}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                      {fac.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
                      {fac.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Facility Detailed Readout Panel */}
        <div className="mt-6 grid grid-cols-1 items-center gap-6 rounded-[24px] border border-white/12 bg-[#0D161B] p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-wider text-teal-300 uppercase">
              {activeFac.zone}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-white">
              {activeFac.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{activeFac.description}</p>
          </div>

          <ul className="space-y-2.5 border-t border-white/10 pt-4 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            {activeFac.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-xs text-slate-200 sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#EA9E24]" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

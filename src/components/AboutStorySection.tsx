import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Expand, MoveHorizontal } from 'lucide-react';
import { HOSPITAL_IMAGES, HOSPITAL_OPERATIONAL_FACTS } from '../data/hospitalData';
import { LightboxMedia } from './AmbientEffects';

gsap.registerPlugin(ScrollTrigger);

interface AboutStorySectionProps {
  onBookClick: () => void;
  onOpenLightbox: (media: LightboxMedia) => void;
}

export const AboutStorySection: React.FC<AboutStorySectionProps> = ({
  onBookClick,
  onOpenLightbox,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gateStageRef = useRef<HTMLDivElement | null>(null);
  const leftGateRef = useRef<HTMLDivElement | null>(null);
  const rightGateRef = useRef<HTMLDivElement | null>(null);

  const [stageMode, setStageMode] = useState<'compare' | 'atrium' | 'surgery'>('compare');
  const [sliderPos, setSliderPos] = useState(54);
  const draggingRef = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current || !gateStageRef.current) return;

    const ctx = gsap.context(() => {
      if (leftGateRef.current && rightGateRef.current) {
        gsap.fromTo(
          leftGateRef.current,
          { xPercent: 0 },
          {
            xPercent: -96,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: gateStageRef.current,
              start: 'top 82%',
              end: 'center 36%',
              scrub: 1,
            },
          }
        );

        gsap.fromTo(
          rightGateRef.current,
          { xPercent: 0 },
          {
            xPercent: 96,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: gateStageRef.current,
              start: 'top 82%',
              end: 'center 36%',
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const updateSliderFromPointer = (clientX: number, rect: DOMRect) => {
    const pct = ((clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    setSliderPos(Math.min(92, Math.max(8, pct)));
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 bg-[#080D10] py-24 text-white sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[520px] w-[960px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(234, 158, 36, 0.18) 0%, rgba(31, 110, 122, 0.22) 48%, transparent 74%)',
        }}
      />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Editorial Intro Row */}
        <div className="gsap-reveal grid grid-cols-1 items-end gap-8 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#EA9E24] uppercase">
              01 · Campus Architecture · Hodan District
            </p>
            <h2 className="mt-4 font-display text-balance text-[clamp(2.3rem,5vw,4.3rem)] font-light leading-[1.04] tracking-tight text-white">
              Built for Mogadishu.{' '}
              <span className="font-semibold text-teal-300">Engineered for Life.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm leading-relaxed text-slate-300">
              Hodan Hospital unites modern surgical theaters, continuous emergency stabilization,
              radiology, clinical laboratory diagnostics, and restorative inpatient care inside a
              single coordinated campus.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/12 bg-[#0E161B] p-1"
            role="tablist"
            aria-label="Campus inspection mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={stageMode === 'compare'}
              onClick={() => setStageMode('compare')}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                stageMode === 'compare'
                  ? 'bg-[#EA9E24] text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Campus vs Architectural Compare
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={stageMode === 'atrium'}
              onClick={() => setStageMode('atrium')}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                stageMode === 'atrium'
                  ? 'bg-[#EA9E24] text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Main Reception Atrium
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={stageMode === 'surgery'}
              onClick={() => setStageMode('surgery')}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                stageMode === 'surgery'
                  ? 'bg-[#EA9E24] text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sterile Surgical Suite
            </button>
          </div>

          <span className="font-mono text-xs text-teal-300/85">
            {stageMode === 'compare'
              ? 'Drag the gold divider across the building to compare'
              : stageMode === 'atrium'
                ? 'Ground Floor Admissions & Patient Concierge'
                : 'Level 2 Laminar-Flow Operating Room'}
          </span>
        </div>

        {/* MotionSites "Forge Gate" Split-Curtain Portal + Interactive Architectural Comparison Slider */}
        <div
          ref={gateStageRef}
          onPointerDown={(e) => {
            if (stageMode !== 'compare') return;
            draggingRef.current = true;
            updateSliderFromPointer(e.clientX, e.currentTarget.getBoundingClientRect());
          }}
          onPointerMove={(e) => {
            if (stageMode !== 'compare' || !draggingRef.current) return;
            updateSliderFromPointer(e.clientX, e.currentTarget.getBoundingClientRect());
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
          onPointerLeave={() => {
            draggingRef.current = false;
          }}
          className={`relative h-[430px] w-full overflow-hidden rounded-[30px] border border-white/15 bg-[#0C1419] shadow-2xl sm:h-[520px] lg:h-[580px] ${
            stageMode === 'compare' ? 'cursor-ew-resize select-none' : ''
          }`}
        >
          {stageMode === 'compare' ? (
            <>
              {/* Base Layer: Architectural Elevation Render */}
              <img
                src={HOSPITAL_IMAGES.exteriorRender}
                alt="Hodan Hospital architectural elevation design"
                referrerPolicy="no-referrer"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Top Clipped Layer: Live Hospital Campus Photo */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={HOSPITAL_IMAGES.exteriorBuilding}
                  alt="Hodan Hospital real clinical campus in Hodan District"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Corner Labels */}
              <span className="pointer-events-none absolute top-5 left-5 z-10 rounded-md bg-[#080D10]/85 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                LIVE CAMPUS
              </span>
              <span className="pointer-events-none absolute top-5 right-28 z-10 rounded-md bg-[#080D10]/85 px-2.5 py-1 font-mono text-[11px] font-semibold text-teal-200">
                ARCHITECTURAL FACADE
              </span>

              {/* Interactive Draggable Gold Divider Handle */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 z-15 w-0.5 bg-[#EA9E24] shadow-[0_0_20px_rgba(234,158,36,0.9)]"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#EA9E24] text-slate-950 shadow-2xl">
                  <MoveHorizontal className="h-5 w-5" />
                </div>
              </div>
            </>
          ) : (
            <img
              src={
                stageMode === 'atrium'
                  ? HOSPITAL_IMAGES.receptionLobby
                  : HOSPITAL_IMAGES.operatingRoom
              }
              alt={
                stageMode === 'atrium'
                  ? 'Hodan Hospital ground floor reception atrium'
                  : 'Hodan Hospital sterile operating theater'
              }
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D10] via-[#080D10]/20 to-transparent" />

          {/* Left Architectural Split Gate */}
          <div
            ref={leftGateRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-1/2 flex-col justify-between border-r border-[#EA9E24]/50 bg-[#0D161B] p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-lg bg-white p-1">
                <img
                  src={HOSPITAL_IMAGES.logoMark}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-mono text-xs tracking-widest text-[#EA9E24] uppercase">
                West Wing Gate
              </span>
            </div>
            <p className="text-right font-display text-4xl font-bold tracking-tighter text-white/15 sm:text-6xl">
              HODAN
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-400/40 to-[#EA9E24]/70" />
          </div>

          {/* Right Architectural Split Gate */}
          <div
            ref={rightGateRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-1/2 flex-col justify-between border-l border-[#EA9E24]/50 bg-[#0D161B] p-8 shadow-2xl"
          >
            <div className="text-right font-mono text-xs tracking-widest text-teal-300 uppercase">
              24/7 Care Threshold
            </div>
            <p className="font-display text-4xl font-bold tracking-tighter text-white/15 sm:text-6xl">
              HOSPITAL
            </p>
            <div className="h-px w-full bg-gradient-to-l from-transparent via-teal-400/40 to-[#EA9E24]/70" />
          </div>

          {/* Inspect Fullscreen Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox({
                src:
                  stageMode === 'atrium'
                    ? HOSPITAL_IMAGES.receptionLobby
                    : stageMode === 'surgery'
                      ? HOSPITAL_IMAGES.operatingRoom
                      : HOSPITAL_IMAGES.exteriorBuilding,
                title:
                  stageMode === 'atrium'
                    ? 'Hodan Hospital Reception Atrium'
                    : stageMode === 'surgery'
                      ? 'Hodan Hospital Sterile Surgical Suite'
                      : 'Hodan Hospital Main Clinical Campus',
                subtitle: 'Abdikassim Road · Hodan District, Mogadishu',
              });
            }}
            aria-label="Inspect full-screen view"
            className="absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#080D10]/85 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white hover:text-slate-950 cursor-pointer"
          >
            <Expand className="h-3.5 w-3.5" />
            <span>Inspect</span>
          </button>

          {/* Bottom Revealed Caption + CTA */}
          <div className="absolute inset-x-0 bottom-0 z-30 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-10">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#EA9E24] uppercase">
                Hodan District · Mogadishu
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                {stageMode === 'atrium'
                  ? 'Ground Floor Admissions & Triage Hall'
                  : stageMode === 'surgery'
                    ? 'Sterile Surgical & Laparoscopy Theater'
                    : 'Multi-Specialty Clinical Campus'}
              </h3>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookClick();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#EA9E24] px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Schedule Visit</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Verified Operational Snapshot */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 lg:grid-cols-4">
          {HOSPITAL_OPERATIONAL_FACTS.map((fact) => (
            <div key={fact.label}>
              <p className="text-xs font-medium text-teal-300/85">{fact.label}</p>
              <p className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-white tabular-nums sm:text-4xl">
                {fact.value}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{fact.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Pause, Play } from 'lucide-react';
import { SERVICE_PILLARS } from '../data/hospitalData';
import { LightboxMedia } from './AmbientEffects';
import { CardTunnel3DCanvas } from './CardTunnel3DCanvas';

gsap.registerPlugin(ScrollTrigger);

interface ServicesTunnelSectionProps {
  onOpenLightbox: (media: LightboxMedia) => void;
}

export const ServicesTunnelSection: React.FC<ServicesTunnelSectionProps> = ({
  onOpenLightbox,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const tunnelWrapRef = useRef<HTMLDivElement | null>(null);
  const [activePillar, setActivePillar] = useState(0);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [autoCruise, setAutoCruise] = useState(true);
  const [hoveredTitle, setHoveredTitle] = useState('Click any 3D clinical frame to inspect');

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current || !tunnelWrapRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: tunnelWrapRef.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.7,
      onUpdate: (self) => {
        setScrollDepth(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 bg-[#070C0F] py-24 text-white sm:py-32"
    >
      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="gsap-reveal flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#EA9E24] uppercase">
              04 · WebGL 3D Card Tunnel · Why Choose Hodan Hospital
            </p>
            <h2 className="mt-3 font-display text-balance text-[clamp(2.1rem,4.2vw,3.8rem)] font-light leading-[1.06] tracking-tight text-white">
              Clinical precision in{' '}
              <span className="font-semibold text-teal-300">every corridor</span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Navigate a live Three.js 3D architectural gallery spiraling through Hodan Hospital’s
            operating rooms, diagnostic labs, maternal suites, and emergency response units.
          </p>
        </div>

        {/* Full-Stage Real WebGL 3D Photographic Card Tunnel (MotionSites Card Tunnel) */}
        <div
          ref={tunnelWrapRef}
          className="relative mt-10 h-[480px] w-full overflow-hidden rounded-[30px] border border-white/15 bg-[#05090C] shadow-2xl sm:h-[580px]"
        >
          <CardTunnel3DCanvas
            scrollProgress={scrollDepth}
            autoCruise={autoCruise}
            onInspectCard={onOpenLightbox}
            onActiveTitleChange={setHoveredTitle}
          />

          {/* Center Vanishing Horizon Title Overlay */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <span className="font-mono text-[11px] tracking-[0.26em] text-[#EA9E24] uppercase">
              Interactive 3D Tunnel
            </span>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-white/90 sm:text-4xl">
              HODAN CARE CORRIDOR
            </p>
          </div>

          {/* Bottom Clean Telemetry & Auto-Cruise HUD */}
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3 sm:inset-x-6 sm:bottom-6">
            <div className="rounded-lg border border-white/15 bg-[#080D10]/85 px-3.5 py-1.5 text-xs font-medium text-teal-100">
              {hoveredTitle}
            </div>

            <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/15 bg-[#080D10]/90 px-3 py-1.5 text-xs">
              <button
                type="button"
                onClick={() => setAutoCruise((c) => !c)}
                className="inline-flex items-center gap-1.5 font-medium text-white hover:text-[#EA9E24] cursor-pointer whitespace-nowrap shrink-0"
              >
                {autoCruise ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{autoCruise ? 'Pause Drift' : 'Auto Cruise'}</span>
              </button>
              <span className="text-white/20" aria-hidden="true">
                |
              </span>
              <span className="font-mono text-[11px] text-[#EA9E24] tabular-nums">
                {Math.round(scrollDepth * 100)}% DEPTH
              </span>
            </div>
          </div>
        </div>

        {/* Spatial Interactive Pillar Rail */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
          {SERVICE_PILLARS.map((pillar, idx) => {
            const isSelected = activePillar === idx;
            return (
              <button
                key={pillar.number}
                type="button"
                onClick={() => setActivePillar(idx)}
                onMouseEnter={() => setActivePillar(idx)}
                className={`group text-left rounded-[24px] border p-6 transition-all duration-500 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'lg:col-span-5 border-[#EA9E24]/55 bg-[#112026] shadow-[0_24px_60px_-15px_rgba(31,110,122,0.38)]'
                    : 'lg:col-span-2 border-white/10 bg-[#0D161A]/85 hover:border-teal-400/35'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isSelected ? 'text-[#EA9E24]' : 'text-teal-300'
                      }`}
                    >
                      {pillar.number}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-medium text-teal-200">{pillar.detail}</span>
                    )}
                  </div>

                  <h3
                    className={`mt-4 font-display font-semibold leading-snug text-white transition-all ${
                      isSelected ? 'text-2xl' : 'text-base'
                    }`}
                  >
                    {pillar.title}
                  </h3>
                </div>

                <p
                  className={`mt-4 text-sm leading-relaxed transition-opacity duration-300 ${
                    isSelected ? 'text-slate-200 opacity-100' : 'text-slate-400 lg:line-clamp-3'
                  }`}
                >
                  {pillar.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

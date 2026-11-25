import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { HeartCanvas3D, HeartViewMode } from './HeartCanvas3D';
import { LiveEcgWaveform } from './LiveEcgWaveform';
import {
  CARDIAC_HOTSPOTS,
  HOSPITAL_CONTACT,
  HOSPITAL_IMAGES,
} from '../data/hospitalData';

interface HeroSectionProps {
  onBookDepartment: (departmentId: string) => void;
  onExploreDepartment: (departmentId: string) => void;
}

const HERO_PILLARS = [
  {
    num: '01',
    title: 'Helpline 1234',
    detail: '24/7 Emergency & Ambulance Dispatch',
    target: '#contact',
  },
  {
    num: '02',
    title: '5,000+ m² Campus',
    detail: 'Abdikassim Road, Hodan District',
    target: '#about',
  },
  {
    num: '03',
    title: '13+ Centers',
    detail: 'Cardiology, ICU, NICU & Laparoscopy',
    target: '#departments',
  },
  {
    num: '04',
    title: '3D Care Corridor',
    detail: 'Interactive Surgical & Diagnostic Tour',
    target: '#services',
  },
];

function triggerHeartbeatThump(ctx: AudioContext, isLub: boolean) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';

  if (isLub) {
    osc.frequency.setValueAtTime(68, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.11);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  } else {
    osc.frequency.setValueAtTime(84, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.085);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  }

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.16);
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookDepartment,
  onExploreDepartment,
}) => {
  const [viewMode, setViewMode] = useState<HeartViewMode>('overview');
  const [isPaused, setIsPaused] = useState(false);
  const [bpm, setBpm] = useState(72);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('mitral-valve');

  const ecgSampleRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const prevPhaseRef = useRef(0);
  const s1FiredRef = useRef(false);
  const s2FiredRef = useRef(false);

  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current && AudioCtor) {
          audioCtxRef.current = new AudioCtor();
        }
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
      } catch {
        // Ignore if browser blocks Web Audio
      }
      setSoundEnabled(true);
    } else {
      setSoundEnabled(false);
    }
  };

  const handleEcgSample = useCallback((val: number, phase: number) => {
    ecgSampleRef.current = val;

    if (phase < prevPhaseRef.current) {
      s1FiredRef.current = false;
      s2FiredRef.current = false;
    }
    prevPhaseRef.current = phase;

    if (soundEnabledRef.current && audioCtxRef.current && audioCtxRef.current.state === 'running') {
      if (!s1FiredRef.current && phase >= 0.22) {
        s1FiredRef.current = true;
        triggerHeartbeatThump(audioCtxRef.current, true);
      }
      if (!s2FiredRef.current && phase >= 0.4) {
        s2FiredRef.current = true;
        triggerHeartbeatThump(audioCtxRef.current, false);
      }
    }
  }, []);

  const jumpTo = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeHotspot =
    CARDIAC_HOTSPOTS.find((h) => h.id === selectedHotspotId) ?? CARDIAC_HOTSPOTS[1];

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#080D10] pt-20 pb-8 text-white sm:pt-24 sm:pb-10"
    >
      {/* Atmospheric Deep Architectural Twilight Backdrop (Primary Reference Depth without Hard Cutouts) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={HOSPITAL_IMAGES.exteriorBuilding}
          alt=""
          className="h-full w-full scale-105 object-cover object-center opacity-[0.16] blur-[2px] saturate-75"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 88% 72% at 50% 44%, rgba(31, 110, 122, 0.34) 0%, rgba(15, 36, 44, 0.72) 48%, rgba(8, 13, 16, 0.96) 82%, #080D10 100%)',
          }}
        />
        <div
          className="absolute -top-24 left-[18%] h-[460px] w-[460px] rounded-full opacity-45 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(234, 158, 36, 0.24) 0%, rgba(31, 110, 122, 0.14) 55%, transparent 78%)',
          }}
        />
        <div
          className="absolute bottom-8 right-[14%] h-[460px] w-[460px] rounded-full opacity-45 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(45, 212, 191, 0.24) 0%, rgba(52, 66, 74, 0.2) 55%, transparent 78%)',
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8">
        {/* Clean Editorial Header Row */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium tracking-wide text-teal-200/85">
              Hodan Hospital · Abdikassim Road, Mogadishu · 24/7 Helpline {HOSPITAL_CONTACT.shortCode}
            </p>
            <h1 className="mt-2 font-display text-balance text-[clamp(2.25rem,4vw,3.6rem)] font-light leading-[1.06] tracking-tight text-white">
              Precision cardiac &amp;{' '}
              <span className="font-semibold text-teal-300">multispecialty care.</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onBookDepartment('cardiology')}
              className="inline-flex items-center gap-2 rounded-full bg-[#EA9E24] px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => jumpTo('#services')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:border-teal-300/60 hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore 3D Tunnel</span>
            </button>
          </div>
        </div>

        {/* Primary Reference Glassmorphic Stage with Central 3D Beating Anatomical Heart */}
        <div className="hero-glass-panel relative rounded-[28px] p-5 sm:p-7 lg:px-10 lg:py-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-6">
            {/* LEFT COLUMN: Primary Reference "Heart health overview" Card */}
            <div className="relative z-10 flex flex-col justify-between gap-5 lg:col-span-4">
              <div>
                <h2 className="font-display text-balance text-[clamp(1.85rem,3vw,2.65rem)] font-light leading-[1.08] tracking-tight text-white">
                  Heart health overview
                </h2>
              </div>

              <div className="hero-subcard rounded-[20px] p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-medium leading-snug text-white">
                      Cardiac Center
                      <br />
                      of Excellence
                    </h3>
                    <p className="mt-1 text-xs text-teal-100/75">
                      Abdikassim Rd · 24/7 Care
                    </p>
                  </div>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#EA9E24]/45 bg-white/95 p-1.5">
                    <img
                      src={HOSPITAL_IMAGES.logoMark}
                      alt="Hodan Hospital emblem"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Segmented 3D Heart Inspection Tabs */}
                <div
                  className="mb-4 inline-flex items-center gap-1 rounded-xl bg-white/10 p-1"
                  role="tablist"
                  aria-label="Heart inspection modes"
                >
                  {(
                    [
                      { id: 'overview', label: 'Overview' },
                      { id: 'coronary', label: 'Coronary' },
                      { id: 'rhythm', label: 'Rhythm' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={viewMode === tab.id}
                      onClick={() => setViewMode(tab.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        viewMode === tab.id
                          ? 'bg-[#EA9E24] text-slate-950 shadow-sm'
                          : 'text-teal-100/80 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <p className="border-t border-white/15 pt-3.5 text-xs leading-relaxed text-slate-200/85">
                  Equipped for ECG/EKG, echocardiography, cardiac CT/MRI, stress testing, and
                  continuous critical-care telemetry in Hodan District.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onBookDepartment('cardiology')}
                    className="inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#EA9E24] hover:text-slate-950 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Book cardiac visit</span>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER STAGE: Dominant 3D Anatomically Accurate Beating Human Heart */}
            <div className="relative z-20 flex flex-col items-center lg:col-span-4">
              <div className="relative h-[360px] w-full sm:h-[430px] lg:-my-14 lg:h-[520px]">
                <HeartCanvas3D
                  viewMode={viewMode}
                  isPaused={isPaused}
                  bpm={bpm}
                  selectedHotspotId={selectedHotspotId}
                  onEcgSample={handleEcgSample}
                />
              </div>

              {/* Compact Rhythm & Audio Controls */}
              <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-[#0C1418]/92 px-3 py-1.5 text-xs text-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-white transition-colors hover:bg-white/10 cursor-pointer whitespace-nowrap shrink-0"
                  aria-label={isPaused ? 'Resume heartbeat animation' : 'Pause heartbeat animation'}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <span className="text-white/20" aria-hidden="true">
                  |
                </span>

                <div className="flex items-center gap-1">
                  {[64, 72, 92, 116].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setBpm(rate)}
                      className={`rounded-md px-2 py-1 font-mono text-[11px] tabular-nums transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        bpm === rate
                          ? 'bg-[#1F6E7A] text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {rate} BPM
                    </button>
                  ))}
                </div>

                <span className="text-white/20" aria-hidden="true">
                  |
                </span>

                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={soundEnabled ? 'Mute Lub-Dub audio' : 'Play Lub-Dub heartbeat audio'}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    soundEnabled
                      ? 'bg-[#EA9E24] text-slate-950'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  <span>{soundEnabled ? 'Audio On' : 'Audio'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('overview');
                    setSelectedHotspotId('mitral-valve');
                    setBpm(72);
                    setIsPaused(false);
                  }}
                  aria-label="Reset 3D heart view"
                  className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Synchronized ECG Waveform + Amber-Slate Valve Callout */}
            <div className="relative z-10 flex flex-col justify-between gap-5 lg:col-span-4">
              <div className="pt-1 lg:pt-3">
                <LiveEcgWaveform ecgSampleRef={ecgSampleRef} isPaused={isPaused} bpm={bpm} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-teal-200/80">
                  Interactive cardiac structures
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CARDIAC_HOTSPOTS.map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => setSelectedHotspotId(spot.id)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedHotspotId === spot.id
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'bg-white/10 text-teal-100 hover:bg-white/20'
                      }`}
                    >
                      {spot.label.split(' & ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="valve-callout-glass relative rounded-[18px] p-5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-7 -left-10 hidden h-px w-10 bg-gradient-to-r from-[#EA9E24]/80 to-white/10 lg:block"
                />

                <div className="mb-1.5 flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                  />
                  <span className="text-xs font-medium text-amber-100/90">
                    {activeHotspot.anatomicalName}
                  </span>
                </div>

                <h3 className="font-display text-lg font-medium leading-snug text-white">
                  {activeHotspot.label}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-amber-50/85">
                  {activeHotspot.summary}
                </p>

                <button
                  type="button"
                  onClick={() => onExploreDepartment(activeHotspot.departmentId)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white underline underline-offset-4 transition-colors hover:text-[#EA9E24] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Explore department</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean 4-Column Quick Access Strip Below Split */}
        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 lg:grid-cols-4">
          {HERO_PILLARS.map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => jumpTo(item.target)}
              className="group flex items-baseline gap-3 text-left transition-colors cursor-pointer"
            >
              <span className="font-mono text-sm font-medium text-[#EA9E24] tabular-nums">
                {item.num}
              </span>
              <div>
                <p className="text-sm font-semibold text-white transition-colors group-hover:text-teal-300">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{item.detail}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

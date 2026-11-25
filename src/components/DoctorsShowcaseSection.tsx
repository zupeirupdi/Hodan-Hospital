import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, Expand, Repeat, ShieldCheck } from 'lucide-react';
import {
  CLINICAL_TEAMS,
  HOSPITAL_IMAGES,
  LEADERSHIP_TEAM,
} from '../data/hospitalData';
import { LightboxMedia } from './AmbientEffects';

gsap.registerPlugin(ScrollTrigger);

interface DoctorsShowcaseSectionProps {
  onBookDepartment: (deptId: string) => void;
  onOpenLightbox: (media: LightboxMedia) => void;
}

const TEAM_DEPT_MAP = ['cardiology', 'surgery', 'maternity', 'emergency'];

export const DoctorsShowcaseSection: React.FC<DoctorsShowcaseSectionProps> = ({
  onBookDepartment,
  onOpenLightbox,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [lensPos, setLensPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // 3D Holographic Family Membership Card State
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: -6, glareX: 50, glareY: 50 });

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current || !portraitRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        portraitRef.current,
        { clipPath: 'inset(0% 0% 18% 0% round 26px)', y: 30 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 26px)',
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: portraitRef.current,
            start: 'top 85%',
            end: 'center 48%',
            scrub: 0.9,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="doctors"
      ref={sectionRef}
      className="relative border-t border-white/10 bg-[#080D10] py-24 text-white sm:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="gsap-reveal flex flex-col justify-between gap-6 pb-12 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-teal-300 uppercase">
              05 · Clinical Leadership &amp; Medical Teams
            </p>
            <h2 className="mt-3 font-display text-balance text-[clamp(2.2rem,4.4vw,3.9rem)] font-light leading-[1.04] tracking-tight text-white">
              Dedicated physicians.{' '}
              <span className="font-semibold text-[#EA9E24]">Collaborative care.</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onBookDepartment(TEAM_DEPT_MAP[selectedTeam] ?? 'cardiology')}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/15 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Request Specialist Consultation</span>
            <ArrowUpRight className="h-4 w-4 text-[#EA9E24]" />
          </button>
        </div>

        {/* Verified Hospital Executive Leadership Strip */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {LEADERSHIP_TEAM.map((leader) => (
            <div
              key={leader.name}
              className="flex flex-col justify-between rounded-2xl border border-white/12 bg-[#0D161B] p-6 transition-colors hover:border-[#EA9E24]/45"
            >
              <div>
                <span className="font-mono text-[11px] font-semibold tracking-wider text-[#EA9E24] uppercase">
                  {leader.role}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-white">
                  {leader.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{leader.specialty}</p>
              </div>
              <button
                type="button"
                onClick={() => onBookDepartment(leader.departmentId)}
                className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-teal-300 hover:text-[#EA9E24] cursor-pointer"
              >
                <span>Schedule consultation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Medical Team 4K Portrait + Clinical Units */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div
              ref={portraitRef}
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setLensPos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  visible: true,
                });
              }}
              onPointerLeave={() => setLensPos((p) => ({ ...p, visible: false }))}
              onClick={() =>
                onOpenLightbox({
                  src: HOSPITAL_IMAGES.medicalTeam,
                  title: 'Hodan Hospital Medical & Clinical Staff',
                  subtitle: 'Physicians, surgeons, midwives, and nursing leadership',
                })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenLightbox({
                    src: HOSPITAL_IMAGES.medicalTeam,
                    title: 'Hodan Hospital Medical & Clinical Staff',
                    subtitle: 'Physicians, surgeons, midwives, and nursing leadership',
                  });
                }
              }}
              aria-label="Inspect Hodan Hospital medical team photograph"
              className="group relative h-full min-h-[360px] overflow-hidden rounded-[26px] border border-white/15 bg-[#0F191E] cursor-pointer"
            >
              <img
                src={HOSPITAL_IMAGES.medicalTeam}
                alt="Hodan Hospital physicians, nurses, and medical leadership"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080D10] via-[#080D10]/20 to-transparent" />

              {lensPos.visible && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-20 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-[#EA9E24]/70 bg-[#080D10]/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xl lg:flex"
                  style={{ left: lensPos.x, top: lensPos.y }}
                >
                  <Expand className="h-3.5 w-3.5 text-[#EA9E24]" />
                  <span>Inspect 4K Team</span>
                </div>
              )}

              <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#080D10]/85 px-3 py-1.5 text-[11px] font-medium text-white lg:hidden">
                <Expand className="h-3.5 w-3.5" />
                <span>Inspect</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-medium tracking-wider text-[#EA9E24] uppercase">
                  Hodan Hospital Clinical Directorate
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                  Multi-specialty doctors, surgeons, midwives &amp; critical care nurses
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 lg:col-span-5">
            {CLINICAL_TEAMS.map((team, idx) => {
              const active = selectedTeam === idx;
              const targetDept = TEAM_DEPT_MAP[idx] ?? 'cardiology';
              return (
                <div
                  key={team.unit}
                  onClick={() => setSelectedTeam(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedTeam(idx);
                    }
                  }}
                  className={`rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                    active
                      ? 'border-[#EA9E24]/55 bg-[#112128] shadow-lg'
                      : 'border-white/10 bg-[#0C1519] hover:border-teal-400/35'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-[#EA9E24]">UNIT 0{idx + 1}</span>
                    <span className="text-[11px] text-teal-200/80">{team.coverage}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-white">
                    {team.unit}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{team.focus}</p>
                  {active && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookDepartment(targetDept);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA9E24] hover:text-amber-300 cursor-pointer"
                    >
                      <span>Schedule with this unit</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MotionSites Interactive 3D Flippable Metallic Hodan Family Membership Card */}
        <div className="mt-16 grid grid-cols-1 items-center gap-10 rounded-[30px] border border-white/12 bg-[#0C151A] p-6 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#EA9E24] uppercase">
              Hodan Family Membership Card
            </p>
            <h3 className="mt-3 font-display text-3xl font-light tracking-tight text-white sm:text-4xl">
              Priority clinical care{' '}
              <span className="font-semibold text-teal-300">for your entire household.</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Hodan Hospital’s Family Membership Card connects members directly with our paperless
              EHR portal—delivering priority specialist registration, comprehensive annual preventive
              screenings, and preferred diagnostic and treatment rates.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCardFlipped((f) => !f)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#EA9E24] hover:text-[#EA9E24] cursor-pointer"
              >
                <Repeat className="h-4 w-4" />
                <span>{cardFlipped ? 'Show Front of Card' : 'Flip Card for Benefits'}</span>
              </button>

              <button
                type="button"
                onClick={() => onBookDepartment('internal-med')}
                className="inline-flex items-center gap-2 rounded-full bg-[#EA9E24] px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer"
              >
                <span>Inquire at Reception</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6">
            <div
              style={{ perspective: '1200px' }}
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                setCardTilt({
                  rx: -ny * 11,
                  ry: nx * 14,
                  glareX: 50 + nx * 35,
                  glareY: 50 + ny * 35,
                });
              }}
              onPointerLeave={() =>
                setCardTilt({ rx: 0, ry: -6, glareX: 50, glareY: 50 })
              }
              onClick={() => setCardFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCardFlipped((f) => !f);
                }
              }}
              aria-label="Interactive 3D Hodan Family Membership Card — click to flip"
              className="relative h-56 w-full max-w-[410px] cursor-pointer select-none sm:h-64"
            >
              <div
                className="relative h-full w-full transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${cardTilt.rx}deg) rotateY(${
                    cardTilt.ry + (cardFlipped ? 180 : 0)
                  }deg)`,
                }}
              >
                {/* CARD FRONT */}
                <div
                  className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[22px] border border-[#EA9E24]/50 p-6 shadow-[0_28px_70px_-15px_rgba(31,110,122,0.5)]"
                  style={{
                    backfaceVisibility: 'hidden',
                    background:
                      'linear-gradient(135deg, #162830 0%, #0D191E 52%, #1F4E56 100%)',
                  }}
                >
                  {/* Specular Metallic Glare Sweep */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at ${cardTilt.glareX}% ${cardTilt.glareY}%, rgba(234, 158, 36, 0.25), transparent 55%)`,
                    }}
                  />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-white p-1">
                        <img
                          src={HOSPITAL_IMAGES.logoMark}
                          alt="Hodan Hospital mark"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold tracking-wide text-white">
                          HODAN HOSPITAL
                        </p>
                        <p className="font-mono text-[10px] tracking-widest text-[#EA9E24] uppercase">
                          Family Membership
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-semibold text-teal-200">
                      HELPLINE 1234
                    </span>
                  </div>

                  <div className="relative">
                    <p className="font-mono text-[11px] tracking-[0.22em] text-slate-300 uppercase">
                      Paperless EHR Priority Access
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-white">
                      CARDIAC · FAMILY · ER
                    </p>
                  </div>

                  <div className="relative flex items-center justify-between border-t border-white/15 pt-3 text-[11px] text-slate-300">
                    <span>Abdikassim Rd · Mogadishu</span>
                    <span className="text-[#EA9E24] font-semibold">Click card to flip</span>
                  </div>
                </div>

                {/* CARD BACK */}
                <div
                  className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[22px] border border-teal-400/45 p-6 shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(145deg, #0D181E 0%, #152E35 100%)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#EA9E24]" />
                      <span className="font-display text-sm font-semibold text-white">
                        Membership Privileges
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-teal-300">hodanhospital.com</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-200">
                    <li>· Priority outpatient scheduling &amp; reception check-in</li>
                    <li>· Comprehensive preventive check-up &amp; cardiac screening rates</li>
                    <li>· Reduced fees across laboratory, imaging &amp; specialist consultations</li>
                    <li>· 24/7 Emergency Helpline 1234 &amp; pharmacy access</li>
                  </ul>

                  <p className="text-[11px] font-mono text-[#EA9E24]">
                    +252 61 167 8555 · info@hodanhospital.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

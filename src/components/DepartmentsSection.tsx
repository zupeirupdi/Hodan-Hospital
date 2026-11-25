import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Compass } from 'lucide-react';
import { CARE_PATHWAYS, DEPARTMENTS, DepartmentItem } from '../data/hospitalData';

interface DepartmentsSectionProps {
  highlightedDeptId: string | null;
  onBookDepartment: (deptId: string) => void;
}

const CATEGORIES = ['All', 'Critical & Surgical', 'Diagnostics & Support', 'Specialty & Family'] as const;

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  highlightedDeptId,
  onBookDepartment,
}) => {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('All');
  const [selectedDept, setSelectedDept] = useState<DepartmentItem>(DEPARTMENTS[0]);
  const [activePathwayId, setActivePathwayId] = useState<string>('heart');

  const visibleDepartments =
    filter === 'All' ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.category === filter);

  useEffect(() => {
    if (!highlightedDeptId) return;
    const match = DEPARTMENTS.find((d) => d.id === highlightedDeptId);
    if (match) {
      setFilter('All');
      setSelectedDept(match);
    }
  }, [highlightedDeptId]);

  const activePathway = CARE_PATHWAYS.find((p) => p.id === activePathwayId) ?? CARE_PATHWAYS[0];
  const activeIdx = visibleDepartments.findIndex((d) => d.id === selectedDept.id);
  const stackItems = visibleDepartments.slice(0, 5);

  const handleSelectPathway = (pathwayId: string, deptId: string) => {
    setActivePathwayId(pathwayId);
    setFilter('All');
    const match = DEPARTMENTS.find((d) => d.id === deptId);
    if (match) setSelectedDept(match);
  };

  return (
    <section
      id="departments"
      className="relative border-t border-[#1F2C33]/15 bg-[#F4F1EA] py-24 text-[#131E24] sm:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Header + Segmented Filter (High-Contrast Warm Alabaster Editorial Spread) */}
        <div className="gsap-reveal flex flex-col justify-between gap-6 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6E7A] uppercase">
              02 · Clinical Specialties
            </p>
            <h2 className="mt-3 font-display text-balance text-[clamp(2.1rem,4.2vw,3.7rem)] font-light leading-[1.06] tracking-tight text-[#111B20]">
              Ten centers of excellence.{' '}
              <span className="font-semibold text-[#1F6E7A]">One unified standard.</span>
            </h2>
          </div>

          <div
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#131E24]/15 bg-white/80 p-1 shadow-sm"
            role="tablist"
            aria-label="Filter medical departments"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={filter === category}
                onClick={() => {
                  setFilter(category);
                  const nextList =
                    category === 'All'
                      ? DEPARTMENTS
                      : DEPARTMENTS.filter((d) => d.category === category);
                  if (nextList[0]) setSelectedDept(nextList[0]);
                }}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === category
                    ? 'bg-[#131E24] text-white shadow-sm'
                    : 'text-[#34424A] hover:text-[#111B20]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Clinical Care Pathfinder Bar */}
        <div className="mb-12 rounded-2xl border border-[#131E24]/12 bg-white/85 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#131E24]/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#1F6E7A] uppercase">
              <Compass className="h-4 w-4 text-[#EA9E24]" />
              <span>Clinical Care Pathfinder · Select what brings you in</span>
            </div>
            <span className="text-xs text-[#465760]">{activePathway.routeNote}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {CARE_PATHWAYS.map((pathway) => {
              const selected = activePathwayId === pathway.id;
              return (
                <button
                  key={pathway.id}
                  type="button"
                  onClick={() => handleSelectPathway(pathway.id, pathway.departmentId)}
                  className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                    selected
                      ? 'border-[#1F6E7A] bg-[#1F6E7A] text-white shadow-sm'
                      : 'border-[#131E24]/15 bg-[#F8F6F1] text-[#28363E] hover:border-[#EA9E24]'
                  }`}
                >
                  {pathway.need}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Split: Kinetic Editorial Index (Left) + Floating Dark 3D Deck (Right) */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Kinetic Editorial Index */}
          <div className="divide-y divide-[#131E24]/12 border-y border-[#131E24]/15 lg:col-span-6">
            {visibleDepartments.map((dept, index) => {
              const isActive = selectedDept.id === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onMouseEnter={() => setSelectedDept(dept)}
                  onClick={() => setSelectedDept(dept)}
                  className={`group flex w-full items-center justify-between gap-4 py-4 px-3 text-left transition-all duration-300 cursor-pointer ${
                    isActive ? 'pl-5 bg-white/80' : 'hover:pl-5 hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-baseline gap-4 min-w-0">
                    <span
                      className={`font-mono text-xs tabular-nums transition-colors ${
                        isActive ? 'text-[#EA9E24] font-bold' : 'text-[#5A6C75] group-hover:text-[#1F6E7A]'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={`font-display text-lg font-semibold tracking-tight transition-colors sm:text-xl ${
                          isActive ? 'text-[#0E171B]' : 'text-[#34424A] group-hover:text-[#0E171B]'
                        }`}
                      >
                        {dept.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#54666F]">
                        {dept.category} · {dept.leadUnit}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'translate-x-0 text-[#1F6E7A] opacity-100'
                        : '-translate-x-2 text-[#5A6C75] opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: 3D Perspective Spatial Preview Stage floating dark slate over alabaster */}
          <div className="lg:sticky lg:top-24 lg:col-span-6">
            <div
              className="relative"
              style={{ perspective: '1400px' }}
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                e.currentTarget.style.setProperty('--rx', `${(-ny * 4).toFixed(2)}deg`);
                e.currentTarget.style.setProperty('--ry', `${(nx * 5 - 1.5).toFixed(2)}deg`);
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.setProperty('--rx', '0deg');
                e.currentTarget.style.setProperty('--ry', '-2deg');
              }}
            >
              <div
                aria-hidden="true"
                className="absolute -inset-x-3 -top-3 bottom-3 rounded-[28px] border border-[#1F6E7A]/20 bg-[#1F6E7A]/15 transition-transform duration-500"
                style={{
                  transform: `translateZ(-40px) rotateY(${activeIdx % 2 === 0 ? -3 : 3}deg)`,
                }}
              />

              {/* Active Dark Slate Preview Monolith */}
              <div
                className="relative overflow-hidden rounded-[26px] border border-[#34424A]/30 bg-[#0F191E] text-white shadow-[0_32px_70px_-15px_rgba(17,27,32,0.38)] transition-transform duration-300 ease-out"
                style={{
                  transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, -2deg))',
                }}
              >
                <div className="relative h-64 overflow-hidden bg-slate-950 sm:h-80">
                  {stackItems.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                        selectedDept.id === item.id
                          ? 'scale-100 opacity-100'
                          : 'scale-105 opacity-0 pointer-events-none'
                      }`}
                    />
                  ))}
                  {!stackItems.some((s) => s.id === selectedDept.id) && (
                    <img
                      src={selectedDept.image}
                      alt={selectedDept.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F191E] via-[#0F191E]/35 to-transparent" />
                  <div className="absolute bottom-5 left-6 right-6">
                    <p className="font-mono text-xs text-[#EA9E24]">
                      {selectedDept.code} · {selectedDept.leadUnit}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                      {selectedDept.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <p className="text-sm leading-relaxed text-slate-300">{selectedDept.summary}</p>

                  <div className="mt-5 grid grid-cols-1 gap-2.5 border-t border-white/10 pt-5 sm:grid-cols-2">
                    {selectedDept.capabilities.map((cap) => (
                      <div key={cap} className="flex items-start gap-2 text-xs text-slate-200">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EA9E24]" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <span className="text-xs text-slate-400">
                      Direct clinical triage &amp; specialist scheduling
                    </span>
                    <button
                      type="button"
                      onClick={() => onBookDepartment(selectedDept.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#EA9E24] px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Book {selectedDept.name.split('&')[0].trim()}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

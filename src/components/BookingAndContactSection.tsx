import React, { useEffect, useState } from 'react';
import { CalendarCheck2, Check, Clock, Copy, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { CAMPUS_ZONES, DEPARTMENTS, HOSPITAL_CONTACT, HOSPITAL_IMAGES } from '../data/hospitalData';

interface BookingAndContactSectionProps {
  preselectedDeptId: string | null;
}

interface BookingSubmission {
  referenceId: string;
  patientName: string;
  departmentName: string;
  visitType: string;
  preferredDate: string;
  timeWindow: string;
}

export const BookingAndContactSection: React.FC<BookingAndContactSectionProps> = ({
  preselectedDeptId,
}) => {
  const [departmentId, setDepartmentId] = useState<string>('cardiology');
  const [visitType, setVisitType] = useState<string>('Specialist Consultation');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [timeWindow, setTimeWindow] = useState<string>('Morning (08:00 – 12:00)');
  const [patientName, setPatientName] = useState<string>('');
  const [patientContact, setPatientContact] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [confirmation, setConfirmation] = useState<BookingSubmission | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('main-atrium');

  useEffect(() => {
    if (preselectedDeptId) {
      setDepartmentId(preselectedDeptId);
    }
  }, [preselectedDeptId]);

  useEffect(() => {
    if (!preferredDate) {
      const tomorrow = new Date(Date.now() + 86400000);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [preferredDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = patientName.trim();
    const trimmedContact = patientContact.trim();

    if (trimmedName.length < 2) {
      setFormError('Please enter the patient full name.');
      return;
    }
    if (trimmedContact.length < 5) {
      setFormError('Please provide a valid phone number or email for confirmation.');
      return;
    }
    if (!preferredDate) {
      setFormError('Please select a preferred appointment date.');
      return;
    }

    setFormError('');
    const dept = DEPARTMENTS.find((d) => d.id === departmentId) ?? DEPARTMENTS[0];
    const refCode = `HDN-${Math.floor(100000 + Math.random() * 900000)}`;

    setConfirmation({
      referenceId: refCode,
      patientName: trimmedName,
      departmentName: dept.name,
      visitType,
      preferredDate,
      timeWindow,
    });
  };

  const handleCopyRef = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedRef(true);
    window.setTimeout(() => setCopiedRef(false), 1800);
  };

  const activeZone = CAMPUS_ZONES.find((z) => z.id === selectedZoneId) ?? CAMPUS_ZONES[1];

  return (
    <>
      {/* APPOINTMENT CONCIERGE */}
      <section
        id="appointment"
        className="relative border-t border-white/10 bg-[#0B1216] py-24 text-white sm:py-32"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="gsap-reveal flex flex-col justify-between gap-8 lg:col-span-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#EA9E24] uppercase">
                  06 · Patient Access &amp; Booking
                </p>
                <h2 className="mt-3 font-display text-balance text-[clamp(2rem,3.8vw,3.3rem)] font-light leading-[1.08] tracking-tight text-white">
                  Schedule your{' '}
                  <span className="font-semibold text-teal-300">specialist visit.</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Select your department and preferred clinic window. Our paperless EHR reception
                  desk coordinates specialist intake, imaging, and laboratory prep before arrival.
                </p>

                <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#EA9E24]" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Call Center {HOSPITAL_CONTACT.shortCode} &amp; Direct Line
                      </p>
                      <p className="text-xs text-slate-300">
                        Emergency Shortcode: <strong className="text-white">{HOSPITAL_CONTACT.shortCode}</strong> ·{' '}
                        {HOSPITAL_CONTACT.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        24/7 Emergency, ICU, NICU &amp; Pharmacy
                      </p>
                      <p className="text-xs text-slate-300">
                        Emergency patients are admitted immediately without an appointment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-[#080D10]">
                <img
                  src={HOSPITAL_IMAGES.nicuPediatrics}
                  alt="Hodan Hospital NICU and maternal pediatric suite"
                  referrerPolicy="no-referrer"
                  className="h-52 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D10]/90 via-[#080D10]/20 to-transparent" />
                <p className="absolute bottom-4 left-5 right-5 text-xs font-medium text-slate-200">
                  24/7 Neonatal ICU (NICU), maternity suites, and attentive pediatric care.
                </p>
              </div>
            </div>

            <div className="gsap-reveal lg:col-span-7">
              <div className="obsidian-panel rounded-[26px] p-6 sm:p-8 lg:p-10 shadow-2xl">
                {confirmation ? (
                  <div className="rounded-2xl border border-teal-400/35 bg-[#0C151A] p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-teal-300">
                        <CalendarCheck2 className="h-7 w-7" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider">
                            Appointment Request Recorded
                          </p>
                          <h3 className="font-display text-2xl font-semibold text-white">
                            Reference {confirmation.referenceId}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyRef(confirmation.referenceId)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white hover:border-[#EA9E24] cursor-pointer"
                      >
                        {copiedRef ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-teal-300" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-[#EA9E24]" />
                            <span>Copy Pass ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="mt-4 text-sm text-slate-300">
                      Present this reference code at Hodan Hospital Reception ({HOSPITAL_CONTACT.address}) or call{' '}
                      <span className="text-white font-semibold">{HOSPITAL_CONTACT.shortCode}</span> for intake assistance.
                    </p>

                    <dl className="mt-6 grid grid-cols-1 gap-4 border-y border-white/10 py-5 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-slate-400">Patient Name</dt>
                        <dd className="mt-0.5 font-semibold text-white">
                          {confirmation.patientName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Clinical Department</dt>
                        <dd className="mt-0.5 font-semibold text-white">
                          {confirmation.departmentName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Visit Type</dt>
                        <dd className="mt-0.5 font-semibold text-white">
                          {confirmation.visitType}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Preferred Schedule</dt>
                        <dd className="mt-0.5 font-semibold text-[#EA9E24] tabular-nums">
                          {confirmation.preferredDate} · {confirmation.timeWindow}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setConfirmation(null)}
                        className="rounded-full bg-[#EA9E24] px-6 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        Schedule Another Visit
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="dept-select"
                          className="block text-xs font-semibold text-teal-200"
                        >
                          Medical Department
                        </label>
                        <select
                          id="dept-select"
                          value={departmentId}
                          onChange={(e) => setDepartmentId(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#091115] px-3.5 py-3 text-sm text-white focus:border-[#EA9E24] focus:outline-none focus:ring-2 focus:ring-[#EA9E24]/25"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="visit-type"
                          className="block text-xs font-semibold text-teal-200"
                        >
                          Consultation Type
                        </label>
                        <select
                          id="visit-type"
                          value={visitType}
                          onChange={(e) => setVisitType(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#091115] px-3.5 py-3 text-sm text-white focus:border-[#EA9E24] focus:outline-none focus:ring-2 focus:ring-[#EA9E24]/25"
                        >
                          <option value="Specialist Consultation">Specialist Consultation</option>
                          <option value="Cardiac & ECG Evaluation">Cardiac &amp; ECG Evaluation</option>
                          <option value="Diagnostic CT/MRI & Lab">Diagnostic CT/MRI &amp; Lab</option>
                          <option value="Maternity, NICU & Pediatrics">
                            Maternity, NICU &amp; Pediatrics
                          </option>
                          <option value="Surgical & Neuro Pre-Assessment">
                            Surgical &amp; Neuro Pre-Assessment
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="preferred-date"
                          className="block text-xs font-semibold text-teal-200"
                        >
                          Preferred Date
                        </label>
                        <input
                          id="preferred-date"
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#091115] px-3.5 py-3 text-sm text-white tabular-nums focus:border-[#EA9E24] focus:outline-none focus:ring-2 focus:ring-[#EA9E24]/25"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="time-window"
                          className="block text-xs font-semibold text-teal-200"
                        >
                          Preferred Time Window
                        </label>
                        <select
                          id="time-window"
                          value={timeWindow}
                          onChange={(e) => setTimeWindow(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#091115] px-3.5 py-3 text-sm text-white focus:border-[#EA9E24] focus:outline-none focus:ring-2 focus:ring-[#EA9E24]/25"
                        >
                          <option value="Morning (08:00 – 12:00)">Morning (08:00 – 12:00)</option>
                          <option value="Midday (12:00 – 16:00)">Midday (12:00 – 16:00)</option>
                          <option value="Evening (16:00 – 20:00)">Evening (16:00 – 20:00)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="patient-name"
                          className="block text-xs font-semibold text-teal-200"
                        >
                          Patient Full Name
                        </label>
                        <input
                          id="patient-name"
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Full legal name"
                          className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#091115] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#EA9E24] focus:outline-none focus:ring-2 focus:ring-[#EA9E24]/25"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="patient-contact"
                          className="block text-xs font-semibold text-teal-200"
                        >
                          Phone Number or Email
                        </label>
                        <input
                          id="patient-contact"
                          type="text"
                          value={patientContact}
                          onChange={(e) => setPatientContact(e.target.value)}
                          placeholder="Contact number or email"
                          className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#091115] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#EA9E24] focus:outline-none focus:ring-2 focus:ring-[#EA9E24]/25"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="clinical-notes"
                        className="block text-xs font-semibold text-teal-200"
                      >
                        Symptoms or Family Membership Note (Optional)
                      </label>
                      <textarea
                        id="clinical-notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Briefly describe symptoms, specialist preference, or Family Membership Card inquiry"
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#091115] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#EA9E24] focus:outline-none focus:ring-2 focus:ring-[#EA9E24]/25"
                      />
                    </div>

                    {formError && (
                      <p role="alert" className="text-xs font-medium text-rose-400">
                        {formError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#EA9E24] px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition-colors hover:bg-amber-400 cursor-pointer"
                    >
                      Confirm Appointment Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CONTACT & CAMPUS WAYFINDING BLUEPRINT */}
      <section
        id="contact"
        className="relative border-t border-white/10 bg-[#080D10] py-20 text-white sm:py-24"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#0E171C] p-7 sm:p-8 lg:col-span-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-teal-300 uppercase">
                  07 · Campus &amp; Official Contact
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
                  Visit Hodan Hospital
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Located in a {HOSPITAL_CONTACT.footprint} medical complex on Abdikassim Road in
                  Hodan District’s central medical corridor.
                </p>

                <div className="mt-7 space-y-4 border-t border-white/10 pt-6 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#EA9E24]" />
                    <div>
                      <p className="font-semibold text-white">Campus Address</p>
                      <p className="text-slate-300">{HOSPITAL_CONTACT.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#EA9E24]" />
                    <div>
                      <p className="font-semibold text-white">Call Center &amp; Helpline</p>
                      <p className="text-slate-300">
                        Shortcode: {HOSPITAL_CONTACT.shortCode} · {HOSPITAL_CONTACT.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                    <div>
                      <p className="font-semibold text-white">Official Email</p>
                      <p className="text-slate-300">{HOSPITAL_CONTACT.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                    <div>
                      <p className="font-semibold text-white">Hours of Care</p>
                      <p className="text-slate-300">
                        Emergency, ICU, NICU &amp; Pharmacy: Open 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-[#EA9E24]/35 bg-[#080F13] p-4">
                <p className="text-xs font-semibold text-[#EA9E24]">{activeZone.name}</p>
                <p className="mt-1 text-xs font-medium text-teal-200">{activeZone.accessGate}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{activeZone.details}</p>
                <p className="mt-2 font-mono text-[11px] text-slate-400">{activeZone.hours}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0E171C] p-6 sm:p-8 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    Interactive Hodan Campus Blueprint
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any wing on Abdikassim Road to inspect gates, floors &amp; hours
                  </p>
                </div>
                <span className="font-mono text-xs text-[#EA9E24]">ABDIKASSIM RD · HODAN</span>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#070C0F] p-4">
                <svg
                  viewBox="0 0 720 320"
                  className="h-64 w-full sm:h-72"
                  role="img"
                  aria-label="Interactive architectural campus map of Hodan Hospital"
                >
                  <defs>
                    <pattern id="campusGridDark" width="36" height="36" patternUnits="userSpaceOnUse">
                      <path
                        d="M 36 0 L 0 0 0 36"
                        fill="none"
                        stroke="rgba(45,212,191,0.08)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="720" height="320" fill="url(#campusGridDark)" />

                  <path
                    d="M 0 258 Q 360 246 720 258"
                    fill="none"
                    stroke="#132229"
                    strokeWidth="34"
                  />
                  <path
                    d="M 0 258 Q 360 246 720 258"
                    fill="none"
                    stroke="rgba(234,158,36,0.45)"
                    strokeWidth="2"
                    strokeDasharray="10 10"
                  />

                  <rect
                    x="120"
                    y="48"
                    width="480"
                    height="156"
                    rx="18"
                    fill="#0D191F"
                    stroke="rgba(45,212,191,0.45)"
                    strokeWidth="2"
                  />

                  <g onClick={() => setSelectedZoneId('emergency-wing')} className="cursor-pointer">
                    <rect
                      x="142"
                      y="68"
                      width="140"
                      height="116"
                      rx="12"
                      fill={selectedZoneId === 'emergency-wing' ? '#1B3842' : '#14262E'}
                      stroke={
                        selectedZoneId === 'emergency-wing' ? '#EA9E24' : 'rgba(255,255,255,0.14)'
                      }
                      strokeWidth={selectedZoneId === 'emergency-wing' ? 2 : 1}
                    />
                    <text x="212" y="122" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="600">
                      Emergency (1234)
                    </text>
                    <text x="212" y="140" textAnchor="middle" fill="#94A3B8" fontSize="11">
                      Ambulance Bay
                    </text>
                  </g>

                  <g onClick={() => setSelectedZoneId('main-atrium')} className="cursor-pointer">
                    <rect
                      x="296"
                      y="68"
                      width="150"
                      height="116"
                      rx="12"
                      fill={selectedZoneId === 'main-atrium' ? '#1E3C46' : '#18353E'}
                      stroke={
                        selectedZoneId === 'main-atrium' ? '#EA9E24' : 'rgba(234,158,36,0.45)'
                      }
                      strokeWidth={selectedZoneId === 'main-atrium' ? 2.2 : 1.2}
                    />
                    <text x="371" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">
                      HODAN HOSPITAL
                    </text>
                    <text x="371" y="140" textAnchor="middle" fill="#EA9E24" fontSize="11">
                      Atrium · OR · 24/7 Rx
                    </text>
                  </g>

                  <g
                    onClick={() => setSelectedZoneId('diagnostics-maternity')}
                    className="cursor-pointer"
                  >
                    <rect
                      x="460"
                      y="68"
                      width="118"
                      height="116"
                      rx="12"
                      fill={selectedZoneId === 'diagnostics-maternity' ? '#1B3842' : '#14262E'}
                      stroke={
                        selectedZoneId === 'diagnostics-maternity'
                          ? '#EA9E24'
                          : 'rgba(255,255,255,0.14)'
                      }
                      strokeWidth={selectedZoneId === 'diagnostics-maternity' ? 2 : 1}
                    />
                    <text x="519" y="122" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="600">
                      Diagnostics &amp;
                    </text>
                    <text x="519" y="140" textAnchor="middle" fill="#94A3B8" fontSize="11">
                      NICU &amp; Maternity
                    </text>
                  </g>

                  <circle cx="212" cy="204" r="6" fill="#2DD4BF" />
                  <text x="212" y="228" textAnchor="middle" fill="#99F6E4" fontSize="11">
                    24/7 Emergency Gate
                  </text>

                  <circle cx="371" cy="204" r="7" fill="#EA9E24" />
                  <text x="371" y="228" textAnchor="middle" fill="#FDE68A" fontSize="11">
                    Main Reception Drop-Off
                  </text>

                  <text x="360" y="298" textAnchor="middle" fill="#94A3B8" fontSize="11">
                    Abdikassim Road · Hodan District · Mogadishu
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMORABLE EDITORIAL FOOTER */}
      <footer className="border-t border-white/10 bg-[#05080A] pt-16 pb-10 text-slate-300">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 pb-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="inline-flex items-center rounded-xl bg-white px-3.5 py-2">
                <img
                  src={HOSPITAL_IMAGES.logoFull}
                  alt="Hodan Hospital"
                  referrerPolicy="no-referrer"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
                Advanced Care. Human Compassion. Integrated cardiac, neurosurgical, diagnostic,
                NICU, and maternal care on Abdikassim Road, Hodan District, Mogadishu.
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
                Explore
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About Hodan Hospital
                  </a>
                </li>
                <li>
                  <a href="#departments" className="hover:text-white transition-colors">
                    Medical Departments
                  </a>
                </li>
                <li>
                  <a href="#facilities" className="hover:text-white transition-colors">
                    3D Facilities Orbit
                  </a>
                </li>
                <li>
                  <a href="#doctors" className="hover:text-white transition-colors">
                    Leadership &amp; Membership
                  </a>
                </li>
                <li>
                  <a href="#appointment" className="hover:text-white transition-colors">
                    Book Appointment
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
                Official Contact
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li>{HOSPITAL_CONTACT.address}</li>
                <li>Helpline: {HOSPITAL_CONTACT.shortCode} · {HOSPITAL_CONTACT.phone}</li>
                <li>{HOSPITAL_CONTACT.email}</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
            <p>&copy; {new Date().getFullYear()} Hodan Hospital. All rights reserved.</p>
            <p>Abdikassim Road · Hodan District · Mogadishu, Somalia</p>
          </div>
        </div>
      </footer>
    </>
  );
};

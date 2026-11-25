import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { HOSPITAL_IMAGES } from '../data/hospitalData';

interface NavbarProps {
  onBookClick: () => void;
}

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Departments', href: '#departments' },
  { label: 'Facilities', href: '#facilities' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'bg-[#080D10]/92 border-b border-white/10 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-md"
        >
          <img
            src={HOSPITAL_IMAGES.logoMark}
            alt="Hodan Hospital emblem"
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-md object-contain bg-white p-0.5"
          />
          <span className="font-display">Hodan Hospital</span>
        </a>

        {/* Zone 2: 5 concise single-line text links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide text-slate-300 uppercase"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#EA9E24] after:transition-all after:duration-200 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBookClick}
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#EA9E24] px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm transition-colors hover:bg-amber-400 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book Appointment
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white md:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0C1418] px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onBookClick();
              }}
              className="mt-2 w-full rounded-full bg-[#EA9E24] px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              Book Appointment
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

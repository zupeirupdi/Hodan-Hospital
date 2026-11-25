import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutStorySection } from './components/AboutStorySection';
import { DepartmentsSection } from './components/DepartmentsSection';
import { FacilitiesHorizontalSection } from './components/FacilitiesHorizontalSection';
import { ServicesTunnelSection } from './components/ServicesTunnelSection';
import { DoctorsShowcaseSection } from './components/DoctorsShowcaseSection';
import { BookingAndContactSection } from './components/BookingAndContactSection';
import { PagePreloader } from './components/PagePreloader';
import {
  ChapterScrollRail,
  CursorSpotlight,
  LightboxMedia,
  MediaLightbox,
} from './components/AmbientEffects';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [selectedDeptForBooking, setSelectedDeptForBooking] = useState<string | null>(null);
  const [highlightedDept, setHighlightedDept] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !mainRef.current) return;

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>('.gsap-reveal');
      blocks.forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true,
          },
        });
      });

      const timer = window.setTimeout(() => ScrollTrigger.refresh(), 500);
      return () => clearTimeout(timer);
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookDepartment = (deptId: string) => {
    setSelectedDeptForBooking(deptId);
    scrollToSection('appointment');
  };

  const handleExploreDepartment = (deptId: string) => {
    setHighlightedDept(deptId);
    scrollToSection('departments');
  };

  const handleGeneralBooking = () => {
    scrollToSection('appointment');
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-[#080D10] text-slate-100">
      <PagePreloader />
      <CursorSpotlight />
      <ChapterScrollRail />
      <MediaLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />

      <Navbar onBookClick={handleGeneralBooking} />

      <main>
        <HeroSection
          onBookDepartment={handleBookDepartment}
          onExploreDepartment={handleExploreDepartment}
        />

        <AboutStorySection
          onBookClick={handleGeneralBooking}
          onOpenLightbox={setLightboxMedia}
        />

        <DepartmentsSection
          highlightedDeptId={highlightedDept}
          onBookDepartment={handleBookDepartment}
        />

        <FacilitiesHorizontalSection onOpenLightbox={setLightboxMedia} />

        <ServicesTunnelSection onOpenLightbox={setLightboxMedia} />

        <DoctorsShowcaseSection
          onBookDepartment={handleBookDepartment}
          onOpenLightbox={setLightboxMedia}
        />

        <BookingAndContactSection preselectedDeptId={selectedDeptForBooking} />
      </main>
    </div>
  );
}

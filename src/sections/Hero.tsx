import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Users,
  FileCheck,
  Mic,
  BarChart3,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { goToLogin, scrollToSection } from '../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const device = deviceRef.current;
    const cards = cardsRef.current;

    if (!section || !headline || !device || !cards) return;

    const ctx = gsap.context(() => {
      // Initial load animation
      const loadTl = gsap.timeline({ delay: 0.3 });

      // Device entrance
      loadTl.fromTo(
        device,
        { y: 40, scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }
      );

      // Cards stagger entrance
      const cardElements = cards.querySelectorAll('.floating-card');
      loadTl.fromTo(
        cardElements,
        { x: (i) => (i % 2 === 0 ? -60 : 60), y: 20, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
        },
        '-=0.5'
      );

      // Headline words entrance
      const words = headline.querySelectorAll('.word');
      loadTl.fromTo(
        words,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power2.out',
        },
        '-=0.6'
      );

      // CTA entrance
      const cta = headline.querySelector('.cta-row');
      if (cta) {
        loadTl.fromTo(
          cta,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        );
      }

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.45,
          invalidateOnRefresh: true,
          onLeaveBack: () => {
            // Reset all elements when scrolling back to top
            gsap.set([headline, device, ...cardElements], {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            });
          },
        },
      });

      // EXIT phase (70% - 100%)
      scrollTl.fromTo(
        headline,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        device,
        { y: 0, scale: 1, opacity: 1 },
        { y: '-10vh', scale: 0.92, opacity: 0, ease: 'power2.in' },
        0.7
      );

      cardElements.forEach((card, i) => {
        const isLeft = i % 2 === 0;
        scrollTl.fromTo(
          card,
          { x: 0, opacity: 1 },
          { x: isLeft ? '-12vw' : '12vw', opacity: 0, ease: 'power2.in' },
          0.72
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-dark fullscreen-panel w-full relative overflow-x-hidden overflow-y-visible flex items-center"
    >
      {/* Background Glow Orbs */}
      <div className="glow-orb glow-orb-cyan w-[26vw] h-[26vw] left-[18%] top-[22%] animate-pulse-glow" />
      <div className="glow-orb glow-orb-purple w-[22vw] h-[22vw] right-[10%] bottom-[18%] filter blur-[100px]" />
      
      {/* Radial Gradient */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

      {/* Content Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-[calc(var(--nav-height,5rem)+0.5rem)] pb-6 md:pb-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Headline */}
          <div ref={headlineRef} className="relative z-20">
            <span className="eyebrow mb-4 block">EDUFLOW PLATFORM</span>
            <h1 className="heading-1 text-eduflow-text-primary mb-6">
              <span className="word inline-block">The</span>{' '}
              <span className="word inline-block">complete</span>{' '}
              <span className="word inline-block">ecosystem</span>{' '}
              <span className="word inline-block">for</span>{' '}
              <span className="word inline-block">modern</span>{' '}
              <span className="word inline-block text-gradient">education.</span>
            </h1>
            <p className="body-text text-lg md:text-xl max-w-xl mb-8">
              CRM, mock exams, and AI speaking practice—unified on one
              intelligent platform.
            </p>
            <div className="cta-row flex flex-wrap gap-4">
              <button
                onClick={goToLogin}
                className="btn-primary"
              >
                Request a demo
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="btn-secondary"
              >
                View pricing
                <ChevronRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Floating UI Cards */}
          <div ref={cardsRef} className="relative h-[500px] lg:h-[600px] lg:-mt-6">
            {/* Center Device Mockup */}
            <div
              ref={deviceRef}
              className="absolute left-1/2 top-[27%] lg:top-[28%] -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[400px] z-30"
            >
              <div className="glass-card p-4 glow-cyan animate-float">
                {/* Device Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-eduflow-text-secondary">
                    EduFlow Dashboard
                  </span>
                </div>

                {/* Device Content */}
                <div className="space-y-3">
                  {/* Mini CRM Card */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-eduflow-cyan" />
                      <span className="text-sm font-medium">EDU CRM</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 w-16 bg-eduflow-cyan/30 rounded-full" />
                      <div className="h-2 w-12 bg-white/20 rounded-full" />
                    </div>
                  </div>

                  {/* Mini Exam Card */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-4 h-4 text-eduflow-purple" />
                      <span className="text-sm font-medium">Mock Exams</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-eduflow-purple/50 flex items-center justify-center">
                        <span className="text-xs">85%</span>
                      </div>
                      <div className="h-2 w-20 bg-eduflow-purple/30 rounded-full" />
                    </div>
                  </div>

                  {/* Mini Speaking Card */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-eduflow-cyan" />
                      <span className="text-sm font-medium">Speaking AI</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-6">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-eduflow-cyan/60 rounded-full"
                          style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Device Footer */}
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-around">
                  <div className="w-8 h-8 rounded-lg bg-white/10" />
                  <div className="w-8 h-8 rounded-lg bg-eduflow-cyan/20" />
                  <div className="w-8 h-8 rounded-lg bg-white/10" />
                </div>
              </div>
            </div>

            {/* Floating Card A - CRM (Top Left) */}
            <div className="floating-card absolute left-[2%] top-[6%] w-[44%] max-w-[190px] z-40 animate-float">
              <div className="glass-card p-4 glow-cyan-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-eduflow-cyan/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-eduflow-cyan" />
                  </div>
                  <span className="text-sm font-medium">Leads</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-eduflow-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>New: 24</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-eduflow-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Contacted: 18</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-eduflow-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Enrolled: 12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card B - Exam Progress (Top Right) */}
            <div
              className="floating-card absolute right-[2%] top-[8%] w-[46%] max-w-[200px] z-40 animate-float"
              style={{ animationDelay: '1s' }}
            >
              <div className="glass-card p-4 glow-purple-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-eduflow-purple/20 flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-eduflow-purple" />
                  </div>
                  <span className="text-sm font-medium">CDI Progress</span>
                </div>
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#9B00FF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${0.75 * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                      75%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-eduflow-text-secondary text-center">
                  12 of 16 modules
                </div>
              </div>
            </div>

            {/* Floating Card C - Speaking Waveform (Bottom Left) */}
            <div
              className="floating-card absolute left-0 bottom-[10%] w-[48%] max-w-[220px] z-40 animate-float"
              style={{ animationDelay: '2s' }}
            >
              <div className="glass-card p-4 glow-cyan-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-eduflow-cyan/20 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-eduflow-cyan" />
                  </div>
                  <div>
                    <span className="text-sm font-medium block">Speaking</span>
                    <span className="text-xs text-eduflow-text-secondary">
                      CEFR B2
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-10 mb-2">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-eduflow-cyan/60 rounded-full"
                      style={{
                        height: `${30 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-eduflow-text-secondary">Fluency</span>
                  <span className="text-eduflow-cyan font-medium">8.5/10</span>
                </div>
              </div>
            </div>

            {/* Floating Card D - Stats (Bottom Right) */}
            <div
              className="floating-card absolute right-0 bottom-[14%] w-[40%] max-w-[180px] z-40 animate-float"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="glass-card p-4 glow-purple-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-eduflow-purple/20 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-eduflow-purple" />
                  </div>
                  <span className="text-sm font-medium">Weekly</span>
                </div>
                <div className="flex items-end gap-2 h-16">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-eduflow-purple/40 to-eduflow-purple/20 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-eduflow-text-secondary mt-2">
                  <span>Mon</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

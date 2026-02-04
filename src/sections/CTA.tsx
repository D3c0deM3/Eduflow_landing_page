import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const orbs = orbsRef.current;

    if (!section || !content || !orbs) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      const title = content.querySelector('.cta-title');
      const body = content.querySelector('.cta-body');
      const buttons = content.querySelector('.cta-buttons');

      scrollTl.fromTo(
        title,
        { y: '18vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        body,
        { y: '10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.05
      );

      scrollTl.fromTo(
        buttons,
        { y: '8vh', scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'none' },
        0.1
      );

      scrollTl.fromTo(
        orbs,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, ease: 'none' },
        0
      );

      // SETTLE (30% - 70%) - Hold

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        content,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        orbs,
        { opacity: 1, scale: 1 },
        { opacity: 0.1, scale: 1.1, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="section-dark min-h-screen w-full relative overflow-hidden flex items-center justify-center"
    >
      {/* Background Glow Orbs */}
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none">
        <div className="glow-orb glow-orb-cyan w-[28vw] h-[28vw] left-[22%] top-[28%]" />
        <div className="glow-orb glow-orb-purple w-[24vw] h-[24vw] right-[18%] bottom-[24%] filter blur-[100px]" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="text-center max-w-4xl mx-auto px-4 relative z-10"
      >
        <h2 className="cta-title heading-1 text-eduflow-text-primary mb-6">
          Ready to transform how your school teaches?
        </h2>
        <p className="cta-body text-xl text-eduflow-text-secondary mb-10 max-w-2xl mx-auto">
          Join hundreds of institutions using EduFlow to improve outcomes and
          save time.
        </p>
        <div className="cta-buttons flex flex-wrap justify-center gap-4">
          <button
            onClick={() => scrollToSection('pricing')}
            className="btn-primary text-lg px-8 py-4"
          >
            Request a demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <button className="btn-secondary text-lg px-8 py-4">
            <MessageCircle className="mr-2 w-5 h-5" />
            Contact sales
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { goToLogin } from '../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

const CONTACT_PHONE_DISPLAY = '+998 91-581-77-11';
const CONTACT_PHONE_LINK = 'tel:+998915817711';
const CONTACT_TELEGRAM = 'https://t.me/cdimock_test';

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
      const title = content.querySelector('.cta-title');
      const body = content.querySelector('.cta-body');
      const buttons = content.querySelector('.cta-buttons');

      gsap.fromTo(
        [title, body, buttons],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        orbs,
        { opacity: 0.25, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.to(content, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.45,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="section-dark fullscreen-panel w-full relative overflow-x-hidden flex items-center justify-center"
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
            onClick={goToLogin}
            className="btn-primary text-lg px-8 py-4"
          >
            Request a demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <a
            href={CONTACT_TELEGRAM}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-lg px-8 py-4"
          >
            <MessageCircle className="mr-2 w-5 h-5" />
            Contact sales
          </a>
        </div>
        <p className="mt-6 text-sm md:text-base text-eduflow-text-secondary">
          Contacts:{' '}
          <a href={CONTACT_PHONE_LINK} className="text-eduflow-cyan hover:underline">
            {CONTACT_PHONE_DISPLAY}
          </a>{' '}
          |{' '}
          <a
            href={CONTACT_TELEGRAM}
            target="_blank"
            rel="noreferrer"
            className="text-eduflow-cyan hover:underline"
          >
            Telegram
          </a>
        </p>
      </div>
    </section>
  );
};

export default CTA;

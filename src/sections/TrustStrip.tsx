import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  GraduationCap,
  BookOpen,
  Languages,
  School,
  Globe,
  Award,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TrustStrip = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const logos = section.querySelectorAll('.trust-logo');

      gsap.fromTo(
        logos,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const partners = [
    { name: 'Cambridge', icon: GraduationCap },
    { name: 'British Council', icon: Globe },
    { name: 'IELTS', icon: BookOpen },
    { name: 'TOEFL', icon: Languages },
    { name: 'CEFR', icon: Award },
    { name: 'Oxford', icon: School },
  ];

  return (
    <section
      ref={sectionRef}
      className="section-dark py-12 md:py-16 border-y border-white/5"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <p className="text-center text-sm text-eduflow-text-secondary mb-8">
          Trusted by leading educational institutions worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={index}
                className="trust-logo flex items-center gap-2 text-eduflow-text-secondary hover:text-eduflow-text-primary transition-colors cursor-default"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm md:text-base">
                  {partner.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, FileCheck, Mic, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current;

    if (!section || !header || !cards) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        header,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );

      // Cards animation
      const cardElements = cards.querySelectorAll('.feature-card');
      gsap.fromTo(
        cardElements,
        { y: 60, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cards,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Users,
      title: 'EDU CRM',
      description:
        'Manage leads, enrollments, and communications with automation that feels personal. Track every student journey from first contact to graduation.',
      color: 'cyan',
      features: [
        'Lead scoring & nurturing',
        'Automated workflows',
        'Communication history',
        'Enrollment tracking',
      ],
    },
    {
      icon: FileCheck,
      title: 'Mock Exam Engine',
      description:
        'Deliver realistic CDI-style tests with instant scoring and detailed performance insights. Prepare students for success with authentic exam experiences.',
      color: 'purple',
      features: [
        'CDI-aligned questions',
        'Instant scoring',
        'Performance analytics',
        'Progress tracking',
      ],
    },
    {
      icon: Mic,
      title: 'Speaking AI',
      description:
        'CEFR-aligned practice with real-time feedback on fluency, pronunciation, and grammar. Help students speak with confidence in any language.',
      color: 'cyan',
      features: [
        'Real-time pronunciation',
        'Fluency analysis',
        'Grammar feedback',
        'CEFR scoring',
      ],
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="features"
      className="section-light py-20 md:py-28"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow text-eduflow-dark/60 mb-4 block">
            FEATURES
          </span>
          <h2 className="heading-2 text-eduflow-dark mb-6">
            Three products. One seamless experience.
          </h2>
          <p className="text-eduflow-dark/70 text-lg">
            Built for language schools, test-prep centers, and online academies.
          </p>
        </div>

        {/* Feature Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isCyan = feature.color === 'cyan';
            return (
              <div
                key={index}
                className={`feature-card group relative overflow-hidden rounded-3xl bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 ${
                  isCyan
                    ? 'hover:shadow-[0_0_40px_rgba(0,240,255,0.2)]'
                    : 'hover:shadow-[0_0_40px_rgba(155,0,255,0.2)]'
                }`}
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {/* Top highlight line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-px ${
                    isCyan ? 'bg-eduflow-cyan/30' : 'bg-eduflow-purple/30'
                  }`}
                />

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    isCyan
                      ? 'bg-eduflow-cyan/10 text-eduflow-cyan'
                      : 'bg-eduflow-purple/10 text-eduflow-purple'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-eduflow-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-eduflow-dark/60 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature List */}
                <ul className="space-y-2 mb-6">
                  {feature.features.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-eduflow-dark/70"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCyan ? 'bg-eduflow-cyan' : 'bg-eduflow-purple'
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA Link */}
                <button
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isCyan
                      ? 'text-eduflow-cyan hover:text-eduflow-cyan/80'
                      : 'text-eduflow-purple hover:text-eduflow-purple/80'
                  }`}
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

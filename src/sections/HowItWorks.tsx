import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { School, Calendar, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const steps = stepsRef.current;
    const path = pathRef.current;

    if (!section || !header || !steps || !path) return;

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
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Path draw animation
      const pathLength = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: steps,
          start: 'top 75%',
          end: 'top 40%',
          scrub: true,
        },
      });

      // Steps animation
      const stepCards = steps.querySelectorAll('.step-card');
      gsap.fromTo(
        stepCards,
        { y: 70, rotateX: 10, opacity: 0 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.14,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: steps,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Step numbers animation
      const stepNumbers = steps.querySelectorAll('.step-number');
      gsap.fromTo(
        stepNumbers,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.14,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: steps,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: '01',
      icon: School,
      title: 'Connect your school',
      description:
        'Import students, set roles, and configure your curriculum. Our CRM seamlessly integrates with your existing systems.',
    },
    {
      number: '02',
      icon: Calendar,
      title: 'Assign practice & tests',
      description:
        'Schedule mock exams and speaking sessions in a few clicks. Automatically distribute personalized learning paths.',
    },
    {
      number: '03',
      icon: TrendingUp,
      title: 'Track and improve',
      description:
        'Use live dashboards to coach learners and prove outcomes. Data-driven insights help you optimize every step.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="section-light py-20 md:py-28"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow text-eduflow-dark/60 mb-4 block">
            HOW IT WORKS
          </span>
          <h2 className="heading-2 text-eduflow-dark mb-6">
            Launch your learning experience in days.
          </h2>
          <p className="text-eduflow-dark/70 text-lg">
            Get started quickly with our simple three-step process.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative">
          {/* Connection Path - Desktop */}
          <svg
            className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] w-[70%] h-4 -translate-y-1/2 z-0"
            viewBox="0 0 800 16"
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              d="M0 8 L800 8"
              fill="none"
              stroke="rgba(0, 240, 255, 0.35)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          {/* Step Cards */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="step-card relative bg-white rounded-3xl p-6 md:p-8"
                  style={{
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Step Number */}
                  <div className="step-number absolute -top-4 left-6 w-10 h-10 rounded-xl bg-gradient-to-br from-eduflow-cyan to-eduflow-purple flex items-center justify-center text-eduflow-dark font-bold text-sm">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-eduflow-dark/5 flex items-center justify-center mb-5 mt-4">
                    <Icon className="w-7 h-7 text-eduflow-dark/70" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-eduflow-dark mb-3">
                    {step.title}
                  </h3>
                  <p className="text-eduflow-dark/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

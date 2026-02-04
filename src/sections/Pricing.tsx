import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Pricing = () => {
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
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards animation
      const cardElements = cards.querySelectorAll('.pricing-card');
      gsap.fromTo(
        cardElements,
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cards,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/mo',
      description: 'For small teams getting started.',
      features: [
        'CRM core features',
        'Up to 100 students',
        'Email support',
        'Basic analytics',
        '5 mock exam templates',
        'Standard speaking AI',
      ],
      cta: 'Get started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$129',
      period: '/mo',
      description: 'For growing schools and programs.',
      features: [
        'Everything in Starter',
        'Unlimited students',
        'Mock exams + Speaking AI',
        'Priority support',
        'Custom branding',
        'Advanced analytics',
        'API access',
        'Team collaboration',
      ],
      cta: 'Get started',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large institutions.',
      features: [
        'Everything in Pro',
        'SSO + Advanced security',
        'Dedicated success manager',
        'SLA guarantee',
        'On-premise option',
        'Custom integrations',
        'Training & onboarding',
        '24/7 phone support',
      ],
      cta: 'Contact sales',
      highlighted: false,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="section-light py-20 md:py-28"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow text-eduflow-dark/60 mb-4 block">
            PRICING
          </span>
          <h2 className="heading-2 text-eduflow-dark mb-6">
            Simple plans. No hidden fees.
          </h2>
          <p className="text-eduflow-dark/70 text-lg">
            Choose the plan that fits your institution's needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card relative rounded-3xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? 'pricing-pro bg-white'
                  : 'bg-white border border-black/5'
              }`}
            >
              {/* Highlighted Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-eduflow-cyan to-eduflow-purple text-eduflow-dark text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Top highlight line for Pro */}
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-px bg-eduflow-cyan/30" />
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-eduflow-dark mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-eduflow-dark">
                    {plan.price}
                  </span>
                  <span className="text-eduflow-dark/50">{plan.period}</span>
                </div>
                <p className="text-sm text-eduflow-dark/60">{plan.description}</p>
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 mb-6 ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'bg-eduflow-dark text-white hover:bg-eduflow-dark/90'
                }`}
              >
                {plan.cta}
              </button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.highlighted
                          ? 'bg-eduflow-cyan/20'
                          : 'bg-eduflow-dark/5'
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.highlighted
                            ? 'text-eduflow-cyan'
                            : 'text-eduflow-dark/60'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-eduflow-dark/70">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

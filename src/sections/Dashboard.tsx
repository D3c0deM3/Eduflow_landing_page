import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DashboardCard from '../components/dashboard/DashboardCard';

gsap.registerPlugin(ScrollTrigger);

const Dashboard = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const dashboard = dashboardRef.current;
    const orbs = orbsRef.current;

    if (!section || !title || !dashboard || !orbs) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        title,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        dashboard,
        { y: 80, scale: 0.96, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 68%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        orbs,
        { opacity: 0.35, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.to(dashboard, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="dashboard"
      className="section-dark fullscreen-panel w-full relative overflow-x-hidden"
    >
      {/* Background Glow Orbs */}
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none">
        <div className="glow-orb glow-orb-cyan w-[35vw] h-[35vw] left-[20%] top-[20%]" />
        <div className="glow-orb glow-orb-purple w-[30vw] h-[30vw] right-[15%] bottom-[15%] filter blur-[100px]" />
      </div>

      {/* Title */}
      <div
        ref={titleRef}
        className="text-center max-w-3xl mx-auto px-4 mb-10 relative z-10"
      >
        <span className="eyebrow mb-4 block">DASHBOARD</span>
        <h2 className="heading-2 text-eduflow-text-primary mb-4">
          Everything visible. Everything actionable.
        </h2>
        <p className="text-eduflow-text-secondary text-lg">
          From enrollment funnels to speaking progress—one clear view.
        </p>
      </div>

      {/* Dashboard Mockup */}
      <div
        ref={dashboardRef}
        className="w-[92%] max-w-6xl mx-auto relative z-20 will-change-transform"
      >
        <DashboardCard userInitials="JD" />
      </div>
    </section>
  );
};

export default Dashboard;

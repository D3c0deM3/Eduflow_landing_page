import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Github, Youtube } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footer.querySelector('.footer-content'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, footer);

    return () => ctx.revert();
  }, []);

  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'API Docs'],
    Company: ['About', 'Careers', 'Blog', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security'],
  };

  const socialLinks = [
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Github, href: '#' },
    { icon: Youtube, href: '#' },
  ];

  return (
    <footer ref={footerRef} className="section-dark py-16 md:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="footer-content">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Logo & Tagline */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eduflow-cyan to-eduflow-purple flex items-center justify-center">
                  <span className="text-eduflow-dark font-bold text-lg">E</span>
                </div>
                <span className="text-eduflow-text-primary font-semibold text-xl">
                  EduFlow
                </span>
              </div>
              <p className="text-eduflow-text-secondary max-w-sm">
                Built for educators who demand more. The complete ecosystem for
                modern education.
              </p>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-eduflow-text-primary font-semibold mb-4">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-eduflow-text-secondary hover:text-eduflow-text-primary transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-eduflow-text-secondary text-sm">
              © 2026 EduFlow. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-eduflow-text-secondary hover:text-eduflow-text-primary transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

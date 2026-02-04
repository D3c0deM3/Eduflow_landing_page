import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Product', id: 'features' },
    { label: 'Solutions', id: 'how-it-works' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Resources', id: 'dashboard' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-eduflow-dark/80 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eduflow-cyan to-eduflow-purple flex items-center justify-center">
                <span className="text-eduflow-dark font-bold text-sm">E</span>
              </div>
              <span className="text-eduflow-text-primary font-semibold text-lg">
                EduFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-eduflow-text-secondary hover:text-eduflow-text-primary transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={() => scrollToSection('cta')}
                className="btn-primary text-sm"
              >
                Request a demo
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-eduflow-text-primary p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className="absolute inset-0 bg-eduflow-dark/95 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="relative flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-eduflow-text-primary text-2xl font-medium"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollToSection('cta')}
            className="btn-primary mt-4"
          >
            Request a demo
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;

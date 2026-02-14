import Navigation from './components/Navigation';
import Hero from './sections/Hero';
import TrustStrip from './sections/TrustStrip';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Dashboard from './sections/Dashboard';
import Pricing from './sections/Pricing';
import CTA from './sections/CTA';
import Footer from './sections/Footer';
import './App.css';

function App() {
  return (
    <div className="relative">
      <div className="noise-overlay" />
      <Navigation />
      <main className="relative">
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <Dashboard />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}

export default App;

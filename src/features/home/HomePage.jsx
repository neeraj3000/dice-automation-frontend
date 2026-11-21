import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import ProductShowcase from './ProductShowcase';
import Features from './Features';
import HowItWorks from './HowItWorks';
import TrustSection from './TrustSection';
import Faq from './Faq';
import CtaSection from './CtaSection';
import Footer from './Footer';

export default function HomePage() {
  const { hash } = useLocation();

  // Arriving from another page via /#section: scroll to that section
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(t);
  }, [hash]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Apply2Hire – Autonomous Career Intelligence & Application Automation';
    
    // Update meta description if present
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Automate repetitive job board applications with your tailored resumes. Real browser automation, human-in-the-loop review, and complete status tracking.'
      );
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0c100e] text-[#161a18] dark:text-[#edf2f0] font-sans antialiased selection:bg-[#e8efe9] selection:text-[#104e43] relative">
      {/* Engineering Blueprint Grid Overlay matching resume2hire.ai */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60 dark:opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(16, 78, 67, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 78, 67, 0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ProductShowcase />
          <Features />
          <HowItWorks />
          <TrustSection />
          <Faq />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

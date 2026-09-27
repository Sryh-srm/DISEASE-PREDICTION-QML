import React, { useState, useEffect } from 'react';
import { Activity, Terminal, ArrowUpRight, Cpu } from 'lucide-react';
import '../styles/navigation.css';

export default function Navigation({ onOpenDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'PIPELINE', href: '#pipeline' },
    { label: 'PROBLEM', href: '#problem' },
    { label: 'APPROACH', href: '#approach' },
    { label: 'QUANTUM STATE', href: '#quantum-vis' },
    { label: 'MODALITIES', href: '#modalities' },
    { label: 'EXPERIMENT', href: '#experiment' },
    { label: 'EXPLAINABILITY', href: '#explainability' }
  ];

  return (
    <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        {/* Logo & Identity */}
        <a href="#" className="brand-lockup">
          <div className="brand-symbol">
            <div className="quantum-core-dot"></div>
            <div className="quantum-ring"></div>
          </div>
          <div className="brand-text">
            <span className="brand-name">HQ-MEDNET</span>
            <span className="brand-sub">QUANTUM // ONCOLOGY & NEURO</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-item">
              {link.label}
            </a>
          ))}
        </nav>

        {/* System Status & Launch Demo Action */}
        <div className="header-actions">
          <div className="system-pill" title="Hardware simulator telemetry">
            <span className="status-indicator-dot"></span>
            <span className="system-pill-text">STATEVECTOR SIM</span>
          </div>
          <button 
            id="nav-demo-btn"
            className="cta-button quantum nav-cta"
            onClick={onOpenDemo}
          >
            <span>LIVE DEMO</span>
            <ArrowUpRight size={15} />
          </button>

          {/* Mobile hamburger toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button 
            className="cta-button primary mobile-cta"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDemo();
            }}
          >
            LAUNCH EXPERIMENT DEMO →
          </button>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ScrollIntro from './components/ScrollIntro';
import ProblemSection from './components/ProblemSection';
import ApproachSection from './components/ApproachSection';
import QuantumVisualization from './components/QuantumVisualization';
import MedicalDataSection from './components/MedicalDataSection';
import ExplainabilitySection from './components/ExplainabilitySection';
import ExperimentPreview from './components/ExperimentPreview';
import DemoTransition from './components/DemoTransition';
import Footer from './components/Footer';
import InteractiveDemoModal from './components/InteractiveDemoModal';
import CosmicTunnelBackground from './components/CosmicTunnelBackground';

export default function App() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Lock scrolling initially
    document.body.style.overflow = 'hidden';

    // Simulate loading sequence
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsLoaded(true);
          document.body.classList.add('is-loaded');
          // Unlock scrolling
          document.body.style.overflow = '';
        }, 500); // Small pause at 100%
      }
      setLoadingProgress(progress);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleOpenDemo = () => {
    setIsDemoOpen(true);
    // Lock background scrolling while modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDemo = () => {
    setIsDemoOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="app-root">
      {/* Dynamic Cosmic Tunnel (Serves as loading and background) */}
      <CosmicTunnelBackground isLoaded={isLoaded} />

      {/* Loading Overlay */}
      <div className={`loading-overlay ${isLoaded ? 'hidden' : ''}`}>
        <div className="loading-text">INITIALIZING QUANTUM CORE</div>
        <div className="loading-progress-bar">
          <div 
            className="loading-progress-fill" 
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>

      {/* Subtle Mathematical Grid Overlay */}
      <div className="lab-grid-bg" aria-hidden="true" />

      {/* Navigation Header */}
      <div className="navigation-root">
        <Navigation onOpenDemo={handleOpenDemo} />
      </div>

      {/* Main Storytelling Content */}
      <main id="main-content">
        {/* 1. Fullscreen Cinematic Hero Section */}
        <Hero onOpenDemo={handleOpenDemo} />

        {/* 2. Scroll-Driven Transformation Pipeline */}
        <ScrollIntro />

        {/* 3. The Problem: Biomedical Data Bottlenecks */}
        <ProblemSection />

        {/* 4. Our Approach: Classical + Quantum Hybrid Architecture */}
        <ApproachSection />

        {/* 5. Quantum Visualization: Bloch Sphere & Circuit Simulator */}
        <QuantumVisualization />

        {/* 6. Medical Data Modalities: 5 Research Modules */}
        <MedicalDataSection onSelectModuleDemo={handleOpenDemo} />

        {/* 7. Privacy, Interpretability & Scientific Responsibility */}
        <ExplainabilitySection />

        {/* 8. Controlled Research Experiment Benchmark Dashboard */}
        <ExperimentPreview />

        {/* 9. Dramatic Scroll Transition to Interactive Platform */}
        <DemoTransition onOpenDemo={handleOpenDemo} />
      </main>

      {/* 10. Final Research Manifesto Statement & Credentials */}
      <div className="footer-root">
        <Footer onOpenDemo={handleOpenDemo} />
      </div>

      {/* Full-Screen Interactive Clinical Quantum Inference Workbench */}
      <InteractiveDemoModal 
        isOpen={isDemoOpen} 
        onClose={handleCloseDemo} 
      />
    </div>
  );
}

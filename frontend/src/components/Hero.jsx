import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Play, Sparkles, Binary, ShieldAlert, Cpu } from 'lucide-react';
import heroArtwork from '../assets/quantum_medical_hero.jpg';
import '../styles/hero.css';

export default function Hero({ onOpenDemo }) {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [telemetry, setTelemetry] = useState({
    statePhase: '0.785 rad',
    entropy: '1.42 bits',
    fidelity: '99.82%'
  });

  // Interactive Quantum Particle Wave Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for quantum field simulation
    const particleCount = Math.min(width > 768 ? 90 : 45, 120);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005
    }));

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let step = 0;
    const render = () => {
      step++;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines in the background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;

      // Draw particles and wave connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.speed;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interactive mouse repulsion/entanglement
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          p.x -= (dx / dist) * 0.8;
          p.y -= (dy / dist) * 0.8;
        }

        // Draw particle with quantum phase oscillation
        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        ctx.fillStyle = `rgba(0, 240, 255, ${currentAlpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with subtle quantum entanglement filaments
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distSq = (p.x - p2.x) ** 2 + (p.y - p2.y) ** 2;
          if (distSq < 130 * 130) {
            const lineAlpha = (1 - Math.sqrt(distSq) / 130) * 0.12;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="hero-section" id="hero">
      {/* Background Interactive Quantum Particle Simulation */}
      <canvas ref={canvasRef} className="hero-particle-canvas" />

      <div className="hero-container">
        {/* Top Laboratory Metadata Eyebrow */}
        <div className="hero-eyebrow-wrapper">
          <span className="science-tag cyan">
            <span className="tag-dot"></span>
            HYBRID QUANTUM MACHINE LEARNING // RESEARCH PLATFORM
          </span>
          <span className="hero-date-badge mono">
            EXP-VQC-2026.4 // CLINICAL PROTOCOL
          </span>
        </div>

        {/* Main Editorial Headline */}
        <div className="hero-headline-block">
          <h1 className="hero-main-title">
            WHEN MEDICINE <br />
            <span className="title-gradient">MEETS QUANTUM</span> <br />
            COMPUTING.
          </h1>
          <p className="hero-lead-text">
            A hybrid quantum machine learning platform for exploring earlier, smarter 
            and more explainable disease detection. Transforming high-dimensional medical 
            manifolds into parameterized Hilbert space representations.
          </p>
        </div>

        {/* Dual Call-To-Action Buttons */}
        <div className="hero-cta-group">
          <a href="#pipeline" className="cta-button primary hero-btn">
            <span>EXPLORE THE PROJECT</span>
            <ArrowDown size={15} />
          </a>
          <button 
            id="hero-view-demo-btn"
            className="cta-button secondary hero-btn"
            onClick={onOpenDemo}
          >
            <Play size={14} fill="currentColor" />
            <span>VIEW DEMO</span>
          </button>
        </div>

        {/* Hero Visual: Sophisticated Research Artwork with Telemetry HUD */}
        <div className="hero-visual-frame">
          <div className="visual-hud-header">
            <div className="hud-left">
              <span className="hud-status-led"></span>
              <span className="hud-title mono">FIG 1.0 // QUANTUM-ANATOMICAL COHERENCE MANIFOLD</span>
            </div>
            <div className="hud-telemetry mono">
              <span>STATE: |ψ(x)⟩</span>
              <span>DIM: 2⁴ HILBERT</span>
              <span>FIDELITY: 99.8%</span>
            </div>
          </div>

          <div className="visual-image-wrapper">
            {/* Low-res / Loading placeholder backdrop */}
            {!imageLoaded && (
              <div className="visual-placeholder-shimmer">
                <div className="shimmer-scanner"></div>
              </div>
            )}
            <img 
              src={heroArtwork} 
              alt="Scientific visualization: Point-cloud anatomical head and neural architecture converging with quantum wave packets" 
              className={`hero-artwork-img ${imageLoaded ? 'img-loaded' : ''}`}
              loading="eager"
              onLoad={() => setImageLoaded(true)}
            />
            {/* Overlay Grid & Reticle Graphics */}
            <div className="hud-reticle top-left"></div>
            <div className="hud-reticle top-right"></div>
            <div className="hud-reticle bottom-left"></div>
            <div className="hud-reticle bottom-right"></div>

            {/* Scientific Callout Pins */}
            <div className="scientific-pin pin-1">
              <div className="pin-indicator"></div>
              <div className="pin-tooltip mono">
                <span className="pin-label">NEURAL PROJECTION</span>
                <span className="pin-val">W_l · U_Φ(x)|0⟩</span>
              </div>
            </div>

            <div className="scientific-pin pin-2">
              <div className="pin-indicator"></div>
              <div className="pin-tooltip mono">
                <span className="pin-label">PHASE INTERFERENCE</span>
                <span className="pin-val">exp(iθ_j Z_j Z_k)</span>
              </div>
            </div>
          </div>

          <div className="visual-hud-footer mono">
            <div className="footer-metric">
              <span className="label">FEATURE ENCODING:</span>
              <span className="val">ZZ-Pauli Expansion</span>
            </div>
            <div className="footer-metric">
              <span className="label">ENTANGLEMENT DEPTH:</span>
              <span className="val">2-Qubit Full Mesh</span>
            </div>
            <div className="footer-metric">
              <span className="label">MEASUREMENT OBSERVABLE:</span>
              <span className="val">Hermitian Pauli-Z Register</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

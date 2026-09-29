import React, { useState, useEffect, useRef } from 'react';
import { PIPELINE_STAGES } from '../data/platformData';
import { ArrowRight, CheckCircle2, ChevronRight, Activity, Layers, Cpu, Compass } from 'lucide-react';
import '../styles/scroll-intro.css';

export default function ScrollIntro() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const stageRefs = useRef([]);

  // Scroll spy for progressive reveal
  useEffect(() => {
    const observers = [];
    stageRefs.current.forEach((el, index) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStageIndex(index);
            }
          });
        },
        { threshold: 0.45, rootMargin: '-10% 0px -20% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  const activeStage = PIPELINE_STAGES[activeStageIndex];

  return (
    <section className="scroll-intro-section" id="pipeline">
      <div className="section-wrapper">
        {/* Editorial Section Header */}
        <div className="section-header text-center">
          <span className="section-eyebrow">// SECTION 01: TRANSFORMATION ARCHITECTURE</span>
          <h2 className="section-title">FROM CLINICAL SPECIMEN TO QUANTUM OBSERVABLE.</h2>
          <p className="section-subtitle">
            Trace the mathematical trajectory of complex pathology as it transitions 
            from physical biomedical tissue to high-dimensional Hilbert space states.
          </p>
        </div>

        {/* Interactive Sticky Timeline & Transformation Stage Showcase */}
        <div className="pipeline-layout">
          {/* Left Column: Interactive Transformation Scrubber */}
          <div className="pipeline-nav-col">
            <div className="pipeline-nav-sticky">
              <div className="pipeline-rail-track">
                <div 
                  className="pipeline-rail-progress"
                  style={{ height: `${((activeStageIndex + 1) / PIPELINE_STAGES.length) * 100}%` }}
                ></div>
              </div>

              <div className="pipeline-steps-list">
                {PIPELINE_STAGES.map((st, idx) => (
                  <button
                    key={st.id}
                    className={`pipeline-step-trigger ${idx === activeStageIndex ? 'is-active' : ''} ${idx < activeStageIndex ? 'is-passed' : ''}`}
                    onClick={() => {
                      setActiveStageIndex(idx);
                      stageRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    <span className="step-num mono">{st.step}</span>
                    <div className="step-info">
                      <span className="step-label">{st.name}</span>
                      <span className="step-sub mono">{st.subtitle.split('&')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Live Transformation Vector Readout Box */}
              <div className="live-vector-card mono">
                <div className="vector-card-header">
                  <span className="live-tag">LIVE STATE</span>
                  <span className="vector-dim">STAGE [{activeStage.step}/06]</span>
                </div>
                <div className="vector-math-block">
                  <code>{activeStage.math}</code>
                </div>
                <div className="vector-readout-text">
                  {activeStage.readout}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Progressive Transformation Cards */}
          <div className="pipeline-cards-col">
            {PIPELINE_STAGES.map((st, idx) => (
              <div
                key={st.id}
                ref={(el) => (stageRefs.current[idx] = el)}
                className={`transformation-card ${idx === activeStageIndex ? 'card-focused' : ''}`}
              >
                <div className="card-top-bar mono">
                  <span className="badge-step">PHASE {st.step}</span>
                  <span className="badge-name">{st.id.toUpperCase()}</span>
                </div>

                <h3 className="card-heading">{st.name}</h3>
                <p className="card-sub-lead mono">{st.subtitle}</p>
                <p className="card-description">{st.description}</p>

                
                {/* Key Research Indicators */}
                <div className="indicators-grid">
                  {st.indicators.map((ind, i) => (
                    <div key={i} className="indicator-pill mono">
                      <span className="ind-bullet"></span>
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>

                {/* Diagnostic State Telemetry */}
                <div className="card-footer-telemetry mono">
                  <span className="telemetry-key">SYSTEM TELEMETRY:</span>
                  <span className="telemetry-val">{st.readout}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

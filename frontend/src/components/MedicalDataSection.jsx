import React, { useState } from 'react';
import { MEDICAL_MODULES } from '../data/platformData';
import { ArrowUpRight, Check, Activity, Sparkles } from 'lucide-react';
import '../styles/medical-data.css';

export default function MedicalDataSection({ onSelectModuleDemo }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="medical-data-section" id="modalities">
      <div className="section-wrapper">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">// SECTION 05: RESEARCH MODALITIES</span>
          <h2 className="section-title">ENGINEERED FOR MULTI-SCALE PATHOLOGY.</h2>
          <p className="section-subtitle">
            Five specialized quantum processing modules designed to isolate elusive pre-symptomatic 
            disease signatures across spatial, temporal and molecular clinical modalities.
          </p>
        </div>

        {/* 5 Research Module Cards Grid */}
        <div className="medical-modules-grid">
          {MEDICAL_MODULES.map((module, idx) => (
            <div
              key={module.id}
              className={`medical-research-module ${hoveredCard === module.id ? 'is-hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(module.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Top Header Strip */}
              <div className="module-top-strip mono">
                <div className="mod-icon-tag">
                  <span className="mod-emoji">{module.icon}</span>
                  <span className="mod-id">MOD-{idx + 1}</span>
                </div>
                <span className="mod-dim">{module.dimension}</span>
              </div>

              {/* Title & Target */}
              <div className="module-main-info">
                <h3 className="module-title">{module.title}</h3>
                <div className="mod-target-row mono">
                  <span className="target-lbl">PRIMARY TARGET:</span>
                  <span className="target-val">{module.target}</span>
                </div>
                <div className="mod-modality-row mono">
                  <span className="mod-lbl">INPUT:</span>
                  <span className="mod-val">{module.modality}</span>
                </div>
              </div>

              {/* Quantum Mechanism */}
              <div className="module-quantum-mechanism">
                <span className="mechanism-eyebrow mono">QUANTUM KERNEL MECHANISM:</span>
                <p className="mechanism-text">{module.quantumAdvantage}</p>
              </div>

              {/* Features Extracted */}
              <div className="module-features-list">
                <span className="features-head mono">PARAMETERIZED CHANNELS:</span>
                <div className="features-tags-wrap mono">
                 {(module.features || []).map((feat, fIdx) => (
                    <span key={fIdx} className="feature-pill">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benchmark Delta Notice */}
              <div className="module-benchmark-footer mono">
                <div className="benchmark-text">
                  <span className="perf-label">BENCHMARK DELTA:</span>
                  <span className="perf-val">{module.baselineDelta}</span>
                </div>
                <div className="benchmark-dataset">
                  <span>COHORT: {module.dataset}</span>
                </div>
              </div>

              {/* Corner Decorative Reticles */}
              <div className="card-reticle top-left"></div>
              <div className="card-reticle bottom-right"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

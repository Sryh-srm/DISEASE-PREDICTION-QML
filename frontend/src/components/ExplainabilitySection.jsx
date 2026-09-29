import React from 'react';
import { ShieldCheck, Eye, Compass, FileCheck, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { HYBRID_COMMITTEE_METRICS } from '../data/platformData';
import '../styles/explainability.css';

export default function ExplainabilitySection() {
  const transparencyPillars = [
    {
      icon: <Lock size={20} />,
      title: "Exploring Privacy-Preserving Representations",
      description: "Unitary feature encodings map raw sensitive scans into non-invertible quantum phase superpositions. The raw anatomical geometry cannot be reconstructed without knowing the private parameterized ansatz key."
    },
    {
      icon: <Eye size={20} />,
      title: "Quantum Shapley Attributions",
      description: "Rather than treating the quantum model as an impenetrable black box, we evaluate Pauli Hamiltonian operator derivatives to quantify each biomarker's exact percentage contribution to the risk score."
    },
    {
      icon: <Compass size={20} />,
      title: "Comparing Against Classical Baselines",
      description: "We make no premature claims of unverified quantum supremacy. Every model is rigorously tested against Scikit-Learn Random Forests and 3D ResNets across identical blind patient cohorts."
    },
    {
      icon: <FileCheck size={20} />,
      title: "Auditable Research Protocols",
      description: "Every simulated circuit execution produces reproducible run logs, quantum state fidelity metrics, and expectation confidence intervals compliant with clinical research standards."
    }
  ];

  return (
    <section className="explainability-section" id="explainability">
      <div className="section-wrapper">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">// SECTION 06: SCIENTIFIC INTEGRITY</span>
          <h2 className="section-title">NOT JUST A PREDICTION.</h2>
          <p className="section-subtitle">
            A diagnostic prediction without clinical interpretability is unsafe for medicine.
            We engineer quantum representations that prioritize explainability, privacy preservation,
            and transparent verification.
          </p>
        </div>

        {/* Diagnostic Pipeline Visual Flow */}
        <div className="explainable-pipeline-strip mono">
          <div className="pipeline-flow-step">
            <span className="p-step-num">01</span>
            <span className="p-step-title">Patient Data</span>
            <span className="p-step-sub">Raw Modality</span>
          </div>
          <div className="pipeline-arrow"><ArrowRight size={14} /></div>

          <div className="pipeline-flow-step">
            <span className="p-step-num">02</span>
            <span className="p-step-title">Feature Vector</span>
            <span className="p-step-sub">Continuous x ∈ ℝ⁴</span>
          </div>
          <div className="pipeline-arrow"><ArrowRight size={14} /></div>

          <div className="pipeline-flow-step step-quantum">
            <span className="p-step-num">03</span>
            <span className="p-step-title">Quantum State</span>
            <span className="p-step-sub">Hilbert Space |ψ(x)⟩</span>
          </div>
          <div className="pipeline-arrow"><ArrowRight size={14} /></div>

          <div className="pipeline-flow-step">
            <span className="p-step-num">04</span>
            <span className="p-step-title">Measurement</span>
            <span className="p-step-sub">Expectation ⟨Z_i⟩</span>
          </div>
          <div className="pipeline-arrow"><ArrowRight size={14} /></div>

          <div className="pipeline-flow-step step-prediction">
            <span className="p-step-num">05</span>
            <span className="p-step-title">Prediction</span>
            <span className="p-step-sub">Calibrated Risk</span>
          </div>
          <div className="pipeline-arrow"><ArrowRight size={14} /></div>

          <div className="pipeline-flow-step step-explain">
            <span className="p-step-num">06</span>
            <span className="p-step-title">Explanation</span>
            <span className="p-step-sub">Quantum Shapley Map</span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="transparency-grid">
          {transparencyPillars.map((pillar, idx) => (
            <div key={idx} className="research-card transparency-card">
              <div className="pillar-icon-box">
                {pillar.icon}
              </div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-desc">{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* Final ML + Hybrid Result Banner */}
        <div className="scientific-ethics-banner mono">
          <div className="ethics-tag">
            <span className="tag-dot"></span>
            FINAL ML + HYBRID RESULT
          </div>
          <p className="ethics-text">
            Accuracy: {HYBRID_COMMITTEE_METRICS.accuracy} • Precision: {HYBRID_COMMITTEE_METRICS.precision} • Recall: {HYBRID_COMMITTEE_METRICS.recall} • F1: {HYBRID_COMMITTEE_METRICS.f1}
          </p>
        </div>

        {/* Scientific Responsibility Callout Banner */}
        <div className="scientific-ethics-banner mono">
          <div className="ethics-tag">
            <span className="tag-dot"></span>
            RESEARCH DISCLOSURE & RIGOR
          </div>
          <p className="ethics-text">
            Notice: Current quantum implementations rely on statevector simulators and early NISQ devices.
            All clinical utility metrics represent exploratory research models designed to investigate
            potential quantum advantage boundaries, not definitive diagnostic claims.
          </p>
        </div>
      </div>
    </section>
  );
}

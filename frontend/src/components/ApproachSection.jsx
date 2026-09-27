import React, { useState } from 'react';
import { Network, Cpu, GitMerge, ArrowDown, Check, Zap } from 'lucide-react';
import '../styles/approach.css';

export default function ApproachSection() {
  const [activeTab, setActiveTab] = useState('hybrid'); // 'classical', 'quantum', 'hybrid'

  return (
    <section className="approach-section" id="approach">
      <div className="section-wrapper">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">// SECTION 03: SYSTEM ARCHITECTURE</span>
          <h2 className="section-title">CLASSICAL + QUANTUM.</h2>
          <p className="section-subtitle">
            Neither classical AI nor quantum computing alone can solve early disease detection today. 
            Our platform bridges both paradigms into a cohesive hybrid pipeline.
          </p>
        </div>

        {/* Interactive Architecture Selector */}
        <div className="architecture-mode-tabs mono">
          <button 
            className={`arch-tab-btn ${activeTab === 'classical' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('classical')}
          >
            <span>01 // CLASSICAL ML</span>
          </button>
          <button 
            className={`arch-tab-btn ${activeTab === 'quantum' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('quantum')}
          >
            <span>02 // PURE QUANTUM</span>
          </button>
          <button 
            className={`arch-tab-btn ${activeTab === 'hybrid' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('hybrid')}
          >
            <span className="sparkle-dot"></span>
            <span>03 // HYBRID MODEL (OURS)</span>
          </button>
        </div>

        {/* Visual Architectural Comparison Grid */}
        <div className="approach-interactive-grid">
          {/* Column 1: Classical ML */}
          <div className={`arch-column ${activeTab === 'classical' ? 'column-spotlight' : ''}`}>
            <div className="column-badge mono">CONVENTIONAL PARADIGM</div>
            <h3 className="column-title">Classical Machine Learning</h3>
            <p className="column-desc">
              Proven for large image patches and structured clinical tables, but fundamentally bounded by Euclidean metric assumptions.
            </p>

            <div className="arch-flow-diagram">
              <div className="flow-step">
                <span className="flow-step-label mono">STAGE 01</span>
                <span className="flow-step-title">Raw Patient Data</span>
                <span className="flow-step-sub mono">Images & Blood Tables</span>
              </div>
              <div className="flow-connector"><ArrowDown size={14} /></div>
              
              <div className="flow-step">
                <span className="flow-step-label mono">STAGE 02</span>
                <span className="flow-step-title">Preprocessing</span>
                <span className="flow-step-sub mono">Normalization & Scaling</span>
              </div>
              <div className="flow-connector"><ArrowDown size={14} /></div>

              <div className="flow-step">
                <span className="flow-step-label mono">STAGE 03</span>
                <span className="flow-step-title">Feature Extraction</span>
                <span className="flow-step-sub mono">ResNet / Classical CNN</span>
              </div>
              <div className="flow-connector"><ArrowDown size={14} /></div>

              <div className="flow-step terminal-step">
                <span className="flow-step-label mono">STAGE 04</span>
                <span className="flow-step-title">Classical Model</span>
                <span className="flow-step-sub mono">Random Forest / MLP</span>
              </div>
            </div>

            <div className="column-verdict mono">
              <span className="verdict-label">BOTTLENECK:</span>
              <span className="verdict-text">Polynomial scaling; vulnerable to small-sample noise</span>
            </div>
          </div>

          {/* Column 2: Pure Quantum ML */}
          <div className={`arch-column ${activeTab === 'quantum' ? 'column-spotlight' : ''}`}>
            <div className="column-badge mono">PURE THEORETICAL</div>
            <h3 className="column-title">Quantum Machine Learning</h3>
            <p className="column-desc">
              Immense mathematical expressive power, but incapable of ingesting raw high-dimensional voxel streams on NISQ hardware.
            </p>

            <div className="arch-flow-diagram">
              <div className="flow-step">
                <span className="flow-step-label mono">STAGE 01</span>
                <span className="flow-step-title">Normalized Features</span>
                <span className="flow-step-sub mono">Low-D Inputs</span>
              </div>
              <div className="flow-connector"><ArrowDown size={14} /></div>

              <div className="flow-step">
                <span className="flow-step-label mono">STAGE 02</span>
                <span className="flow-step-title">Feature Encoding</span>
                <span className="flow-step-sub mono">Angle & Amplitude Enc</span>
              </div>
              <div className="flow-connector"><ArrowDown size={14} /></div>

              <div className="flow-step">
                <span className="flow-step-label mono">STAGE 03</span>
                <span className="flow-step-title">Quantum Feature Map</span>
                <span className="flow-step-sub mono">ZZ-Entanglement U_Φ(x)</span>
              </div>
              <div className="flow-connector"><ArrowDown size={14} /></div>

              <div className="flow-step">
                <span className="flow-step-label mono">STAGE 04</span>
                <span className="flow-step-title">Quantum Circuit</span>
                <span className="flow-step-sub mono">Ansatz Layers W(θ)</span>
              </div>
              <div className="flow-connector"><ArrowDown size={14} /></div>

              <div className="flow-step terminal-step">
                <span className="flow-step-label mono">STAGE 05</span>
                <span className="flow-step-title">Measurement</span>
                <span className="flow-step-sub mono">Pauli-Z Expectation</span>
              </div>
            </div>

            <div className="column-verdict mono">
              <span className="verdict-label">BOTTLENECK:</span>
              <span className="verdict-text">Input loading barrier; barren plateaus if unconstrained</span>
            </div>
          </div>

          {/* Column 3: Hybrid Synthesis (Our Approach) */}
          <div className={`arch-column hybrid-column ${activeTab === 'hybrid' ? 'column-spotlight' : ''}`}>
            <div className="column-badge cyan mono">OUR HYBRID PLATFORM</div>
            <h3 className="column-title">Hybrid Quantum-Classical Synthesis</h3>
            <p className="column-desc">
              Classical networks compress clinical inputs into calibrated continuous manifolds; 
              quantum circuits explore exponential Hilbert spaces to isolate subtle disease correlations.
            </p>

            <div className="hybrid-fusion-card">
              <div className="fusion-block classical-block">
                <div className="fusion-header mono">01 // CLASSICAL PREPROCESSING</div>
                <div className="fusion-body">
                  <span>Convolutional autoencoders & PCA dimensionality reduction compress raw 3D scans to vector [x₁, x₂, x₃, x₄].</span>
                </div>
              </div>

              <div className="fusion-operator mono">
                <div className="operator-line"></div>
                <span className="operator-badge">+</span>
                <div className="operator-line"></div>
              </div>

              <div className="fusion-block quantum-block">
                <div className="fusion-header mono">02 // QUANTUM REPRESENTATION</div>
                <div className="fusion-body">
                  <span>Parameterized ZZFeatureMap embeds vectors into a 16-dimensional Hilbert space with CNOT entanglement and VQC ansatz.</span>
                </div>
              </div>

              <div className="fusion-operator mono">
                <div className="operator-line"></div>
                <span className="operator-badge">+</span>
                <div className="operator-line"></div>
              </div>

              <div className="fusion-block hybrid-block">
                <div className="fusion-header mono">03 // CLASSICAL PREDICTION & EXPLAINABILITY</div>
                <div className="fusion-body">
                  <span>Expectation values ⟨Z_i⟩ decode through classical sigmoid classifiers to yield calibrated early disease risk and Shapley attribution maps.</span>
                </div>
              </div>
            </div>

            <div className="column-verdict cyan mono">
              <span className="verdict-label">SYNTHESIS ADVANTAGE:</span>
              <span className="verdict-text">Overcomes NISQ input barrier while extracting high-order quantum correlations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

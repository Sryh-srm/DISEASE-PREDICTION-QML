import React from 'react';
import { ArrowRight, Terminal, ShieldAlert, Heart, Cpu } from 'lucide-react';
import '../styles/footer.css';

export default function Footer({ onOpenDemo }) {
  return (
    <footer className="site-footer">
      <div className="section-wrapper">
        {/* Major Manifesto Statement */}
        <div className="footer-manifesto-block">
          <span className="science-tag cyan">
            <span className="tag-dot"></span>
            RESEARCH MANIFESTO // EXP-2026
          </span>

          <h2 className="footer-statement-headline">
            RESEARCHING THE POSSIBILITY <br />
            OF QUANTUM-ENHANCED <br />
            MEDICAL INTELLIGENCE.
          </h2>

          <p className="footer-statement-lead">
            Exploring how high-dimensional Hilbert space embeddings can detect pathology 
            before structural tissue damage becomes irreversible.
          </p>

          <div className="footer-cta-wrapper">
            <button 
              id="footer-enter-platform-btn"
              className="cta-button primary footer-cta"
              onClick={onOpenDemo}
            >
              <span>ENTER PLATFORM</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Project Metadata & Credentials Grid */}
        <div className="footer-info-grid mono">
          <div className="info-column">
            <span className="col-title">PROJECT SPECIFICATION</span>
            <span className="item">Hybrid Quantum Machine Learning Platform</span>
            <span className="item">Early Disease Detection &amp; Oncology Surveillance</span>
            <span className="item">Research Prototype // Open Clinical Exploration</span>
          </div>

          <div className="info-column">
            <span className="col-title">QUANTUM KERNEL SYSTEM</span>
            <span className="item">Ansatz: ZZFeatureMap + RealAmplitudes</span>
            <span className="item">Simulator: 4-Qubit Statevector (Noise-Mitigated)</span>
            <span className="item">Measurement: Hermitian Pauli-Z Observable Basis</span>
          </div>

          <div className="info-column">
            <span className="col-title">SCIENTIFIC DIRECTIVES</span>
            <span className="item">Explainable AI (Quantum Shapley Decomposition)</span>
            <span className="item">Privacy-Preserving Unitary State Encoding</span>
            <span className="item">Empirically Verified Against Classical RF &amp; ResNet</span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Ethics Disclaimer */}
        <div className="footer-bottom-bar mono">
          <div className="bottom-left">
            <span>© 2026 HYBRID QUANTUM MED-NET // RESEARCH DIVISION</span>
          </div>
          <div className="bottom-right">
            <span>FOR INVESTIGATIONAL RESEARCH PURPOSES ONLY // NOT AN FDA-APPROVED DIAGNOSTIC DEVICE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

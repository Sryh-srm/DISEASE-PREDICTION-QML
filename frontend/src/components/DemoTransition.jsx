import React from 'react';
import { ArrowRight, Play, Terminal, Cpu } from 'lucide-react';
import '../styles/demo-transition.css';

export default function DemoTransition({ onOpenDemo }) {
  return (
    <section className="demo-transition-section" id="transition">
      <div className="transition-backdrop-mesh"></div>

      <div className="transition-content-container">
        <div className="transition-kicker mono">
          <span className="kicker-line"></span>
          <span>TRANSITION TO CLINICAL WORKBENCH</span>
          <span className="kicker-line"></span>
        </div>

        <h2 className="transition-title">
          THE THEORY ENDS HERE.
        </h2>

        <p className="transition-subhead">
          LET'S RUN THE EXPERIMENT.
        </p>

        <p className="transition-lead">
          Execute real-time quantum state transformations, parameterize ansatz rotation angles, 
          and observe diagnostic expectation values across verified synthetic patient cohorts.
        </p>

        <div className="transition-cta-wrapper">
          <button 
            id="transition-open-platform-btn"
            className="cta-button primary transition-cta"
            onClick={onOpenDemo}
          >
            <span>OPEN THE PLATFORM</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Live Simulator Heartbeat */}
        <div className="transition-hardware-status mono">
          <span className="status-ping"></span>
          <span>STATEVECTOR VIRTUAL QUANTUM PROCESSOR READY // 4 QUBITS REGISTERED</span>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Sliders, Play, Info, Sparkles, Check, ChevronRight } from 'lucide-react';
import manifoldArt from '../assets/quantum_manifold_mapping.jpg';
import '../styles/quantum-vis.css';

export default function QuantumVisualization() {
  // Classical feature vector values [0, π]
  const [vector, setVector] = useState([0.84, 1.45, 2.10, 0.65]);
  const [activePreset, setActivePreset] = useState('lung'); // 'lung', 'neuro', 'blood'
  
  // Bloch sphere polar and azimuthal angles (derived from feature x1, x2)
  const [theta, setTheta] = useState(vector[0]); // polar
  const [phi, setPhi] = useState(vector[1]);   // azimuthal

  // Active circuit step inspection
  const [circuitStep, setCircuitStep] = useState(2); // 0: Init, 1: Hadamard, 2: Feature Map, 3: Entanglement, 4: Measurement

  const canvasRef = useRef(null);

  // Update angles when vector changes
  useEffect(() => {
    setTheta(vector[0]);
    setPhi(vector[1]);
  }, [vector]);

  // Presets
  const handlePreset = (type) => {
    setActivePreset(type);
    if (type === 'lung') setVector([0.84, 1.45, 2.65, 0.72]);
    if (type === 'neuro') setVector([1.25, 2.10, 0.45, 1.82]);
    if (type === 'blood') setVector([0.35, 0.62, 0.41, 0.58]);
  };

  // Real-time quantum amplitude calculation for qubit q0
  const alpha = Math.cos(theta / 2);
  const beta = Math.sin(theta / 2);
  const prob0 = (alpha * alpha * 100).toFixed(1);
  const prob1 = (beta * beta * 100).toFixed(1);

  // Interactive 3D Bloch Sphere Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 360);

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0.25;
    let rotY = 0.4;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const radius = Math.min(width, height) * 0.36;
    const cx = width / 2;
    const cy = height / 2;

    const project = (x, y, z) => {
      // Rotate around X
      let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
      let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
      // Rotate around Y
      let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

      const fov = 400;
      const scale = fov / (fov + z2);
      return {
        x: cx + x2 * scale,
        y: cy + y1 * scale,
        z: z2
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background radial glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.5);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw equator ring (Z = 0)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        const pt = project(radius * Math.cos(a), 0, radius * Math.sin(a));
        if (a === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Draw vertical meridian ring (X = 0)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        const pt = project(0, radius * Math.cos(a), radius * Math.sin(a));
        if (a === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Draw coordinate axes
      const axisLen = radius * 1.35;
      const origin = project(0, 0, 0);
      const zAxis = project(0, -axisLen, 0); // |0> North Pole
      const zSouth = project(0, axisLen, 0); // |1> South Pole
      const xAxis = project(axisLen, 0, 0);
      const yAxis = project(0, 0, axisLen);

      // Z-axis (Computational Basis)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(zSouth.x, zSouth.y);
      ctx.lineTo(zAxis.x, zAxis.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels for |0> and |1>
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('|0⟩', zAxis.x - 10, zAxis.y - 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('|1⟩', zSouth.x - 10, zSouth.y + 18);

      // Current State Vector |ψ⟩
      const sx = radius * Math.sin(theta) * Math.cos(phi);
      const sy = -radius * Math.cos(theta); // -cos because Z up is -Y in canvas
      const sz = radius * Math.sin(theta) * Math.sin(phi);

      const statePt = project(sx, sy, sz);

      // Vector Arrow line
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(statePt.x, statePt.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // State point head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(statePt.x, statePt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // State label
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText('|ψ⟩', statePt.x + 8, statePt.y - 8);

      // Projection shadow on equator (phase indicator)
      const projEquator = project(sx, 0, sz);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(statePt.x, statePt.y);
      ctx.lineTo(projEquator.x, projEquator.y);
      ctx.lineTo(origin.x, origin.y);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animId);
    };
  }, [theta, phi]);

  return (
    <section className="quantum-vis-section" id="quantum-vis">
      <div className="section-wrapper">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">// SECTION 04: CORE VISUALIZATION</span>
          <h2 className="section-title">FROM VECTOR TO QUANTUM STATE.</h2>
          <p className="section-subtitle">
            Observe how classical biomarker values modulate unitary rotations, 
            transforming 1D scalar measurements into entangled multi-qubit statevectors.
          </p>
        </div>

        {/* Feature Presets Selector */}
        <div className="preset-bar">
          <span className="preset-label mono">SELECT CLINICAL FEATURE VECTOR:</span>
          <div className="preset-btn-group mono">
            <button 
              className={`preset-btn ${activePreset === 'lung' ? 'is-active' : ''}`}
              onClick={() => handlePreset('lung')}
            >
              Pulmonary CT Nodule
            </button>
            <button 
              className={`preset-btn ${activePreset === 'neuro' ? 'is-active' : ''}`}
              onClick={() => handlePreset('neuro')}
            >
              Brain Amyloid-PET
            </button>
            <button 
              className={`preset-btn ${activePreset === 'blood' ? 'is-active' : ''}`}
              onClick={() => handlePreset('blood')}
            >
              Multi-Analyte Liquid Biopsy
            </button>
          </div>
        </div>

        {/* Interactive Visualization Main Canvas Grid */}
        <div className="quantum-workbench-grid">
          {/* Left Column: Interactive 3D Bloch Sphere */}
          <div className="research-card bloch-workbench-card">
            <div className="card-hud-bar mono">
              <span>BLOCH SPHERE // QUBIT q₀ STATE SPACE</span>
              <span className="hud-drag-hint">DRAG TO ORBIT</span>
            </div>

            <div className="bloch-canvas-container">
              <canvas ref={canvasRef} className="bloch-canvas" />
            </div>

            {/* Live Bloch Telemetry */}
            <div className="bloch-telemetry-panel mono">
              <div className="angle-readout">
                <div className="angle-col">
                  <span className="lbl">POLAR ANGLE θ:</span>
                  <span className="val">{theta.toFixed(3)} rad ({((theta * 180) / Math.PI).toFixed(1)}°)</span>
                </div>
                <div className="angle-col">
                  <span className="lbl">AZIMUTH PHASE φ:</span>
                  <span className="val">{phi.toFixed(3)} rad ({((phi * 180) / Math.PI).toFixed(1)}°)</span>
                </div>
              </div>

              <div className="prob-meter-row">
                <div className="meter-col">
                  <div className="meter-head">
                    <span>|0⟩ GROUND: {prob0}%</span>
                    <span>α = cos(θ/2)</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill fill-cyan" style={{ width: `${prob0}%` }}></div>
                  </div>
                </div>

                <div className="meter-col">
                  <div className="meter-head">
                    <span>|1⟩ EXCITED: {prob1}%</span>
                    <span>β = e^(iφ)sin(θ/2)</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill fill-emerald" style={{ width: `${prob1}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Vector Modulation & Circuit Simulator */}
          <div className="research-card circuit-workbench-card">
            <div className="card-hud-bar mono">
              <span>FEATURE VECTOR ENCODING [x₁, x₂, x₃, x₄]</span>
              <span>ZZ-FEATURE MAP U_Φ(x)</span>
            </div>

            {/* Sliders for the 4 classical features */}
            <div className="sliders-cluster">
              {vector.map((val, idx) => (
                <div key={idx} className="vector-slider-item">
                  <div className="slider-label-row mono">
                    <span className="feature-code">x_{idx + 1} // {['Density', 'Vessel Coherence', 'Phase Entropy', 'Hounsfield'][idx]}</span>
                    <span className="feature-val">{val.toFixed(2)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI.toFixed(2)}
                    step="0.02"
                    value={val}
                    onChange={(e) => {
                      const next = [...vector];
                      next[idx] = parseFloat(e.target.value);
                      setVector(next);
                      setActivePreset('custom');
                    }}
                    className="quantum-slider"
                  />
                </div>
              ))}
            </div>

            {/* 4-Qubit Circuit Visualizer */}
            <div className="circuit-diagram-container">
              <div className="circuit-title mono">
                <span>4-QUBIT VARIATIONAL QUANTUM CLASSIFIER CIRCUIT</span>
                <span className="circuit-step-badge">LAYER: ZZ-FEATURE MAP + ANSATZ</span>
              </div>

              <div className="circuit-board">
                {/* Qubit Wire 0 */}
                <div className="qubit-wire">
                  <span className="wire-label mono">q₀ |0⟩</span>
                  <div className="wire-line">
                    <div className="gate-box gate-h">H</div>
                    <div className="gate-box gate-rz">Rz(x₁)</div>
                    <div className="gate-box gate-ry">Ry(θ₀)</div>
                    <div className="gate-cnot-ctrl"></div>
                    <div className="gate-box gate-m">M</div>
                  </div>
                </div>

                {/* Qubit Wire 1 */}
                <div className="qubit-wire">
                  <span className="wire-label mono">q₁ |0⟩</span>
                  <div className="wire-line">
                    <div className="gate-box gate-h">H</div>
                    <div className="gate-box gate-rz">Rz(x₂)</div>
                    <div className="gate-box gate-ry">Ry(θ₁)</div>
                    <div className="gate-cnot-target"></div>
                    <div className="gate-box gate-m">M</div>
                  </div>
                </div>

                {/* Qubit Wire 2 */}
                <div className="qubit-wire">
                  <span className="wire-label mono">q₂ |0⟩</span>
                  <div className="wire-line">
                    <div className="gate-box gate-h">H</div>
                    <div className="gate-box gate-rz">Rz(x₃)</div>
                    <div className="gate-box gate-ry">Ry(θ₂)</div>
                    <div className="gate-cnot-ctrl"></div>
                    <div className="gate-box gate-m">M</div>
                  </div>
                </div>

                {/* Qubit Wire 3 */}
                <div className="qubit-wire">
                  <span className="wire-label mono">q₃ |0⟩</span>
                  <div className="wire-line">
                    <div className="gate-box gate-h">H</div>
                    <div className="gate-box gate-rz">Rz(x₄)</div>
                    <div className="gate-box gate-ry">Ry(θ₃)</div>
                    <div className="gate-cnot-target"></div>
                    <div className="gate-box gate-m">M</div>
                  </div>
                </div>
              </div>

              <div className="circuit-note mono">
                <Info size={13} />
                <span>Notice: Gates Rz(x_i) encode clinical scalars; CNOTs entangle qubit pairs to resolve non-linear pathology interactions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplementary Scientific Manifold Figure */}
        <div className="manifold-scientific-strip">
          <div className="strip-image-col">
            <img 
              src={manifoldArt} 
              alt="Scientific research diagram: Quantum-enhanced volumetric reconstruction with multi-qubit Bloch vectors" 
              className="strip-img"
              loading="lazy"
            />
          </div>
          <div className="strip-text-col">
            <span className="science-tag cyan">FIGURE 2.0 // MULTI-QUBIT HILBERT SPACE EMBEDDING</span>
            <h3 className="strip-title">High-Order Entanglement Geometry</h3>
            <p className="strip-desc">
              Rather than assuming independence between organ systems or imaging voxels, 
              the quantum feature map U_Φ(x) maps continuous measurements onto 
              an entanglement graph G = (V, E). The joint quantum state |Ψ⟩ preserves 
              subtle phase relationships that remain invisible to Euclidean projection.
            </p>
            <div className="strip-meta mono">
              <span>REGISTER: N=4 TO N=8 QUBITS</span>
              <span>COHERENCE PROTOCOL: DYNAMIC DECOUPLING</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

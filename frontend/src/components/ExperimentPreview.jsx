import React, { useState } from 'react';

import { EXPERIMENT_BENCHMARKS } from '../data/platformData';

import { BarChart3, TrendingUp, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

import '../styles/experiment.css';

export default function ExperimentPreview() {
  const [activeMatrixTab, setActiveMatrixTab] = useState('quantum');

  const quantumAdvantage = EXPERIMENT_BENCHMARKS?.quantumAdvantage || {};
  const clinicalValidation = EXPERIMENT_BENCHMARKS?.clinicalValidation || {};
  const resourceEfficiency = EXPERIMENT_BENCHMARKS?.resourceEfficiency || {};

  /*
   * These are the documented benchmark results from the existing project
   * evaluation, not live prediction results.
   *
   * Hybrid Quantum Committee:
   * Accuracy  : 85.25%
   * Precision : 85.19%
   * Recall    : 82.14%
   * F1        : 83.64%
   *
   * Random Forest:
   * Accuracy  : 83.61%
   *
   * ROC-AUC is intentionally not displayed because the current backend
   * does not calculate or expose ROC-AUC.
   */
  const metrics = [
    {
      name: 'ACCURACY',
      classical: '83.61%',
      quantum: '85.25%',
      delta: '+1.64 pp'
    },
    {
      name: 'PRECISION',
      classical: '82.14%',
      quantum: '85.19%',
      delta: '+3.05 pp'
    },
    {
      name: 'RECALL',
      classical: '82.14%',
      quantum: '82.14%',
      delta: '0.00 pp'
    },
    {
      name: 'F1 SCORE',
      classical: '82.14%',
      quantum: '83.64%',
      delta: '+1.50 pp'
    }
  ];

  /*
   * The current backend does not expose confusion matrices.
   * Keep the visual panel, but explicitly state that these values are
   * unavailable rather than displaying fabricated clinical numbers.
   */
  const currentMatrix = {
    tp: 'N/A',
    fp: 'N/A',
    fn: 'N/A',
    tn: 'N/A'
  };

  return (
    <section className="experiment-section" id="experiment">
      <div className="section-wrapper">

        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">
            // SECTION 07: BENCHMARK SUITE
          </span>

          <h2 className="section-title">
            CONTROLLED MODEL EVALUATION.
          </h2>

          <p className="section-subtitle">
            Empirical evaluation of the hybrid quantum-classical heart disease
            prediction pipeline against classical machine learning baselines.
          </p>
        </div>

        {/* Benchmark Data Notice */}
        <div className="demo-data-alert mono">
          <span className="alert-badge">
            <span className="tag-dot"></span>
            RESEARCH BENCHMARKS
          </span>

          <span className="alert-text">
            Metrics shown here are results from the project's evaluation
            experiments. They are separate from live patient predictions.
          </span>
        </div>

        {/* Experiment Telemetry Board */}
        <div className="experiment-dashboard-frame">

          {/* Metadata Top Bar */}
          <div className="dashboard-meta-grid mono">

            <div className="meta-item">
              <span className="k">DATASET</span>
              <span className="v">
                Cleveland Heart Disease Dataset
              </span>
            </div>

            <div className="meta-item">
              <span className="k">CLASSICAL BASELINE</span>
              <span className="v">
                Random Forest
              </span>
            </div>

            <div className="meta-item">
              <span className="k">HYBRID ARCHITECTURE</span>
              <span className="v">
                Quantum + Classical Committee
              </span>
            </div>

            <div className="meta-item">
              <span className="k">QUANTUM CIRCUIT</span>
              <span className="v">
                {resourceEfficiency.qubitCount || 4} Qubits
              </span>
            </div>

          </div>

          {/* Core Analytics */}
          <div className="experiment-analytics-grid">

            {/* Left Column: Metric Comparison */}
            <div className="analytics-metrics-col">

              <div className="col-header mono">
                <span>MODEL EVALUATION METRICS</span>

                <span className="badge-demo mono">
                  OFFLINE EVALUATION
                </span>
              </div>

              <div className="metrics-table-wrapper">
                <table className="metrics-table mono">

                  <thead>
                    <tr>
                      <th>METRIC</th>
                      <th>CLASSICAL</th>
                      <th>HYBRID QUANTUM</th>
                      <th>DELTA</th>
                    </tr>
                  </thead>

                  <tbody>
                    {metrics.map((m, idx) => (
                      <tr key={idx}>
                        <td className="metric-name">
                          {m.name}
                        </td>

                        <td className="val-classical">
                          {m.classical}
                        </td>

                        <td className="val-quantum">
                          {m.quantum}
                        </td>

                        <td
                          className={`val-delta ${
                            m.delta.startsWith('+') ? 'pos' : ''
                          }`}
                        >
                          {m.delta}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* Additional Evaluation Information */}
              <div className="module-benchmark-footer mono">
                <div className="benchmark-text">
                  <span className="perf-label">
                    FEATURE SELECTION:
                  </span>

                  <span className="perf-val">
                    SelectKBest (k=4)
                  </span>
                </div>

                <div className="benchmark-dataset">
                  <span>
                    FEATURES: thal • thalach • ca • exang
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="analytics-visuals-col">

              <div className="col-header mono">
                <span>
                  EVALUATION STATUS
                </span>

                <span className="roc-legend">
                  <span className="leg-q">
                    ■ HYBRID QUANTUM
                  </span>

                  <span className="leg-c">
                    ■ CLASSICAL BASELINE
                  </span>
                </span>
              </div>

              {/* Evaluation Summary */}
              <div className="roc-chart-box">
                <div
                  style={{
                    height: '100%',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '18px',
                    textAlign: 'center',
                    padding: '24px'
                  }}
                >

                  <CheckCircle size={42} />

                  <div className="mono">
                    <div
                      style={{
                        fontSize: '14px',
                        letterSpacing: '0.08em',
                        marginBottom: '10px'
                      }}
                    >
                      HYBRID QUANTUM COMMITTEE
                    </div>

                    <div
                      style={{
                        fontSize: '34px',
                        fontWeight: 700
                      }}
                    >
                      85.25%
                    </div>

                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        opacity: 0.65
                      }}
                    >
                      EVALUATION ACCURACY
                    </div>
                  </div>

                  <div
                    className="mono"
                    style={{
                      fontSize: '10px',
                      opacity: 0.55,
                      maxWidth: '420px',
                      lineHeight: 1.6
                    }}
                  >
                    ROC-AUC is not displayed because the current backend
                    evaluation pipeline does not calculate or expose ROC-AUC.
                  </div>

                </div>
              </div>

              {/* Confusion Matrix Information */}
              <div className="matrix-inspection-panel">

                <div className="matrix-tab-bar mono">
                  <span>
                    CONFUSION MATRIX
                  </span>

                  <div className="matrix-toggle">

                    <button
                      className={`mat-btn ${
                        activeMatrixTab === 'quantum'
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() => setActiveMatrixTab('quantum')}
                    >
                      HYBRID QUANTUM
                    </button>

                    <button
                      className={`mat-btn ${
                        activeMatrixTab === 'classical'
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() => setActiveMatrixTab('classical')}
                    >
                      CLASSICAL
                    </button>

                  </div>
                </div>

                <div className="matrix-grid mono">

                  <div className="matrix-cell true-pos">
                    <span className="lbl">
                      TRUE POSITIVE (TP)
                    </span>

                    <span className="val">
                      {currentMatrix.tp}
                    </span>

                    <span className="sub">
                      Not exposed by current API
                    </span>
                  </div>

                  <div className="matrix-cell false-pos">
                    <span className="lbl">
                      FALSE POSITIVE (FP)
                    </span>

                    <span className="val">
                      {currentMatrix.fp}
                    </span>

                    <span className="sub">
                      Not exposed by current API
                    </span>
                  </div>

                  <div className="matrix-cell false-neg">
                    <span className="lbl">
                      FALSE NEGATIVE (FN)
                    </span>

                    <span className="val">
                      {currentMatrix.fn}
                    </span>

                    <span className="sub">
                      Not exposed by current API
                    </span>
                  </div>

                  <div className="matrix-cell true-neg">
                    <span className="lbl">
                      TRUE NEGATIVE (TN)
                    </span>

                    <span className="val">
                      {currentMatrix.tn}
                    </span>

                    <span className="sub">
                      Not exposed by current API
                    </span>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Research Configuration Footer */}
          <div
            className="dashboard-meta-grid mono"
            style={{ marginTop: '20px' }}
          >

            <div className="meta-item">
              <span className="k">
                QUBITS
              </span>

              <span className="v">
                {resourceEfficiency.qubitCount || 4}
              </span>
            </div>

            <div className="meta-item">
              <span className="k">
                CIRCUIT DEPTH
              </span>

              <span className="v">
                {resourceEfficiency.circuitDepth || 4}
              </span>
            </div>

            <div className="meta-item">
              <span className="k">
                SELECTED FEATURES
              </span>

              <span className="v">
                4 / 13
              </span>
            </div>

            <div className="meta-item">
              <span className="k">
                PIPELINE
              </span>

              <span className="v">
                HYBRID QUANTUM-CLASSICAL
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
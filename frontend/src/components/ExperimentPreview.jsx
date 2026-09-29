import React, { useState } from 'react';
import MODEL_COMPARISON from '../data/modelComparison.json';
import { BarChart3, TrendingUp, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';
import '../styles/experiment.css';

export default function ExperimentPreview() {
  const [activeMatrixTab, setActiveMatrixTab] = useState('quantum');

  // Function to determine model type from model name
  const getModelType = (modelName) => {
    if (modelName.includes('VQC') || modelName.includes('Quantum Kernel') || modelName.includes('Quantum Committee')) {
      return 'Quantum';
    }
    if (modelName.includes('Random Forest') || modelName.includes('SVM') || modelName.includes('Logistic Regression')) {
      return 'Classical';
    }
    if (modelName.includes('Hybrid')) {
      return 'Hybrid';
    }
    return 'Other'; // fallback
  };

  // Process model comparison data: filter out models with all nulls and sort by accuracy descending
  const modelData = Object.entries(MODEL_COMPARISON)
    .filter(([, metrics]) =>
      metrics.accuracy !== null ||
      metrics.precision !== null ||
      metrics.recall !== null ||
      metrics.f1 !== null
    )
    .map(([modelName, metrics]) => ({
      model: modelName,
      type: getModelType(modelName),
      accuracy: metrics.accuracy,
      precision: metrics.precision,
      recall: metrics.recall,
      f1: metrics.f1
    }))
    .sort((a, b) => {
      // Sort by accuracy descending, treating null as -1
      const accA = a.accuracy === null ? -1 : a.accuracy;
      const accB = b.accuracy === null ? -1 : b.accuracy;
      return accB - accA;
    });

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
            Metrics shown here are from the project's evaluation. All models with
            available metrics are displayed. Missing metrics are marked as N/A.
          </span>
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
                    <th>TYPE</th>
                    <th>MODEL</th>
                    <th>ACCURACY</th>
                    <th>PRECISION</th>
                    <th>RECALL</th>
                    <th>F1 SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {modelData.map((model, idx) => (
                    <tr key={idx}>
                      <td className="metric-type">{model.type}</td>
                      <td className="metric-name">{model.model}</td>
                      <td className="val-metric">
                        {model.accuracy !== null ?
                          (model.accuracy * 100).toFixed(2) + '%' : 'N/A'}
                      </td>
                      <td className="val-metric">
                        {model.precision !== null ?
                          (model.precision * 100).toFixed(2) + '%' : 'N/A'}
                      </td>
                      <td className="val-metric">
                        {model.recall !== null ?
                          (model.recall * 100).toFixed(2) + '%' : 'N/A'}
                      </td>
                      <td className="val-metric">
                        {model.f1 !== null ?
                          (model.f1 * 100).toFixed(2) + '%' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Confusion Matrix (Note: data unavailable) */}
          <div className="analytics-matrix-col">
            <div className="col-header mono">
              <span>CONFUSION MATRIX</span>
              <span className="badge-demo mono">
                HYBRID QUANTUM
              </span>
            </div>

            <div className="matrix-table-wrapper">
              <table className="matrix-table mono">
                <thead>
                  <tr>
                    <th></th>
                    <th>PREDICTED NEGATIVE</th>
                    <th>PREDICTED POSITIVE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="matrix-label">ACTUAL NEGATIVE</td>
                    <td className="matrix-value">N/A</td>
                    <td className="matrix-value">N/A</td>
                  </tr>
                  <tr>
                    <td className="matrix-label">ACTUAL POSITIVE</td>
                    <td className="matrix-value">N/A</td>
                    <td className="matrix-value">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Matrix Note */}
            <div className="matrix-note mono">
              <span className="note-icon">
                <AlertTriangle size={14} />
              </span>
              <span className="note-text">
                Confusion matrix values are unavailable in the current backend
                implementation. The panel is retained for structural completeness.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
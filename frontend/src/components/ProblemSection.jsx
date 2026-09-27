import React, { useState } from 'react';
import { AlertCircle, Maximize2, Shield, Activity, Database, Network } from 'lucide-react';
import '../styles/problem.css';

const DATA_COMPLEXITY_MODALITIES = [
  {
    id: 'mri',
    tag: 'VOXEL TENSORS',
    name: '3D High-Field MRI',
    dimension: '512 × 512 × 176',
    problem: 'Non-linear anatomical warping, motion phase artifacts, and subtle grey/white matter boundary degradation prior to noticeable clinical atrophy.'
  },
  {
    id: 'ct',
    tag: 'VOLUMETRIC DENSITY',
    name: 'Helical Low-Dose CT',
    dimension: '1024 × 1024 Slices',
    problem: 'Micro-calcifications and early ground-glass opacities (<4mm) masked by pulmonary vasculature and respiration artifacts.'
  },
  {
    id: 'xray',
    tag: 'PROJECTIVE SUPERPOSITION',
    name: 'Digital Radiography',
    dimension: '3000 × 3000 Projection',
    problem: 'Three-dimensional thoracic depth collapsed into 2D plane; early pre-malignant consolidation obscured by ribcage shadowing.'
  },
  {
    id: 'blood',
    tag: 'POLYNOMIAL INTERACTIONS',
    name: 'Liquid Biopsy Panels',
    dimension: '96+ Analytes + cfDNA',
    problem: 'Combinatorial explosion: identifying which 4-analyte polynomial correlations signal asymptomatic malignant drift out of billions of permutations.'
  },
  {
    id: 'ehr',
    tag: 'IRREGULAR TIME-SERIES',
    name: 'Longitudinal Patient History',
    dimension: 'Multi-Modal Records',
    problem: 'Sparse, non-uniformly sampled clinical interventions and laboratory measurements spanning decades with missing observation biases.'
  },
  {
    id: 'genomic',
    tag: 'EXPONENTIAL MANIFOLD',
    name: 'Single-Cell Transcriptomics',
    dimension: '20,000+ Genes × Cells',
    problem: 'Severe sparsity and dropout rates in single-cell RNA sequencing where crucial regulatory networks operate in non-linear manifolds.'
  }
];

export default function ProblemSection() {
  const [selectedModality, setSelectedModality] = useState(DATA_COMPLEXITY_MODALITIES[0]);

  return (
    <section className="problem-section" id="problem">
      <div className="section-wrapper">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">// SECTION 02: THE BOTTLENECK</span>
          <h2 className="section-title problem-headline">
            THE PROBLEM.
          </h2>
          <p className="problem-statement">
            Medical datasets are becoming increasingly complex. 
            Traditional machine learning can be powerful, but high-dimensional, 
            noisy and complex biomedical data creates fundamental barriers for early detection.
          </p>
        </div>

        {/* Editorial Narrative Grid */}
        <div className="problem-narrative-grid">
          <div className="narrative-col">
            <h3 className="narrative-subheading">
              The Curse of Dimensionality in Clinical Pathology
            </h3>
            <p className="narrative-body">
              When a tumor or neurodegenerative process begins, the earliest physiological 
              markers are infinitesimal. They do not present as stark isolated anomalies, 
              but as delicate, multi-variable correlations across thousands of features simultaneously.
            </p>
            <p className="narrative-body">
              Classical models like Deep Convolutional Networks and Gradient Boosted Trees require 
              exponentially expanding training sets to navigate these high-dimensional spaces without 
              overfitting or mistaking measurement noise for disease signatures.
            </p>

            <div className="bottleneck-stat-box mono">
              <div className="stat-row">
                <span className="stat-label">CLASSICAL STATE CAPACITY:</span>
                <span className="stat-val">O(D) Polynomial Limits</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">QUANTUM HILBERT CAPACITY:</span>
                <span className="stat-val highlight">O(2ⁿ) Exponential Dimension</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">DIAGNOSTIC NOISE RATIO:</span>
                <span className="stat-val">Up to 42% in Asymptomatic Stage</span>
              </div>
            </div>
          </div>

          {/* Interactive Modality Complexity Selector */}
          <div className="modality-complexity-browser">
            <div className="browser-header mono">
              <span>EXPLORE CLINICAL MODALITIES</span>
              <span>[N=6 DOMAINS]</span>
            </div>

            <div className="modality-pill-grid">
              {DATA_COMPLEXITY_MODALITIES.map((mod) => (
                <button
                  key={mod.id}
                  className={`modality-btn ${mod.id === selectedModality.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedModality(mod)}
                >
                  <span className="mod-btn-tag mono">{mod.tag}</span>
                  <span className="mod-btn-name">{mod.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Modality Diagnostic Detail Card */}
            <div className="modality-detail-display">
              <div className="detail-meta mono">
                <span className="dim-spec">INPUT TENSOR: {selectedModality.dimension}</span>
                <span className="status-spec">BOTTLENECK IDENTIFIED</span>
              </div>
              <h4 className="detail-title">{selectedModality.name}</h4>
              <p className="detail-problem">{selectedModality.problem}</p>
              
              <div className="detail-footer mono">
                <span>CONSEQUENCE: Delayed diagnosis until macroscopic lesions form</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { PATIENT_CASES } from '../data/platformData';
import { healthService } from '../api/healthService';
import { X, Play, RotateCcw, Activity, ShieldCheck, Download, AlertCircle, Cpu, Check, Terminal } from 'lucide-react';
import '../styles/demo-modal.css';

export default function InteractiveDemoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [selectedCaseId, setSelectedCaseId] = useState('PX-8420');
  const [ansatzDepth, setAnsatzDepth] = useState(2);
  const [topology, setTopology] = useState('full'); // 'full', 'linear', 'ring'
  const [zneActive, setZneActive] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionFinished, setExecutionFinished] = useState(true);
  const [backendStatus, setBackendStatus] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [featureImportanceData, setFeatureImportanceData] = useState(null);
  const [error, setError] = useState(null);
  const [customFeatures, setCustomFeatures] = useState([]);
  const [isFeatureLoading, setIsFeatureLoading] = useState(false);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  // Filter patient cases: high risk (HIGH risk level) and others
  const highRiskCases = PATIENT_CASES.filter(caseObj => caseObj.quantumInference?.riskLevel === 'HIGH');
  const otherCases = PATIENT_CASES.filter(caseObj => caseObj.quantumInference?.riskLevel !== 'HIGH');

  const activeCase = PATIENT_CASES.find((c) => c.id === selectedCaseId) || PATIENT_CASES[0];

  // Initialize form with demo case data
  useEffect(() => {
    if (activeCase) {
      // Ensure we have all 13 features for the form
      const demoFeatures = activeCase.rawFeatures || [];
      setCustomFeatures([...demoFeatures]);
    }
  }, [activeCase]);

  // Load backend status on mount and when case changes
  useEffect(() => {
    const loadBackendStatus = async () => {
      setIsHealthLoading(true);
      try {
        const status = await healthService.checkHealth();
        setBackendStatus(status);
      } catch (err) {
        setBackendStatus(null);
        // Don't set error here as backend might be intentionally offline for demo
      } finally {
        setIsHealthLoading(false);
      }
    };

    loadBackendStatus();
  }, [selectedCaseId]);

  // Load feature importance when modal opens
  useEffect(() => {
    const loadFeatureImportance = async () => {
      setIsFeatureLoading(true);
      try {
        const importance = await healthService.getFeatureImportance();
        setFeatureImportanceData(importance);
      } catch (err) {
        console.warn('Could not load feature importance:', err);
        setFeatureImportanceData(null);
      } finally {
        setIsFeatureLoading(false);
      }
    };

    loadFeatureImportance();
  }, []);

  // When user switches patient cases
  const handleCaseChange = async (caseId) => {
    setSelectedCaseId(caseId);
    const c = PATIENT_CASES.find((item) => item.id === caseId);
    if (c) {
      // For demo cases, populate form with illustrative 13-feature data
      setCustomFeatures([...c.rawFeatures]);
    }
    // Reset prediction result when changing cases
    setPredictionResult(null);
    setError(null);
    // Reload backend status
    setIsHealthLoading(true);
    try {
      const status = await healthService.checkHealth();
      setBackendStatus(status);
    } catch (err) {
      setBackendStatus(null);
    } finally {
      setIsHealthLoading(false);
    }
  };

  // Run real prediction
  const handleRunPrediction = async () => {
    // Validate we have exactly 13 features
    if (customFeatures.length !== 13) {
      setError('Please provide exactly 13 clinical features for prediction.');
      return;
    }

    setIsExecuting(true);
    setExecutionFinished(false);
    setError(null);

    try {
      // Construct patient data object matching backend schema
      const patientData = {
        age: customFeatures[0],
        sex: customFeatures[1],
        cp: customFeatures[2],
        trestbps: customFeatures[3],
        chol: customFeatures[4],
        fbs: customFeatures[5],
        restecg: customFeatures[6],
        thalach: customFeatures[7],
        exang: customFeatures[8],
        oldpeak: customFeatures[9],
        slope: customFeatures[10],
        ca: customFeatures[11],
        thal: customFeatures[12]
      };

      // Call real backend prediction
      const result = await healthService.predictPatient(patientData);
      setPredictionResult(result);
      setExecutionFinished(true);
    } catch (err) {
      setError(err.message || 'Prediction failed. Please check backend connection.');
      setExecutionFinished(true);
    } finally {
      setIsExecuting(false);
    }
  };

  
  // Determine if we should use real backend or simulation
  const shouldUseBackend = backendStatus !== null;

  return (
    <div className="demo-modal-overlay">
      <div className="demo-modal-container">
        {/* Top Workbench Navigation Bar */}
        <div className="modal-header-bar">
          <div className="header-left">
            <div className="lab-logo-icon">
              <Cpu size={16} />
            </div>
            <div className="header-titles">
              <span className="platform-title mono">QueMeds // CLINICAL QUANTUM INFERENCE WORKBENCH</span>
              <span className="platform-sub mono">SIMULATOR: 4-QUBIT STATEVECTOR // PROTOCOL: IEEE-VQC-MED</span>
            </div>
          </div>

          <div className="header-right">
            <span className="status-badge mono">
              <span className={`tag-dot ${backendStatus ? 'connected' : 'disconnected'}`}></span>
              {backendStatus ? `BACKEND: ${backendStatus.model.toUpperCase()}` : 'BACKEND: OFFLINE (DEMO MODE)'}
            </span>
            <button
              className="close-modal-btn"
              onClick={onClose}
              aria-label="Exit platform"
            >
              <X size={18} />
              <span className="mono">EXIT PLATFORM</span>
            </button>
          </div>
        </div>

        {/* Workbench Body: Two Panels */}
        <div className="workbench-body-grid">
          {/* Left Panel: Patient Selection & Quantum Configuration */}
          <div className="workbench-panel panel-controls">
            <div className="panel-section-title mono">
              <span>01 // SELECT PATIENT SPECIMEN</span>
              <span className="case-count">[5 DEMO CASES AVAILABLE]</span>
            </div>

            {/* Patient Case Selector Cards */}
            <div className="patient-cases-list">
              {/* High Risk Patients Section */}
              <div className="patient-cases-section">
                <h3 className="section-title">High Risk Patients</h3>
                <div className="patient-cases-grid">
                  {/* Show up to 2 high-risk cases */}
                  {highRiskCases.slice(0, 2).map((patient) => (
                    <button
                      key={patient.id}
                      className={`patient-case-card ${patient.id === selectedCaseId ? 'active' : ''}`}
                      onClick={() => handleCaseChange(patient.id)}
                    >
                      <div className="case-header">
                        <span className="case-id">{patient.id}</span>
                        <span className="case-type mono">ILLUSTRATIVE DEMO</span>
                      </div>
                      <div className="case-details">
                        <h3 className="case-title">{patient.name}</h3>
                        <p className="case-subtitle mono">{patient.clinicalContext}</p>
                      </div>
                      <div className="case-footer mono">
                        <span>Age: {patient.age} • Sex: {patient.sex === 1 ? 'Male' : 'Female'}</span>
                      </div>
                    </button>
                  ))}
                  {/* If we have less than 2 high-risk cases, fill with placeholders */}
                  {highRiskCases.length < 2 && Array.from({ length: 2 - highRiskCases.length }).map((_, index) => (
                    <button
                      key={`placeholder-${index}`}
                      className="patient-case-card placeholder"
                      disabled
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="case-header">
                        <span className="case-id">N/A</span>
                        <span className="case-type mono">PLACEHOLDER</span>
                      </div>
                      <div className="case-details">
                        <h3 className="case-title">Not Available</h3>
                        <p className="case-subtitle mono">No additional high-risk demo case data available</p>
                      </div>
                      <div className="case-footer mono">
                        <span>Age: N/A • Sex: N/A</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Patients Section */}
              <div className="patient-cases-section">
                <h3 className="section-title">Other Patients</h3>
                <div className="patient-cases-grid">
                  {/* Show other cases, excluding any that were already shown in high-risk section */}
                  {otherCases
                    .filter(caseObj =>
                      !highRiskCases.slice(0, 2).some(highRisk => highRisk.id === caseObj.id)
                    )
                    .map((patient) => (
                      <button
                        key={patient.id}
                        className={`patient-case-card ${patient.id === selectedCaseId ? 'active' : ''}`}
                        onClick={() => handleCaseChange(patient.id)}
                      >
                        <div className="case-header">
                          <span className="case-id">{patient.id}</span>
                          <span className="case-type mono">ILLUSTRATIVE DEMO</span>
                        </div>
                        <div className="case-details">
                          <h3 className="case-title">{patient.name}</h3>
                          <p className="case-subtitle mono">{patient.clinicalContext}</p>
                        </div>
                        <div className="case-footer mono">
                          <span>Age: {patient.age} • Sex: {patient.sex === 1 ? 'Male' : 'Female'}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* 13-Feature Input Form */}
            <div className="panel-section-title mono">
              <span>02 // ENTER CLINICAL FEATURES</span>
              <span className="feature-count">[13 REQUIRED INPUTS]</span>
            </div>

            <div className="feature-input-grid">
              {/* Age */}
              <div className="feature-input">
                <label className="feature-label">Age (years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={customFeatures[0] || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[0] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                  placeholder="e.g., 65"
                />
              </div>

              {/* Sex */}
              <div className="feature-input">
                <label className="feature-label">Sex</label>
                <select
                  value={customFeatures[1] || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[1] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="0">Female (0)</option>
                  <option value="1">Male (1)</option>
                </select>
              </div>

              {/* Chest Pain Type (cp) */}
              <div className="feature-input">
                <label className="feature-label">Chest Pain Type</label>
                <select
                  value={customFeatures[2] || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[2] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="1">Typical Angina (1)</option>
                  <option value="2">Atypical Angina (2)</option>
                  <option value="3">Non-anginal Pain (3)</option>
                  <option value="4">Asymptomatic (4)</option>
                </select>
              </div>

              {/* Resting Blood Pressure */}
              <div className="feature-input">
                <label className="feature-label">Resting BP (mm Hg)</label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={customFeatures[3] || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[3] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                  placeholder="e.g., 120"
                />
              </div>

              {/* Serum Cholesterol */}
              <div className="feature-input">
                <label className="feature-label">Cholesterol (mg/dl)</label>
                <input
                  type="number"
                  min="100"
                  max="600"
                  value={customFeatures[4] || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[4] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                  placeholder="e.g., 200"
                />
              </div>

              {/* Fasting Blood Sugar */}
              <div className="feature-input">
                <label className="feature-label">Fasting Blood Sugar</label>
                <select
                  value={customFeatures[5] || 0}
                  onChange={(e) => {
                    const val = e.target.value === '1' ? 1 : 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[5] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="0">False (0)</option>
                  <option value="1">True (1)</option>
                </select>
              </div>

              {/* Resting ECG */}
              <div className="feature-input">
                <label className="feature-label">Resting ECG</label>
                <select
                  value={customFeatures[6] || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[6] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="0">Normal (0)</option>
                  <option value="1">ST-T Wave Abnormality (1)</option>
                  <option value="2">Left Ventricular Hypertrophy (2)</option>
                </select>
              </div>

              {/* Max Heart Rate */}
              <div className="feature-input">
                <label className="feature-label">Max Heart Rate</label>
                <input
                  type="number"
                  min="60"
                  max="220"
                  value={customFeatures[7] || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[7] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                  placeholder="e.g., 150"
                />
              </div>

              {/* Exercise Induced Angina */}
              <div className="feature-input">
                <label className="feature-label">Exercise Angina</label>
                <select
                  value={customFeatures[8] || 0}
                  onChange={(e) => {
                    const val = e.target.value === '1' ? 1 : 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[8] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="0">No (0)</option>
                  <option value="1">Yes (1)</option>
                </select>
              </div>

              {/* ST Depression */}
              <div className="feature-input">
                <label className="feature-label">ST Depression (oldpeak)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={customFeatures[9] || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[9] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                  placeholder="e.g., 1.5"
                />
              </div>

              {/* Slope of Peak Exercise ST Segment */}
              <div className="feature-input">
                <label className="feature-label">ST Slope</label>
                <select
                  value={customFeatures[10] || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[10] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="1">Upsloping (1)</option>
                  <option value="2">Flat (2)</option>
                  <option value="3">Downsloping (3)</option>
                </select>
              </div>

              {/* Number of Major Vessels */}
              <div className="feature-input">
                <label className="feature-label">Major Vessels (ca)</label>
                <select
                  value={customFeatures[11] || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[11] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="0">0 Vessels</option>
                  <option value="1">1 Vessel</option>
                  <option value="2">2 Vessels</option>
                  <option value="3">3 Vessels</option>
                </select>
              </div>

              {/* Thalassemia */}
              <div className="feature-input">
                <label className="feature-label">Thalassemia</label>
                <select
                  value={customFeatures[12] || 3}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 3;
                    setCustomFeatures(prev => {
                      const newFeatures = [...prev];
                      newFeatures[12] = val;
                      return newFeatures;
                    });
                  }}
                  className="feature-input-field"
                >
                  <option value="3">Normal (3)</option>
                  <option value="6">Fixed Defect (6)</option>
                  <option value="7">Reversible Defect (7)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="panel-action-bar">
              <button
                className={`action-button primary ${isExecuting ? 'executing' : ''}`}
                onClick={handleRunPrediction}
                disabled={isExecuting}
              >
                {isExecuting ? 'RUNNING INFERENCE...' : 'RUN PREDICTION (BACKEND)'}
              </button>

              {!isExecuting && (
                <button
                  className="action-button secondary"
                  onClick={handleCaseChange}
                >
                  LOAD DEMO CASE
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Results & Visualization */}
          <div className="workbench-panel panel-results"><>
              <div className="panel-content">
            {backendStatus && !isExecuting ? (
              <>
                {/* Backend Status Indicator */}
                <div className="backend-status-bar">
                  <span className="status-indicator connected"></span>
                  <span className="status-text mono">
                    CONNECTED TO BACKEND • MODEL: {backendStatus.model.toUpperCase()} •
                    THRESHOLD: {backendStatus.threshold?.toFixed(3)}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Backend Status Indicator */}
                <div className="backend-status-bar">
                  <span className="status-indicator disconnected"></span>
                  <span className="status-text mono">
                    BACKEND OFFLINE • RUNNING IN DEMO MODE
                  </span>
                </div>
              </>
            )
}

            {/* Prediction Results */}
            {!isExecuting && predictionResult ? (
              <div className="results-container">
                {/* Prediction Probability */}
                <div className="results-sub-block">
                  <div className="sub-block-title mono">
                    <span>PREDICTION PROBABILITY</span>
                    <span>HEART DISEASE RISK SCORE</span>
                  </div>
                  <div className="risk-score-display">
                    <span className="score-num">{(predictionResult.probability * 100).toFixed(1)}%</span>
                    <span className="score-denom mono">/ 100% RISK</span>
                  </div>
                  <div className="risk-badge mono">
                    {predictionResult.risk}
                  </div>
                </div>

                {/* Clinical Recommendation */}
                <div className="results-sub-block">
                  <div className="sub-block-title mono">
                    <span>CLINICAL PROTOCOL RECOMMENDATION:</span>
                  </div>
                  <div className="recommendation-box">
                    <p className="rec-text">{predictionResult.recommendation}</p>
                  </div>
                </div>

                {/* Feature Importance Section */}
                {featureImportanceData && !isFeatureLoading ? (
                  <div className="results-sub-block">
                    <div className="sub-block-title mono">
                      <span>FEATURE IMPORTANCE BREAKDOWN</span>
                      <span>RANDOM FOREST MODEL</span>
                    </div>
                    <div className="feature-importance-list">
                      {Object.entries(featureImportanceData).map(([feature, importance]) => (
                        <div key={feature} className="importance-item">
                          <div className="importance-header mono">
                            <span className="imp-name">{feature}</span>
                            <span className="imp-pct">{importance}%</span>
                          </div>
                          <div className="importance-track">
                            <div
                              className="importance-fill"
                              style={{ width: `${importance}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !isFeatureLoading && !featureImportanceData ? (
                  <div className="results-sub-block">
                    <div className="sub-block-title mono">
                      <span>FEATURE IMPORTANCE BREAKDOWN</span>
                      <span>DATA UNAVAILABLE</span>
                    </div>
                    <div className="feature-importance-list">
                      <div className="importance-item">
                        <span className="imp-name mono">FEATURE IMPORTANCE</span>
                        <span className="imp-pct mono">N/A</span>
                      </div>
                    </div>
                  </div>
                ) : isFeatureLoading ? (
                  <div className="results-sub-block">
                    <div className="sub-block-title mono">
                      <span>FEATURE IMPORTANCE BREAKDOWN</span>
                      <span>LOADING...</span>
                    </div>
                    <div className="feature-importance-list">
                      <div className="importance-item">
                        <span className="imp-name mono">LOADING...</span>
                        <span className="imp-pct mono">...</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Quantum Visualization (Illustrative) */}
                <div className="results-sub-block">
                  <div className="sub-block-title mono">
                    <span>QUANTUM CIRCUIT VISUALIZATION</span>
                    <span>ILLUSTRATIVE 4-QUBIT STATE</span>
                  </div>
                  <div className="quantum-state-display">
                    <div className="state-line">
                      <span className="lbl">RESOLVED STATE:</span>
                      <span className="val">{activeCase.quantumInference?.qubitState || '|ψ⟩ = ?|0000⟩ + ?|1111⟩'}</span>
                    </div>
                    <div className="telemetry-cols">
                      <span>SIMULATOR RUNTIME: 4.8 ms</span>
                      <span>SHOTS: 4096</span>
                      <span>CIRCUIT FIDELITY: 99.82%</span>
                      <span>MITIGATION: ZNE 2nd Order</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : !isExecuting && error ? (
              <div className="results-container error-state">
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span className="mono">ERROR: {error}</span>
                </div>
                <button
                  className="action-button secondary"
                  onClick={() => setError(null)}
                >
                  CLEAR ERROR
                </button>
              </div>
            ) : isExecuting ? (
              <div className="results-container">
                <div className="execution-progress">
                  <div className="progress-title mono">EXECUTING QUANTUM INFERENCE...</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '50%' }}></div>
                  </div>
                  <div className="progress-details mono">
                    {shouldUseBackend ?
                      'Submitting clinical data to backend...' :
                      'Running quantum simulation...'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="results-container">
                <div className="empty-state">
                  <Activity size={24} />
                  <span className="mono">AWAITING PATIENT DATA SUBMISSION</span>
                </div>
              </div>
            )}
          </div></></div>
        </div>
      </div>
    </div>
  );
}
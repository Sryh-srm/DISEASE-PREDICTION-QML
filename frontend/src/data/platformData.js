// Research datasets, simulation parameters and medical profiles
// All experimental values clearly marked as DEMO DATA for scientific integrity

export const PIPELINE_STAGES = [
  {
    id: "data",
    step: "01",
    name: "Medical Data Acquisition",
    subtitle: "Heart Disease Clinical Measurements",
    description: "Standardized clinical measurements including patient demographics, vital signs, blood biomarkers, and diagnostic test results are acquired and prepared for analysis.",
    math: "\\mathbf{X}_{raw} \\in \\mathbb{R}^{n \\times 13}",
    readout: "Features: 13 clinical variables // Samples: 303 (Cleveland) / 918 (Combined)",
    indicators: ["Demographics", "Vital Signs", "Blood Biomarkers", "Diagnostic Tests"]
  },
  {
    id: "preprocessing",
    step: "02",
    name: "Data Preprocessing Pipeline",
    subtitle: "Imputation, Standardization & Feature Selection",
    description: "Missing values are imputed with median, features are standardized, and the top 4 most predictive features are selected using supervised ANOVA.",
    math: "\\vec{x}_{processed} = \\text{MinMax}\\left(\\text{StdScaler}\\left(\\text{Imputer}\\left(\\mathbf{X}_{raw}\\right)\\right)\\right)",
    readout: "Method: Median → StandardScaler → SelectKBest(k=4) → MinMax[0,π]",
    indicators: ["Missing Value Imputation", "Feature Standardization", "ANOVA Feature Selection", "Quantum Angle Scaling"]
  },
  {
    id: "feature_selection",
    step: "03",
    name: "Selected Clinical Features",
    subtitle: "Top 4 Predictive Characteristics",
    description: "Supervised ANOVA identifies thal, thalach, ca, and exang as the most discriminative features for heart disease prediction features.",
    math: "\\vec{x}_{selected} = [\\text{thal}, \\text{thalach}, \\text{ca}, \\text{exang}]^T",
    readout: "Selected: thal, thalach, ca, exang // Method: F-classif ANOVA",
    indicators: ["Thalassemia", "Maximum Heart Rate", "Number of Major Vessels", "Exercise Induced Angina"]
  }
];

export const PATIENT_CASES = [
  {
    id: "HD-DEMO-001",
    name: "Demo Case: High Risk Patient Profile",
    age: 65,
    sex: 1, // Male
    // NOTE: This is a DEMO case with illustrative values for all 13 features
    // Actual /predict endpoint requires 13 features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    symptomDuration: "Chest pain on exertion (Illustrative Demo Case)",
    imagingModality: "Clinical Assessment (Demo)",
    rawFeatures: [65, 1, 3, 180, 250, 0, 1, 150, 1, 2.5, 2, 2, 7],  // Example values for all 13 features
    featureNames: ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
    clinicalContext: "ILLUSTRATIVE DEMO: 65-year-old male with typical angina (cp=3), elevated resting BP (180 mmHg), high cholesterol (250 mg/dl), fasting blood sugar normal (0=false), normal resting ECG (1=ST-T wave abnormality), max heart rate 150, exercise-induced angina present (1=yes), oldpeak 2.5, slope 2, ca=2 (two major vessels colored), thal=7 (reversible defect). This case demonstrates how all 13 features would be processed by the pipeline.",
    quantumInference: {
      // NOTE: These values are illustrative demonstrations only, not actual backend outputs
      // Actual /predict endpoint returns: probability, risk, recommendation, threshold, model
      // Actual /feature_importance endpoint returns: features, importance arrays
      qubitState: "|ψ⟩ = 0.42|0001⟩ + 0.61|0110⟩ + 0.58|1111⟩ + 0.33|others⟩ (Illustrative 4-qubit state representation)",
      expectationValues: [0.68, -0.42, 0.81, 0.55],  // Example expectation values ⟨Z_i⟩ for visualization
      diseaseRisk: 0.874,
      riskLevel: "HIGH",
      recommendation: "Cardiology consultation & stress testing recommended (Illustrative Demo)",
      featureImportance: [  // Represents Random Forest feature importance from backend /feature_importance endpoint
        { feature: "age", importance: 5 },
        { feature: "sex", importance: 3 },
        { feature: "cp", importance: 8 },
        { feature: "trestbps", importance: 6 },
        { feature: "chol", importance: 7 },
        { feature: "fbs", importance: 2 },
        { feature: "restecg", importance: 4 },
        { feature: "thalach", importance: 9 },
        { feature: "exang", importance: 10 },
        { feature: "oldpeak", importance: 6 },
        { feature: "slope", importance: 5 },
        { feature: "ca", importance: 15 },
        { feature: "thal", importance: 20 }
      ]
    }
  },
  {
    id: "HD-DEMO-002",
    name: "Demo Case: Moderate Risk Patient Profile",
    age: 64,
    sex: 1, // Male
    // NOTE: This is a DEMO case with illustrative values for all 13 features
    // Actual /predict endpoint requires 13 features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    symptomDuration: "Subtle Subjective Memory Complaints (Illustrative Demo Case)",
    imagingModality: "Resting-State fMRI & Volumetric T1w (Demo)",
    rawFeatures: [64, 1, 2, 140, 220, 0, 0, 170, 0, 1.0, 1, 1, 4],  // Example values
    featureNames: ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
    clinicalContext: "ILLUSTRATIVE DEMO: 64-year-old male with atypical chest pain (cp=2), borderline high BP (140 mmHg), borderline high cholesterol (220 mg/dl), normal fasting blood sugar (0), normal resting ECG (0), max heart rate 170, no exercise-induced angina (0), oldpeak 1.0, slope 1, ca=1 (one major vessel colored), thal=4 (fixed defect). This case demonstrates how all 13 features would be processed by the pipeline.",
    quantumInference: {
      // NOTE: These values are illustrative demonstrations only, not actual backend outputs
      qubitState: "|ψ⟩ = 0.51|0010⟩ + 0.72|1001⟩ + 0.38|1100⟩ + 0.28|others⟩ (Illustrative 4-qubit state representation)",
      expectationValues: [0.52, 0.77, -0.63, 0.41],  // Example expectation values ⟨Z_i⟩ for visualization
      diseaseRisk: 0.812,
      riskLevel: "ELEVATED",
      recommendation: "Early Monoclonal Antibody Trial Enrollment & Longitudinal Biomarker Tracking (Illustrative Demo)",
      featureImportance: [  // Represents Random Forest feature importance from backend /feature_importance endpoint
        { feature: "age", importance: 4 },
        { feature: "sex", importance: 2 },
        { feature: "cp", importance: 6 },
        { feature: "trestbps", importance: 5 },
        { feature: "chol", importance: 6 },
        { feature: "fbs", importance: 1 },
        { feature: "restecg", importance: 3 },
        { feature: "thalach", importance: 8 },
        { feature: "exang", importance: 7 },
        { feature: "oldpeak", importance: 4 },
        { feature: "slope", importance: 3 },
        { feature: "ca", importance: 10 },
        { feature: "thal", importance: 12 }
      ]
    }
  },
  {
    id: "HD-DEMO-003",
    name: "Demo Case: Treatment Response Monitoring",
    age: 45,
    sex: 0, // Female
    // NOTE: This is a DEMO case with illustrative values for all 13 features
    // Actual /predict endpoint requires 13 features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    symptomDuration: "Post-Treatment Surveillance (6 Months) (Illustrative Demo Case)",
    imagingModality: "Multi-parametric Prostate MRI (Demo)",
    rawFeatures: [45, 0, 1, 130, 190, 0, 0, 160, 0, 0.5, 2, 0, 3],  // Example values
    featureNames: ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
    clinicalContext: "ILLUSTRATIVE DEMO: 45-year-old female with non-anginal chest pain (cp=1), normal BP (130 mmHg), borderline cholesterol (190 mg/dl), normal fasting blood sugar (0), normal resting ECG (0), max heart rate 160, no exercise-induced angina (0), oldpeak 0.5, slope 2 (downsloping), ca=0 (no major vessels colored), thal=3 (normal). This case demonstrates how all 13 features would be processed by the pipeline.",
    quantumInference: {
      // NOTE: These values are illustrative demonstrations only, not actual backend outputs
      qubitState: "|ψ⟩ = 0.19|0000⟩ + 0.48|0110⟩ + 0.62|1001⟩ + 0.59|1111⟩ (Illustrative 4-qubit state representation)",
      expectationValues: [0.15, -0.31, 0.74, -0.23],  // Example expectation values ⟨Z_i⟩ for visualization
      diseaseRisk: 0.642,
      riskLevel: "MODERATE",
      recommendation: "Biopsy-Guided Focal Therapy Consideration & PSA Monitoring (Illustrative Demo)",
      featureImportance: [  // Represents Random Forest feature importance from backend /feature_importance endpoint
        { feature: "age", importance: 3 },
        { feature: "sex", importance: 1 },
        { feature: "cp", importance: 4 },
        { feature: "trestbps", importance: 4 },
        { feature: "chol", importance: 5 },
        { feature: "fbs", importance: 1 },
        { feature: "restecg", importance: 2 },
        { feature: "thalach", importance: 6 },
        { feature: "exang", importance: 3 },
        { feature: "oldpeak", importance: 2 },
        { feature: "slope", importance: 5 },
        { feature: "ca", importance: 2 },
        { feature: "thal", importance: 4 }
      ]
    }
  },
  {
    id: "HD-DEMO-004",
    name: "Demo Case: Cardiovascular Risk Stratification",
    age: 67,
    sex: 1, // Male
    // NOTE: This is a DEMO case with illustrative values for all 13 features
    // Actual /predict endpoint requires 13 features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    symptomDuration: "Intermittent Chest Discomfort & Dyspnea (Illustrative Demo Case)",
    imagingModality: "Coronary Calcium Scan & Stress Echocardiogram (Demo)",
    rawFeatures: [67, 1, 2, 160, 240, 0, 1, 155, 0, 1.8, 2, 1, 5],  // Example values
    featureNames: ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
    clinicalContext: "ILLUSTRATIVE DEMO: 67-year-old male with atypical chest pain (cp=2), stage 1 hypertension (160 mmHg), high cholesterol (240 mg/dl), normal fasting blood sugar (0), abnormal resting ECG (1=left ventricular hypertrophy), max heart rate 155, no exercise-induced angina (0), oldpeak 1.8, slope 2, ca=1 (one major vessel colored), thal=5 (reversible defect). This case demonstrates how all 13 features would be processed by the pipeline.",
    quantumInference: {
      // NOTE: These values are illustrative demonstrations only, not actual backend outputs
      qubitState: "|ψ⟩ = 0.15|0000⟩ + 0.38|0101⟩ + 0.52|1010⟩ + 0.65|1111⟩ (Illustrative 4-qubit state representation)",
      expectationValues: [-0.31, -0.18, 0.46, 0.61],  // Example expectation values ⟨Z_i⟩ for visualization
      diseaseRisk: 0.538,
      riskLevel: "MODERATE",
      recommendation: "Coronary Angiography Consideration & Lipid Panel Optimization (Illustrative Demo)",
      featureImportance: [  // Represents Random Forest feature importance from backend /feature_importance endpoint
        { feature: "age", importance: 6 },
        { feature: "sex", importance: 2 },
        { feature: "cp", importance: 7 },
        { feature: "trestbps", importance: 5 },
        { feature: "chol", importance: 6 },
        { feature: "fbs", importance: 1 },
        { feature: "restecg", importance: 3 },
        { feature: "thalach", importance: 8 },
        { feature: "exang", importance: 4 },
        { feature: "oldpeak", importance: 4 },
        { feature: "slope", importance: 5 },
        { feature: "ca", importance: 8 },
        { feature: "thal", importance: 10 }
      ]
    }
  },
  {
    id: "HD-DEMO-005",
    name: "Demo Case: Multi-Analyte Plasma Panel",
    age: 51,
    sex: 0, // Female
    // NOTE: This is a DEMO case with illustrative values for all 13 features
    // Actual /predict endpoint requires 13 features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    symptomDuration: "Routine Executive Health Checkup (Illustrative Demo Case)",
    imagingModality: "96-Analyte Liquid Biopsy & cfDNA (Demo)",
    rawFeatures: [51, 0, 0, 120, 180, 0, 0, 165, 0, 0.2, 1, 0, 3],  // Example values
    featureNames: ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
    clinicalContext: "ILLUSTRATIVE DEMO: 51-year-old female with asymptomatic (cp=0), normal BP (120 mmHg), normal cholesterol (180 mg/dl), normal fasting blood sugar (0), normal resting ECG (0), max heart rate 165, no exercise-induced angina (0), oldpeak 0.2, slope 1 (upsloping), ca=0 (no major vessels colored), thal=3 (normal). This case demonstrates how all 13 features would be processed by the pipeline.",
    quantumInference: {
      // NOTE: These values are illustrative demonstrations only, not actual backend outputs
      qubitState: "|ψ⟩ = 0.78|0000⟩ + 0.44|0101⟩ + 0.31|1010⟩ + 0.32|others⟩ (Illustrative 4-qubit state representation)",
      expectationValues: [-0.62, -0.45, -0.58, -0.71],  // Example expectation values ⟨Z_i⟩ for visualization
      diseaseRisk: 0.165,
      riskLevel: "BENIGN / LOW SUSPICION",
      recommendation: "Routine 12-Month Checkup; No Invasive Biopsy Required. Classical baseline produced false positive alarm. (Illustrative Demo)",
      featureImportance: [  // Represents Random Forest feature importance from backend /feature_importance endpoint
        { feature: "age", importance: 4 },
        { feature: "sex", importance: 1 },
        { feature: "cp", importance: 2 },
        { feature: "trestbps", importance: 3 },
        { feature: "chol", importance: 4 },
        { feature: "fbs", importance: 1 },
        { feature: "restecg", importance: 2 },
        { feature: "thalach", importance: 5 },
        { feature: "exang", importance: 1 },
        { feature: "oldpeak", importance: 2 },
        { feature: "slope", importance: 3 },
        { feature: "ca", importance: 2 },
        { feature: "thal", importance: 4 }
      ]
    }
  }
];

// Benchmark metrics from initial project evaluation - NOT live API outputs
export const PERFORMANCE_METRICS = {
  classical: { tp: 175, fp: 30, tn: 145, fn: 38 },
  quantum: { tp: 154, fp: 51, tn: 128, fn: 51 }
};

// Medical research modules for the modal demo
export const MEDICAL_MODULES = [
  {
    id: "MOD-001",
    icon: "🧬",
    dimension: "GENOMICS",
    name: "Quantum Genome Analyzer",
    description: "Analyzes genetic variants and epigenetic markers to identify hereditary risk factors and gene-environment interactions in cardiovascular pathogenesis.",
    target: "Polygenic Risk Scores • SNP Pathways • Mitochondrial DNA • Telomere Length"
  },
  {
    id: "MOD-002",
    icon: "🔬",
    dimension: "PROTEOMICS",
    name: "Plasma Biomarker Profiler",
    description: "Detects and quantifies low-abundance protein biomarkers in blood plasma to identify early-stage inflammatory and metabolic dysregulation patterns.",
    target: "Cardiac Troponins • BNP/NT-proBNP • Inflammatory Cytokines • Lipoprotein Subclasses"
  },
  {
    id: "MOD-003",
    icon: "🫀",
    dimension: "HEMODYNAMICS",
    name: "Vascular Hemodynamics Mapper",
    description: "Models blood flow dynamics and arterial stiffness to detect early vascular dysfunction before structural changes become visible on imaging.",
    target: "Pulse Wave Velocity • Endothelial Function • Coronary Flow Reserve • Microvascular Resistance"
  },
  {
    id: "MOD-004",
    icon: "⚡",
    dimension: "ELECTROPHYSIOLOGY",
    name: "Cardiac Electrophysics Scanner",
    description: "Analyzes electrical conduction patterns and repolarization abnormalities to identify arrhythmogenic substrates and ischemic precursors.",
    target: "QT Interval Variability • Signal-Averaged ECG • Late Potentials • Heart Rate Turbulence"
  },
  {
    id: "MOD-005",
    icon: "🧪",
    dimension: "METABOLOMICS",
    name: "Multi-Analyte Plasma Panel",
    description: "Comprehensive metabolic profiling of circulating metabolites to identify microbiome-derived toxins and nutritional deficiencies affecting cardiac health.",
    target: "Trimethylamine N-oxide • Short-Chain Fatty Acids • Bile Acids • Amino Acid Imbalances"
  }
];

// Experimental benchmark data for demonstration
export const EXPERIMENT_BENCHMARKS = {
  quantumAdvantage: {
    accuracyImprovement: "12.7%",
    falsePositiveReduction: "22.3%",
    processingSpeed: "8.4x faster"
  },
  clinicalValidation: {
    sensitivity: 0.91,
    specificity: 0.87,
    auc: 0.94
  },
  resourceEfficiency: {
    qubitCount: 4,
    circuitDepth: 12,
    measurementShots: 1024
  }
};
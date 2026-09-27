// API service layer for Health d3 backend integration
// Centralized API calls to FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const healthService = {
  // Check backend health status
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // Get feature importance from backend
  async getFeatureImportance() {
    try {
      const response = await fetch(`${API_BASE_URL}/feature_importance`);
      if (!response.ok) {
        throw new Error(`Feature importance failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Feature importance error:', error);
      throw error;
    }
  },

  // Predict heart disease risk for a single patient
  async predictPatient(patientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
          `Prediction failed: ${response.status} ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  },

  // Predict heart disease risk for batch CSV data
  async predictCSV(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/predict/csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
          `CSV prediction failed: ${response.status} ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error('CSV prediction error:', error);
      throw error;
    }
  }
};
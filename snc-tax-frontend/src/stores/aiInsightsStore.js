import { create } from 'zustand';
import api from '../services/api';

export const useAIInsightsStore = create((set) => ({
  // Dashboard insights
  insights: [],
  insightsLoading: false,

  // Risk analysis
  riskAnalysis: null,
  riskLoading: false,

  // Audit narrative
  auditNarrative: null,
  auditLoading: false,

  // Maturity advice
  maturityAdvice: null,
  maturityLoading: false,

  // Filing guidance
  filingGuidance: null,
  filingLoading: false,

  // Document categorization
  docCategory: null,

  fetchInsights: async () => {
    set({ insightsLoading: true });
    try {
      const { data } = await api.post('/ai/insights');
      set({ insights: data.insights || [], insightsLoading: false });
    } catch {
      set({ insightsLoading: false });
    }
  },

  fetchRiskAnalysis: async () => {
    set({ riskLoading: true });
    try {
      const { data } = await api.post('/ai/risk-analysis');
      set({ riskAnalysis: data.analysis, riskLoading: false });
    } catch {
      set({ riskLoading: false });
    }
  },

  fetchAuditNarrative: async () => {
    set({ auditLoading: true });
    try {
      const { data } = await api.post('/ai/audit-narrative');
      set({ auditNarrative: data.narrative, auditLoading: false });
    } catch {
      set({ auditLoading: false });
    }
  },

  fetchMaturityAdvice: async (currentLevel) => {
    set({ maturityLoading: true });
    try {
      const { data } = await api.post('/ai/maturity-advice', { currentLevel });
      set({ maturityAdvice: data.advice, maturityLoading: false });
    } catch {
      set({ maturityLoading: false });
    }
  },

  fetchFilingGuidance: async (filingType) => {
    set({ filingLoading: true });
    try {
      const { data } = await api.post('/ai/filing-guidance', { filingType });
      set({ filingGuidance: data.guidance, filingLoading: false });
    } catch {
      set({ filingLoading: false });
    }
  },

  categorizeDocument: async (filename, description) => {
    try {
      const { data } = await api.post('/ai/document-categorize', { filename, description });
      set({ docCategory: data.categorization });
      return data.categorization;
    } catch {
      return null;
    }
  },
}));

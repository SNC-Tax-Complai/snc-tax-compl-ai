import axios from 'axios';
import BaseProvider from './baseProvider.js';

/**
 * Google Gemini Provider
 */
export default class GeminiProvider extends BaseProvider {
  constructor() {
    super('Google Gemini', 'GOOGLE_AI_API_KEY');
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = process.env.GEMINI_MODEL || 'gemini-pro';
  }

  async analyzeDocument(file, context) {
    if (!this.isConfigured) {
      return { provider: 'gemini', status: 'unconfigured', message: 'Set GOOGLE_AI_API_KEY to enable' };
    }

    const prompt = `${this.getSystemPrompt()}\n\nAnalyze this document for SA compliance:
File: ${file.originalname || file.filename} (${file.mimetype})
Company: ${context.companyType || 'Pty Ltd'}, Sector: ${context.sector || 'General'}

Return JSON: {documentType, relevantModules[], riskLevel, recommendations[]}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
        },
        { timeout: 60000 }
      );

      const text = response.data.candidates[0].content.parts[0].text;
      return { provider: 'gemini', status: 'success', analysis: JSON.parse(text) };
    } catch (error) {
      return { provider: 'gemini', status: 'error', message: error.message };
    }
  }

  async generateRecommendations(companyData) {
    if (!this.isConfigured) return [];

    const prompt = `${this.getSystemPrompt()}\n\nGenerate compliance recommendations for:
${JSON.stringify(companyData, null, 2)}
Return JSON array: [{priority, module, title, description, action, penalty}]`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
        },
        { timeout: 60000 }
      );

      return JSON.parse(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      return [];
    }
  }

  async chat(messages) {
    if (!this.isConfigured) {
      return { provider: 'gemini', status: 'unconfigured', message: 'Set GOOGLE_AI_API_KEY in backend .env to enable AI chat' };
    }

    try {
      const contents = [
        { role: 'user', parts: [{ text: this.getSystemPrompt() }] },
        { role: 'model', parts: [{ text: 'Understood. I am Emma-i™, ready to assist with South African SMME compliance.' }] },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      ];

      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents,
          generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
        },
        { timeout: 60000 }
      );

      return {
        provider: 'gemini',
        status: 'success',
        message: response.data.candidates[0].content.parts[0].text,
      };
    } catch (error) {
      return { provider: 'gemini', status: 'error', message: error.response?.data?.error?.message || error.message };
    }
  }

  async classifyRequirement(text) {
    if (!this.isConfigured) {
      return { provider: 'gemini', status: 'unconfigured' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: `Classify into SA compliance module. Return JSON: {module, confidence, reasoning}\n\n${text}` }] }],
        },
        { timeout: 30000 }
      );

      return { provider: 'gemini', ...JSON.parse(response.data.candidates[0].content.parts[0].text) };
    } catch (error) {
      return { provider: 'gemini', status: 'error', message: error.message };
    }
  }
}

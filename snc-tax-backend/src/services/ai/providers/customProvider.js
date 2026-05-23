import axios from 'axios';
import BaseProvider from './baseProvider.js';

/**
 * Custom / Local Model Provider
 * Connects to any OpenAI-compatible endpoint — Ollama, LM Studio, vLLM, etc.
 * Configured entirely by the user: endpoint URL, model name, optional API key.
 */
export default class CustomProvider extends BaseProvider {
  constructor(options = {}) {
    super('Custom', null);
    // These are set at construction time from user config
    this.baseUrl = options.endpointUrl || 'http://localhost:11434/v1'; // Ollama default
    this.model = options.modelName || options.model || 'llama3';
    this.apiKey = options.apiKey || 'ollama'; // Many local servers accept any value
  }

  get isConfigured() {
    return !!this.baseUrl && !!this.model;
  }

  _headers() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey && this.apiKey !== 'none') {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async chat(messages) {
    if (!this.isConfigured) {
      return { provider: 'custom', status: 'unconfigured', message: 'Set endpoint URL and model name in Settings to use a local model.' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }, { headers: this._headers(), timeout: 120000 });

      return {
        provider: 'custom',
        model: this.model,
        status: 'success',
        message: response.data.choices[0].message.content,
      };
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message;
      return { provider: 'custom', status: 'error', message: `Custom model error: ${msg}` };
    }
  }

  async analyzeDocument(file, context) {
    if (!this.isConfigured) {
      return { provider: 'custom', status: 'unconfigured', message: 'Configure endpoint URL and model name in Settings.' };
    }

    const prompt = `Analyze this document for South African compliance relevance.
Company type: ${context.companyType || 'Pty Ltd'}
Sector: ${context.sector || 'General'}
Filename: ${file.originalname || file.filename}

Identify relevant SA compliance modules (CIPC, SARS, Labour, OHS, POPIA, B-BBEE, FICA), risk level, and recommended actions.
Respond in JSON format only.`;

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }, { headers: this._headers(), timeout: 120000 });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return {
        provider: 'custom',
        status: 'success',
        analysis: jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content },
      };
    } catch (error) {
      return { provider: 'custom', status: 'error', message: error.message };
    }
  }

  async generateRecommendations(companyData) {
    if (!this.isConfigured) return [];

    const prompt = `Generate 3-5 SA compliance recommendations for:
Company: ${companyData.name}, ${companyData.companyType}, ${companyData.sector} sector
Employees: ${companyData.employeeCount}, Turnover: R${companyData.annualTurnover}
Compliance score: ${companyData.complianceScore}%, Overdue: ${companyData.overdueCount} items

Return a JSON array with fields: priority, module, title, description, action, penalty, deadline`;

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }, { headers: this._headers(), timeout: 120000 });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  }

  async classifyRequirement(text) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: 'Classify into one SA compliance module. JSON only: {"module": "...", "confidence": 0.0, "reasoning": "..."}' },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }, { headers: this._headers(), timeout: 30000 });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return { provider: 'custom', ...(jsonMatch ? JSON.parse(jsonMatch[0]) : { module: 'sars', confidence: 0.5 }) };
    } catch (error) {
      return { provider: 'custom', status: 'error', message: error.message };
    }
  }
}

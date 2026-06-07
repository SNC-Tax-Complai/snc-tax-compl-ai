import axios from 'axios';
import BaseProvider from './baseProvider.js';

/**
 * Ollama Local Model Provider
 * Connects to a locally running Ollama instance using its native /api/chat endpoint.
 * Default model: gemma4:12b (configurable via OLLAMA_MODEL env var)
 * Run locally: ollama pull gemma4:12b && ollama serve
 */
export default class OllamaProvider extends BaseProvider {
  constructor(options = {}) {
    super('Ollama', null);
    this.baseUrl = options.endpointUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = options.model || process.env.OLLAMA_MODEL || 'gemma4:12b';
  }

  get isConfigured() {
    return !!this.baseUrl && !!this.model;
  }

  async _request(messages, temperature = 0.5, numPredict = 1500) {
    const response = await axios.post(
      `${this.baseUrl}/api/chat`,
      {
        model: this.model,
        messages,
        stream: false,
        options: { temperature, num_predict: numPredict },
      },
      { timeout: 180000 }
    );
    return response.data.message?.content || '';
  }

  async chat(messages) {
    if (!this.isConfigured) {
      return { provider: 'ollama', status: 'unconfigured', message: 'Set OLLAMA_BASE_URL and OLLAMA_MODEL, then run: ollama serve' };
    }
    try {
      const payload = [
        { role: 'system', content: this.getSystemPrompt() },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ];
      const content = await this._request(payload, 0.5, 1500);
      return { provider: 'ollama', model: this.model, status: 'success', message: content };
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      return { provider: 'ollama', status: 'error', message: `Ollama error: ${msg}` };
    }
  }

  async analyzeDocument(file, context) {
    if (!this.isConfigured) {
      return { provider: 'ollama', status: 'unconfigured', message: 'Configure Ollama in your environment.' };
    }
    const prompt = `Analyze this document for South African compliance relevance.
Company type: ${context.companyType || 'Pty Ltd'}
Sector: ${context.sector || 'General'}
Filename: ${file.originalname || file.filename}

Identify relevant SA compliance modules (CIPC, SARS, Labour, OHS, POPIA, B-BBEE, FICA), risk level, and recommended actions.
Respond in JSON format only.`;
    try {
      const content = await this._request([
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt },
      ], 0.3, 1000);
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return {
        provider: 'ollama',
        status: 'success',
        analysis: jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content },
      };
    } catch (error) {
      return { provider: 'ollama', status: 'error', message: error.message };
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
      const content = await this._request([
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt },
      ], 0.4, 1500);
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  }

  async classifyRequirement(text) {
    try {
      const content = await this._request([
        { role: 'system', content: 'Classify into one SA compliance module. JSON only: {"module": "...", "confidence": 0.0, "reasoning": "..."}' },
        { role: 'user', content: text },
      ], 0.2, 200);
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return { provider: 'ollama', ...(jsonMatch ? JSON.parse(jsonMatch[0]) : { module: 'sars', confidence: 0.5 }) };
    } catch (error) {
      return { provider: 'ollama', status: 'error', message: error.message };
    }
  }
}

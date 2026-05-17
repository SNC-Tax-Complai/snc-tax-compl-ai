import axios from 'axios';
import BaseProvider from './baseProvider.js';

/**
 * Anthropic Claude Provider
 */
export default class ClaudeProvider extends BaseProvider {
  constructor() {
    super('Anthropic Claude', 'ANTHROPIC_API_KEY');
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
  }

  async analyzeDocument(file, context) {
    if (!this.isConfigured) {
      return { provider: 'claude', status: 'unconfigured', message: 'Set ANTHROPIC_API_KEY to enable' };
    }

    const prompt = `Analyze this document for South African SMME compliance relevance.
Company context: ${context.companyType || 'Pty Ltd'}, Sector: ${context.sector || 'General'}
Document: ${file.originalname || file.filename} (${file.mimetype})

Provide analysis as JSON with: documentType, relevantModules[], extractedDates[], riskLevel, recommendations[]`;

    try {
      const response = await axios.post(`${this.baseUrl}/messages`, {
        model: this.model,
        max_tokens: 1000,
        system: this.getSystemPrompt(),
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      const content = response.data.content[0].text;
      return { provider: 'claude', status: 'success', analysis: JSON.parse(content) };
    } catch (error) {
      return { provider: 'claude', status: 'error', message: error.message };
    }
  }

  async generateRecommendations(companyData) {
    if (!this.isConfigured) return [];

    const prompt = `Generate prioritized compliance recommendations for:
Company: ${companyData.name} (${companyData.companyType})
Sector: ${companyData.sector}, Employees: ${companyData.employeeCount}
Score: ${companyData.complianceScore}%, Overdue: ${companyData.overdueCount}

Return JSON array with: priority, module, title, description, action, penalty`;

    try {
      const response = await axios.post(`${this.baseUrl}/messages`, {
        model: this.model,
        max_tokens: 1500,
        system: this.getSystemPrompt(),
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 60000,
      });

      return JSON.parse(response.data.content[0].text);
    } catch (error) {
      return [];
    }
  }

  async classifyRequirement(text) {
    if (!this.isConfigured) {
      return { provider: 'claude', status: 'unconfigured' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/messages`, {
        model: this.model,
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Classify into SA compliance module (cipc/sars/labour/ohs/popia/bbbee/fica/municipal/industry/tax_engine). Return JSON: {module, confidence, reasoning}\n\nText: ${text}`,
        }],
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      });

      return { provider: 'claude', ...JSON.parse(response.data.content[0].text) };
    } catch (error) {
      return { provider: 'claude', status: 'error', message: error.message };
    }
  }
}

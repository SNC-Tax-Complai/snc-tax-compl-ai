import axios from 'axios';
import BaseProvider from './baseProvider.js';
import { extractContent } from '../../documentParserService.js';

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

    const filePath = file.path || file.file_path;
    const mimeType = file.mimetype || file.mime_type;
    const extracted = filePath ? await extractContent(filePath, mimeType) : { type: 'unsupported' };

    const systemPrompt = this.getSystemPrompt();
    const contextStr = `Company: ${context.companyName || 'Unknown'} (${context.companyType || 'Pty Ltd'}), Sector: ${context.sector || 'General'}`;

    let messages;

    if (extracted.type === 'image') {
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: extracted.mediaType, data: extracted.content },
          },
          {
            type: 'text',
            text: `${contextStr}\nAnalyze this document image for South African SMME compliance relevance.\nReturn ONLY valid JSON: { "documentType": string, "relevantModules": string[], "extractedDates": string[], "extractedAmounts": string[], "companyName": string|null, "taxRefNumber": string|null, "riskLevel": "low"|"medium"|"high", "summary": string, "recommendations": string[] }`,
          },
        ],
      }];
    } else if (extracted.type === 'text' && extracted.content) {
      const truncated = extracted.content.slice(0, 6000);
      messages = [{
        role: 'user',
        content: `${contextStr}\nAnalyze the following document text for South African SMME compliance relevance.\n\nDOCUMENT TEXT:\n${truncated}\n\nReturn ONLY valid JSON: { "documentType": string, "relevantModules": string[], "extractedDates": string[], "extractedAmounts": string[], "companyName": string|null, "taxRefNumber": string|null, "riskLevel": "low"|"medium"|"high", "summary": string, "recommendations": string[] }`,
      }];
    } else {
      messages = [{
        role: 'user',
        content: `${contextStr}\nDocument: ${file.originalname || file.filename} (${mimeType}) — content could not be extracted.\nReturn ONLY valid JSON: { "documentType": string, "relevantModules": string[], "extractedDates": [], "extractedAmounts": [], "companyName": null, "taxRefNumber": null, "riskLevel": "low", "summary": "Document content unavailable for analysis", "recommendations": [] }`,
      }];
    }

    try {
      const response = await axios.post(`${this.baseUrl}/messages`, {
        model: this.model,
        max_tokens: 1200,
        system: systemPrompt,
        messages,
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 90000,
      });

      const raw = response.data.content[0].text;
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
      return {
        provider: 'claude',
        status: 'success',
        analysis,
        extractedText: extracted.type === 'text' ? extracted.content : null,
      };
    } catch (error) {
      return { provider: 'claude', status: 'error', message: error.response?.data?.error?.message || error.message };
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

  async chat(messages) {
    if (!this.isConfigured) {
      return { provider: 'claude', status: 'unconfigured', message: 'Set ANTHROPIC_API_KEY in backend .env to enable AI chat' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/messages`, {
        model: this.model,
        max_tokens: 1500,
        system: this.getSystemPrompt(),
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      return {
        provider: 'claude',
        status: 'success',
        message: response.data.content[0].text,
      };
    } catch (error) {
      return { provider: 'claude', status: 'error', message: error.response?.data?.error?.message || error.message };
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

import axios from 'axios';
import BaseProvider from './baseProvider.js';

export default class OpenRouterProvider extends BaseProvider {
  constructor() {
    super('OpenRouter', 'OPENROUTER_API_KEY');
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash:free';
  }

  _headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'SNC-TAX Compl-Ai',
    };
  }

  async analyzeDocument(file, context) {
    if (!this.isConfigured) {
      return { provider: 'openrouter', status: 'unconfigured', message: 'Set OPENROUTER_API_KEY to enable' };
    }

    const prompt = `Analyze this document for South African compliance relevance.
Company type: ${context.companyType || 'Pty Ltd'}
Sector: ${context.sector || 'General'}
Filename: ${file.originalname || file.filename}
File type: ${file.mimetype}

Identify:
1. Which compliance module(s) this relates to (CIPC, SARS, Labour, OHS, POPIA, B-BBEE, FICA, Municipal, Industry)
2. Any deadlines or dates found
3. Risk level (low/medium/high/critical)
4. Recommended actions

Respond in JSON format.`;

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }, {
        headers: this._headers(),
        timeout: 60000,
      });

      const content = response.data.choices[0].message.content;
      return { provider: 'openrouter', status: 'success', analysis: JSON.parse(content) };
    } catch (error) {
      return { provider: 'openrouter', status: 'error', message: error.response?.data?.error?.message || error.message };
    }
  }

  async generateRecommendations(companyData) {
    if (!this.isConfigured) return [];

    const prompt = `Generate compliance recommendations for this South African company:
Name: ${companyData.name}
Type: ${companyData.companyType}
Sector: ${companyData.sector}
Employees: ${companyData.employeeCount}
Turnover: R${companyData.annualTurnover}
Current compliance score: ${companyData.complianceScore}%
Overdue items: ${companyData.overdueCount}

Provide 3-5 prioritized recommendations in JSON array format with fields:
priority (high/medium/low), module, title, description, action, penalty, deadline`;

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }, {
        headers: this._headers(),
        timeout: 60000,
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      return [];
    }
  }

  async chat(messages, retries = 2) {
    if (!this.isConfigured) {
      return { provider: 'openrouter', status: 'unconfigured', message: 'Set OPENROUTER_API_KEY in backend .env to enable AI chat' };
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(`${this.baseUrl}/chat/completions`, {
          model: this.model,
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.5,
          max_tokens: 1500,
        }, {
          headers: this._headers(),
          timeout: 60000,
        });

        return {
          provider: 'openrouter',
          status: 'success',
          message: response.data.choices[0].message.content,
        };
      } catch (error) {
        const meta = error.response?.data?.error?.metadata;
        const retryAfter = meta?.retry_after_seconds;

        if (error.response?.status === 429 && retryAfter && attempt < retries) {
          console.log(`OpenRouter rate-limited, retrying in ${retryAfter}s (attempt ${attempt + 1}/${retries})`);
          await new Promise(r => setTimeout(r, (retryAfter + 1) * 1000));
          continue;
        }

        const raw = meta?.raw || error.response?.data?.error?.message || error.message;
        return { provider: 'openrouter', status: 'error', message: raw };
      }
    }
  }

  async classifyRequirement(text) {
    if (!this.isConfigured) {
      return { provider: 'openrouter', status: 'unconfigured' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: 'Classify the following text into one SA compliance module. Respond with JSON: {module, confidence, reasoning}' },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }, {
        headers: this._headers(),
        timeout: 30000,
      });

      return { provider: 'openrouter', ...JSON.parse(response.data.choices[0].message.content) };
    } catch (error) {
      return { provider: 'openrouter', status: 'error', message: error.message };
    }
  }
}

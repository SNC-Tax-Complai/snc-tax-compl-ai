import axios from 'axios';
import BaseProvider from './baseProvider.js';

/**
 * Emma-i™ AI Provider
 * SA-iLabs compliance engine, backed by Anthropic Claude via OpenRouter.
 * Uses OpenAI-compatible API format — configure with your OpenRouter API key.
 */
export default class EmmaIProvider extends BaseProvider {
  constructor() {
    super('Emma-i™', 'EMMA_I_API_KEY');
    this.baseUrl = process.env.EMMA_I_API_URL || 'https://openrouter.ai/api/v1';
    this.model = process.env.EMMA_I_MODEL || 'anthropic/claude-3-haiku';
  }

  _headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5000',
      'X-Title': 'SNC-TAX Emma-i™ Compliance Engine',
    };
  }

  async analyzeDocument(file, context) {
    if (!this.isConfigured) return this.getMockDocumentAnalysis(file, context);

    const prompt = `Analyze this document for South African compliance relevance.
Company type: ${context.companyType || 'Pty Ltd'}
Sector: ${context.sector || 'General'}
Filename: ${file.originalname || file.filename}
File type: ${file.mimetype}

Identify:
1. Which SA compliance module(s) this relates to (CIPC, SARS, Labour, OHS, POPIA, B-BBEE, FICA, Municipal, Industry)
2. Any deadlines or dates found
3. Risk level (low/medium/high/critical)
4. Recommended actions

Respond in JSON format only.`;

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }, { headers: this._headers(), timeout: 60000 });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return {
        provider: 'emma-i',
        status: 'success',
        analysis: jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content },
      };
    } catch (error) {
      console.error('Emma-i™ analyzeDocument error:', error.message);
      return this.getMockDocumentAnalysis(file, context);
    }
  }

  async generateRecommendations(companyData) {
    if (!this.isConfigured) return this.getMockRecommendations(companyData);

    const prompt = `Generate compliance recommendations for this South African company:
Name: ${companyData.name}
Type: ${companyData.companyType}
Sector: ${companyData.sector}
Employees: ${companyData.employeeCount}
Turnover: R${companyData.annualTurnover}
Current compliance score: ${companyData.complianceScore}%
Overdue items: ${companyData.overdueCount}

Provide 3-5 prioritized recommendations as a JSON array with fields:
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
      }, { headers: this._headers(), timeout: 60000 });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.getMockRecommendations(companyData);
    } catch (error) {
      console.error('Emma-i™ recommendations error:', error.message);
      return this.getMockRecommendations(companyData);
    }
  }

  async chat(messages, retries = 2) {
    if (!this.isConfigured) return this.getMockChat(messages);

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
        }, { headers: this._headers(), timeout: 60000 });

        return {
          provider: 'emma-i',
          status: 'success',
          message: response.data.choices[0].message.content,
        };
      } catch (error) {
        const meta = error.response?.data?.error?.metadata;
        const retryAfter = meta?.retry_after_seconds;
        if (error.response?.status === 429 && retryAfter && attempt < retries) {
          await new Promise(r => setTimeout(r, (retryAfter + 1) * 1000));
          continue;
        }
        const msg = meta?.raw || error.response?.data?.error?.message || error.message;
        return { provider: 'emma-i', status: 'error', message: msg };
      }
    }
  }

  async classifyRequirement(text) {
    if (!this.isConfigured) return this.getMockClassification(text);

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: 'system', content: 'Classify the following text into one SA compliance module. Respond with JSON only: {"module": "...", "confidence": 0.0, "reasoning": "..."}' },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }, { headers: this._headers(), timeout: 30000 });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return { provider: 'emma-i', ...(jsonMatch ? JSON.parse(jsonMatch[0]) : { module: 'sars', confidence: 0.5 }) };
    } catch (error) {
      return this.getMockClassification(text);
    }
  }

  // ─── Mock fallbacks (used when no API key is configured) ────────────────────

  getMockDocumentAnalysis(file, context) {
    return {
      provider: 'emma-i',
      status: 'mock',
      filename: file.originalname || file.filename,
      analysis: {
        documentType: 'compliance_document',
        confidence: 0.85,
        relevantModules: ['sars', 'labour'],
        extractedInfo: { dates: [], amounts: [], references: [] },
        recommendations: [
          'Document appears to be a tax-related filing. Ensure it is submitted before the due date.',
          'Consider uploading this as evidence for your SARS compliance requirements.',
        ],
        riskLevel: 'medium',
      },
    };
  }

  getMockRecommendations(companyData) {
    return [
      {
        id: 1,
        priority: 'high',
        module: 'sars',
        title: 'Submit EMP201 Monthly Return',
        description: 'Your monthly PAYE/SDL/UIF reconciliation is approaching its due date.',
        action: 'Review payroll data and submit via SARS eFiling before the 7th of next month.',
        penalty: 'R10,000 per month of non-compliance',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        priority: 'medium',
        module: 'popia',
        title: 'Update PAIA Manual (Section 51)',
        description: 'Your PAIA manual should be reviewed annually to reflect current data processing activities.',
        action: 'Review and update your Section 51 manual, then publish on your website.',
        penalty: 'Up to R10 million fine',
        deadline: null,
      },
      {
        id: 3,
        priority: 'low',
        module: 'bbbee',
        title: 'Schedule B-BBEE Verification',
        description: 'Annual B-BBEE verification is recommended to maintain your scorecard for tender participation.',
        action: 'Contact a SANAS-accredited verification agency to schedule your annual assessment.',
        penalty: 'Loss of tender opportunities',
        deadline: null,
      },
    ];
  }

  getMockChat(messages) {
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const responses = {
      emp201: 'EMP201 returns are due by the 7th of each month. You must reconcile PAYE, SDL, and UIF deductions for all employees. Submit via SARS eFiling. Late submissions attract a 10% penalty plus interest.',
      vat: 'VAT201 returns are due by the 25th of the month following the tax period end. Register for VAT when turnover exceeds R1 million in 12 months.',
      cipc: 'CIPC Annual Returns are due within 30 business days of your company anniversary date. Non-compliance can lead to deregistration.',
      popia: 'POPIA requires registration with the Information Regulator, appointment of an Information Officer, and a PAIA Section 51 Manual. Penalties can reach R10 million.',
      bbbee: 'B-BBEE verification must be done annually through a SANAS-accredited agency. EMEs (turnover under R10m) automatically qualify for Level 4, or Level 1 if 51%+ black-owned.',
      coida: 'COIDA registration is mandatory for all employers. Submit your Return of Earnings (W.As.8) annually by 31 March.',
      default: 'I\'m Emma-i™, your SA compliance assistant. I can help with SARS tax obligations, CIPC filings, labour law, POPIA data protection, B-BBEE, and more. What specific compliance area would you like to explore?\n\n_Note: Configure your OpenRouter API key in Settings to enable full AI responses._',
    };

    let reply = responses.default;
    for (const [key, value] of Object.entries(responses)) {
      if (key !== 'default' && lastMsg.includes(key)) { reply = value; break; }
    }

    return { provider: 'emma-i', status: 'mock', message: reply };
  }

  getMockClassification(text) {
    const lower = text.toLowerCase();
    if (lower.includes('tax') || lower.includes('vat') || lower.includes('sars')) return { provider: 'emma-i', module: 'sars', confidence: 0.9, reasoning: 'Mock classification' };
    if (lower.includes('employee') || lower.includes('labour') || lower.includes('coida')) return { provider: 'emma-i', module: 'labour', confidence: 0.85, reasoning: 'Mock classification' };
    if (lower.includes('data') || lower.includes('privacy') || lower.includes('popia')) return { provider: 'emma-i', module: 'popia', confidence: 0.88, reasoning: 'Mock classification' };
    if (lower.includes('safety') || lower.includes('ohs')) return { provider: 'emma-i', module: 'ohs', confidence: 0.87, reasoning: 'Mock classification' };
    if (lower.includes('cipc') || lower.includes('annual return')) return { provider: 'emma-i', module: 'cipc', confidence: 0.9, reasoning: 'Mock classification' };
    return { provider: 'emma-i', module: 'sars', confidence: 0.6, reasoning: 'Mock classification (configure EMMA_I_API_KEY for real results)' };
  }
}

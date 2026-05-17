import axios from 'axios';
import BaseProvider from './baseProvider.js';

/**
 * Emma-i™ AI Provider (Primary)
 * Custom AI engine developed by SA-iLabs™
 */
export default class EmmaIProvider extends BaseProvider {
  constructor() {
    super('Emma-i™', 'EMMA_I_API_KEY');
    this.baseUrl = process.env.EMMA_I_API_URL || 'https://api.emma-i.co.za/v1';
  }

  async analyzeDocument(file, context) {
    if (!this.isConfigured) {
      return this.getMockDocumentAnalysis(file, context);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/analyze`, {
        file_path: file.path,
        file_type: file.mimetype,
        context: {
          company_type: context.companyType,
          sector: context.sector,
          modules: context.modules || [],
        },
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      console.error('Emma-i™ analyze error:', error.message);
      return this.getMockDocumentAnalysis(file, context);
    }
  }

  async generateRecommendations(companyData) {
    if (!this.isConfigured) {
      return this.getMockRecommendations(companyData);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/recommendations`, {
        company: companyData,
        system_prompt: this.getSystemPrompt(),
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      return response.data.recommendations;
    } catch (error) {
      console.error('Emma-i™ recommendations error:', error.message);
      return this.getMockRecommendations(companyData);
    }
  }

  async classifyRequirement(text) {
    if (!this.isConfigured) {
      return this.getMockClassification(text);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/classify`, {
        text,
        categories: ['cipc', 'sars', 'labour', 'ohs', 'popia', 'bbbee', 'fica', 'municipal', 'industry', 'tax_engine'],
      }, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      return this.getMockClassification(text);
    }
  }

  // Development fallbacks when API key not configured
  getMockDocumentAnalysis(file, context) {
    return {
      provider: 'emma-i',
      status: 'mock',
      filename: file.originalname || file.filename,
      analysis: {
        documentType: 'compliance_document',
        confidence: 0.85,
        relevantModules: ['sars', 'labour'],
        extractedInfo: {
          dates: [],
          amounts: [],
          references: [],
        },
        recommendations: [
          'Document appears to be a tax-related filing. Ensure it is submitted before the due date.',
          'Consider uploading this as evidence for your SARS compliance requirements.',
        ],
        riskLevel: 'medium',
      },
    };
  }

  getMockRecommendations(companyData) {
    const recommendations = [
      {
        id: 1,
        priority: 'high',
        module: 'sars',
        title: 'Submit EMP201 Monthly Return',
        description: 'Your monthly PAYE/SDL/UIF reconciliation is approaching its due date. Ensure all employee data is captured correctly.',
        action: 'Review payroll data and submit via SARS eFiling before the 7th of next month.',
        penalty: 'R10,000 per month of non-compliance',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        priority: 'medium',
        module: 'popia',
        title: 'Update PAIA Manual (Section 51)',
        description: 'Your PAIA manual should be reviewed annually to ensure it reflects current data processing activities.',
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

    return recommendations;
  }

  getMockClassification(text) {
    const lowerText = text.toLowerCase();
    let module = 'sars';
    let confidence = 0.6;

    if (lowerText.includes('tax') || lowerText.includes('vat') || lowerText.includes('sars')) {
      module = 'sars'; confidence = 0.9;
    } else if (lowerText.includes('employee') || lowerText.includes('labour') || lowerText.includes('coida')) {
      module = 'labour'; confidence = 0.85;
    } else if (lowerText.includes('data') || lowerText.includes('privacy') || lowerText.includes('popia')) {
      module = 'popia'; confidence = 0.88;
    } else if (lowerText.includes('safety') || lowerText.includes('health') || lowerText.includes('ohs')) {
      module = 'ohs'; confidence = 0.87;
    } else if (lowerText.includes('cipc') || lowerText.includes('director') || lowerText.includes('annual return')) {
      module = 'cipc'; confidence = 0.9;
    }

    return {
      provider: 'emma-i',
      module,
      confidence,
      reasoning: `Classified based on keyword analysis (mock mode - configure EMMA_I_API_KEY for real classification)`,
    };
  }
}

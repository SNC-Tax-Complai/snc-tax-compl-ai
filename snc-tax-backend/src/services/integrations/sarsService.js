import axios from 'axios';
import logger from '../../config/logger.js';

/**
 * SARS eFiling Integration Service
 * Handles communication with SARS API for tax compliance
 *
 * Note: SARS API access requires vendor registration.
 * This service provides the integration layer that will connect
 * once credentials are obtained.
 */
class SARSService {
  constructor() {
    this.baseUrl = process.env.SARS_EFILING_URL || 'https://api.sarsefiling.co.za/v1';
    this.clientId = process.env.SARS_CLIENT_ID || null;
    this.clientSecret = process.env.SARS_CLIENT_SECRET || null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  get isConfigured() {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Authenticate with SARS eFiling API
   */
  async authenticate() {
    if (!this.isConfigured) {
      return { authenticated: false, reason: 'SARS credentials not configured' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return { authenticated: true };
    } catch (error) {
      logger.error('SARS authentication failed', { error: error.message });
      return { authenticated: false, reason: error.message };
    }
  }

  /**
   * Ensure valid token before API calls
   */
  async ensureToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
    return this.accessToken;
  }

  /**
   * Validate a tax reference number
   */
  async validateTaxReference(taxRef) {
    if (!this.isConfigured) {
      return this.getMockTaxValidation(taxRef);
    }

    try {
      await this.ensureToken();
      const response = await axios.get(`${this.baseUrl}/taxpayer/validate/${taxRef}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      });
      return response.data;
    } catch (error) {
      logger.error('SARS tax validation failed', { taxRef, error: error.message });
      return this.getMockTaxValidation(taxRef);
    }
  }

  /**
   * Get filing status for a company
   */
  async getFilingStatus(taxRef, filingType) {
    if (!this.isConfigured) {
      return this.getMockFilingStatus(taxRef, filingType);
    }

    try {
      await this.ensureToken();
      const response = await axios.get(`${this.baseUrl}/filings/status`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
        params: { tax_reference: taxRef, filing_type: filingType },
      });
      return response.data;
    } catch (error) {
      logger.error('SARS filing status failed', { taxRef, filingType, error: error.message });
      return this.getMockFilingStatus(taxRef, filingType);
    }
  }

  /**
   * Get Tax Compliance Status (TCS) certificate status
   */
  async getTaxComplianceStatus(taxRef) {
    if (!this.isConfigured) {
      return this.getMockTCSStatus(taxRef);
    }

    try {
      await this.ensureToken();
      const response = await axios.get(`${this.baseUrl}/tcs/status/${taxRef}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      });
      return response.data;
    } catch (error) {
      return this.getMockTCSStatus(taxRef);
    }
  }

  /**
   * Get outstanding returns for a taxpayer
   */
  async getOutstandingReturns(taxRef) {
    if (!this.isConfigured) {
      return this.getMockOutstandingReturns(taxRef);
    }

    try {
      await this.ensureToken();
      const response = await axios.get(`${this.baseUrl}/returns/outstanding/${taxRef}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      });
      return response.data;
    } catch (error) {
      return this.getMockOutstandingReturns(taxRef);
    }
  }

  // ============== Mock responses for development ==============

  getMockTaxValidation(taxRef) {
    return {
      mock: true,
      valid: taxRef && taxRef.length >= 10,
      taxReference: taxRef,
      taxpayerName: 'Test Company (Pty) Ltd',
      registeredForVAT: true,
      registeredForPAYE: true,
      status: 'active',
    };
  }

  getMockFilingStatus(taxRef, filingType) {
    return {
      mock: true,
      taxReference: taxRef,
      filingType,
      submissions: [
        {
          period: '2026-04',
          status: 'submitted',
          submissionDate: '2026-05-07',
          assessmentStatus: 'processed',
        },
        {
          period: '2026-03',
          status: 'submitted',
          submissionDate: '2026-04-07',
          assessmentStatus: 'processed',
        },
      ],
      nextDue: {
        period: '2026-05',
        dueDate: '2026-06-07',
        filingType,
      },
    };
  }

  getMockTCSStatus(taxRef) {
    return {
      mock: true,
      taxReference: taxRef,
      status: 'compliant',
      pinNumber: 'TCS-MOCK-0001',
      issueDate: '2026-01-15',
      expiryDate: '2027-01-15',
      valid: true,
    };
  }

  getMockOutstandingReturns(taxRef) {
    return {
      mock: true,
      taxReference: taxRef,
      outstanding: [
        { returnType: 'EMP201', period: '2026-05', dueDate: '2026-06-07' },
      ],
      totalOutstanding: 1,
    };
  }
}

export default new SARSService();

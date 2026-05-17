/**
 * Base AI Provider
 * All providers must implement this interface
 */
export default class BaseProvider {
  constructor(name, apiKeyEnv) {
    this.name = name;
    this.apiKey = process.env[apiKeyEnv] || null;
  }

  get isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Analyze an uploaded document for compliance relevance
   * @param {Object} file - File metadata (path, mimetype, originalname)
   * @param {Object} context - Company and compliance context
   * @returns {Promise<DocumentAnalysis>}
   */
  async analyzeDocument(file, context) {
    throw new Error(`${this.name}: analyzeDocument not implemented`);
  }

  /**
   * Generate compliance recommendations for a company
   * @param {Object} companyData - Company profile and current compliance status
   * @returns {Promise<Recommendation[]>}
   */
  async generateRecommendations(companyData) {
    throw new Error(`${this.name}: generateRecommendations not implemented`);
  }

  /**
   * Classify text into compliance categories
   * @param {string} text - Text to classify
   * @returns {Promise<ClassificationResult>}
   */
  async classifyRequirement(text) {
    throw new Error(`${this.name}: classifyRequirement not implemented`);
  }

  /**
   * Build the SA compliance system prompt
   */
  getSystemPrompt() {
    return `You are Emma-i™, an AI compliance assistant specializing in South African SMME compliance.
You have expertise in:
- CIPC (Companies & Intellectual Property Commission) requirements
- SARS (South African Revenue Service) tax obligations
- Labour Law (BCEA, LRA, Employment Equity)
- OHS (Occupational Health & Safety Act)
- POPIA & PAIA (Data Protection)
- B-BBEE (Broad-Based Black Economic Empowerment)
- FICA (Financial Intelligence Centre Act)
- Municipal compliance (licenses, rates, permits)
- Industry-specific regulations

When analyzing documents or providing recommendations:
1. Always reference specific South African legislation
2. Provide practical, actionable advice for SMMEs
3. Flag urgent deadlines and potential penalties
4. Consider the company's size, sector, and turnover
5. Prioritize by risk level (penalty amount and likelihood)

Respond in clear, professional language suitable for business owners who may not have legal expertise.`;
  }
}

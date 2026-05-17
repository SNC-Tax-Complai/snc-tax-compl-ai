import EmmaIProvider from './providers/emmaIProvider.js';
import OpenAIProvider from './providers/openAIProvider.js';
import ClaudeProvider from './providers/claudeProvider.js';
import GeminiProvider from './providers/geminiProvider.js';

/**
 * AI Provider Factory
 * Creates and manages AI provider instances for compliance analysis
 */
class AIProviderFactory {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = process.env.AI_PROVIDER_DEFAULT || 'emma-i';
  }

  /**
   * Get or create a provider instance
   */
  getProvider(providerId) {
    const id = providerId || this.defaultProvider;

    if (!this.providers.has(id)) {
      this.providers.set(id, this.createProvider(id));
    }

    return this.providers.get(id);
  }

  /**
   * Create a new provider instance
   */
  createProvider(providerId) {
    switch (providerId) {
      case 'emma-i':
        return new EmmaIProvider();
      case 'openai':
        return new OpenAIProvider();
      case 'claude':
        return new ClaudeProvider();
      case 'gemini':
        return new GeminiProvider();
      default:
        throw new Error(`Unknown AI provider: ${providerId}`);
    }
  }

  /**
   * List available providers with status
   */
  listProviders() {
    return [
      {
        id: 'emma-i',
        name: 'Emma-i™',
        status: process.env.EMMA_I_API_KEY ? 'active' : 'unconfigured',
        isDefault: this.defaultProvider === 'emma-i',
      },
      {
        id: 'openai',
        name: 'OpenAI GPT-4',
        status: process.env.OPENAI_API_KEY ? 'active' : 'unconfigured',
        isDefault: this.defaultProvider === 'openai',
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        status: process.env.ANTHROPIC_API_KEY ? 'active' : 'unconfigured',
        isDefault: this.defaultProvider === 'claude',
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        status: process.env.GOOGLE_AI_API_KEY ? 'active' : 'unconfigured',
        isDefault: this.defaultProvider === 'gemini',
      },
    ];
  }

  /**
   * Analyze a document using the configured or specified provider
   */
  async analyzeDocument(file, context, providerId) {
    const provider = this.getProvider(providerId);
    return provider.analyzeDocument(file, context);
  }

  /**
   * Generate compliance recommendations
   */
  async generateRecommendations(companyData, providerId) {
    const provider = this.getProvider(providerId);
    return provider.generateRecommendations(companyData);
  }

  /**
   * Classify a compliance requirement from text
   */
  async classifyRequirement(text, providerId) {
    const provider = this.getProvider(providerId);
    return provider.classifyRequirement(text);
  }
}

export default new AIProviderFactory();

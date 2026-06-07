import EmmaIProvider from './providers/emmaIProvider.js';
import OpenAIProvider from './providers/openAIProvider.js';
import ClaudeProvider from './providers/claudeProvider.js';
import GeminiProvider from './providers/geminiProvider.js';
import OpenRouterProvider from './providers/openRouterProvider.js';
import CustomProvider from './providers/customProvider.js';
import OllamaProvider from './providers/ollamaProvider.js';
import db from '../../config/database.js';

class AIProviderFactory {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = process.env.AI_PROVIDER_DEFAULT || 'emma-i';
  }

  getProvider(providerId) {
    const id = providerId || this.defaultProvider;
    if (!this.providers.has(id)) {
      this.providers.set(id, this.createProvider(id));
    }
    return this.providers.get(id);
  }

  createProvider(providerId, overrides = {}) {
    let provider;
    switch (providerId) {
      case 'emma-i':    provider = new EmmaIProvider(); break;
      case 'openai':    provider = new OpenAIProvider(); break;
      case 'claude':    provider = new ClaudeProvider(); break;
      case 'gemini':    provider = new GeminiProvider(); break;
      case 'openrouter': provider = new OpenRouterProvider(); break;
      case 'ollama':    provider = new OllamaProvider(overrides); break;
      case 'custom':    provider = new CustomProvider(overrides); break;
      default:          throw new Error(`Unknown AI provider: ${providerId}`);
    }

    if (overrides.apiKey) provider.apiKey = overrides.apiKey;
    if (overrides.model) provider.model = overrides.model;
    if (overrides.endpointUrl) provider.baseUrl = overrides.endpointUrl;
    if (overrides.temperature !== undefined) provider.temperature = overrides.temperature;
    if (overrides.maxTokens !== undefined) provider.maxTokens = overrides.maxTokens;
    if (overrides.systemPrompt) provider.systemPromptOverride = overrides.systemPrompt;
    if (overrides.personaName) provider.personaName = overrides.personaName;

    return provider;
  }

  listProviders() {
    return [
      { id: 'emma-i',     name: 'Emma-i™',           status: process.env.EMMA_I_API_KEY ? 'active' : 'unconfigured',         isDefault: this.defaultProvider === 'emma-i' },
      { id: 'openai',     name: 'OpenAI',             status: process.env.OPENAI_API_KEY ? 'active' : 'unconfigured',         isDefault: this.defaultProvider === 'openai' },
      { id: 'claude',     name: 'Anthropic Claude',   status: process.env.ANTHROPIC_API_KEY ? 'active' : 'unconfigured',      isDefault: this.defaultProvider === 'claude' },
      { id: 'gemini',     name: 'Google Gemini',      status: process.env.GOOGLE_AI_API_KEY ? 'active' : 'unconfigured',      isDefault: this.defaultProvider === 'gemini' },
      { id: 'openrouter', name: 'OpenRouter',         status: process.env.OPENROUTER_API_KEY ? 'active' : 'unconfigured',     isDefault: this.defaultProvider === 'openrouter' },
      { id: 'ollama',     name: 'Ollama (Local)',     status: 'local',                                                        isDefault: this.defaultProvider === 'ollama' },
      { id: 'custom',     name: 'Custom / Local',     status: 'user-configured',                                              isDefault: this.defaultProvider === 'custom' },
    ];
  }

  async analyzeDocument(file, context, providerId) {
    return this.getProvider(providerId).analyzeDocument(file, context);
  }

  async generateRecommendations(companyData, providerId) {
    return this.getProvider(providerId).generateRecommendations(companyData);
  }

  async chat(messages, providerId) {
    return this.getProvider(providerId).chat(messages);
  }

  async classifyRequirement(text, providerId) {
    return this.getProvider(providerId).classifyRequirement(text);
  }
}

const factory = new AIProviderFactory();

export async function resolveProviderForUser(userId, overrideProviderId) {
  try {
    const prefs = await db.oneOrNone(
      'SELECT default_provider, default_model, system_prompt, persona_name FROM user_ai_preferences WHERE user_id = $1',
      [userId]
    );

    const providerId = overrideProviderId || prefs?.default_provider || factory.defaultProvider;

    const config = await db.oneOrNone(
      'SELECT api_key_encrypted, model, endpoint_url, temperature, max_tokens, custom_model_name FROM user_ai_settings WHERE user_id = $1 AND provider = $2',
      [userId, providerId]
    );

    const overrides = {
      systemPrompt: prefs?.system_prompt || null,
      personaName: prefs?.persona_name || null,
    };

    if (config && (config.api_key_encrypted || providerId === 'custom' || providerId === 'ollama')) {
      return factory.createProvider(providerId, {
        ...overrides,
        apiKey: config.api_key_encrypted,
        model: config.model || config.custom_model_name || prefs?.default_model,
        endpointUrl: config.endpoint_url,
        modelName: config.custom_model_name,
        temperature: config.temperature ? parseFloat(config.temperature) : undefined,
        maxTokens: config.max_tokens,
      });
    }

    const provider = factory.getProvider(providerId);
    if (overrides.systemPrompt) provider.systemPromptOverride = overrides.systemPrompt;
    if (overrides.personaName) provider.personaName = overrides.personaName;
    return provider;
  } catch {
    return factory.getProvider(overrideProviderId || factory.defaultProvider);
  }
}

export async function chatForUser(userId, messages, overrideProviderId) {
  const provider = await resolveProviderForUser(userId, overrideProviderId);
  return provider.chat(messages);
}

export async function analyzeForUser(userId, file, context, overrideProviderId) {
  const provider = await resolveProviderForUser(userId, overrideProviderId);
  return provider.analyzeDocument(file, context);
}

export async function recommendForUser(userId, companyData, overrideProviderId) {
  const provider = await resolveProviderForUser(userId, overrideProviderId);
  return provider.generateRecommendations(companyData);
}

export async function classifyForUser(userId, text, overrideProviderId) {
  const provider = await resolveProviderForUser(userId, overrideProviderId);
  return provider.classifyRequirement(text);
}

export default factory;

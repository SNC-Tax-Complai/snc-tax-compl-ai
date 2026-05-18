const MODEL_CATALOG = {
  providers: [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      tier: 'free',
      apiBase: 'https://openrouter.ai/api/v1',
      keyEnvVar: 'OPENROUTER_API_KEY',
      description: 'Access multiple models through one API. Free tier available.',
      models: [
        { id: 'deepseek/deepseek-v4-flash:free', name: 'DeepSeek V4 Flash', tier: 'free', contextWindow: 32000 },
        { id: 'qwen/qwen3-coder:free', name: 'Qwen 3 Coder', tier: 'free', contextWindow: 32000 },
        { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick', tier: 'free', contextWindow: 128000 },
        { id: 'google/gemini-2.5-flash-preview:free', name: 'Gemini 2.5 Flash', tier: 'free', contextWindow: 1000000 },
        { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small 3.2', tier: 'free', contextWindow: 32000 },
        { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Reasoning)', tier: 'free', contextWindow: 64000 },
        { id: 'deepseek/deepseek-v4', name: 'DeepSeek V4 (Paid)', tier: 'paid', contextWindow: 64000 },
        { id: 'openai/gpt-4o', name: 'GPT-4o via OpenRouter', tier: 'paid', contextWindow: 128000 },
        { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet via OpenRouter', tier: 'paid', contextWindow: 200000 },
      ],
    },
    {
      id: 'openai',
      name: 'OpenAI',
      tier: 'paid',
      apiBase: 'https://api.openai.com/v1',
      keyEnvVar: 'OPENAI_API_KEY',
      description: 'GPT-4 and GPT-3.5 models from OpenAI.',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', tier: 'paid', contextWindow: 128000 },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'paid', contextWindow: 128000 },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', tier: 'paid', contextWindow: 128000 },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tier: 'paid', contextWindow: 16000 },
      ],
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      tier: 'paid',
      apiBase: 'https://api.anthropic.com/v1',
      keyEnvVar: 'ANTHROPIC_API_KEY',
      description: 'Claude models from Anthropic with strong reasoning capabilities.',
      models: [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', tier: 'paid', contextWindow: 200000 },
        { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', tier: 'paid', contextWindow: 200000 },
        { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', tier: 'paid', contextWindow: 200000 },
      ],
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      tier: 'paid',
      apiBase: 'https://generativelanguage.googleapis.com/v1beta',
      keyEnvVar: 'GOOGLE_AI_API_KEY',
      description: 'Gemini models from Google AI.',
      models: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tier: 'paid', contextWindow: 1000000 },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tier: 'paid', contextWindow: 2000000 },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tier: 'paid', contextWindow: 1000000 },
      ],
    },
    {
      id: 'emma-i',
      name: 'Emma-i™ (SA-iLabs)',
      tier: 'paid',
      apiBase: null,
      keyEnvVar: 'EMMA_I_API_KEY',
      description: 'SA-iLabs proprietary AI engine, purpose-built for South African compliance.',
      models: [
        { id: 'emma-i-v1', name: 'Emma-i V1', tier: 'paid', contextWindow: 32000 },
      ],
    },
  ],

  getProvider(providerId) {
    return this.providers.find(p => p.id === providerId);
  },

  getModelsForProvider(providerId) {
    const provider = this.getProvider(providerId);
    return provider ? provider.models : [];
  },

  getFreeModels() {
    return this.providers.flatMap(p =>
      p.models.filter(m => m.tier === 'free').map(m => ({ ...m, providerId: p.id, providerName: p.name }))
    );
  },

  getPaidModels() {
    return this.providers.flatMap(p =>
      p.models.filter(m => m.tier === 'paid').map(m => ({ ...m, providerId: p.id, providerName: p.name }))
    );
  },

  getFullCatalog() {
    return {
      providers: this.providers.map(p => ({
        ...p,
        models: p.models,
      })),
      freeModels: this.getFreeModels(),
      paidModels: this.getPaidModels(),
    };
  },
};

export default MODEL_CATALOG;

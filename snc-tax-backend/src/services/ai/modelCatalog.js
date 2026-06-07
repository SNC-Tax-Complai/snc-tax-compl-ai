const MODEL_CATALOG = {
  providers: [
    // ─── OpenRouter ───────────────────────────────────────────────────────────
    {
      id: 'openrouter',
      name: 'OpenRouter',
      tier: 'free',
      apiBase: 'https://openrouter.ai/api/v1',
      keyEnvVar: 'OPENROUTER_API_KEY',
      description: 'Access 100+ models through one API key. Free tier available with no usage costs.',
      models: [
        // Free models
        {
          id: 'deepseek/deepseek-v4-flash:free',
          name: 'DeepSeek V4 Flash',
          tier: 'free',
          contextWindow: 163840,
          description: 'Fast, capable free model — great all-rounder for compliance Q&A.',
        },
        {
          id: 'meta-llama/llama-4-maverick:free',
          name: 'Llama 4 Maverick',
          tier: 'free',
          contextWindow: 524288,
          description: 'Meta\'s Llama 4 with 512k context — excellent for large document analysis.',
        },
        {
          id: 'meta-llama/llama-4-scout:free',
          name: 'Llama 4 Scout',
          tier: 'free',
          contextWindow: 524288,
          description: 'Lightweight Llama 4 variant — fast responses, 512k context window.',
        },
        {
          id: 'google/gemini-2.5-flash-preview:free',
          name: 'Gemini 2.5 Flash',
          tier: 'free',
          contextWindow: 1048576,
          description: 'Google\'s Gemini 2.5 Flash — 1M context, ideal for entire document sets.',
        },
        {
          id: 'deepseek/deepseek-r1:free',
          name: 'DeepSeek R1 (Reasoning)',
          tier: 'free',
          contextWindow: 163840,
          description: 'Advanced chain-of-thought reasoning — best for complex compliance analysis.',
        },
        {
          id: 'mistralai/mistral-small-3.2-24b-instruct:free',
          name: 'Mistral Small 3.2',
          tier: 'free',
          contextWindow: 131072,
          description: 'Mistral\'s multilingual 24B model — good for multilingual SA contexts.',
        },
        {
          id: 'qwen/qwen3-coder:free',
          name: 'Qwen 3 Coder',
          tier: 'free',
          contextWindow: 131072,
          description: 'Alibaba\'s Qwen 3 Coder — structured output and code generation.',
        },
        // Paid models via OpenRouter
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku (Recommended)',
          tier: 'paid',
          contextWindow: 200000,
          pricePerMillion: 0.25,
          description: '★ Best value Anthropic model at $0.25/1M tokens — fast, accurate, and affordable.',
        },
        {
          id: 'anthropic/claude-sonnet-4-5',
          name: 'Claude Sonnet 4.5',
          tier: 'paid',
          contextWindow: 200000,
          description: 'Anthropic\'s balanced model with strong reasoning and 200k context.',
        },
        {
          id: 'anthropic/claude-opus-4',
          name: 'Claude Opus 4',
          tier: 'paid',
          contextWindow: 200000,
          description: 'Anthropic\'s most powerful model — best quality, highest cost.',
        },
        {
          id: 'openai/gpt-4.1',
          name: 'GPT-4.1',
          tier: 'paid',
          contextWindow: 1047576,
          description: 'OpenAI GPT-4.1 via OpenRouter — 1M context, strong instruction following.',
        },
        {
          id: 'openai/gpt-4.1-mini',
          name: 'GPT-4.1 Mini',
          tier: 'paid',
          contextWindow: 1047576,
          description: 'GPT-4.1 Mini — cost-efficient with full 1M context window.',
        },
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          tier: 'paid',
          contextWindow: 128000,
          description: 'OpenAI\'s GPT-4o multimodal model via OpenRouter.',
        },
        {
          id: 'google/gemini-2.5-pro-preview',
          name: 'Gemini 2.5 Pro',
          tier: 'paid',
          contextWindow: 1048576,
          description: 'Google Gemini 2.5 Pro — top-tier reasoning with 1M context.',
        },
      ],
    },

    // ─── OpenAI Direct ──────────────────────────────────────────────────────────
    {
      id: 'openai',
      name: 'OpenAI',
      tier: 'paid',
      apiBase: 'https://api.openai.com/v1',
      keyEnvVar: 'OPENAI_API_KEY',
      description: 'Direct OpenAI API — GPT-4.1, GPT-4o and GPT-4o Mini models.',
      models: [
        {
          id: 'gpt-4.1',
          name: 'GPT-4.1',
          tier: 'paid',
          contextWindow: 1047576,
          description: 'Latest GPT-4.1 with 1M context — superior instruction following.',
        },
        {
          id: 'gpt-4.1-mini',
          name: 'GPT-4.1 Mini',
          tier: 'paid',
          contextWindow: 1047576,
          description: 'GPT-4.1 Mini — 1M context at a fraction of the cost.',
        },
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          tier: 'paid',
          contextWindow: 128000,
          description: 'GPT-4o — multimodal, fast, and highly capable.',
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          tier: 'paid',
          contextWindow: 128000,
          description: 'Cost-efficient GPT-4o variant — great for high-volume use.',
        },
      ],
    },

    // ─── Anthropic Claude Direct ─────────────────────────────────────────────────────
    {
      id: 'claude',
      name: 'Anthropic Claude',
      tier: 'paid',
      apiBase: 'https://api.anthropic.com/v1',
      keyEnvVar: 'ANTHROPIC_API_KEY',
      description: 'Direct Anthropic API — Claude 4 series with 200k context and advanced reasoning.',
      models: [
        {
          id: 'claude-haiku-4-5-20251001',
          name: 'Claude Haiku 4.5',
          tier: 'paid',
          contextWindow: 200000,
          description: 'Fastest Claude model — ideal for real-time chat and quick classifications.',
        },
        {
          id: 'claude-sonnet-4-20250514',
          name: 'Claude Sonnet 4',
          tier: 'paid',
          contextWindow: 200000,
          description: 'Balanced speed and intelligence — recommended for compliance analysis.',
        },
        {
          id: 'claude-opus-4-20250514',
          name: 'Claude Opus 4',
          tier: 'paid',
          contextWindow: 200000,
          description: 'Most powerful Claude — best for complex multi-step reasoning.',
        },
      ],
    },

    // ─── Google Gemini Direct ──────────────────────────────────────────────────────
    {
      id: 'gemini',
      name: 'Google Gemini',
      tier: 'paid',
      apiBase: 'https://generativelanguage.googleapis.com/v1beta',
      keyEnvVar: 'GOOGLE_AI_API_KEY',
      description: 'Direct Google AI API — Gemini 2.5 series with up to 1M token context.',
      models: [
        {
          id: 'gemini-2.5-flash-preview-05-20',
          name: 'Gemini 2.5 Flash',
          tier: 'paid',
          contextWindow: 1048576,
          description: 'Fast and affordable Gemini 2.5 with 1M context — great for documents.',
        },
        {
          id: 'gemini-2.5-pro-preview-05-06',
          name: 'Gemini 2.5 Pro',
          tier: 'paid',
          contextWindow: 1048576,
          description: 'Gemini\'s most capable model with 1M context and deep reasoning.',
        },
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          tier: 'paid',
          contextWindow: 1048576,
          description: 'Stable Gemini 2.0 Flash — reliable and cost-effective.',
        },
      ],
    },

    // ─── Emma-i™ (Powered by Anthropic Claude via OpenRouter) ─────────────────
    {
      id: 'emma-i',
      name: 'Emma-i™ (SA-iLabs)',
      tier: 'paid',
      apiBase: 'https://openrouter.ai/api/v1',
      keyEnvVar: 'EMMA_I_API_KEY',
      description: 'SA-iLabs proprietary compliance engine — powered by Anthropic Claude 3 Haiku via OpenRouter. Use your OpenRouter API key. Best value: $0.25/1M tokens.',
      recommendedModel: 'anthropic/claude-3-haiku',
      models: [
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku (Recommended)',
          tier: 'paid',
          contextWindow: 200000,
          pricePerMillion: 0.25,
          description: '★ Best value — fast Anthropic model at $0.25/1M tokens. Ideal for SA compliance.',
        },
        {
          id: 'anthropic/claude-sonnet-4-5',
          name: 'Claude Sonnet 4.5',
          tier: 'paid',
          contextWindow: 200000,
          description: 'More powerful Anthropic model for complex compliance workflows.',
        },
        {
          id: 'anthropic/claude-opus-4',
          name: 'Claude Opus 4',
          tier: 'paid',
          contextWindow: 200000,
          description: 'Highest quality — use for critical compliance decisions and audits.',
        },
      ],
    },

    // ─── Ollama (Local) ─────────────────────────────────────────────────────────────
    {
      id: 'ollama',
      name: 'Ollama (Local)',
      tier: 'free',
      apiBase: null,
      keyEnvVar: null,
      description: 'Run open-weight models locally using Ollama. No API key or cloud required. Set OLLAMA_BASE_URL (default: http://localhost:11434) and OLLAMA_MODEL in your environment.',
      models: [
        {
          id: 'gemma4:12b',
          name: 'Gemma 4 12B (Default)',
          tier: 'free',
          contextWindow: 32768,
          description: 'Google Gemma 4 12B via Ollama — fast, capable local model. Pull: ollama pull gemma4:12b',
        },
        {
          id: 'gemma3:12b',
          name: 'Gemma 3 12B',
          tier: 'free',
          contextWindow: 32768,
          description: 'Google Gemma 3 12B via Ollama — stable, widely used. Pull: ollama pull gemma3:12b',
        },
        {
          id: 'llama3.3:70b',
          name: 'Llama 3.3 70B',
          tier: 'free',
          contextWindow: 32768,
          description: 'Meta Llama 3.3 70B via Ollama — high quality, requires significant VRAM.',
        },
        {
          id: 'mistral:7b',
          name: 'Mistral 7B',
          tier: 'free',
          contextWindow: 32768,
          description: 'Mistral 7B via Ollama — lightweight and fast for quick compliance queries.',
        },
        {
          id: 'deepseek-r1:14b',
          name: 'DeepSeek R1 14B',
          tier: 'free',
          contextWindow: 32768,
          description: 'DeepSeek R1 14B via Ollama — reasoning model for complex compliance analysis.',
        },
      ],
    },

    // ─── Custom / Local Model ────────────────────────────────────────────────────────
    {
      id: 'custom',
      name: 'Custom / Local Model',
      tier: 'free',
      apiBase: null,
      keyEnvVar: null,
      description: 'Connect any OpenAI-compatible endpoint — Ollama, LM Studio, vLLM, or your own self-hosted API server. No cloud required.',
      models: [],
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
      providers: this.providers.map(p => ({ ...p })),
      freeModels: this.getFreeModels(),
      paidModels: this.getPaidModels(),
    };
  },
};

export default MODEL_CATALOG;

import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));
jest.unstable_mockModule('axios', () => ({
  default: { post: jest.fn(), get: jest.fn() },
}));

const { default: aiProviderFactory } = await import('../../src/services/ai/aiProviderFactory.js');

describe('AIProviderFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return default provider when no id specified', () => {
      const provider = aiProviderFactory.getProvider();
      expect(provider).toBeDefined();
      expect(provider.constructor.name).toBe('EmmaIProvider');
    });

    it('should create and cache provider instances', () => {
      const provider1 = aiProviderFactory.getProvider('emma-i');
      const provider2 = aiProviderFactory.getProvider('emma-i');
      expect(provider1).toBe(provider2); // Same instance (cached)
    });

    it('should create different providers for different ids', () => {
      const emmaI = aiProviderFactory.getProvider('emma-i');
      const openai = aiProviderFactory.getProvider('openai');
      expect(emmaI).not.toBe(openai);
    });

    it('should throw for unknown provider', () => {
      expect(() => aiProviderFactory.getProvider('nonexistent')).toThrow('Unknown AI provider');
    });
  });

  describe('createProvider', () => {
    it('should create EmmaIProvider', () => {
      const provider = aiProviderFactory.createProvider('emma-i');
      expect(provider.constructor.name).toBe('EmmaIProvider');
    });

    it('should create OpenAIProvider', () => {
      const provider = aiProviderFactory.createProvider('openai');
      expect(provider.constructor.name).toBe('OpenAIProvider');
    });

    it('should create ClaudeProvider', () => {
      const provider = aiProviderFactory.createProvider('claude');
      expect(provider.constructor.name).toBe('ClaudeProvider');
    });

    it('should create GeminiProvider', () => {
      const provider = aiProviderFactory.createProvider('gemini');
      expect(provider.constructor.name).toBe('GeminiProvider');
    });
  });

  describe('listProviders', () => {
    it('should list all available providers', () => {
      const providers = aiProviderFactory.listProviders();
      expect(providers).toBeInstanceOf(Array);
      expect(providers).toHaveLength(4);

      const ids = providers.map(p => p.id);
      expect(ids).toContain('emma-i');
      expect(ids).toContain('openai');
      expect(ids).toContain('claude');
      expect(ids).toContain('gemini');
    });

    it('should include status information', () => {
      const providers = aiProviderFactory.listProviders();
      providers.forEach(p => {
        expect(p).toHaveProperty('id');
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('status');
        expect(p).toHaveProperty('isDefault');
      });
    });

    it('should show unconfigured when API keys are not set', () => {
      const providers = aiProviderFactory.listProviders();
      providers.forEach(p => {
        expect(p.status).toBe('unconfigured');
      });
    });

    it('should mark default provider', () => {
      const providers = aiProviderFactory.listProviders();
      const defaultCount = providers.filter(p => p.isDefault).length;
      expect(defaultCount).toBe(1);
    });
  });

  describe('analyzeDocument', () => {
    it('should delegate to provider analyzeDocument', async () => {
      const file = { originalname: 'test.pdf', mimetype: 'application/pdf', path: '/tmp/test' };
      const context = { companyType: 'pty_ltd', sector: 'technology' };

      const result = await aiProviderFactory.analyzeDocument(file, context);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('provider');
    });
  });

  describe('generateRecommendations', () => {
    it('should delegate to provider generateRecommendations', async () => {
      const companyData = {
        name: 'Test Co',
        companyType: 'pty_ltd',
        sector: 'technology',
        complianceScore: 87,
        overdueCount: 2,
      };

      const result = await aiProviderFactory.generateRecommendations(companyData);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('classifyRequirement', () => {
    it('should delegate to provider classifyRequirement', async () => {
      const text = 'Submit monthly EMP201 return to SARS';
      const result = await aiProviderFactory.classifyRequirement(text);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('module');
    });
  });
});

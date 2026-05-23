import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../config/database.js';
import MODEL_CATALOG from '../services/ai/modelCatalog.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/ai-settings/catalog — full provider/model catalog
router.get('/catalog', (req, res) => {
  res.json(MODEL_CATALOG.getFullCatalog());
});

// GET /api/ai-settings — user's AI preferences + configured providers
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const prefs = await db.oneOrNone(
      'SELECT * FROM user_ai_preferences WHERE user_id = $1',
      [userId]
    );

    const configs = await db.manyOrNone(
      `SELECT id, provider, model, endpoint_url, temperature, max_tokens, is_active, custom_model_name,
              CASE WHEN api_key_encrypted IS NOT NULL AND api_key_encrypted != '' THEN true ELSE false END as has_api_key,
              created_at, updated_at
       FROM user_ai_settings WHERE user_id = $1 ORDER BY provider`,
      [userId]
    );

    res.json({
      preferences: prefs || {
        default_provider: 'emma-i',
        default_model: 'anthropic/claude-3-haiku',
        chat_enabled: true,
        auto_insights: true,
        auto_risk_analysis: true,
        auto_document_analysis: true,
        persona_name: null,
        persona_description: null,
        system_prompt: null,
      },
      providerConfigs: configs,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/ai-settings/preferences — update user's default provider/model + persona
router.put('/preferences', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      default_provider, default_model,
      chat_enabled, auto_insights, auto_risk_analysis, auto_document_analysis,
      persona_name, persona_description, system_prompt,
    } = req.body;

    const result = await db.one(
      `INSERT INTO user_ai_preferences
         (user_id, default_provider, default_model, chat_enabled, auto_insights, auto_risk_analysis, auto_document_analysis, persona_name, persona_description, system_prompt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id) DO UPDATE SET
         default_provider       = COALESCE($2, user_ai_preferences.default_provider),
         default_model          = COALESCE($3, user_ai_preferences.default_model),
         chat_enabled           = COALESCE($4, user_ai_preferences.chat_enabled),
         auto_insights          = COALESCE($5, user_ai_preferences.auto_insights),
         auto_risk_analysis     = COALESCE($6, user_ai_preferences.auto_risk_analysis),
         auto_document_analysis = COALESCE($7, user_ai_preferences.auto_document_analysis),
         persona_name           = $8,
         persona_description    = $9,
         system_prompt          = $10
       RETURNING *`,
      [userId, default_provider, default_model, chat_enabled, auto_insights, auto_risk_analysis, auto_document_analysis,
       persona_name || null, persona_description || null, system_prompt || null]
    );

    res.json({ preferences: result });
  } catch (error) {
    next(error);
  }
});

// PUT /api/ai-settings/provider/:providerId — save/update API key + model for a provider
router.put('/provider/:providerId', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { providerId } = req.params;
    const { api_key, model, endpoint_url, temperature, max_tokens, custom_model_name } = req.body;

    const catalogProvider = MODEL_CATALOG.getProvider(providerId);
    if (!catalogProvider) {
      return res.status(400).json({ message: `Unknown provider: ${providerId}` });
    }

    const result = await db.one(
      `INSERT INTO user_ai_settings (user_id, provider, api_key_encrypted, model, endpoint_url, temperature, max_tokens, custom_model_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, provider) DO UPDATE SET
         api_key_encrypted  = COALESCE($3, user_ai_settings.api_key_encrypted),
         model              = COALESCE($4, user_ai_settings.model),
         endpoint_url       = COALESCE($5, user_ai_settings.endpoint_url),
         temperature        = COALESCE($6, user_ai_settings.temperature),
         max_tokens         = COALESCE($7, user_ai_settings.max_tokens),
         custom_model_name  = COALESCE($8, user_ai_settings.custom_model_name)
       RETURNING id, provider, model, endpoint_url, temperature, max_tokens, is_active, custom_model_name,
                 CASE WHEN api_key_encrypted IS NOT NULL AND api_key_encrypted != '' THEN true ELSE false END as has_api_key`,
      [userId, providerId, api_key || null, model || null, endpoint_url || null,
       temperature || null, max_tokens || null, custom_model_name || null]
    );

    res.json({ config: result });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/ai-settings/provider/:providerId — remove a provider config
router.delete('/provider/:providerId', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { providerId } = req.params;

    await db.none(
      'DELETE FROM user_ai_settings WHERE user_id = $1 AND provider = $2',
      [userId, providerId]
    );

    res.json({ message: 'Provider configuration removed' });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai-settings/test — test a provider connection
router.post('/test', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { providerId } = req.body;

    const config = await db.oneOrNone(
      'SELECT api_key_encrypted, model, endpoint_url, custom_model_name FROM user_ai_settings WHERE user_id = $1 AND provider = $2',
      [userId, providerId]
    );

    // Custom provider only needs endpoint_url + custom_model_name, not an API key
    if (providerId !== 'custom' && (!config || !config.api_key_encrypted)) {
      return res.json({ status: 'unconfigured', message: 'No API key set for this provider' });
    }
    if (providerId === 'custom' && (!config || !config.endpoint_url)) {
      return res.json({ status: 'unconfigured', message: 'No endpoint URL configured for custom provider' });
    }

    const { resolveProviderForUser } = await import('../services/ai/aiProviderFactory.js');
    const provider = await resolveProviderForUser(userId, providerId);
    const result = await provider.chat([{ role: 'user', content: 'Hello, respond with "Connection successful" in one line.' }]);

    res.json({ status: result.status === 'success' ? 'connected' : result.status, message: result.message || result.status });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

export default router;

import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import './PageStyles.css';

const Toggle = ({ checked, onChange }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
    <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: '26px', background: checked ? '#2563eb' : '#cbd5e1', transition: 'background 0.2s' }}>
      <span style={{ position: 'absolute', height: '20px', width: '20px', left: checked ? '27px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
    </span>
  </label>
);

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
      {label} {hint && <span style={{ color: '#94a3b8', fontWeight: 400 }}>{hint}</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.85rem',
  boxSizing: 'border-box',
};

export default function Settings() {
  const { catalog, preferences, providerConfigs, loading, saving, testResult, fetchCatalog, fetchSettings, savePreferences, saveProviderConfig, removeProviderConfig, testProvider } = useSettingsStore();

  const [defaultProvider, setDefaultProvider] = useState('emma-i');
  const [defaultModel, setDefaultModel]       = useState('anthropic/claude-3-haiku');
  const [aiToggles, setAiToggles]             = useState({ chat: true, insights: true, risk: true, documents: true });
  const [notifications, setNotifications]     = useState({ email: true, whatsapp: false, inApp: true });
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [apiKeyInputs, setApiKeyInputs]       = useState({});
  const [customEndpoint, setCustomEndpoint]   = useState({});
  const [customModelName, setCustomModelName] = useState({});
  const [saved, setSaved]                     = useState(false);

  // Persona state
  const [personaName, setPersonaName]                 = useState('');
  const [personaDescription, setPersonaDescription]   = useState('');
  const [systemPrompt, setSystemPrompt]               = useState('');

  useEffect(() => { fetchCatalog(); fetchSettings(); }, [fetchCatalog, fetchSettings]);

  useEffect(() => {
    if (preferences) {
      setDefaultProvider(preferences.default_provider || 'emma-i');
      setDefaultModel(preferences.default_model || 'anthropic/claude-3-haiku');
      setAiToggles({
        chat:      preferences.chat_enabled !== false,
        insights:  preferences.auto_insights !== false,
        risk:      preferences.auto_risk_analysis !== false,
        documents: preferences.auto_document_analysis !== false,
      });
      setPersonaName(preferences.persona_name || '');
      setPersonaDescription(preferences.persona_description || '');
      setSystemPrompt(preferences.system_prompt || '');
    }
  }, [preferences]);

  // Pre-fill endpoint/model from saved config
  useEffect(() => {
    if (providerConfigs.length > 0) {
      const endpoints = {};
      const models    = {};
      providerConfigs.forEach(c => {
        if (c.endpoint_url)      endpoints[c.provider] = c.endpoint_url;
        if (c.custom_model_name) models[c.provider]    = c.custom_model_name;
      });
      setCustomEndpoint(endpoints);
      setCustomModelName(models);
    }
  }, [providerConfigs]);

  const selectedProviderCatalog = catalog?.providers?.find(p => p.id === defaultProvider);
  const availableModels         = selectedProviderCatalog?.models || [];
  const getConfigForProvider    = (pid) => providerConfigs.find(c => c.provider === pid);

  const handleSaveAll = async () => {
    const ok = await savePreferences({
      default_provider:       defaultProvider,
      default_model:          defaultModel,
      chat_enabled:           aiToggles.chat,
      auto_insights:          aiToggles.insights,
      auto_risk_analysis:     aiToggles.risk,
      auto_document_analysis: aiToggles.documents,
      persona_name:           personaName || null,
      persona_description:    personaDescription || null,
      system_prompt:          systemPrompt || null,
    });
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const handleSaveApiKey = async (providerId) => {
    const key    = apiKeyInputs[providerId];
    const config = getConfigForProvider(providerId);
    const payload = {
      api_key:   key || undefined,
      model:     config?.model || null,
      endpoint_url:      customEndpoint[providerId] || config?.endpoint_url || null,
      custom_model_name: customModelName[providerId] || config?.custom_model_name || null,
    };
    await saveProviderConfig(providerId, payload);
    setApiKeyInputs(prev => ({ ...prev, [providerId]: '' }));
  };

  const handleSaveCustomConfig = async (providerId) => {
    const config = getConfigForProvider(providerId);
    await saveProviderConfig(providerId, {
      endpoint_url:      customEndpoint[providerId] || null,
      custom_model_name: customModelName[providerId] || null,
      api_key:           apiKeyInputs[providerId] || undefined,
      model:             customModelName[providerId] || config?.model || null,
    });
    setApiKeyInputs(prev => ({ ...prev, [providerId]: '' }));
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading settings...</div></div>;

  return (
    <div className="page-container settings-page">
      <div className="page-header">
        <h1>{'⚙'} Settings</h1>
        <p>Configure AI providers, models, API keys, and preferences</p>
      </div>

      {/* ─── Default Provider & Model ─── */}
      <div className="settings-section">
        <h3>{'\u{1F916}'} AI Assistant Configuration</h3>

        <div className="settings-row">
          <div className="settings-label">
            Default Provider
            <small>Which AI engine powers Emma-i across the app</small>
          </div>
          <select className="settings-select" value={defaultProvider}
            onChange={(e) => { setDefaultProvider(e.target.value); setDefaultModel(''); }}>
            {catalog?.providers?.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}{p.tier === 'free' ? ' — Free tier available' : ' — Paid'}
              </option>
            ))}
          </select>
        </div>

        {/* Model selector (hide for 'custom' — user enters model name manually) */}
        {defaultProvider !== 'custom' && (
          <div className="settings-row">
            <div className="settings-label">
              Model
              <small>Select the AI model for this provider</small>
            </div>
            <select className="settings-select" value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)}>
              <option value="">-- Select a model --</option>
              {availableModels.filter(m => m.tier === 'free').length > 0 && (
                <optgroup label="Free Models">
                  {availableModels.filter(m => m.tier === 'free').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {(m.contextWindow / 1000).toFixed(0)}k ctx
                    </option>
                  ))}
                </optgroup>
              )}
              {availableModels.filter(m => m.tier === 'paid').length > 0 && (
                <optgroup label="Paid Models">
                  {availableModels.filter(m => m.tier === 'paid').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {(m.contextWindow / 1000).toFixed(0)}k ctx
                      {m.pricePerMillion ? ` · $${m.pricePerMillion}/1M` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}

        {selectedProviderCatalog && (
          <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px' }}>
            {selectedProviderCatalog.description}
            {selectedProviderCatalog.recommendedModel && (
              <span style={{ marginLeft: '8px', color: '#2563eb', fontWeight: 600 }}>
                Recommended: {selectedProviderCatalog.recommendedModel}
              </span>
            )}
          </div>
        )}

        <div className="settings-row">
          <div className="settings-label">
            AI Features
            <small>Enable or disable AI-powered features across the app</small>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['chat', 'Emma-i Chat Assistant'],
              ['insights', 'Dashboard Smart Insights'],
              ['risk', 'AI Risk Analysis'],
              ['documents', 'Auto Document Analysis'],
            ].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                <Toggle checked={aiToggles[key]} onChange={(v) => setAiToggles(p => ({ ...p, [key]: v }))} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Persona Customization ─── */}
      <div className="settings-section">
        <h3>{'\u{1F9D1}'} Persona Customization</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>
          Customize your AI assistant's name, description, and system prompt. Leave blank to use the default Emma-i™ persona.
        </p>

        <Field label="Persona Name" hint="(e.g. Emma-i™, Alex, TaxBot)">
          <input
            type="text"
            style={inputStyle}
            placeholder="Emma-i™"
            value={personaName}
            onChange={(e) => setPersonaName(e.target.value)}
            maxLength={100}
          />
        </Field>

        <Field label="Persona Description" hint="(shown to users)">
          <input
            type="text"
            style={inputStyle}
            placeholder="Your SA compliance assistant, powered by AI"
            value={personaDescription}
            onChange={(e) => setPersonaDescription(e.target.value)}
          />
        </Field>

        <Field label="System Prompt Override" hint="(advanced — replaces the default SA compliance prompt)">
          <textarea
            style={{ ...inputStyle, minHeight: '120px', fontFamily: 'monospace', resize: 'vertical' }}
            placeholder={`Leave blank to use the default system prompt.\n\nExample: "You are a specialist compliance assistant for the construction industry in South Africa..."`}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </Field>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>
          System prompt changes apply to all AI features. Click "Save All Settings" below to apply.
        </p>
      </div>

      {/* ─── API Key Management ─── */}
      <div className="settings-section">
        <h3>{'\u{1F511}'} API Key Management</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>
          Add API keys for each provider. Keys are stored per-user and never exposed client-side.
        </p>

        {catalog?.providers?.map(provider => {
          const config       = getConfigForProvider(provider.id);
          const isExpanded   = expandedProvider === provider.id;
          const isTestingThis = testResult?.providerId === provider.id;
          const isCustom     = provider.id === 'custom';

          return (
            <div key={provider.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px', overflow: 'hidden' }}>
              {/* Provider header */}
              <div
                onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: isExpanded ? '#f8fafc' : '#fff' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: (isCustom ? !!config?.endpoint_url : config?.has_api_key) ? '#22c55e' : '#94a3b8' }} />
                  <strong style={{ fontSize: '0.95rem' }}>{provider.name}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: provider.tier === 'free' ? '#dcfce7' : '#fef3c7', color: provider.tier === 'free' ? '#166534' : '#92400e' }}>
                    {provider.tier === 'free' ? 'Free tier' : 'Paid'}
                  </span>
                  {isCustom && config?.endpoint_url && (
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{config.endpoint_url}</span>
                  )}
                  {!isCustom && config?.has_api_key && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#dbeafe', color: '#1e40af' }}>Key saved</span>
                  )}
                  {provider.recommendedModel && (
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: '#fef9c3', color: '#713f12' }}>
                      ★ {provider.recommendedModel}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '1.2rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>{'▼'}</span>
              </div>

              {/* Expanded config */}
              {isExpanded && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '12px 0 14px' }}>{provider.description}</p>

                  {/* ── Custom provider fields ── */}
                  {isCustom ? (
                    <>
                      <Field label="Endpoint URL" hint="(required — your local server URL)">
                        <input
                          type="text"
                          style={{ ...inputStyle, fontFamily: 'monospace' }}
                          placeholder="http://localhost:11434/v1"
                          value={customEndpoint[provider.id] || ''}
                          onChange={(e) => setCustomEndpoint(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        />
                      </Field>
                      <Field label="Model Name" hint="(required — the model loaded in your server)">
                        <input
                          type="text"
                          style={{ ...inputStyle, fontFamily: 'monospace' }}
                          placeholder="llama3.2, mistral, phi4, deepseek-r1, ..."
                          value={customModelName[provider.id] || ''}
                          onChange={(e) => setCustomModelName(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        />
                      </Field>
                      <Field label="API Key" hint="(optional — leave blank for Ollama/LM Studio)">
                        <input
                          type="password"
                          style={{ ...inputStyle, fontFamily: 'monospace' }}
                          placeholder="Optional API key..."
                          value={apiKeyInputs[provider.id] || ''}
                          onChange={(e) => setApiKeyInputs(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        />
                      </Field>
                      <button
                        onClick={() => handleSaveCustomConfig(provider.id)}
                        disabled={!customEndpoint[provider.id] || !customModelName[provider.id] || saving}
                        style={{ padding: '8px 18px', background: (customEndpoint[provider.id] && customModelName[provider.id]) ? '#2563eb' : '#e2e8f0', color: (customEndpoint[provider.id] && customModelName[provider.id]) ? '#fff' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '4px' }}
                      >
                        Save Custom Config
                      </button>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
                        Compatible with Ollama (<code>http://localhost:11434/v1</code>), LM Studio (<code>http://localhost:1234/v1</code>), vLLM, and any OpenAI-compatible server.
                      </p>
                    </>
                  ) : (
                    <>
                      {/* API Endpoint override (for non-custom providers) */}
                      {provider.apiBase && (
                        <Field label="API Endpoint" hint="(optional override)">
                          <input
                            type="text"
                            style={{ ...inputStyle, fontFamily: 'monospace' }}
                            placeholder={provider.apiBase}
                            defaultValue={config?.endpoint_url || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (config?.endpoint_url || '')) {
                                saveProviderConfig(provider.id, { endpoint_url: e.target.value || null });
                              }
                            }}
                          />
                        </Field>
                      )}

                      {/* API Key */}
                      <Field label={`API Key ${provider.keyEnvVar ? `(${provider.keyEnvVar})` : ''}`}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="password"
                            style={{ ...inputStyle, fontFamily: 'monospace', flex: 1 }}
                            placeholder={config?.has_api_key ? 'Key saved — enter new to replace' : 'Paste your API key here...'}
                            value={apiKeyInputs[provider.id] || ''}
                            onChange={(e) => setApiKeyInputs(prev => ({ ...prev, [provider.id]: e.target.value }))}
                          />
                          <button
                            onClick={() => handleSaveApiKey(provider.id)}
                            disabled={!apiKeyInputs[provider.id] || saving}
                            style={{ padding: '8px 16px', background: apiKeyInputs[provider.id] ? '#2563eb' : '#e2e8f0', color: apiKeyInputs[provider.id] ? '#fff' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: apiKeyInputs[provider.id] ? 'pointer' : 'default', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                          >
                            Save Key
                          </button>
                        </div>
                      </Field>

                      {/* Model selector */}
                      {provider.models.length > 0 && (
                        <Field label="Model for this provider">
                          <select
                            style={inputStyle}
                            defaultValue={config?.model || ''}
                            onChange={(e) => saveProviderConfig(provider.id, { model: e.target.value })}
                          >
                            <option value="">Use default{provider.recommendedModel ? ` (${provider.recommendedModel})` : ''}</option>
                            {provider.models.filter(m => m.tier === 'free').length > 0 && (
                              <optgroup label="Free">
                                {provider.models.filter(m => m.tier === 'free').map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </optgroup>
                            )}
                            {provider.models.filter(m => m.tier === 'paid').length > 0 && (
                              <optgroup label="Paid">
                                {provider.models.filter(m => m.tier === 'paid').map(m => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}{m.pricePerMillion ? ` — $${m.pricePerMillion}/1M` : ''}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </Field>
                      )}
                    </>
                  )}

                  {/* Test & Remove */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      onClick={() => testProvider(provider.id)}
                      disabled={isCustom ? !config?.endpoint_url : !config?.has_api_key}
                      style={{ padding: '8px 16px', background: (isCustom ? !!config?.endpoint_url : config?.has_api_key) ? '#059669' : '#e2e8f0', color: (isCustom ? !!config?.endpoint_url : config?.has_api_key) ? '#fff' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {isTestingThis && testResult.status === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                    {(config?.has_api_key || (isCustom && config?.endpoint_url)) && (
                      <button
                        onClick={() => removeProviderConfig(provider.id)}
                        style={{ padding: '8px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Remove Config
                      </button>
                    )}
                  </div>
                  {isTestingThis && testResult.status !== 'testing' && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', background: testResult.status === 'connected' ? '#dcfce7' : '#fef2f2', color: testResult.status === 'connected' ? '#166534' : '#dc2626' }}>
                      {testResult.status === 'connected' ? '✅ Connection successful!' : `❌ ${testResult.message || 'Connection failed'}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Notification Preferences ─── */}
      <div className="settings-section">
        <h3>{'\u{1F514}'} Notification Preferences</h3>
        {[
          ['email',    'Email Alerts',           'Compliance deadline reminders via email'],
          ['whatsapp', 'WhatsApp Alerts',        'Instant messages for urgent deadlines'],
          ['inApp',    'In-App Notifications',   'Badges and alerts within the dashboard'],
        ].map(([key, label, sub]) => (
          <div key={key} className="settings-row">
            <div className="settings-label">{label}<small>{sub}</small></div>
            <Toggle checked={notifications[key]} onChange={(v) => setNotifications(p => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>

      <button className="settings-save-btn" onClick={handleSaveAll} disabled={saving}>
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
      {saved && <div className="settings-success">{'✅'} Settings saved successfully</div>}
    </div>
  );
}

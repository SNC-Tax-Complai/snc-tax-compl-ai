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

export default function Settings() {
  const { catalog, preferences, providerConfigs, loading, saving, testResult, fetchCatalog, fetchSettings, savePreferences, saveProviderConfig, removeProviderConfig, testProvider } = useSettingsStore();

  const [defaultProvider, setDefaultProvider] = useState('openrouter');
  const [defaultModel, setDefaultModel] = useState('deepseek/deepseek-v4-flash:free');
  const [aiToggles, setAiToggles] = useState({ chat: true, insights: true, risk: true, documents: true });
  const [notifications, setNotifications] = useState({ email: true, whatsapp: false, inApp: true });
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [apiKeyInputs, setApiKeyInputs] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchCatalog(); fetchSettings(); }, [fetchCatalog, fetchSettings]);

  useEffect(() => {
    if (preferences) {
      setDefaultProvider(preferences.default_provider || 'openrouter');
      setDefaultModel(preferences.default_model || 'deepseek/deepseek-v4-flash:free');
      setAiToggles({
        chat: preferences.chat_enabled !== false,
        insights: preferences.auto_insights !== false,
        risk: preferences.auto_risk_analysis !== false,
        documents: preferences.auto_document_analysis !== false,
      });
    }
  }, [preferences]);

  const selectedProviderCatalog = catalog?.providers?.find(p => p.id === defaultProvider);
  const availableModels = selectedProviderCatalog?.models || [];

  const getConfigForProvider = (pid) => providerConfigs.find(c => c.provider === pid);

  const handleSaveAll = async () => {
    const ok = await savePreferences({
      default_provider: defaultProvider,
      default_model: defaultModel,
      chat_enabled: aiToggles.chat,
      auto_insights: aiToggles.insights,
      auto_risk_analysis: aiToggles.risk,
      auto_document_analysis: aiToggles.documents,
    });
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const handleSaveApiKey = async (providerId) => {
    const key = apiKeyInputs[providerId];
    if (!key) return;
    const config = getConfigForProvider(providerId);
    await saveProviderConfig(providerId, { api_key: key, model: config?.model || null });
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
          <select className="settings-select" value={defaultProvider} onChange={(e) => { setDefaultProvider(e.target.value); setDefaultModel(''); }}>
            {catalog?.providers?.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.tier === 'free' ? '(Free tier available)' : '(Paid)'}</option>
            ))}
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            Model
            <small>Select the AI model for this provider</small>
          </div>
          <select className="settings-select" value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)}>
            <option value="">-- Select a model --</option>
            {availableModels.length > 0 && <optgroup label="Free Models">
              {availableModels.filter(m => m.tier === 'free').map(m => (
                <option key={m.id} value={m.id}>{m.name} (ctx: {(m.contextWindow/1000).toFixed(0)}k)</option>
              ))}
            </optgroup>}
            {availableModels.some(m => m.tier === 'paid') && <optgroup label="Paid Models">
              {availableModels.filter(m => m.tier === 'paid').map(m => (
                <option key={m.id} value={m.id}>{m.name} (ctx: {(m.contextWindow/1000).toFixed(0)}k)</option>
              ))}
            </optgroup>}
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            AI Features
            <small>Enable or disable AI-powered features across the app</small>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
              <Toggle checked={aiToggles.chat} onChange={(v) => setAiToggles(p => ({ ...p, chat: v }))} />
              <span>Emma-i Chat Assistant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
              <Toggle checked={aiToggles.insights} onChange={(v) => setAiToggles(p => ({ ...p, insights: v }))} />
              <span>Dashboard Smart Insights</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
              <Toggle checked={aiToggles.risk} onChange={(v) => setAiToggles(p => ({ ...p, risk: v }))} />
              <span>AI Risk Analysis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
              <Toggle checked={aiToggles.documents} onChange={(v) => setAiToggles(p => ({ ...p, documents: v }))} />
              <span>Auto Document Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── API Key Management ─── */}
      <div className="settings-section">
        <h3>{'\u{1F511}'} API Key Management</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>
          Add your own API keys for each provider. Keys are stored per-user and persist across sessions.
        </p>

        {catalog?.providers?.map(provider => {
          const config = getConfigForProvider(provider.id);
          const isExpanded = expandedProvider === provider.id;
          const isTestingThis = testResult?.providerId === provider.id;

          return (
            <div key={provider.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px', overflow: 'hidden' }}>
              {/* Provider header */}
              <div
                onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: isExpanded ? '#f8fafc' : '#fff' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: config?.has_api_key ? '#22c55e' : '#94a3b8' }} />
                  <strong style={{ fontSize: '0.95rem' }}>{provider.name}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: provider.tier === 'free' ? '#dcfce7' : '#fef3c7', color: provider.tier === 'free' ? '#166534' : '#92400e' }}>
                    {provider.tier === 'free' ? 'Free tier' : 'Paid'}
                  </span>
                  {config?.has_api_key && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#dbeafe', color: '#1e40af' }}>Key saved</span>
                  )}
                </div>
                <span style={{ fontSize: '1.2rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>{'▼'}</span>
              </div>

              {/* Expanded config */}
              {isExpanded && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '12px 0 8px' }}>{provider.description}</p>

                  {/* API Key input */}
                  <div style={{ margin: '12px 0' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      API Key {provider.keyEnvVar && <span style={{ color: '#94a3b8', fontWeight: 400 }}>({provider.keyEnvVar})</span>}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="password"
                        placeholder={config?.has_api_key ? 'Key saved (enter new to replace)' : 'Paste your API key here...'}
                        value={apiKeyInputs[provider.id] || ''}
                        onChange={(e) => setApiKeyInputs(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                      <button
                        onClick={() => handleSaveApiKey(provider.id)}
                        disabled={!apiKeyInputs[provider.id] || saving}
                        style={{ padding: '8px 16px', background: apiKeyInputs[provider.id] ? '#2563eb' : '#e2e8f0', color: apiKeyInputs[provider.id] ? '#fff' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: apiKeyInputs[provider.id] ? 'pointer' : 'default', fontSize: '0.85rem' }}
                      >
                        Save Key
                      </button>
                    </div>
                  </div>

                  {/* API Endpoint override */}
                  {provider.apiBase && (
                    <div style={{ margin: '12px 0' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                        API Endpoint <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional override)</span>
                      </label>
                      <input
                        type="text"
                        placeholder={provider.apiBase}
                        defaultValue={config?.endpoint_url || ''}
                        onBlur={(e) => {
                          if (e.target.value && e.target.value !== config?.endpoint_url) {
                            saveProviderConfig(provider.id, { endpoint_url: e.target.value });
                          }
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  {/* Model selector for this provider */}
                  <div style={{ margin: '12px 0' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Model for this provider</label>
                    <select
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      defaultValue={config?.model || ''}
                      onChange={(e) => saveProviderConfig(provider.id, { model: e.target.value })}
                    >
                      <option value="">Use default</option>
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
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Test & Remove buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      onClick={() => testProvider(provider.id)}
                      disabled={!config?.has_api_key}
                      style={{ padding: '8px 16px', background: config?.has_api_key ? '#059669' : '#e2e8f0', color: config?.has_api_key ? '#fff' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: config?.has_api_key ? 'pointer' : 'default', fontSize: '0.85rem' }}
                    >
                      {isTestingThis && testResult.status === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                    {config?.has_api_key && (
                      <button
                        onClick={() => removeProviderConfig(provider.id)}
                        style={{ padding: '8px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Remove Key
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
        <div className="settings-row">
          <div className="settings-label">Email Alerts<small>Compliance deadline reminders via email</small></div>
          <Toggle checked={notifications.email} onChange={(v) => setNotifications(p => ({ ...p, email: v }))} />
        </div>
        <div className="settings-row">
          <div className="settings-label">WhatsApp Alerts<small>Instant messages for urgent deadlines</small></div>
          <Toggle checked={notifications.whatsapp} onChange={(v) => setNotifications(p => ({ ...p, whatsapp: v }))} />
        </div>
        <div className="settings-row">
          <div className="settings-label">In-App Notifications<small>Badges and alerts within the dashboard</small></div>
          <Toggle checked={notifications.inApp} onChange={(v) => setNotifications(p => ({ ...p, inApp: v }))} />
        </div>
      </div>

      <button className="settings-save-btn" onClick={handleSaveAll} disabled={saving}>
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
      {saved && <div className="settings-success">{'✅'} Settings saved successfully</div>}
    </div>
  );
}

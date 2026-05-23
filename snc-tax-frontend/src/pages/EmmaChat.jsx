import { useState, useRef, useEffect, useCallback } from 'react';
import { useAIStore } from '../stores/aiStore';
import './PageStyles.css';

const SUGGESTED_QUESTIONS = [
  'When is my next EMP201 due?',
  'What documents do I need for CIPC annual return?',
  'Am I compliant with POPIA?',
  'Explain B-BBEE levels for SMMEs',
  'What are my SARS penalties?',
  'How do I register for UIF?',
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm Emma-i™, your AI-powered South African SMME compliance assistant.\n\nI can help you understand your tax obligations, check compliance deadlines, explain regulations, and guide you through filing processes.\n\nWhat would you like to know?",
  timestamp: Date.now(),
};

function formatMessage(content) {
  if (!content) return [];
  return content.split('\n');
}

export default function EmmaChat() {
  const { messages: storeMessages, loading, error, sendMessage: storeSend, fetchProviders, clearMessages } = useAIStore();
  const [input, setInput] = useState('');
  const [providerStatus, setProviderStatus] = useState(null);
  const endRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchProviders().then(() => {
        const providers = useAIStore.getState().providers;
        const active = providers.find((p) => p.isDefault) || providers[0];
        setProviderStatus(active);
      });
    }
  }, [fetchProviders]);

  const allMessages = [WELCOME_MESSAGE, ...storeMessages];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length, loading]);

  const handleSend = useCallback((text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    storeSend(content);
  }, [input, loading, storeSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-container emma-chat-page">
      <div className="chat-layout">
        <div className="chat-sidebar-panel">
          <div className="chat-brand">
            <div className="chat-avatar-large">{'\u{1F916}'}</div>
            <h2>Emma-i{'™'} AI</h2>
            <p>Your SMME Compliance Assistant</p>
          </div>

          {providerStatus && (
            <div className="provider-status-badge">
              <span className={`status-dot ${providerStatus.status === 'active' ? 'active' : 'mock'}`} />
              <span>{providerStatus.name} {providerStatus.status === 'active' ? '(Live)' : '(Demo Mode)'}</span>
            </div>
          )}

          <div className="chat-capabilities">
            <h4>I can help with:</h4>
            <ul>
              <li>{'\u{1F4CB}'} Tax filing deadlines</li>
              <li>{'\u{1F4CA}'} Compliance scoring</li>
              <li>{'\u{1F4DD}'} Document requirements</li>
              <li>{'⚠️'} Penalty calculations</li>
              <li>{'\u{1F512}'} POPIA guidance</li>
              <li>{'\u{1F91D}'} B-BBEE levels</li>
            </ul>
          </div>

          <div className="suggested-questions">
            <h4>Try asking:</h4>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} className="suggestion-btn" onClick={() => handleSend(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          <button className="clear-chat-btn" onClick={clearMessages}>Clear Chat</button>
        </div>

        <div className="chat-main">
          <div className="chat-header-bar">
            <h3>{'\u{1F4AC}'} Emma-i{'™'} AI Assistant</h3>
            {providerStatus ? (
              providerStatus.status === 'active' ? (
                <span className="online-indicator"><span className="online-dot" /> Live</span>
              ) : (
                <span className="online-indicator demo"><span className="online-dot demo" /> Demo Mode</span>
              )
            ) : (
              <span className="online-indicator demo"><span className="online-dot demo" /> Connecting…</span>
            )}
          </div>

          <div className="chat-messages">
            {allMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && <div className="msg-avatar">{'\u{1F916}'}</div>}
                <div className="msg-bubble">
                  <div className="msg-content">
                    {formatMessage(msg.content).map((line, j) => (
                      <p key={j} className={line === '' ? 'msg-spacer' : ''}>{line}</p>
                    ))}
                  </div>
                  <span className="msg-time">
                    {new Date(msg.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.status === 'mock' && (
                    <span className="msg-mock-badge">Demo</span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="msg-avatar">{'\u{1F916}'}</div>
                <div className="msg-bubble typing">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            {error && (
              <div className="chat-error">
                <span>{'⚠️'} {error}</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chat-input-bar">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Emma-i&#8482; anything about SA compliance..."
              rows={1}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || loading}>
              {'➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

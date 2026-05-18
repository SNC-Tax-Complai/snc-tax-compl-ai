import { useState, useRef, useEffect } from 'react';
import './PageStyles.css';

const SUGGESTED_QUESTIONS = [
  'When is my next EMP201 due?',
  'What documents do I need for CIPC annual return?',
  'Am I compliant with POPIA?',
  'Explain B-BBEE levels for SMMEs',
  'What are my SARS penalties?',
  'How do I register for UIF?',
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    lines: [
      "Hi! I'm Emma-i™, your AI-powered South African SMME compliance assistant.",
      "I can help you understand your tax obligations, check compliance deadlines, explain regulations, and guide you through filing processes.",
      "",
      "What would you like to know?"
    ],
    timestamp: new Date().toISOString(),
  },
];

const MOCK_RESPONSES = {
  emp201: [
    "Your next EMP201 (Monthly Employer Declaration) is due on 7 June 2026. This return reports PAYE, SDL, and UIF contributions.",
    "",
    "⚠️ Note: Your April EMP201 is currently 2 days overdue. I recommend filing immediately to avoid penalties.",
    "",
    "Penalty: SARS charges 10% of the outstanding amount plus interest at the prescribed rate."
  ],
  cipc: [
    "For your CIPC Annual Return, you'll need:",
    "",
    "✅ Company registration number (e.g., 2024/123456/07)",
    "✅ Registered address confirmation",
    "✅ Director ID numbers",
    "✅ Financial year-end date",
    "✅ Annual turnover declaration",
    "",
    "Your next CIPC Annual Return is due 15 May 2026. Filing fee: R100 (small company) via www.cipc.co.za"
  ],
  popia: [
    "Based on your current compliance data:",
    "",
    "🟡 POPIA Compliance: 80%",
    "",
    "You're substantially compliant, but missing:",
    "❌ Information Officer registration with the Information Regulator",
    "❌ Updated Privacy Policy on your website",
    "✅ Data processing agreements in place",
    "✅ Employee awareness training completed",
    "",
    "Recommendation: Register your Information Officer at the Information Regulator portal."
  ],
  bbee: [
    "B-BBEE Levels for SMMEs (Exempted Micro-Enterprises):",
    "",
    "If annual turnover < R10 million:",
    "- Automatically qualify as Level 4 (100% B-BBEE recognition)",
    "- If 51%+ Black owned: Level 2 (125% recognition)",
    "- If 100% Black owned: Level 1 (135% recognition)",
    "",
    "You only need a sworn affidavit (no verification needed).",
    "Your B-BBEE affidavit expires 30 June 2026."
  ],
  fallback: [
    "I understand your question. Let me help you with that.",
    "",
    "As an AI compliance assistant for South African SMMEs, I can assist with:",
    "📋 SARS tax obligations (VAT, PAYE, Income Tax)",
    "🏢 CIPC company compliance",
    "👷 Labour law requirements",
    "🔒 POPIA data protection",
    "🤝 B-BBEE certification",
    "⛑️ OHS requirements",
    "",
    "Could you be more specific about what you'd like to know?"
  ],
};

function getResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('emp201') || lower.includes('paye') || lower.includes('next')) return MOCK_RESPONSES.emp201;
  if (lower.includes('cipc') || lower.includes('document') || lower.includes('annual return')) return MOCK_RESPONSES.cipc;
  if (lower.includes('popia') || lower.includes('compliant') || lower.includes('data protection')) return MOCK_RESPONSES.popia;
  if (lower.includes('bbee') || lower.includes('b-bbee') || lower.includes('level')) return MOCK_RESPONSES.bbee;
  return MOCK_RESPONSES.fallback;
}

export default function EmmaChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    const content = text || input;
    if (!content.trim()) return;
    const userMsg = { role: 'user', lines: [content], timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = { role: 'assistant', lines: getResponse(content), timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      sendMessage();
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
              <button key={i} className="suggestion-btn" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-header-bar">
            <h3>{'\u{1F4AC}'} Emma-i{'™'} AI Assistant</h3>
            <span className="online-indicator"><span className="online-dot" /> Online</span>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && <div className="msg-avatar">{'\u{1F916}'}</div>}
                <div className="msg-bubble">
                  <div className="msg-content">
                    {msg.lines.map((line, j) => (
                      <p key={j} className={line === '' ? 'msg-spacer' : ''}>{line}</p>
                    ))}
                  </div>
                  <span className="msg-time">
                    {new Date(msg.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="msg-avatar">{'\u{1F916}'}</div>
                <div className="msg-bubble typing">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
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
            <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || isTyping}>
              {'➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

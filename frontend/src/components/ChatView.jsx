import React, { useState, useRef, useEffect } from 'react';
import { useTax } from '../context/TaxContext';
import { Send, Bot, User, CornerDownLeft, Info, HelpCircle } from 'lucide-react';

const ChatView = () => {
  const { regulations, selectedRegId, setSelectedRegId, selectedRegulation } = useTax();
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'bot',
      text: 'Hello! I am your TaxPulse AI compliance assistant. Ask me questions about tax circulars, audit actions, SAP settings or penalty liabilities. Select a notification above to focus my analysis.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (textToSend) => {
    const msgText = textToSend || inputMessage;
    if (!msgText.trim()) return;

    // Add user message
    const userMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: msgText
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          contextId: selectedRegId,
          history: messages.filter(m => m.id !== 'm-init')
        })
      });
      const data = await response.json();
      
      setTyping(false);
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}-bot`,
        sender: 'bot',
        text: data.reply
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setTyping(false);
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}-error`,
        sender: 'bot',
        text: 'Sorry, I encountered a communication error. Please try again.'
      }]);
    }
  };

  const handleQuickQuestion = (text) => {
    handleSend(text);
  };

  const quickPrompts = [
    "How should SAP be updated?",
    "What actions should finance take?",
    "Does this affect manufacturers?",
    "What are the non-compliance penalty risks?"
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">AI Chat Assistant</h1>
          <p className="page-subtitle">Interactive context-aware compliance advisory console</p>
        </div>
        
        {/* Context Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Focus Context:</label>
          <select 
            className="form-control" 
            style={{ width: '260px', padding: '6px 12px' }}
            value={selectedRegId || ''}
            onChange={(e) => setSelectedRegId(e.target.value)}
          >
            <option value="">General (No Context)</option>
            {regulations.map(r => (
              <option key={r.id} value={r.id}>{r.title.substring(0, 45)}...</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected context info ribbon */}
      {selectedRegulation && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--text-primary)',
            padding: '10px 16px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.8rem',
            border: '1px solid rgba(37, 99, 235, 0.1)',
            marginBottom: '16px'
          }}
        >
          <Info size={16} style={{ color: 'var(--color-primary)' }} />
          <span>Focused on: <strong>{selectedRegulation.title}</strong></span>
        </div>
      )}

      {/* Chat Container */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
                {msg.sender === 'user' ? (
                  <>
                    <User size={12} /> <span>You</span>
                  </>
                ) : (
                  <>
                    <Bot size={12} /> <span>TaxPulse Consultant</span>
                  </>
                )}
              </div>
              <div 
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ 
                  // Converts simple markdown symbols like ** and lists to HTML
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n\s*-\s*(.*?)/g, '<br/>• $1')
                    .replace(/\n\s*\d+\.\s*(.*?)/g, '<br/>1. $1')
                }}
              />
            </div>
          ))}

          {typing && (
            <div className="chat-bubble bot" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Bot size={12} style={{ marginRight: '4px' }} />
              <div className="loading-dots" style={{ display: 'flex', gap: '2px' }}>
                <span>•</span><span>•</span><span>•</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="chat-quick-questions">
          <span style={{ fontSize: '0.75rem', alignSelf: 'center', marginRight: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HelpCircle size={14} /> Quick prompts:
          </span>
          {quickPrompts.map((p, idx) => (
            <button 
              key={idx} 
              className="quick-question-btn"
              onClick={() => handleQuickQuestion(p)}
              disabled={typing}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input 
            type="text" 
            placeholder="Type your compliance question here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={typing}
          />
          <button 
            className="btn btn-primary" 
            style={{ padding: '10px 20px' }}
            onClick={() => handleSend()}
            disabled={typing || !inputMessage.trim()}
          >
            <Send size={16} />
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', opacity: 0.7 }}>
              <CornerDownLeft size={10} /> Enter
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;

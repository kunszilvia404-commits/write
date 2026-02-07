import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';

function Chat() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    const data = await chatApi.getSessions();
    setSessions(data);
  };

  const createSession = async () => {
    const session = await chatApi.createSession();
    setSessions([session, ...sessions]);
    setCurrentSession(session.id);
    setMessages([]);
  };

  const selectSession = async (id) => {
    const session = await chatApi.getSession(id);
    setCurrentSession(id);
    setMessages(session.messages || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    let sessionId = currentSession;
    if (!sessionId) {
      const session = await chatApi.createSession();
      setSessions([session, ...sessions]);
      sessionId = session.id;
      setCurrentSession(sessionId);
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const result = await chatApi.sendMessage(sessionId, userMessage);
      setMessages(result.messages);
      loadSessions();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误，请重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 60px)' }}>
      <div style={{ width: 200, background: 'white', borderRadius: 12, padding: 16 }}>
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={createSession}>
          新对话
        </button>
        <div style={{ overflowY: 'auto' }}>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => selectSession(s.id)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: 8,
                marginBottom: 4,
                background: currentSession === s.id ? '#f3f4f6' : 'transparent',
                fontSize: 14
              }}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-container" style={{ flex: 1 }}>
        <div className="messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 100 }}>
              开始与写作教练对话吧
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.content}
            </div>
          ))}
          {loading && <div className="loading">思考中...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入你的问题..."
            disabled={loading}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            发送
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;

import React, { useState, useRef, useEffect } from 'react';
import { ideationApi } from '../services/api';

function Ideation() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    setLoading(true);
    try {
      const data = await ideationApi.start();
      setSessionId(data.sessionId);
      setStage(data.stage);
      setMessages([{ role: 'assistant', content: data.prompt }]);
      setIsComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !sessionId) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await ideationApi.respond(sessionId, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setStage(data.stage);
      setIsComplete(data.isComplete);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误，请重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const stageLabels = {
    topic: '确定主题',
    audience: '明确读者',
    purpose: '写作目的',
    outline: '生成大纲'
  };

  return (
    <div>
      <h1 className="page-title">想法引导</h1>

      {!sessionId ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <h3 style={{ marginBottom: 16 }}>将模糊想法转化为清晰写作计划</h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>
            通过引导式问答，帮助你明确写作主题、目标读者、写作目的，最终生成写作大纲
          </p>
          <button className="btn btn-primary" onClick={startSession} disabled={loading}>
            开始引导
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {Object.entries(stageLabels).map(([key, label]) => (
              <span
                key={key}
                style={{
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 12,
                  background: stage === key ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                  color: stage === key ? 'white' : '#6b7280'
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="chat-container" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="messages">
              {messages.map((m, i) => (
                <div key={i} className={`message ${m.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
              ))}
              {loading && <div className="loading">思考中...</div>}
              <div ref={messagesEndRef} />
            </div>

            {!isComplete ? (
              <form className="chat-input" onSubmit={sendMessage}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="输入你的回答..."
                  disabled={loading}
                />
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  发送
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ color: '#10b981', marginBottom: 12 }}>引导完成！大纲已生成</p>
                <button className="btn btn-secondary" onClick={() => { setSessionId(null); setMessages([]); }}>
                  开始新的引导
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Ideation;

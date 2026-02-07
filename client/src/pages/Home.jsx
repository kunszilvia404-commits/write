import React, { useState, useRef, useEffect } from 'react';
import { chatApi } from '../services/api';

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const session = await chatApi.createSession();
        currentSessionId = session.id;
        setSessionId(currentSessionId);
      }

      const result = await chatApi.sendMessage(currentSessionId, userMessage);
      setMessages(result.messages);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，出了点问题。请再试一次。'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setInput('');
  };

  const quickPrompts = [
    '写作卡住了，不知道怎么继续',
    '脑子里想法很乱，帮我理一理',
    '帮我看看这段文字写得怎么样'
  ];

  return (
    <div className="coach-container">
      {/* 头部品牌区 */}
      <div className="coach-header">
        <div className="brand">
          <h1>写伴</h1>
          <span className="brand-en">Write to See</span>
        </div>
        <p className="main-slogan">问对问题，写出答案</p>
        <p className="sub-slogan">从混沌到澄明，写见自己</p>
      </div>

      {/* 对话区域 */}
      <div className="coach-chat">
        {messages.length === 0 ? (
          <div className="welcome-area">
            <div className="welcome-icon">✍️</div>
            <h2>今天想聊点什么？</h2>
            <div className="welcome-hints">
              {quickPrompts.map((prompt, i) => (
                <span key={i} onClick={() => setInput(prompt)}>{prompt.split('，')[0]}</span>
              ))}
            </div>
            <p>无论是写作困惑、思路混乱，还是需要文章反馈，都可以告诉我。</p>
          </div>
        ) : (
          <div className="messages-area">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.role === 'assistant' && <span className="avatar">✦</span>}
                <div className="bubble-content">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant">
                <span className="avatar">✦</span>
                <div className="bubble-content typing">思考中...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="coach-input-wrapper">
        {messages.length > 0 && (
          <button className="new-chat-btn" onClick={startNewChat}>
            开始新对话
          </button>
        )}
        <form onSubmit={handleSubmit} className="coach-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="说说你的想法、困惑，或者粘贴你的文章..."
            rows={2}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            发送
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;

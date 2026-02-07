const express = require('express');
const router = express.Router();
const { chat } = require('../services/claude');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');
const HISTORY_FILE = path.join(DATA_DIR, 'chat-history.json');

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading history:', e);
  }
  return { sessions: {} };
}

function saveHistory(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

// Get all sessions
router.get('/sessions', (req, res) => {
  const history = loadHistory();
  const sessions = Object.entries(history.sessions).map(([id, session]) => ({
    id,
    title: session.title || '新对话',
    createdAt: session.createdAt,
    messageCount: session.messages.length
  }));
  res.json(sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Create new session
router.post('/sessions', (req, res) => {
  const history = loadHistory();
  const id = uuidv4();
  history.sessions[id] = {
    title: '新对话',
    createdAt: new Date().toISOString(),
    messages: []
  };
  saveHistory(history);
  res.json({ id, title: '新对话', messages: [] });
});

// Get session messages
router.get('/sessions/:id', (req, res) => {
  const history = loadHistory();
  const session = history.sessions[req.params.id];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ id: req.params.id, ...session });
});

// Send message
router.post('/sessions/:id/messages', async (req, res) => {
  try {
    const { message } = req.body;
    const history = loadHistory();
    const session = history.sessions[req.params.id];

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.messages.push({ role: 'user', content: message });

    // 只发送最近的消息，避免超出 token 限制
    const MAX_MESSAGES = 10;
    const recentMessages = session.messages.slice(-MAX_MESSAGES);

    // 如果有更早的消息，添加一个摘要提示
    let aiMessages = recentMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // 添加对话轮次信息，帮助 AI 判断进度
    const turnCount = Math.floor(session.messages.length / 2);

    const response = await chat(aiMessages, 'chat', turnCount);
    session.messages.push({ role: 'assistant', content: response });

    if (session.messages.length === 2) {
      session.title = message.slice(0, 20) + (message.length > 20 ? '...' : '');
    }

    saveHistory(history);
    res.json({ response, messages: session.messages });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete session
router.delete('/sessions/:id', (req, res) => {
  const history = loadHistory();
  delete history.sessions[req.params.id];
  saveHistory(history);
  res.json({ success: true });
});

module.exports = router;

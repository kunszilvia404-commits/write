const express = require('express');
const router = express.Router();
const { ideation } = require('../services/claude');

const sessions = new Map();

router.post('/start', (req, res) => {
  const sessionId = Date.now().toString();
  sessions.set(sessionId, {
    stage: 'topic',
    messages: [],
    data: {}
  });
  res.json({
    sessionId,
    stage: 'topic',
    prompt: '你好！我是你的写作引导助手。让我们一起把你的想法变成清晰的写作计划。\n\n首先，你想写什么？可以是一个模糊的想法，比如"想写关于旅行的文章"或"想分享工作经验"。'
  });
});

router.post('/respond', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.messages.push({ role: 'user', content: message });

    const stages = ['topic', 'audience', 'purpose', 'outline'];
    const currentIndex = stages.indexOf(session.stage);

    const response = await ideation(session.messages, session.stage);
    session.messages.push({ role: 'assistant', content: response });

    if (currentIndex < stages.length - 1 && session.messages.length >= 2) {
      session.stage = stages[currentIndex + 1];
    }

    const isComplete = session.stage === 'outline' && session.messages.length >= 6;

    res.json({
      response,
      stage: session.stage,
      isComplete
    });
  } catch (error) {
    console.error('Ideation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId);
  res.json({ success: true });
});

module.exports = router;

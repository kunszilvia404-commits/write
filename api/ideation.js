const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  baseURL: 'https://c.tokhub.ai',
  apiKey: process.env.TOKHUB_API_KEY
});

const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `你是一位创意引导专家，帮助用户将模糊的想法转化为清晰的写作计划。
根据用户当前的阶段，提出引导性问题或给出建议。
当用户完成所有引导后，生成一份写作大纲。`;

const sessions = new Map();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url.replace('/api/ideation', '');

  try {
    if (method === 'POST' && path === '/start') {
      const sessionId = Date.now().toString();
      sessions.set(sessionId, {
        stage: 'topic',
        messages: [],
        data: {}
      });
      return res.json({
        sessionId,
        stage: 'topic',
        prompt: '你好！我是你的写作引导助手。让我们一起把你的想法变成清晰的写作计划。\n\n首先，你想写什么？可以是一个模糊的想法，比如"想写关于旅行的文章"或"想分享工作经验"。'
      });
    }

    if (method === 'POST' && path === '/respond') {
      const { sessionId, message } = req.body;
      const session = sessions.get(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      session.messages.push({ role: 'user', content: message });

      const stages = ['topic', 'audience', 'purpose', 'outline'];
      const currentIndex = stages.indexOf(session.stage);

      const stagePrompts = {
        topic: '用户正在确定写作主题，请帮助他们明确想要写什么。',
        audience: '用户已确定主题，现在需要明确目标读者是谁。',
        purpose: '请帮助用户明确写作目的和想要传达的核心信息。',
        outline: '根据之前的讨论，请为用户生成一份详细的写作大纲。'
      };

      const systemPrompt = SYSTEM_PROMPT + '\n\n当前阶段：' + (stagePrompts[session.stage] || stagePrompts.topic);

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: session.messages
      });

      const aiResponse = response.content[0].text;
      session.messages.push({ role: 'assistant', content: aiResponse });

      if (currentIndex < stages.length - 1 && session.messages.length >= 2) {
        session.stage = stages[currentIndex + 1];
      }

      const isComplete = session.stage === 'outline' && session.messages.length >= 6;

      return res.json({
        response: aiResponse,
        stage: session.stage,
        isComplete
      });
    }

    const delMatch = path.match(/^\/([^/]+)$/);
    if (method === 'DELETE' && delMatch) {
      sessions.delete(delMatch[1]);
      return res.json({ success: true });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Ideation error:', error);
    return res.status(500).json({ error: error.message });
  }
};

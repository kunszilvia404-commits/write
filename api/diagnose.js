const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  baseURL: 'https://c.tokhub.ai',
  apiKey: process.env.TOKHUB_API_KEY
});

const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `你是一位专业的文章诊断专家。请从以下维度分析用户提交的文章：
1. 结构分析：文章的整体架构是否清晰
2. 逻辑分析：论述是否连贯，论据是否充分
3. 表达分析：语言是否准确、生动
4. 语法检查：是否有语法错误或用词不当

请以JSON格式返回分析结果，包含以下字段：
{
  "summary": "总体评价",
  "score": 0-100的评分,
  "structure": { "score": 分数, "feedback": "反馈", "suggestions": ["建议"] },
  "logic": { "score": 分数, "feedback": "反馈", "suggestions": ["建议"] },
  "expression": { "score": 分数, "feedback": "反馈", "suggestions": ["建议"] },
  "grammar": { "score": 分数, "feedback": "反馈", "issues": ["具体问题"] }
}`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { article } = req.body;

    if (!article || article.trim().length < 50) {
      return res.status(400).json({ error: '文章内容太短，请至少输入50个字符' });
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `请分析以下文章：\n\n${article}` }]
    });

    const text = response.content[0].text;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return res.json(jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text, score: 0 });
    } catch {
      return res.json({ summary: text, score: 0 });
    }
  } catch (error) {
    console.error('Diagnose error:', error);
    return res.status(500).json({ error: error.message });
  }
};

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  baseURL: 'https://c.tokhub.ai',
  apiKey: process.env.TOKHUB_API_KEY
});

const COACH_PROMPT = `你是一位资深的写作教练，拥有丰富的写作教学和心理辅导经验。你的名字叫"文道"。

## 核心目标

你的最终目标是：**帮助用户准备好写作，或完成一篇文章的构思**。

不要无限地聊下去。通过 3-5 轮对话，你应该帮用户达成以下其中一个结果：
1. 理清思路，明确要写什么
2. 列出文章大纲或要点
3. 解决情绪卡点，准备好开始写
4. 完成文章点评，知道如何修改

## 对话节奏

- **第 1-2 轮**：倾听、理解用户的需求和状态
- **第 3-4 轮**：聚焦核心问题，深入探讨
- **第 4-5 轮**：给出总结和行动建议

当你觉得已经聊得差不多时，主动给出一个「小结」，包括：
- 我们聊了什么
- 你现在可以做什么（具体的下一步行动）
- 一句鼓励的话

## 你的三种工作模式

### 模式一：倾听与支持
**触发条件**：用户表达焦虑、沮丧、自我怀疑、拖延、写作恐惧等情绪

**你要做的**：
- 先接住情绪，不急于解决问题
- 说出用户可能没说出口的感受
- 分享一个洞察：为什么会有这种感受
- 用一个温和的问题引导用户继续说

**收尾时**：帮用户看到情绪背后的原因，给一个可以立刻做的小行动

### 模式二：思路引导
**触发条件**：用户有想法但混乱、不知从何下笔、需要梳理思路

**你要做的**：
- 抓住用户表达中的关键词，追问细节
- 用「具体化」的问题帮助用户聚焦
- 帮用户看到他们自己没注意到的角度

**收尾时**：帮用户整理出一个简单的大纲或写作要点

### 模式三：文章点评
**触发条件**：用户分享了一段文字或文章

**你要做的**：
- 先说你读完的「第一感受」
- 指出 1-2 个具体的亮点
- 指出 1-2 个可以改进的地方，并给出具体建议
- 如果可能，给一个改写示例

**收尾时**：给出修改优先级，告诉用户先改哪里效果最明显

## 回答质量要求

1. **有洞察**：不说正确的废话，要说出用户没想到但一听就觉得对的东西
2. **够具体**：少说"你可以..."，多说"比如..."，用例子说话
3. **有层次**：先回应情绪/问题，再给分析，最后用问题或建议收尾
4. **有目标**：每次回复都在推进对话向「准备好写作」的目标前进

## 排版要求

- 段落之间空一行
- 要点用数字或短横线列表
- 关键词用「」标注
- 每次回复 3-5 个段落

## 禁止事项

- 不要无限追问，3-5 轮后要给出总结和建议
- 不要说"我理解你的感受"然后就没了
- 不要一次问太多问题
- 不要给空泛的建议

用中文回复。`;

const MODEL = 'claude-sonnet-4-20250514';

const sessions = new Map();

async function chat(messages, type = 'chat', turnCount = 0) {
  let systemPrompt = COACH_PROMPT;

  if (turnCount >= 4) {
    systemPrompt += '\n\n【系统提示】这是第 ' + turnCount + ' 轮对话了。如果你觉得已经聊得差不多，请给出总结和具体的行动建议，帮助用户准备好开始写作。';
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    temperature: 0.7,
    system: systemPrompt,
    messages: messages
  });
  return response.content[0].text;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  try {
    if (url === '/api/chat/sessions' && method === 'GET') {
      const sessionList = Array.from(sessions.entries()).map(([id, s]) => ({
        id,
        title: s.title,
        messageCount: s.messages.length
      }));
      return res.json(sessionList);
    }

    if (url === '/api/chat/sessions' && method === 'POST') {
      const id = Date.now().toString();
      sessions.set(id, { title: '新对话', messages: [] });
      return res.json({ id, title: '新对话', messages: [] });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

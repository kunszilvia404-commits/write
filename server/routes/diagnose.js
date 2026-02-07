const express = require('express');
const router = express.Router();
const { diagnose } = require('../services/claude');

router.post('/', async (req, res) => {
  try {
    const { article } = req.body;

    if (!article || article.trim().length < 50) {
      return res.status(400).json({ error: '文章内容太短，请至少输入50个字符' });
    }

    const result = await diagnose(article);
    res.json(result);
  } catch (error) {
    console.error('Diagnose error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const https = require('https');
const { protect } = require('../middleware/auth');

const claudeAPI = (prompt) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed.content[0].text);
        } catch (err) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// Smart task suggestions based on title
router.post('/suggest', protect, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const prompt = `You are a smart task management AI. Based on this task title: "${title}"
    
Suggest the best values for these fields. Respond ONLY with valid JSON, no explanation:
{
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": suggest a realistic due date in YYYY-MM-DD format from today ${new Date().toISOString().split('T')[0]},
  "description": a helpful 1-2 sentence description,
  "tags": array of 2-3 relevant tags
}`;

    const response = await claudeAPI(prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    const suggestion = JSON.parse(clean);
    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ message: 'AI suggestion failed' });
  }
});

// Natural language task creation
router.post('/parse', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `You are a smart task management AI. Parse this natural language input into a task: "${text}"

Today's date is ${new Date().toISOString().split('T')[0]}.
Respond ONLY with valid JSON, no explanation:
{
  "title": "clear task title",
  "description": "brief description if any details mentioned",
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": "YYYY-MM-DD format or null if not mentioned",
  "tags": array of 2-3 relevant tags
}`;

    const response = await claudeAPI(prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    const task = JSON.parse(clean);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'AI parsing failed' });
  }
});

// AI daily summary
router.post('/summary', protect, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || !tasks.length) return res.json({ summary: 'No tasks yet! Create your first task to get started. 🚀' });

    const taskList = tasks.map(t =>
      `- ${t.title} (${t.priority} priority, ${t.status}, due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'no date'})`
    ).join('\n');

    const prompt = `You are ShivTask AI assistant. Analyze these tasks and give a friendly, motivating summary in 2-3 sentences. Mention urgent items, progress, and encouragement:

${taskList}

Today is ${new Date().toLocaleDateString()}. Keep it short, friendly and actionable.`;

    const summary = await claudeAPI(prompt);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: 'AI summary failed' });
  }
});

module.exports = router;
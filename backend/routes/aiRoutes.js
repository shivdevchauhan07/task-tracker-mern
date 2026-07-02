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

    console.log('Calling Claude API...');
    console.log('API Key exists:', !!process.env.CLAUDE_API_KEY);

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
        console.log('Claude response status:', res.statusCode);
        console.log('Claude response body:', body.substring(0, 200));
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
          } else {
            resolve(parsed.content[0].text);
          }
        } catch (err) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', (err) => {
      console.error('Claude API request error:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
};

// Test AI route
router.get('/test',async (req, res) => {
  try {
    console.log('Testing Claude API...');
    const response = await claudeAPI('Say hello in one word');
    res.json({ success: true, response });
  } catch (err) {
    console.error('AI test error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Smart task suggestions
router.post('/suggest', protect, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const prompt = `You are a smart task management AI. Based on this task title: "${title}"
    
Suggest the best values. Respond ONLY with valid JSON:
{
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": "YYYY-MM-DD",
  "description": "1-2 sentence description",
  "tags": ["tag1", "tag2"]
}`;

    const response = await claudeAPI(prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    const suggestion = JSON.parse(clean);
    res.json(suggestion);
  } catch (err) {
    console.error('Suggest error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Natural language parse
router.post('/parse', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Parse this into a task: "${text}"
Today: ${new Date().toISOString().split('T')[0]}

Respond ONLY with valid JSON:
{
  "title": "task title",
  "description": "brief description",
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": "YYYY-MM-DD or null",
  "tags": ["tag1", "tag2"]
}`;

    const response = await claudeAPI(prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    const task = JSON.parse(clean);
    res.json(task);
  } catch (err) {
    console.error('Parse error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// AI summary
router.post('/summary', protect, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || !tasks.length) {
      return res.json({ summary: 'No tasks yet! Create your first task to get started. 🚀' });
    }

    const taskList = tasks.map(t =>
      `- ${t.title} (${t.priority} priority, ${t.status})`
    ).join('\n');

    const prompt = `Analyze these tasks and give a friendly 2-sentence summary with motivation:
${taskList}
Keep it short and encouraging.`;

    const summary = await claudeAPI(prompt);
    res.json({ summary });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
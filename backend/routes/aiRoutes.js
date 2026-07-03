const express = require('express');
const router = express.Router();
const https = require('https');
const { protect } = require('../middleware/auth');

const openRouterAPI = (prompt) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek/deepseek-r1-0528',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shivdevchauhan07-tasks.vercel.app',
        'X-Title': 'ShivTask AI'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
            return;
          }
          const message = parsed.choices?.[0]?.message;
const text = message?.content || message?.reasoning_content;
if (!text) {
  console.log('Full response:', JSON.stringify(parsed).substring(0, 500));
  reject(new Error('No response from AI'));
  return;
}
resolve(text);
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

// Smart task suggestions
router.post('/suggest', protect, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const prompt = `You are a smart task management AI. Based on this task title: "${title}"

Respond ONLY with valid JSON, no explanation, no markdown backticks:
{
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": "YYYY-MM-DD format from today ${new Date().toISOString().split('T')[0]}",
  "description": "1-2 sentence helpful description",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await openRouterAPI(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const suggestion = JSON.parse(jsonMatch[0]);
    res.json(suggestion);
  } catch (err) {
    console.error('Suggest error:', err.message);
    res.status(500).json({ message: 'AI suggestion failed: ' + err.message });
  }
});

// Natural language parse
router.post('/parse', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `You are a smart task management AI. Parse this into a task: "${text}"
Today: ${new Date().toISOString().split('T')[0]}

Respond ONLY with valid JSON, no explanation, no markdown backticks:
{
  "title": "clear task title",
  "description": "brief description",
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": "YYYY-MM-DD or null",
  "tags": ["tag1", "tag2"]
}`;

    const response = await openRouterAPI(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const task = JSON.parse(jsonMatch[0]);
    res.json(task);
  } catch (err) {
    console.error('Parse error:', err.message);
    res.status(500).json({ message: 'AI parsing failed: ' + err.message });
  }
});

// AI summary
router.post('/summary', protect, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || !tasks.length) {
      return res.json({ summary: 'No tasks yet! Create your first task to get started. 🚀' });
    }

    const taskList = tasks.slice(0, 5).map(t =>
      `- ${t.title} (${t.priority} priority, ${t.status})`
    ).join('\n');

    const prompt = `Give a friendly 2-sentence summary of these tasks and encourage the user. No JSON, just plain text:
${taskList}`;

    const response = await openRouterAPI(prompt);
    
    // Clean response - remove thinking tags if present
    const clean = response
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim();
      
    res.json({ summary: clean || 'Keep going, you are doing great! 💪' });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.json({ summary: 'Stay focused and keep completing your tasks! 💪🤖' });
  }
});

module.exports = router;
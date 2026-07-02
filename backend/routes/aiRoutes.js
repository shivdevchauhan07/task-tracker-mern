const express = require('express');
const router = express.Router();
const https = require('https');
const { protect } = require('../middleware/auth');

const geminiAPI = (prompt) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.3 }
    });

    const apiKey = process.env.GEMINI_API_KEY;
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
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
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('No response from Gemini'));
            return;
          }
          resolve(text);
        } catch (err) {
          reject(new Error('Failed to parse Gemini response'));
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

Suggest the best values. Respond ONLY with valid JSON, no explanation, no markdown:
{
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": "YYYY-MM-DD format from today ${new Date().toISOString().split('T')[0]}",
  "description": "1-2 sentence helpful description",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await geminiAPI(prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    const suggestion = JSON.parse(clean);
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

    const prompt = `You are a smart task management AI. Parse this natural language into a task: "${text}"

Today's date is ${new Date().toISOString().split('T')[0]}.
Respond ONLY with valid JSON, no explanation, no markdown:
{
  "title": "clear task title",
  "description": "brief description if details mentioned",
  "priority": "low" or "medium" or "high",
  "category": one of ["Work", "Personal", "Study", "Health", "Finance", "Shopping", "Other"],
  "dueDate": "YYYY-MM-DD or null if not mentioned",
  "tags": ["tag1", "tag2"]
}`;

    const response = await geminiAPI(prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    const task = JSON.parse(clean);
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

    const taskList = tasks.map(t =>
      `- ${t.title} (${t.priority} priority, ${t.status})`
    ).join('\n');

    const prompt = `You are ShivTask AI assistant. Analyze these tasks and give a friendly motivating summary in 2 sentences. Mention urgent items and give encouragement:

${taskList}

Today is ${new Date().toLocaleDateString()}. Keep it short, friendly and actionable.`;

    const summary = await geminiAPI(prompt);
    res.json({ summary: summary.trim() });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({ message: 'AI summary failed: ' + err.message });
  }
});

module.exports = router;
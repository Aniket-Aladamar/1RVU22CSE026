const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Log } = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const urlStore = new Map();

app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// Endpoint for frontend to register a shortcode (optional)
app.post('/api/register', (req, res) => {
  const { shortcode, longUrl, expiry } = req.body || {};
  if (!shortcode || !longUrl) return res.status(400).json({ error: 'shortcode and longUrl required' });
  urlStore.set(shortcode, { longUrl, expiry });
  Log('backend', 'info', 'service', `Registered shortcode ${shortcode} -> ${longUrl}`);
  res.json({ ok: true });
});

// Logging endpoint for frontend
app.post('/api/log', (req, res) => {
  const { stack, level, package: pkg, message } = req.body || {};
  Log(stack || 'frontend', level || 'info', pkg || 'service', message || 'no message');
  res.json({ ok: true });
});

// Redirect handler: /:shortcode
app.get('/:short', (req, res) => {
  const short = req.params.short;
  if (urlStore.has(short)) {
    const entry = urlStore.get(short);
    if (!entry.expiry || Date.now() < entry.expiry) {
      Log('backend', 'info', 'route', `Redirecting ${short} to ${entry.longUrl}`);
      return res.redirect(entry.longUrl);
    } else {
      return res.status(410).send('Link expired');
    }
  }
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

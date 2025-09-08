URL shortener (non-React) with logging middleware

- Frontend: static HTML/CSS/JS in `frontend/`
- Backend: simple Express server in `Logging Middleware/server.js` that serves the frontend, accepts registrations and logs, and does path-based redirects (in-memory)

How to run (Windows PowerShell):

1. Install deps in Logging Middleware

   cd "1RVU22CSE026\Logging Middleware"
   npm install

2. Start server

   npm start

3. Open http://localhost:3000 in a browser

Notes:
- Shortcodes are stored in-memory; restarting the server clears them.
- The app uses the `logger.js` module to emit logs. If you set LOG_API_URL in `.env`, the logger will forward logs there.

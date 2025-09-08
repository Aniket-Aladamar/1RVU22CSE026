const axios = require('axios');
require('dotenv').config();

const LOG_API_URL = process.env.LOG_API_URL || null;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || null;

const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages = [
  "cache", "controller", "cron_job", "db", "domain", "handler",
  "repository","route","service"
];

async function Log(stack, level, pkg, message) {
  try {
    if (!validStacks.includes(stack)) throw new Error(`Invalid stack: ${stack}`);
    if (!validLevels.includes(level)) throw new Error(`Invalid level: ${level}`);
    if (!validPackages.includes(pkg)) throw new Error(`Invalid package: ${pkg}`);

    const payload = { stack, level, package: pkg, message };

    const response = await axios.post(LOG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": ACCESS_TOKEN ? `Bearer ${ACCESS_TOKEN}` : undefined
      }
    });

    console.log("Log sent:", response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Failed to send log:", error.message);
    }
    return null;
  }
}

if (require.main === module) {
  (async () => {
    await Log("backend", "error", "handler", "received string, expected bool");
    await Log("backend", "fatal", "db", "Critical database connection failure.");
  })();
}

module.exports = { Log };

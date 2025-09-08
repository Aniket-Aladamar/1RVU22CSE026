const urlMap = new Map();

function sendLog(level, pkg, message) {
  try {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    logs.push({ ts: Date.now(), level, package: pkg, message });
    localStorage.setItem('logs', JSON.stringify(logs));
  } catch (e) {
    // ignore
  }
}

function generateCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function shortenUrl() {
  const longUrl = document.getElementById("longUrl").value.trim();
  let validity = parseInt(document.getElementById("validity").value.trim()) || 30;
  let shortcode = document.getElementById("shortcode").value.trim();

  if (!longUrl || !/^https?:\/\/.+/.test(longUrl)) {
  alert("Please enter a valid URL (must start with http/https).");
  sendLog('warn', 'service', 'Invalid URL entered');
    return;
  }

  if (!shortcode) {
    shortcode = generateCode();
  } else if (urlMap.has(shortcode)) {
    alert("Custom shortcode already taken. Try another.");
    return;
  }

  const expiry = Date.now() + validity * 60 * 1000;
  urlMap.set(shortcode, { longUrl, expiry });

  const store = JSON.parse(localStorage.getItem('short_urls') || '{}');
  store[shortcode] = { longUrl, expiry, clicks: store[shortcode] ? store[shortcode].clicks || [] : [] };
  localStorage.setItem('short_urls', JSON.stringify(store));
  sendLog('info', 'service', `Created shortcode ${shortcode}`);

  displayResults();
}

function displayResults() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h3>Shortened URLs:</h3>";

  urlMap.forEach((value, key) => {
    const expiresAt = new Date(value.expiry).toLocaleString();
    resultsDiv.innerHTML += `
      <div class="link">
        <a href="#/${key}" onclick="recordAndOpen(event, '${key}')">http://localhost/#/${key}</a> → ${value.longUrl}<br>
        Expires: ${expiresAt}
      </div>
    `;
  });
}

// Handle redirection
// record click in localStorage and open link
function recordAndOpen(evt, short) {
  evt.preventDefault();
  const store = JSON.parse(localStorage.getItem('short_urls') || '{}');
  const entry = store[short];
  if (!entry) {
    alert('Shortcode not found');
    return;
  }
  if (entry.expiry && Date.now() > entry.expiry) {
    alert('Link expired');
    return;
  }
  // add click record (minimal: timestamp + source)
  entry.clicks = entry.clicks || [];
  entry.clicks.push({ ts: Date.now(), source: 'frontend' });
  store[short] = entry;
  localStorage.setItem('short_urls', JSON.stringify(store));
  sendLog('info', 'route', `Clicked ${short}`);
  window.open(entry.longUrl, '_blank');
}

// load persisted URLs into memory on init
function loadFromStorage() {
  const store = JSON.parse(localStorage.getItem('short_urls') || '{}');
  Object.keys(store).forEach(k => {
    urlMap.set(k, { longUrl: store[k].longUrl, expiry: store[k].expiry });
  });
}

window.onload = function() {
  loadFromStorage();
  // handle hash-based redirect (#/shortcode) for direct open
  const hash = window.location.hash.replace(/^#\//, '');
  if (hash) {
    const store = JSON.parse(localStorage.getItem('short_urls') || '{}');
    const entry = store[hash];
    if (entry) {
      if (!entry.expiry || Date.now() < entry.expiry) {
        // record click and redirect
        entry.clicks = entry.clicks || [];
        entry.clicks.push({ ts: Date.now(), source: 'direct' });
        store[hash] = entry;
        localStorage.setItem('short_urls', JSON.stringify(store));
        sendLog('info', 'route', `Direct redirect for ${hash}`);
        window.location.href = entry.longUrl;
        return;
      } else {
        document.body.innerHTML = "<h2>Link expired</h2>";
        return;
      }
    }
  }
}

/**
 * AI Ashish — Floating Vedic Chatbot Widget
 * AstroPsycho Platform
 * Self-contained: injects all CSS automatically
 * No external dependencies — pure vanilla JS
 */
(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'astro_gemini_api_key';
  const DEFAULT_API_KEY = ''; // REMOVED BY GITHUB SECRETS SCANNER
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
  const MODEL = 'gemini-2.5-flash';
  const MAX_HISTORY = 20; // keep last N messages for context

  const SYSTEM_PROMPT = `You are AI Ashish — the divine Vedic cosmic guide and the AI soul of Ashish Chaurasia, built into the AstroPsycho platform. You are an expert in:

- All 12 Rashis (Mesh to Meen) and their deep psychology
- Navagrahas — Surya, Chandra, Mangal, Budha, Guru, Shukra, Shani, Rahu, Ketu — their nature, dashas, mahadashas and effects on human life
- Vimshottari Dasha system — 120 year cycle, all mahadasha and antardasha interpretations
- 12 Bhavas (houses) — their significations and lords
- Major yogas — Raj Yoga, Dhana Yoga, Gajakesari, Budhaditya, Kemadruma, etc.
- Shadbala, Ashtakavarga, divisional charts (D1-D12)
- Kundali Milan — Ashtakoot compatibility system
- Classical remedies from Parashar, Brigu, Lal Kitab
- Mantras, gemstones, charity, fasting remedies
- Psychological correlations with planetary periods
- Transits (Gochar) and their effects

Your personality:
- Warm, wise, like a knowledgeable pandit who also understands modern psychology
- You ARE Ashish — speak with his confidence and care
- Speak in Hinglish (natural Hindi + English mix)
- Be specific and insightful, never vague
- Give practical, actionable guidance
- Reference Vedic classics when relevant
- Always end on an encouraging, positive note
- Keep responses 4-6 lines unless detailed analysis needed
- Use relevant emojis (🌟🪐✨🔮🙏) sparingly

If user asks who you are, say:
"Main hoon AI Ashish — Ashish Chaurasia ne mujhe banaya hai taaki main unki jagah aapki Vedic journey mein guide kar sakoon 🔮"

If user asks about the platform, tell them to use the assessment and birth chart tools for their full personalized report.`;

  const QUICK_CHIPS = [
    'Mera Rashi aur personality?',
    'Shani Sade Sati kab?',
    'Career mein safalta kab?',
    'Love aur shaadi ka yoga?',
    'Mera lucky gemstone?',
    'Aaj ka din kaisa hai?',
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let isOpen = false;
  let hasUnread = false;
  let conversationHistory = [];
  let isTyping = false;
  let welcomeShown = false;

  // ── Inject CSS ────────────────────────────────────────────────────────────
  function injectCSS() {
    const css = `
      /* ── AstroPsycho Chatbot Widget ── */
      #astro-chatbot-root * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* Floating toggle button */
      #astro-chat-toggle {
        position: fixed;
        bottom: 28px;
        right: 28px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: radial-gradient(circle at 40% 40%, #2a0a4a, #0d0118);
        border: 2px solid #f0c040;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #f0c040;
        z-index: 99999;
        box-shadow: 0 0 18px rgba(240,192,64,0.45), 0 4px 24px rgba(0,0,0,0.6);
        animation: astro-pulse 2.8s ease-in-out infinite;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        outline: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      #astro-chat-toggle:hover {
        transform: scale(1.08);
        box-shadow: 0 0 28px rgba(240,192,64,0.7), 0 4px 24px rgba(0,0,0,0.7);
      }
      #astro-chat-toggle:active {
        transform: scale(0.95);
      }
      @keyframes astro-pulse {
        0%, 100% { box-shadow: 0 0 18px rgba(240,192,64,0.45), 0 4px 24px rgba(0,0,0,0.6); }
        50%       { box-shadow: 0 0 34px rgba(240,192,64,0.85), 0 4px 28px rgba(0,0,0,0.7); }
      }

      /* Unread dot */
      #astro-unread-dot {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        background: #f0c040;
        border-radius: 50%;
        border: 2px solid #0d0118;
        display: none;
        animation: astro-blink 1.4s ease-in-out infinite;
      }
      @keyframes astro-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
      }

      /* Chat panel */
      #astro-chat-panel {
        position: fixed;
        bottom: 96px;
        right: 28px;
        width: 350px;
        height: 500px;
        background: #0d0118;
        border: 1px solid rgba(240,192,64,0.3);
        border-radius: 16px;
        z-index: 99998;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 8px 48px rgba(0,0,0,0.8), 0 0 32px rgba(107,33,168,0.2);
        transform: translateY(20px) scale(0.96);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
        /* Star-pattern background */
        background-image:
          radial-gradient(circle, rgba(240,192,64,0.08) 1px, transparent 1px),
          radial-gradient(circle, rgba(240,192,64,0.05) 1px, transparent 1px),
          linear-gradient(180deg, #0d0118 0%, #110020 100%);
        background-size: 40px 40px, 80px 80px, 100% 100%;
        background-position: 0 0, 20px 20px, 0 0;
      }
      #astro-chat-panel.open {
        transform: translateY(0) scale(1);
        opacity: 1;
        pointer-events: all;
      }

      /* Header */
      #astro-chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 10px;
        border-bottom: 1px solid rgba(240,192,64,0.2);
        background: linear-gradient(135deg, rgba(107,33,168,0.35) 0%, rgba(13,1,24,0.8) 100%);
        flex-shrink: 0;
      }
      #astro-chat-header-left {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      #astro-chat-title {
        font-size: 15px;
        font-weight: 700;
        color: #f0c040;
        letter-spacing: 0.3px;
        text-shadow: 0 0 8px rgba(240,192,64,0.5);
      }
      #astro-chat-subtitle {
        font-size: 11px;
        color: rgba(240,192,64,0.6);
        letter-spacing: 0.4px;
      }
      #astro-header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .astro-icon-btn {
        background: none;
        border: none;
        color: rgba(240,192,64,0.6);
        cursor: pointer;
        font-size: 16px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s, background 0.2s;
        outline: none;
      }
      .astro-icon-btn:hover {
        color: #f0c040;
        background: rgba(240,192,64,0.1);
      }

      /* Messages container */
      #astro-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        scroll-behavior: smooth;
      }
      #astro-messages::-webkit-scrollbar { width: 4px; }
      #astro-messages::-webkit-scrollbar-track { background: transparent; }
      #astro-messages::-webkit-scrollbar-thumb { background: rgba(240,192,64,0.25); border-radius: 4px; }

      /* Welcome screen */
      #astro-welcome {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 10px;
        padding: 16px 8px;
        animation: astro-fadein 0.5s ease both;
      }
      #astro-welcome-om {
        font-size: 38px;
        color: #f0c040;
        text-shadow: 0 0 24px rgba(240,192,64,0.7);
        animation: astro-glow-om 2.5s ease-in-out infinite;
      }
      @keyframes astro-glow-om {
        0%, 100% { text-shadow: 0 0 18px rgba(240,192,64,0.6); }
        50%       { text-shadow: 0 0 36px rgba(240,192,64,1); }
      }
      #astro-welcome-greeting {
        font-size: 15px;
        font-weight: 600;
        color: #f0c040;
        line-height: 1.3;
      }
      #astro-welcome-sub {
        font-size: 12px;
        color: rgba(200,170,255,0.7);
        line-height: 1.5;
        max-width: 240px;
      }
      #astro-chips-label {
        font-size: 11px;
        color: rgba(240,192,64,0.5);
        margin-top: 2px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      #astro-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;
        margin-top: 2px;
      }
      .astro-chip {
        background: rgba(107,33,168,0.3);
        border: 1px solid rgba(240,192,64,0.3);
        border-radius: 20px;
        padding: 5px 12px;
        font-size: 11.5px;
        color: rgba(240,192,64,0.85);
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s, transform 0.15s;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
      }
      .astro-chip:hover {
        background: rgba(240,192,64,0.15);
        border-color: rgba(240,192,64,0.6);
        transform: translateY(-1px);
      }
      .astro-chip:active { transform: scale(0.97); }

      /* Message bubbles */
      .astro-msg {
        display: flex;
        gap: 8px;
        animation: astro-fadein 0.35s ease both;
        max-width: 100%;
      }
      @keyframes astro-fadein {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .astro-msg.user {
        flex-direction: row-reverse;
      }
      .astro-msg-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: radial-gradient(circle, #2a0a4a, #0d0118);
        border: 1px solid rgba(240,192,64,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        align-self: flex-end;
      }
      .astro-msg-bubble {
        padding: 9px 13px;
        border-radius: 14px;
        font-size: 13px;
        line-height: 1.55;
        max-width: calc(100% - 44px);
        word-break: break-word;
        white-space: pre-wrap;
      }
      .astro-msg.ai .astro-msg-bubble {
        background: rgba(107,33,168,0.2);
        border: 1px solid rgba(107,33,168,0.4);
        color: rgba(230,215,255,0.92);
        border-bottom-left-radius: 4px;
      }
      .astro-msg.user .astro-msg-bubble {
        background: rgba(240,192,64,0.12);
        border: 1px solid rgba(240,192,64,0.3);
        color: rgba(255,240,190,0.95);
        border-bottom-right-radius: 4px;
      }

      /* Typing dots */
      #astro-typing {
        display: none;
        gap: 8px;
        align-items: center;
        animation: astro-fadein 0.3s ease both;
      }
      .astro-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #f0c040;
        animation: astro-bounce 1.2s ease-in-out infinite;
      }
      .astro-dot:nth-child(2) { animation-delay: 0.18s; }
      .astro-dot:nth-child(3) { animation-delay: 0.36s; }
      @keyframes astro-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
        40%           { transform: translateY(-6px); opacity: 1; }
      }
      #astro-typing-bubble {
        background: rgba(107,33,168,0.2);
        border: 1px solid rgba(107,33,168,0.4);
        border-radius: 14px;
        border-bottom-left-radius: 4px;
        padding: 11px 14px;
        display: flex;
        gap: 5px;
        align-items: center;
      }

      /* API key setup screen */
      #astro-apikey-screen {
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px 20px;
        text-align: center;
        animation: astro-fadein 0.4s ease both;
      }
      #astro-apikey-screen.visible { display: flex; }
      #astro-apikey-icon { font-size: 36px; }
      #astro-apikey-title {
        font-size: 16px;
        font-weight: 700;
        color: #f0c040;
        text-shadow: 0 0 8px rgba(240,192,64,0.5);
      }
      #astro-apikey-sub {
        font-size: 12px;
        color: rgba(200,170,255,0.7);
        line-height: 1.5;
      }
      #astro-apikey-input {
        width: 100%;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(240,192,64,0.35);
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 13px;
        color: #f5f0ff;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: monospace;
      }
      #astro-apikey-input:focus {
        border-color: rgba(240,192,64,0.7);
        box-shadow: 0 0 0 3px rgba(240,192,64,0.1);
      }
      #astro-apikey-input::placeholder { color: rgba(200,170,255,0.35); }
      #astro-apikey-btn {
        width: 100%;
        background: linear-gradient(135deg, #6b21a8, #3b0064);
        border: 1px solid rgba(240,192,64,0.4);
        border-radius: 10px;
        padding: 11px;
        font-size: 13.5px;
        font-weight: 600;
        color: #f0c040;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s;
        outline: none;
        letter-spacing: 0.3px;
      }
      #astro-apikey-btn:hover {
        background: linear-gradient(135deg, #7c31c0, #4a0080);
        transform: translateY(-1px);
      }
      #astro-apikey-btn:active { transform: scale(0.98); }
      #astro-apikey-link {
        font-size: 11px;
        color: rgba(240,192,64,0.5);
      }
      #astro-apikey-link a {
        color: rgba(240,192,64,0.75);
        text-decoration: none;
      }
      #astro-apikey-link a:hover { text-decoration: underline; }

      /* Input bar */
      #astro-input-bar {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        padding: 10px 12px 14px;
        border-top: 1px solid rgba(240,192,64,0.15);
        background: rgba(13,1,24,0.9);
        flex-shrink: 0;
      }
      #astro-textarea {
        flex: 1;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(240,192,64,0.2);
        border-radius: 12px;
        padding: 9px 12px;
        font-size: 13px;
        color: #f5f0ff;
        outline: none;
        resize: none;
        min-height: 38px;
        max-height: 110px;
        overflow-y: auto;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
        line-height: 1.5;
      }
      #astro-textarea:focus {
        border-color: rgba(240,192,64,0.6);
        box-shadow: 0 0 0 3px rgba(240,192,64,0.08);
      }
      #astro-textarea::placeholder { color: rgba(200,170,255,0.35); }
      #astro-textarea::-webkit-scrollbar { width: 3px; }
      #astro-textarea::-webkit-scrollbar-thumb { background: rgba(240,192,64,0.2); border-radius: 3px; }
      #astro-send-btn {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
        border-radius: 50%;
        background: linear-gradient(135deg, #f0c040, #c8960a);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s, box-shadow 0.2s;
        outline: none;
        box-shadow: 0 2px 12px rgba(240,192,64,0.35);
      }
      #astro-send-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 4px 18px rgba(240,192,64,0.55);
      }
      #astro-send-btn:active { transform: scale(0.94); }
      #astro-send-btn svg {
        width: 16px;
        height: 16px;
        fill: #0d0118;
      }

      /* ── Mobile: full-width bottom sheet ── */
      @media (max-width: 480px) {
        #astro-chat-panel {
          right: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 88vh;
          border-radius: 20px 20px 0 0;
          border-left: none;
          border-right: none;
          border-bottom: none;
        }
        #astro-chat-panel.open {
          transform: translateY(0) scale(1);
        }
        #astro-chat-toggle {
          bottom: 20px;
          right: 20px;
        }
      }
    `;
    const style = document.createElement('style');
    style.id = 'astro-chatbot-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Build DOM ─────────────────────────────────────────────────────────────
  function buildDOM() {
    const root = document.createElement('div');
    root.id = 'astro-chatbot-root';

    // Toggle button
    root.innerHTML = `
      <!-- Toggle Button -->
      <button id="astro-chat-toggle" aria-label="Open AI Ashish chatbot" title="AI Ashish — Vedic Guide">
        <span>ॐ</span>
        <span id="astro-unread-dot"></span>
      </button>

      <!-- Chat Panel -->
      <div id="astro-chat-panel" role="dialog" aria-label="AI Ashish chatbot">
        <!-- Header -->
        <div id="astro-chat-header">
          <div id="astro-chat-header-left">
            <div id="astro-chat-title">🔮 AI Ashish</div>
            <div id="astro-chat-subtitle">Your Vedic Cosmic Guide</div>
          </div>
          <div id="astro-header-actions">
            <button class="astro-icon-btn" id="astro-settings-btn" title="Update API Key" aria-label="Settings">⚙️</button>
            <button class="astro-icon-btn" id="astro-close-btn" title="Close" aria-label="Close chat">✕</button>
          </div>
        </div>

        <!-- API Key Setup Screen (shown at start if no key) -->
        <div id="astro-apikey-screen">
          <div id="astro-apikey-icon">🔑</div>
          <div id="astro-apikey-title">AI Ashish ko jagao</div>
          <div id="astro-apikey-sub">Apna Google Gemini API key daalo<br>aur apni Vedic journey shuru karo</div>
          <input id="astro-apikey-input" type="password" placeholder="AIzaSy..." autocomplete="off" />
          <button id="astro-apikey-btn">✨ Activate AI Ashish</button>
          <div id="astro-apikey-link">Free key milegi: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com</a></div>
        </div>

        <!-- Messages Area -->
        <div id="astro-messages">
          <!-- Welcome screen injected here on open -->
          <!-- Typing indicator -->
          <div id="astro-typing">
            <div class="astro-msg-avatar">ॐ</div>
            <div id="astro-typing-bubble">
              <div class="astro-dot"></div>
              <div class="astro-dot"></div>
              <div class="astro-dot"></div>
            </div>
          </div>
        </div>

        <!-- Input Bar -->
        <div id="astro-input-bar">
          <textarea id="astro-textarea" placeholder="AI Ashish se poochho..." rows="1" aria-label="Message input"></textarea>
          <button id="astro-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  // ── Welcome Screen ─────────────────────────────────────────────────────────
  function renderWelcome() {
    if (welcomeShown) return;
    welcomeShown = true;

    const messagesEl = document.getElementById('astro-messages');
    const typingEl = document.getElementById('astro-typing');

    const welcomeEl = document.createElement('div');
    welcomeEl.id = 'astro-welcome';
    welcomeEl.innerHTML = `
      <div id="astro-welcome-om">ॐ</div>
      <div id="astro-welcome-greeting">Namaste 🙏 Main hoon AI Ashish</div>
      <div id="astro-welcome-sub">Ashish Chaurasia ka Vedic AI —<br>apne cosmos ke raaz janiye</div>
      <div id="astro-chips-label">📿 Kuch sawaal poochho</div>
      <div id="astro-chips">
        ${QUICK_CHIPS.map(chip => `<button class="astro-chip">${chip}</button>`).join('')}
      </div>
    `;

    // Insert before typing indicator
    messagesEl.insertBefore(welcomeEl, typingEl);

    // Attach chip listeners
    welcomeEl.querySelectorAll('.astro-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.textContent;
        sendMessage(text);
      });
    });
  }

  // ── Message Rendering ──────────────────────────────────────────────────────
  function appendMessage(role, text) {
    const messagesEl = document.getElementById('astro-messages');
    const typingEl = document.getElementById('astro-typing');

    const msgEl = document.createElement('div');
    msgEl.className = `astro-msg ${role}`;

    if (role === 'ai') {
      msgEl.innerHTML = `
        <div class="astro-msg-avatar">ॐ</div>
        <div class="astro-msg-bubble">${escapeHtml(text)}</div>
      `;
    } else {
      msgEl.innerHTML = `
        <div class="astro-msg-bubble">${escapeHtml(text)}</div>
      `;
    }

    messagesEl.insertBefore(msgEl, typingEl);
    scrollToBottom();
  }

  function showTyping(show) {
    const typingEl = document.getElementById('astro-typing');
    typingEl.style.display = show ? 'flex' : 'none';
    if (show) scrollToBottom();
    isTyping = show;
  }

  function scrollToBottom() {
    const messagesEl = document.getElementById('astro-messages');
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── API Call ───────────────────────────────────────────────────────────────
  function getApiKey() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_KEY;
  }

  async function callGeminiAPI(userMessage) {
    const apiKey = getApiKey();
    if (!apiKey) {
      showAPIKeyScreen();
      return;
    }

    // --- Inject User's Dynamic Astrological Data ---
    let dynamicContext = "";
    try {
      const stored = localStorage.getItem('astropsycho_assessment');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.birthDetails) {
          dynamicContext = `\n\n=== USER'S BIRTH PROFILE ===\nName: ${data.name || 'Seeker'}\nDOB: ${data.birthDetails.birthDate}\nTime: ${data.birthDetails.birthTime}\nPlace: ${data.birthDetails.birthPlace}\n`;
          
          if (typeof window.VedicAstrologyEngine !== 'undefined') {
            try {
              const baseEng = new window.VedicAstrologyEngine();
              const chart = baseEng.calculateBirthChart(data.birthDetails);
              dynamicContext += `\nLagna (Ascendant): ${chart.ascendant.sign}\n`;
              dynamicContext += `Rashi (Moon Sign): ${chart.planets.moon.sign}\n`;
              dynamicContext += `Sun Sign: ${chart.planets.sun.sign}\n`;
              dynamicContext += `\n--- EXACT PLANETARY CHART (DO NOT CALCULATE YOURSELF, TRUST THESE) ---\n`;
              for (const [pName, pData] of Object.entries(chart.planets)) {
                dynamicContext += `- ${pName.toUpperCase()}: ${pData.sign} (House ${pData.house})\n`;
              }
              dynamicContext += `----------------------------------------------------------------------\n`;
            } catch(e) { console.error('Error pre-calculating chart for AI', e); }
          } else {
             dynamicContext += `(No pre-calculated chart available, calculate based on exact Lahiri Ayanamsa only if asked).\n`;
          }
          
          dynamicContext += `Use this exact profile profoundly when answering "mera rashi", "mera future" etc. Treat this user as your primary client.`;
        }
      }
    } catch(e) {
      console.error("Could not parse user chart for context");
    }

    const finalSystemPrompt = SYSTEM_PROMPT + dynamicContext;

    // Format history for Gemini (roles matching user / model)
    let geminiHistory = conversationHistory.slice(-MAX_HISTORY).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const body = {
      systemInstruction: { parts: [{ text: finalSystemPrompt }] },
      contents: geminiHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    };

    showTyping(true);

    try {
      const endpoint = `${API_URL}${MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      showTyping(false);

      if (!response.ok) {
        const errorData = await response.json().catch(()=>({}));
        console.error('Gemini API Error:', errorData);
        
        if (response.status === 400 && errorData?.error?.message?.includes("API key not valid")) {
           appendMessage('ai', 'API key sahi nahi hai — settings se update karo 🔑');
        } else {
           appendMessage('ai', `Kuch galat ho gaya (${response.status}). Dobara try karo ✨`);
        }
        return;
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Koi jawab nahi mila — dobara poochho 🙏';
      conversationHistory.push({ role: 'assistant', content: aiText });
      appendMessage('ai', aiText);

      // If panel is closed, show unread dot
      if (!isOpen) {
        hasUnread = true;
        document.getElementById('astro-unread-dot').style.display = 'block';
      }

    } catch (err) {
      showTyping(false);
      appendMessage('ai', 'Connection nahi hai — internet check karo ✨');
    }
  }

  // ── Send Message ───────────────────────────────────────────────────────────
  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || isTyping) return;

    // If no API key at all, show setup screen
    const apiKey = getApiKey();
    if (!apiKey) {
      showAPIKeyScreen();
      return;
    }

    // Remove welcome screen once user sends first message
    const welcomeEl = document.getElementById('astro-welcome');
    if (welcomeEl) welcomeEl.remove();

    appendMessage('user', text);

    // Reset textarea
    const textarea = document.getElementById('astro-textarea');
    if (textarea) {
      textarea.value = '';
      textarea.style.height = 'auto';
    }

    conversationHistory.push({ role: 'user', content: text });
    await callGeminiAPI(text);
  }

  // ── API Key Screen ─────────────────────────────────────────────────────────
  function showAPIKeyScreen() {
    const screen = document.getElementById('astro-apikey-screen');
    const messagesEl = document.getElementById('astro-messages');
    const inputBar = document.getElementById('astro-input-bar');
    if (screen) {
      screen.classList.add('visible');
      messagesEl.style.display = 'none';
      inputBar.style.display = 'none';
    }
  }

  function hideAPIKeyScreen() {
    const screen = document.getElementById('astro-apikey-screen');
    const messagesEl = document.getElementById('astro-messages');
    const inputBar = document.getElementById('astro-input-bar');
    if (screen) {
      screen.classList.remove('visible');
      messagesEl.style.display = '';
      inputBar.style.display = '';
    }
  }

  // ── Panel Open/Close ───────────────────────────────────────────────────────
  function openPanel() {
    isOpen = true;
    hasUnread = false;
    document.getElementById('astro-chat-panel').classList.add('open');
    document.getElementById('astro-unread-dot').style.display = 'none';

    const apiKey = getApiKey();
    if (!apiKey) {
      showAPIKeyScreen();
    } else {
      hideAPIKeyScreen();
      renderWelcome();
      // Focus textarea
      setTimeout(() => {
        const ta = document.getElementById('astro-textarea');
        if (ta) ta.focus();
      }, 300);
    }
  }

  function closePanel() {
    isOpen = false;
    document.getElementById('astro-chat-panel').classList.remove('open');
  }

  // ── Event Listeners ────────────────────────────────────────────────────────
  function attachListeners() {
    // Toggle button
    document.getElementById('astro-chat-toggle').addEventListener('click', () => {
      isOpen ? closePanel() : openPanel();
    });

    // Close button
    document.getElementById('astro-close-btn').addEventListener('click', closePanel);

    // Settings / change API key
    document.getElementById('astro-settings-btn').addEventListener('click', () => {
      showAPIKeyScreen();
      const input = document.getElementById('astro-apikey-input');
      const current = localStorage.getItem(STORAGE_KEY) || '';
      if (input) {
        input.value = current;
        setTimeout(() => input.focus(), 100);
      }
    });

    // API key activate button
    document.getElementById('astro-apikey-btn').addEventListener('click', activateAPIKey);
    document.getElementById('astro-apikey-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') activateAPIKey();
    });

    // Textarea auto-grow + Enter to send
    const textarea = document.getElementById('astro-textarea');
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 110) + 'px';
    });
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(textarea.value);
      }
    });

    // Send button
    document.getElementById('astro-send-btn').addEventListener('click', () => {
      sendMessage(textarea.value);
    });

    // Close on outside click (desktop)
    document.addEventListener('click', (e) => {
      if (!isOpen) return;
      const panel = document.getElementById('astro-chat-panel');
      const toggle = document.getElementById('astro-chat-toggle');
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        closePanel();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closePanel();
    });
  }

  function activateAPIKey() {
    const input = document.getElementById('astro-apikey-input');
    const key = (input?.value || '').trim();
    if (!key) {
      input.style.borderColor = 'rgba(255,80,80,0.7)';
      setTimeout(() => (input.style.borderColor = ''), 1200);
      return;
    }
    localStorage.setItem(STORAGE_KEY, key);
    input.value = '';
    hideAPIKeyScreen();
    renderWelcome();
    const ta = document.getElementById('astro-textarea');
    if (ta) setTimeout(() => ta.focus(), 300);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    // Don't initialise twice
    if (document.getElementById('astro-chatbot-root')) return;
    injectCSS();
    buildDOM();
    attachListeners();
  }

  // Wait for DOM if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

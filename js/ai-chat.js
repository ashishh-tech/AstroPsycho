/**
 * AI Astrologer Chat Logic
 * Handles user input, birth chart context gathering, and API simulation/connection.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const chatInput = document.getElementById('chatInput');
    const chatSubmitBtn = document.getElementById('chatSubmitBtn');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    // Setup Modal
    const setupOverlay = document.getElementById('setupOverlay');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const simModeBtn = document.getElementById('simModeBtn');
    const aiStatusBadge = document.getElementById('aiStatus');
    const openSettingsBtn = document.getElementById('openSettingsBtn');

    // State Variables
    let userContext = null;
    let chatHistory = [];

    init();

    function init() {
        // Load user chart data from localStorage to feed the AI
        const stored = localStorage.getItem('astropsycho_assessment');
        if (stored) {
            userContext = JSON.parse(stored);
            console.log("Loaded birth chart context for AI:", userContext.birthDetails.fullName);
        } else {
            addAiMessage("⚠️ I noticed you haven't generated a birth chart yet. My readings will be generic until you complete the assessment.");
        }

        // Hide the old setup overlay
        if (setupOverlay) {
            setupOverlay.style.display = 'none';
        }
        setAiOnline(true, false);

        // Event Listeners
        chatSubmitBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
    }

    function setAiOnline(online, simulation = false) {
        if (!online) {
            aiStatusBadge.className = "badge bg-danger bg-opacity-10 text-danger border border-danger";
            aiStatusBadge.textContent = "Offline";
        } else if (simulation) {
            aiStatusBadge.className = "badge bg-warning bg-opacity-10 text-warning border border-warning";
            aiStatusBadge.textContent = "Simulation Mode";
        } else {
            aiStatusBadge.className = "badge bg-success bg-opacity-10 text-success border border-success";
            aiStatusBadge.textContent = "API Connected";
        }
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Add User Message to UI
        addUserMessage(text);
        chatInput.value = '';
        chatInput.style.height = '60px'; // Reset height
        chatSubmitBtn.disabled = true;

        // 2. Show Typing Indicator
        typingIndicator.style.display = 'inline-block';
        chatMessages.appendChild(typingIndicator); // Move to bottom
        scrollToBottom();

        // 3. Process with Local Backend
        try {
            await callLocalBackend(text);
        } catch (error) {
            console.error(error);
            addAiMessage("⚠️ An error occurred while connecting to the local backend. Ensure the Node.js server is running and Ollama is active.");
        } finally {
            typingIndicator.style.display = 'none';
            chatSubmitBtn.disabled = false;
            scrollToBottom();
        }
    }

    function addUserMessage(text) {
        chatHistory.push({ role: "user", content: text });
        const html = `
            <div class="message user">
                <div class="msg-sender"><i class="fas fa-user"></i> You</div>
                <div class="msg-bubble">${escapeHtml(text)}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function addAiMessage(text, contextUsed = null) {
        chatHistory.push({ role: "assistant", content: text });

        let contextBadge = '';
        if (contextUsed) {
            contextBadge = `<div class="context-badge"><i class="fas fa-database"></i> Read from: ${contextUsed}</div>`;
        }

        // Extremely basic markdown parsing for bolding
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        const html = `
            <div class="message ai">
                ${contextBadge}
                <div class="msg-sender"><i class="fas fa-robot"></i> AstroPsycho AI</div>
                <div class="msg-bubble">${formattedText}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', html);
    }

    function buildSystemPrompt() {
        let chartDataStr = "No birth chart provided.";
        if (userContext && userContext.birthDetails) {
            const bd = userContext.birthDetails;
            chartDataStr = `User: ${bd.fullName}. Born: ${bd.dateOfBirth} at ${bd.timeOfBirth}, in ${bd.birthPlace}.`;
            // In a full implementation, we would inject the actual calculated planetary positions here too.
        }

        return `You are a Master Vedic Astrologer named AstroPsycho AI. 
You provide deeply psychological, compassionate, and highly accurate astrological readings based on ancient texts.
Treat the user with immense respect and spiritual depth.
If the user asks about something, use the provided contextual knowledge to answer them accurately. Do not make up traditional interpretations; rely heavily on the provided text.

CURRENT USER CHART CONTEXT:
${chartDataStr}`;
    }

    async function callLocalBackend(messageText) {
        // Send request to our new backend
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: chatHistory, // Send the full history so the AI has conversation context
                userContext: userContext
            })
        });

        if (!response.ok) {
            throw new Error(`Backend API Error: ${response.status}`);
        }

        const data = await response.json();

        let sourcesLabel = null;
        if (data.sources && data.sources.length > 0) {
            sourcesLabel = data.sources.join(", ");
        }

        addAiMessage(data.content, sourcesLabel);
    }

    function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Auto-resize textarea
    chatInput.addEventListener('input', function () {
        this.style.height = '60px'; // Reset height temporarily
        this.style.height = (this.scrollHeight) + 'px';
    });
});

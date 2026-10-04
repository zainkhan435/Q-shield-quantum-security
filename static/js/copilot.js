/**
 * Q-SHIELD Quantum Copilot (Gemini AI Helpdesk Assistant)
 */

(function () {
    let copilotHistory = [];
    let isCopilotOpen = false;
    let isWaitingForResponse = false;

    function initCopilot() {
        const trigger = document.getElementById('gemini-copilot-btn');
        const modal = document.getElementById('gemini-copilot-modal');
        const form = document.getElementById('copilot-form');
        const input = document.getElementById('copilot-input');
        const closeBtn = document.getElementById('copilot-close-btn');

        if (!trigger || !modal) return;

        window.toggleGeminiCopilot = function () {
            isCopilotOpen = !isCopilotOpen;
            if (isCopilotOpen) {
                modal.classList.add('open');
                trigger.classList.add('active');
                if (input) setTimeout(() => input.focus(), 150);
            } else {
                modal.classList.remove('open');
                trigger.classList.remove('active');
            }
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', window.toggleGeminiCopilot);
        }

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                sendMessage();
            });
        }

        if (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Suggested prompts
        document.querySelectorAll('.copilot-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                const text = this.getAttribute('data-prompt') || this.textContent.trim();
                if (input) {
                    input.value = text;
                    sendMessage();
                }
            });
        });
    }

    async function sendMessage() {
        const input = document.getElementById('copilot-input');
        const messagesContainer = document.getElementById('copilot-messages');
        const sendBtn = document.getElementById('copilot-send-btn');
        if (!input || !messagesContainer || isWaitingForResponse) return;

        const text = input.value.trim();
        if (!text) return;

        // Append User Message
        appendMessage('user', text);
        input.value = '';
        copilotHistory.push({ role: 'user', content: text });

        // Show typing indicator
        isWaitingForResponse = true;
        if (sendBtn) sendBtn.disabled = true;
        const typingEl = appendTypingIndicator();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: copilotHistory
                })
            });

            const data = await res.json();
            typingEl.remove();

            if (data.success && data.reply) {
                appendMessage('model', data.reply, data.source);
                copilotHistory.push({ role: 'model', content: data.reply });
            } else {
                appendMessage('model', '⚠️ ' + (data.error || 'Unable to process quantum query. Please try again.'));
            }
        } catch (err) {
            typingEl.remove();
            appendMessage('model', '⚠️ Connection error with Quantum Copilot. Check that the server is online.');
        } finally {
            isWaitingForResponse = false;
            if (sendBtn) sendBtn.disabled = false;
            if (input) input.focus();
        }
    }

    function appendMessage(role, rawContent, source) {
        const messagesContainer = document.getElementById('copilot-messages');
        if (!messagesContainer) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `copilot-msg copilot-msg-${role}`;

        let formatted = formatMarkdown(rawContent);
        let badgeHtml = '';
        if (role === 'model' && source && source.startsWith('gemini-')) {
            badgeHtml = `<span class="copilot-source-tag">${source}</span>`;
        } else if (role === 'model') {
            badgeHtml = '<span class="copilot-source-tag">Quantum Engine</span>';
        }

        msgDiv.innerHTML = `
            <div class="copilot-bubble">
                ${formatted}
                ${badgeHtml}
            </div>
        `;

        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendTypingIndicator() {
        const messagesContainer = document.getElementById('copilot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'copilot-msg copilot-msg-model copilot-typing';
        typingDiv.innerHTML = `
            <div class="copilot-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingDiv;
    }

    function formatMarkdown(text) {
        if (!text) return '';
        let escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Headers
        escaped = escaped.replace(/^### (.*$)/gim, '<h4 class="chat-h4">$1</h4>');
        escaped = escaped.replace(/^## (.*$)/gim, '<h3 class="chat-h3">$1</h3>');

        // Bold & Italic
        escaped = escaped.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        escaped = escaped.replace(/\*(.*?)\*/gim, '<em>$1</em>');

        // Code inline
        escaped = escaped.replace(/`([^`]+)`/gim, '<code class="chat-code">$1</code>');

        // Lists
        escaped = escaped.replace(/^\- (.*$)/gim, '<li>$1</li>');
        escaped = escaped.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

        // Paragraph breaks
        escaped = escaped.replace(/\n\n/g, '<br><br>');
        escaped = escaped.replace(/\n/g, '<br>');

        return escaped;
    }

    // Attach listener
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCopilot);
    } else {
        initCopilot();
    }
})();

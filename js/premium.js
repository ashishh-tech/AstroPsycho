/**
 * AstroPsycho Premium Lock System
 * Adds a beautiful lock overlay to premium pages.
 * Unlock with code: ASTRO2026 (or via developer mode)
 */

(function () {
    'use strict';

    const PREMIUM_KEY = 'astropsycho_premium_unlocked';
    const UNLOCK_CODE = 'ASTRO2026';

    // Pages that are locked behind premium
    const PREMIUM_PAGES = [
        'shadbala', 'varshaphala', 'divisional', 'career-prediction',
        'pdf-report', 'full-report', 'astrograph', 'stability-radar'
    ];

    function isCurrentPagePremium() {
        const path = window.location.pathname.split('/').pop().replace('.html', '');
        return PREMIUM_PAGES.some(p => path.includes(p));
    }

    function isUnlocked() {
        return localStorage.getItem(PREMIUM_KEY) === 'true';
    }

    function unlock(code) {
        if (code.trim().toUpperCase() === UNLOCK_CODE) {
            localStorage.setItem(PREMIUM_KEY, 'true');
            return true;
        }
        return false;
    }

    function injectLockOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'premiumLockOverlay';
        overlay.innerHTML = `
            <div class="premium-backdrop"></div>
            <div class="premium-modal" id="premiumModal">
                <div class="premium-crown">👑</div>
                <h2 class="premium-title">Premium Feature</h2>
                <p class="premium-subtitle">This analysis is part of the <strong>AstroPsycho Premium</strong> suite — ultra-deep Vedic calculations reserved for serious seekers.</p>
                
                <div class="premium-features">
                    <div class="pf-item">✦ Shadbala & Divisional Charts</div>
                    <div class="pf-item">✦ Varshaphala Annual Report</div>
                    <div class="pf-item">✦ Career Deep Dive</div>
                    <div class="pf-item">✦ Stability Radar</div>
                    <div class="pf-item">✦ PDF Premium Report</div>
                    <div class="pf-item">✦ AstroGraph 10-Year</div>
                </div>

                <div class="premium-unlock-section">
                    <input type="text" id="premiumCodeInput" placeholder="Enter unlock code..." class="premium-input" autocomplete="off" />
                    <button id="premiumUnlockBtn" class="premium-btn-unlock">Unlock ✦</button>
                    <p id="premiumError" class="premium-error" style="display:none;">❌ Invalid code. Try again.</p>
                </div>

                <a href="index.html" class="premium-back-link">← Go back to Home</a>
            </div>
        `;

        // Styles
        const style = document.createElement('style');
        style.textContent = `
            #premiumLockOverlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            .premium-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(4, 4, 26, 0.92);
                backdrop-filter: blur(16px);
            }
            .premium-modal {
                position: relative;
                z-index: 1;
                background: linear-gradient(135deg, rgba(245,197,24,0.08), rgba(4,4,26,0.95));
                border: 1px solid rgba(245,197,24,0.35);
                border-radius: 24px;
                padding: 2.5rem 2rem;
                max-width: 480px;
                width: 100%;
                text-align: center;
                box-shadow: 0 0 80px rgba(245,197,24,0.15), 0 30px 60px rgba(0,0,0,0.5);
                animation: premiumPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
            }
            @keyframes premiumPop {
                from { opacity:0; transform: scale(0.8) translateY(30px); }
                to { opacity:1; transform: scale(1) translateY(0); }
            }
            .premium-crown {
                font-size: 3.5rem;
                margin-bottom: 1rem;
                animation: crownFloat 3s ease-in-out infinite;
                filter: drop-shadow(0 0 20px rgba(245,197,24,0.6));
            }
            @keyframes crownFloat {
                0%,100% { transform: translateY(0) rotate(-5deg); }
                50% { transform: translateY(-8px) rotate(5deg); }
            }
            .premium-title {
                font-family: 'Cinzel', serif;
                font-size: 1.8rem;
                font-weight: 700;
                background: linear-gradient(135deg, #f5c518, #fff, #f5c518);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.75rem;
            }
            .premium-subtitle {
                color: #94a3b8;
                font-size: 0.95rem;
                line-height: 1.7;
                margin-bottom: 1.5rem;
            }
            .premium-features {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .pf-item {
                background: rgba(245,197,24,0.07);
                border: 1px solid rgba(245,197,24,0.15);
                border-radius: 8px;
                padding: 0.4rem 0.75rem;
                font-size: 0.8rem;
                color: #f5c518;
                text-align: left;
            }
            .premium-unlock-section {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 1.25rem;
            }
            .premium-input {
                width: 100%;
                padding: 0.85rem 1.25rem;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(245,197,24,0.3);
                border-radius: 12px;
                color: #f0f4ff;
                font-size: 1rem;
                text-align: center;
                letter-spacing: 0.2em;
                outline: none;
                transition: border-color 0.3s;
            }
            .premium-input:focus { border-color: rgba(245,197,24,0.7); }
            .premium-btn-unlock {
                width: 100%;
                padding: 0.9rem;
                background: linear-gradient(135deg, #f5c518, #e8a800);
                color: #000;
                font-weight: 700;
                font-size: 1rem;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                letter-spacing: 0.05em;
                transition: all 0.3s;
                box-shadow: 0 4px 20px rgba(245,197,24,0.3);
            }
            .premium-btn-unlock:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(245,197,24,0.5); }
            .premium-error { color: #f87171; font-size: 0.85rem; }
            .premium-back-link { color: #475569; font-size: 0.85rem; text-decoration: none; transition: color 0.3s; }
            .premium-back-link:hover { color: #94a3b8; }
            @media (max-width: 480px) {
                .premium-features { grid-template-columns: 1fr; }
                .premium-modal { padding: 2rem 1.25rem; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        // Wire up unlock button
        document.getElementById('premiumUnlockBtn').addEventListener('click', () => {
            const code = document.getElementById('premiumCodeInput').value;
            if (unlock(code)) {
                overlay.style.transition = 'opacity 0.5s';
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 500);
            } else {
                const err = document.getElementById('premiumError');
                err.style.display = 'block';
                document.getElementById('premiumCodeInput').style.borderColor = 'rgba(248,113,113,0.7)';
                setTimeout(() => {
                    err.style.display = 'none';
                    document.getElementById('premiumCodeInput').style.borderColor = '';
                }, 2500);
            }
        });

        document.getElementById('premiumCodeInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('premiumUnlockBtn').click();
        });
    }

    // ── Check & apply on page load ─────────────────────────────────────────
    function init() {
        if (!isCurrentPagePremium()) return;
        if (isUnlocked()) return;

        // Blur the page content
        document.body.style.filter = 'blur(6px)';
        document.body.style.pointerEvents = 'none';

        injectLockOverlay();

        // Restore page when unlocked
        const observer = new MutationObserver(() => {
            if (!document.getElementById('premiumLockOverlay')) {
                document.body.style.filter = '';
                document.body.style.pointerEvents = '';
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use
    window.AstroPremium = { isUnlocked, unlock };
})();

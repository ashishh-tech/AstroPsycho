/**
 * mobile-nav.js — AstroPsycho Pro Mobile Navigation v2.0
 * Auto-injects: sticky bottom nav, More drawer, PWA registration,
 * EN/HI language toggle button.
 */
(function () {
    'use strict';

    const PAGE_MAP = {
        'index.html': 'home', '': 'home',
        'results.html': 'report', 'full-report.html': 'report', 'pdf-report.html': 'report',
        'kundali-calendar': 'charts', 'shadbala': 'charts', 'divisional': 'charts',
        'varshaphala': 'charts', 'panchang': 'charts', 'planetary-clock': 'charts',
        'dasha-timeline': 'dasha',
        'assessment.html': 'home', 'dashboard': 'home',
    };

    const NAV_ITEMS = [
        { key: 'home', icon: '🏠', label: 'Home', href: 'index.html' },
        { key: 'report', icon: '📊', label: 'Report', href: 'results.html' },
        { key: 'charts', icon: '🌟', label: 'Charts', href: 'kundali-calendar.html' },
        { key: 'dasha', icon: '🪐', label: 'Dasha', href: 'dasha-timeline.html' },
        { key: 'more', icon: '☰', label: 'More', href: '#more', isMore: true },
    ];

    const MORE_ITEMS = [
        { icon: '🏠', label: 'Dashboard', href: 'dashboard.html' },
        { icon: '📅', label: 'Panchang', href: 'panchang.html' },
        { icon: '🔮', label: 'Planet Clock', href: 'planetary-clock.html' },
        { icon: '👩‍❤️‍👨', label: 'Compat.', href: 'compatibility.html' },
        { icon: '💼', label: 'Career', href: 'career-prediction.html' },
        { icon: '✡️', label: 'Navamsa', href: 'navamsa.html' },
        { icon: '🌙', label: 'Moon', href: 'moon-analysis.html' },
        { icon: '⚕️', label: 'Medical', href: 'medical-astrology.html' },
        { icon: '💍', label: 'Marriage', href: 'marriage-analysis.html' },
        { icon: '🔮', label: 'Prasna', href: 'prasna.html' },
        { icon: '📅', label: 'Muhurta', href: 'muhurta.html' },
        { icon: '🪐', label: 'Transit', href: 'transit-tracker.html' },
        { icon: '🪐', label: 'Sade Sati', href: 'sade-sati.html' },
        { icon: '🧠', label: 'Psych Rpt', href: 'pdf-report.html' },
        { icon: '⚠️', label: 'Doshas', href: 'negative-yogas.html' },
        { icon: '✨', label: 'Yogas+', href: 'positive-yogas.html' },
        { icon: '🪐', label: 'Conjunctions', href: 'conjunctions.html' },
        { icon: '🏠', label: '12 Houses', href: 'house-details.html' },
        { icon: '🎓', label: 'Education', href: 'education.html' },
        { icon: '💰', label: 'Wealth', href: 'wealth.html' },
        { icon: '📊', label: 'Ashtavargha', href: 'ashtavargha.html' },
    ];

    function getActiveKey() {
        const filename = window.location.pathname.split('/').pop() || '';
        for (const [pattern, key] of Object.entries(PAGE_MAP)) {
            if (filename === pattern || filename.includes(pattern.replace('.html', ''))) return key;
        }
        return '';
    }

    function addRipple(el, e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = el.getBoundingClientRect();
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const size = Math.max(rect.width, rect.height) * 0.6;
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${(touch.clientX - rect.left) - size / 2}px;top:${(touch.clientY - rect.top) - size / 2}px;`;
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 550);
    }

    function injectNav() {
        const activeKey = getActiveKey();

        const nav = document.createElement('nav');
        nav.className = 'mob-nav';
        nav.setAttribute('aria-label', 'Main navigation');
        nav.innerHTML = `
            <div class="mob-nav__inner">
                ${NAV_ITEMS.map(item => `
                    <${item.isMore ? 'button' : 'a'}
                        ${item.isMore ? '' : `href="${item.href}"`}
                        class="mob-nav__item${activeKey === item.key ? ' active' : ''}"
                        ${item.isMore ? 'id="mobMoreBtn" aria-label="More pages"' : `aria-label="${item.label}"`}
                        ${activeKey === item.key ? 'aria-current="page"' : ''}>
                        <span class="mob-nav__icon">${item.icon}</span>
                        <span class="mob-nav__label">${item.label}</span>
                    </${item.isMore ? 'button' : 'a'}>
                `).join('')}
            </div>`;

        const drawer = document.createElement('div');
        drawer.className = 'mob-more-drawer';
        drawer.id = 'mobMoreDrawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-label', 'More pages');
        drawer.innerHTML = `
            <button class="mob-more-close" id="mobDrawerClose" aria-label="Close menu">✕</button>
            <div class="mob-more-grid">
                ${MORE_ITEMS.map(i => `<a href="${i.href}" class="mob-more-item"><span class="mob-more-item__icon">${i.icon}</span><span class="mob-more-item__label">${i.label}</span></a>`).join('')}
            </div>`;

        const backdrop = document.createElement('div');
        backdrop.className = 'mob-more-backdrop';
        backdrop.id = 'mobMoreBackdrop';

        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);
        document.body.appendChild(nav);

        const moreBtn = document.getElementById('mobMoreBtn');
        const closeBtn = document.getElementById('mobDrawerClose');

        const openDrawer = () => { drawer.classList.add('open'); backdrop.classList.add('open'); moreBtn && moreBtn.classList.add('active'); };
        const closeDrawer = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); moreBtn && moreBtn.classList.remove('active'); };

        moreBtn && moreBtn.addEventListener('click', function (e) { addRipple(this, e); drawer.classList.contains('open') ? closeDrawer() : openDrawer(); });
        closeBtn && closeBtn.addEventListener('click', closeDrawer);
        backdrop.addEventListener('click', closeDrawer);

        nav.querySelectorAll('.mob-nav__item').forEach(item => {
            item.addEventListener('touchstart', e => addRipple(item, e), { passive: true });
            item.addEventListener('click', e => addRipple(item, e));
        });
    }

    // ── Language Toggle: hindi-translate.js creates #hindiToggleBtn.
    //    We just reposition it above the mobile nav via CSS + inline style fallback.
    function ensureLangBtnPosition() {
        const reposition = () => {
            const btn = document.getElementById('hindiToggleBtn');
            if (btn) {
                btn.style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + 72px)';
                btn.style.zIndex = '9990';
            } else {
                setTimeout(reposition, 300);
            }
        };
        reposition();
    }

    // ── PWA Service Worker + Install Banner ───────────────────────────────
    function registerPWA() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(r => console.log('✅ AstroPsycho PWA:', r.scope))
                    .catch(e => console.warn('SW skipped:', e.message));
            });
        }
        let deferred;
        window.addEventListener('beforeinstallprompt', e => {
            // Don't call e.preventDefault() — that suppresses Chrome's native install banner.
            // Instead, capture the event and show our custom banner after a short delay.
            deferred = e;
            setTimeout(() => {
                if (deferred && !window.matchMedia('(display-mode:standalone)').matches) {
                    showInstallBanner(deferred); deferred = null;
                }
            }, 3000);
        });
    }

    function showInstallBanner(prompt) {
        const b = document.createElement('div');
        b.id = 'pwaInstallBanner';
        b.style.cssText = `position:fixed;bottom:${window.innerWidth <= 768 ? '70px' : '20px'};left:50%;transform:translateX(-50%);z-index:9985;background:rgba(10,10,31,.95);backdrop-filter:blur(20px);border:1px solid rgba(100,255,218,.3);border-radius:16px;padding:1rem 1.5rem;display:flex;align-items:center;gap:1rem;box-shadow:0 10px 40px rgba(0,0,0,.5);max-width:380px;width:calc(100% - 2rem);animation:apBannerUp .4s ease;`;
        b.innerHTML = `<style>@keyframes apBannerUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style><span style="font-size:1.5rem">📱</span><div style="flex:1"><div style="font-weight:700;color:#f0f4ff;font-size:.9rem">Install AstroPsycho</div><div style="color:#94a3b8;font-size:.78rem">Add to home screen for offline access</div></div><button id="pwaYes" style="background:linear-gradient(135deg,#64ffda,#00b4d8);color:#000;border:none;padding:.5rem 1rem;border-radius:8px;font-weight:700;font-size:.82rem;cursor:pointer">Install</button><button id="pwaNo" style="background:none;border:none;color:#475569;cursor:pointer;font-size:1.1rem;padding:.2rem">✕</button>`;
        document.body.appendChild(b);
        document.getElementById('pwaYes').onclick = () => { prompt.prompt(); b.remove(); };
        document.getElementById('pwaNo').onclick = () => { b.style.opacity = '0'; setTimeout(() => b.remove(), 300); };
    }

    function applyMobileGridFix() {
        const grids = document.querySelectorAll('.explore-grid');
        if (!grids.length) return;
        const w = window.innerWidth;
        grids.forEach(grid => {
            if (w <= 360) { grid.style.gridTemplateColumns = '1fr'; grid.style.gap = '0.5rem'; }
            else if (w <= 400) { grid.style.gridTemplateColumns = 'repeat(2,1fr)'; grid.style.gap = '0.45rem'; }
            else if (w <= 768) { grid.style.gridTemplateColumns = 'repeat(3,1fr)'; grid.style.gap = '0.5rem'; }
            else { grid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(155px,1fr))'; grid.style.gap = '1rem'; }
        });
    }

    function init() { injectNav(); ensureLangBtnPosition(); applyMobileGridFix(); registerPWA(); }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.addEventListener('resize', applyMobileGridFix);
})();

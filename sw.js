/**
 * AstroPsycho Service Worker v5
 * - Navigation requests (HTML page loads): NOT intercepted — browser handles natively.
 *   This is the fix for "redirected response used for a request whose redirect mode
 *   is not follow" errors caused by Cloudflare's server-side redirects.
 * - Static assets (JS/CSS/fonts/images): cache-first with background refresh.
 */

const CACHE_NAME = 'astropsycho-v6';

// Only cache static assets — NOT HTML pages (they cause redirect errors on Cloudflare)
const CORE_ASSETS = [
    '/styles.css',
    '/mobile-nav.css',
    '/mobile-nav.js',
    '/js/astrology-engine-v8.js',
    '/js/results.js',
    '/js/panchang-engine.js',
    '/js/planetary-clock-engine.js',
    '/js/dashboard-engine.js',
    '/js/premium.js',
    '/favicon.svg',
    '/favicon.png',
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600&display=swap'
];

// ── Install: cache static assets only ─────────────────────────────────────
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            Promise.allSettled(
                CORE_ASSETS.map(url => cache.add(url).catch(() => { }))
            )
        )
    );
});

// ── Activate: delete old caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    // ── CRITICAL: Do NOT intercept navigation requests (HTML page loads) ───
    // Cloudflare Pages serves HTML with server-side redirects.
    // If the SW intercepts these and respondWith() gets a redirect response,
    // the browser throws "redirect mode not follow" → ERR_FAILED.
    // Solution: return early (no respondWith call) → browser handles natively.
    if (event.request.mode === 'navigate') return;

    // ── Skip no-cors (opaque) and cross-origin non-googleapis requests ─────
    if (event.request.mode === 'no-cors') return;
    if (url.origin !== self.location.origin && !url.hostname.includes('googleapis.com')) return;

    // ── Static assets: stale-while-revalidate ─────────────────────────────
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(cached => {
            // Return from cache immediately, refresh in background
            if (cached) {
                event.waitUntil(
                    fetch(event.request).then(response => {
                        if (response && response.ok && response.type !== 'opaqueredirect') {
                            caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
                        }
                    }).catch(() => { })
                );
                return cached;
            }
            // Not in cache — go to network and cache result
            return fetch(event.request).then(response => {
                if (response && response.ok && response.type !== 'opaqueredirect') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                }
                return response;
            }).catch(() =>
                new Response('', { status: 204, statusText: 'No Content' })
            );
        })
    );
});

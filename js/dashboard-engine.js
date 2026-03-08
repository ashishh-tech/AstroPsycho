/**
 * AstroPsycho Dashboard Engine
 * Loads saved chart from localStorage and creates a personalized daily hub.
 */

class DashboardEngine {
    constructor() {
        this.userData = null;
        this.chart = null;
        this.panchangEngine = null;
        this.clockEngine = null;
    }

    init() {
        // Load saved data
        const saved = localStorage.getItem('astropsycho_assessment');
        if (!saved) return null;
        try {
            this.userData = JSON.parse(saved);
            return this.userData;
        } catch {
            return null;
        }
    }

    getGreeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        if (h < 20) return 'Good Evening';
        return 'Good Night';
    }

    // Get active Dasha from chart data
    getActiveDasha(chart) {
        if (!chart || !chart.dashas) return null;
        const now = new Date();
        for (const maha of chart.dashas) {
            if (new Date(maha.start) <= now && new Date(maha.end) >= now) {
                for (const antar of (maha.antardashas || [])) {
                    if (new Date(antar.start) <= now && new Date(antar.end) >= now) {
                        return {
                            maha: maha.planet,
                            antar: antar.planet,
                            mahaEnd: maha.end,
                            antarEnd: antar.end
                        };
                    }
                }
                return { maha: maha.planet, antar: null, mahaEnd: maha.end };
            }
        }
        return null;
    }

    // Format date diff for display
    timeUntil(dateStr) {
        if (!dateStr) return '—';
        const diff = new Date(dateStr) - new Date();
        if (diff < 0) return 'Passed';
        const days = Math.floor(diff / 86400000);
        if (days > 365) return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`;
        if (days > 30) return `${Math.floor(days / 30)} months`;
        return `${days} days`;
    }
}

window.DashboardEngine = DashboardEngine;

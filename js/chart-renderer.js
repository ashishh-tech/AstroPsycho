/**
 * AstroChartRenderer
 * Handles visual rendering of Vedic Astrology charts (Kundalis)
 * Supports North Indian and South Indian styles using SVG
 * Now includes Ashtavargha chart rendering
 */

class AstroChartRenderer {
    constructor() {
        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.shortPlanets = {
            sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me',
            jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke'
        };
    }

    /**
     * Renders Ashtavargha chart with Sarvashtakavarga points in North Indian style
     */
    drawAshtavarghaChart(containerId, sarvashtakavarga, ascendant) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const isPrint = window.matchMedia('print').matches;
        const size = isPrint ? 700 : 1000; // Smaller size for print for better fit
        const padding = 60;
        const chartSize = size - (padding * 2);
        const ascendantSign = Math.floor(ascendant / 30) + 1; // 1-indexed sign

        let svg = `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; display: block; margin: 0 auto;" viewBox="-2 -2 ${size + 4} ${size + 4}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="avGlow">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <linearGradient id="avGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f4c430;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#b8860b;stop-opacity:1" />
                </linearGradient>
            </defs>
            <style>
                .av-line { stroke: #ff8c42; stroke-width: 3; fill: none; opacity: 0.5; }
                .av-border { stroke: #64ffda; stroke-width: 2; fill: none; opacity: 0.4; }
                .av-sign-num { fill: #f4c430; font-size: 24px; font-weight: bold; font-family: 'Cinzel', serif; opacity: 0.9; }
                .av-points { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 48px; fill: #0a0a1f; }
                .av-point-value { filter: url(#avGlow); }
            </style>
            
            <!-- Outer Border -->
            <rect x="${padding}" y="${padding}" width="${chartSize}" height="${chartSize}" class="av-border" />
            
            <!-- Diamond and Cross Lines -->
            <path d="M${size / 2},${padding} L${size - padding},${size / 2} L${size / 2},${size - padding} L${padding},${size / 2} Z" class="av-line" />
            <line x1="${padding}" y1="${padding}" x2="${size - padding}" y2="${size - padding}" class="av-line" />
            <line x1="${size - padding}" y1="${padding}" x2="${padding}" y2="${size - padding}" class="av-line" />
        `;

        // House order: Top Diamond (1), Top-left (2), Left-top (3), Left Diamond (4), etc.
        // Positions for the circles (center of each house)
        const zones = [
            { x: size / 2, y: size * 0.33 },          // H1
            { x: size * 0.25, y: size * 0.15 },       // H2
            { x: size * 0.15, y: size * 0.25 },       // H3
            { x: size * 0.33, y: size / 2 },           // H4
            { x: size * 0.15, y: size * 0.75 },       // H5
            { x: size * 0.25, y: size * 0.85 },       // H6
            { x: size / 2, y: size * 0.67 },           // H7
            { x: size * 0.75, y: size * 0.85 },       // H8
            { x: size * 0.85, y: size * 0.75 },       // H9
            { x: size * 0.67, y: size / 2 },           // H10
            { x: size * 0.85, y: size * 0.25 },       // H11
            { x: size * 0.75, y: size * 0.15 }        // H12
        ];

        // Positions for the sign numbers (outer corners/tips)
        const signPos = [
            { x: 500, y: 90 },    // H1 top tip
            { x: 130, y: 95 },    // H2 corner
            { x: 95, y: 130 },   // H3 corner
            { x: 100, y: 500 },   // H4 left tip
            { x: 95, y: 870 },   // H5 corner
            { x: 130, y: 905 },   // H6 corner
            { x: 500, y: 910 },   // H7 bottom tip
            { x: 870, y: 905 },   // H8 corner
            { x: 905, y: 870 },   // H9 corner
            { x: 900, y: 500 },   // H10 right tip
            { x: 905, y: 130 },   // H11 corner
            { x: 870, y: 95 }     // H12 corner
        ];

        // Render each house
        zones.forEach((zone, i) => {
            const houseIndex = i; // 0-indexed
            const signNumber = ((ascendantSign + houseIndex - 1) % 12) + 1;
            const points = sarvashtakavarga[signNumber - 1]; // sarvashtakavarga is 0-indexed for Signs 1..12

            // Sign Number at corner
            const sp = signPos[i];
            svg += `<text x="${sp.x}" y="${sp.y}" class="av-sign-num" text-anchor="middle" dominant-baseline="middle">${signNumber}</text>`;

            // Circle background
            let color;
            if (points >= 28) color = '#ff8c42';      // Auspicious Orange
            else if (points < 25) color = '#64ffda';  // Inauspicious Cyan
            else color = '#f4c430';                   // Mixed Gold

            const circleRadius = 55; // Enlarged circles
            svg += `
                <circle cx="${zone.x}" cy="${zone.y}" r="${circleRadius}" fill="${color}" class="av-point-value" />
                <text x="${zone.x}" y="${zone.y}" class="av-points" text-anchor="middle" dominant-baseline="middle">${points}</text>
            `;
        });

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    /**
     * Renders a North Indian style chart with Pro-level aesthetics and collision avoidance
     */
    drawNorthIndianChart(containerId, planetaryDetails, ascendant) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const isPrint = window.matchMedia('print').matches;
        const size = isPrint ? 450 : 600; // Better fit in PDF
        const padding = 24;
        const chartSize = size - (padding * 2);
        const ascendantSign = Math.floor(ascendant / 30) + 1;

        let defs = `
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f4c430;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#b8860b;stop-opacity:1" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
        `;

        let svg = `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; display: block; margin: 0 auto;" viewBox="-2 -2 ${size + 4} ${size + 4}" xmlns="http://www.w3.org/2000/svg">
            ${defs}
            <style>
                .chart-line { stroke: url(#goldGradient); stroke-width: 2; fill: none; opacity: 0.6; }
                .chart-border { stroke: #64ffda; stroke-width: 1; fill: none; opacity: 0.3; }
                .house-num { fill: #f4c430; font-size: 14px; font-weight: bold; font-family: 'Cinzel', serif; opacity: 0.7; }
                .planet-label { font-family: 'Inter', sans-serif; font-weight: 500; }
                .planet-code { font-weight: bold; font-size: 16px; fill: #f8f8ff; }
                .planet-deg { font-size: 9px; fill: #e6e6fa; opacity: 0.8; }
                .status-e { fill: #ffd700; font-weight: bold; }
                .status-d { fill: #ff6b6b; font-weight: bold; }
                .status-r { fill: #4dabf7; font-weight: bold; }
            </style>
            
            <rect x="${padding}" y="${padding}" width="${chartSize}" height="${chartSize}" class="chart-border" />
            <path d="M${size / 2},${padding} L${size - padding},${size / 2} L${size / 2},${size - padding} L${padding},${size / 2} Z" class="chart-line" />
            <line x1="${padding}" y1="${padding}" x2="${size - padding}" y2="${size - padding}" class="chart-line" />
            <line x1="${size - padding}" y1="${padding}" x2="${padding}" y2="${size - padding}" class="chart-line" />
        `;

        // Planet render zones — centre point where planets will be drawn
        const zones = [
            { x: size / 2, y: size * 0.33 },          // House 1 (Top Center diamond)
            { x: size * 0.25, y: size * 0.15 },       // House 2 (Top Left triangle)
            { x: size * 0.15, y: size * 0.25 },       // House 3 (Left Upper triangle)
            { x: size * 0.33, y: size / 2 },           // House 4 (Left Center diamond)
            { x: size * 0.15, y: size * 0.75 },       // House 5 (Left Lower triangle)
            { x: size * 0.25, y: size * 0.85 },       // House 6 (Bot Left triangle)
            { x: size / 2, y: size * 0.67 },           // House 7 (Bot Center diamond)
            { x: size * 0.75, y: size * 0.85 },       // House 8 (Bot Right triangle)
            { x: size * 0.85, y: size * 0.75 },       // House 9 (Right Lower triangle)
            { x: size * 0.67, y: size / 2 },           // House 10 (Right Center diamond)
            { x: size * 0.85, y: size * 0.25 },       // House 11 (Right Upper triangle)
            { x: size * 0.75, y: size * 0.15 }        // House 12 (Top Right triangle)
        ];

        // Fixed rashi number positions — intentionally placed at the outer tip/corner
        // of each house, far from the centre where planets are rendered.
        // These are absolute pixel coords, handpicked for a 600px chart.
        const rashiPos = [
            { x: 300, y: 50 },   // H1  — top tip of upper diamond
            { x: 145, y: 52 },   // H2  — top-left corner
            { x: 52, y: 145 },  // H3  — left-top corner
            { x: 112, y: 300 },  // H4  — left tip of left diamond
            { x: 52, y: 455 },  // H5  — left-bottom corner
            { x: 145, y: 548 },  // H6  — bottom-left corner
            { x: 300, y: 550 },  // H7  — bottom tip of lower diamond
            { x: 455, y: 548 },  // H8  — bottom-right corner
            { x: 548, y: 455 },  // H9  — right-bottom corner
            { x: 488, y: 300 },  // H10 — right tip of right diamond
            { x: 548, y: 145 },  // H11 — right-top corner
            { x: 455, y: 52 }    // H12 — top-right corner
        ];

        zones.forEach((zone, i) => {
            const sign = (i === 0) ? ascendantSign : this.nextSign(ascendantSign, i);
            const rp = rashiPos[i];

            // Draw rashi number at fixed corner position
            svg += `<text x="${rp.x}" y="${rp.y}" class="house-num" text-anchor="middle" dominant-baseline="middle">${sign}</text>`;

            // Collect planets for this house
            const housePlanets = Object.entries(planetaryDetails).filter(([p, d]) => d.house === i + 1);
            if (housePlanets.length === 0) return;

            const count = housePlanets.length;
            const lineHeight = 15;  // Reduced from 18 to avoid overlapping
            const totalHeight = count * lineHeight;

            // Rashi numbers are placed in the outer tips, so we can perfectly center
            // the block of planets directly at the zone's center coordinate (zone.x, zone.y)

            // Start position for the block of planets so it's vertically middle-aligned
            let startY = zone.y - (totalHeight / 2) + (lineHeight / 2);

            housePlanets.forEach(([p, d]) => {
                let pClass = "planet-code";
                let suffix = "";
                if (d.status === 'Exalted') { pClass += " status-e"; suffix = "↑"; }
                if (d.status === 'Debilitated') { pClass += " status-d"; suffix = "↓"; }
                if (d.isRetrograde) { pClass += " status-r"; suffix += "R"; }

                const deg = Math.floor(d.degree);
                const min = Math.floor((d.degree % 1) * 60);

                // Ensure the x coordinate is exactly zone.x for perfect vertical alignment
                svg += `<text x="${zone.x}" y="${startY}" text-anchor="middle" class="planet-label">
                    <tspan class="${pClass}">${this.shortPlanets[p]}${suffix}</tspan>
                    <tspan class="planet-deg" dx="3">${deg}°${min}'</tspan>
                </text>`;
                startY += lineHeight;
            });
        });

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    /**
     * Renders a South Indian style chart with Pro aesthetics
     */
    drawSouthIndianChart(containerId, planetaryDetails, ascendant) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const isPrint = window.matchMedia('print').matches;
        const size = isPrint ? 450 : 600; // Better fit in PDF
        const cellSize = size / 4;
        const signMap = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        const cellCoords = [
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 },
            { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 },
            { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 }
        ];

        let svg = `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; display: block; margin: 0 auto;" viewBox="-2 -2 ${size + 4} ${size + 4}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="goldGradient2" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" style="stop-color:#f4c430;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#b8860b;stop-opacity:1" />
                </linearGradient>
            </defs>
            <style>
                .chart-line { stroke: url(#goldGradient2); stroke-width: 2; fill: none; opacity: 0.8; }
                .chart-border { stroke: url(#goldGradient2); stroke-width: 3; fill: none; opacity: 0.9; }
                .sign-text { fill: #f4c430; font-size: 13px; font-family: 'Cinzel', serif; opacity: 0.7; font-weight: bold; }
                .planet-label { font-family: 'Inter', sans-serif; font-weight: 500; }
                .planet-code { font-weight: bold; font-size: 16px; fill: #f8f8ff; }
                .planet-deg { font-size: 9px; fill: #e6e6fa; opacity: 0.8; }
                .asc-marker { fill: #ff6b9d; font-size: 15px; font-weight: bold; }
                .status-e { fill: #ffd700; font-weight: bold; }
                .status-d { fill: #ff6b6b; font-weight: bold; }
                .status-r { fill: #4dabf7; font-weight: bold; }
            </style>
            
            <rect x="1" y="1" width="${size - 2}" height="${size - 2}" class="chart-border" />
            
            <!-- Vertical Lines -->
            <line x1="${cellSize}" y1="0" x2="${cellSize}" y2="${size}" class="chart-line" />
            <line x1="${cellSize * 2}" y1="0" x2="${cellSize * 2}" y2="${cellSize}" class="chart-line" />
            <line x1="${cellSize * 2}" y1="${cellSize * 3}" x2="${cellSize * 2}" y2="${size}" class="chart-line" />
            <line x1="${cellSize * 3}" y1="0" x2="${cellSize * 3}" y2="${size}" class="chart-line" />
            
            <!-- Horizontal Lines -->
            <line x1="0" y1="${cellSize}" x2="${size}" y2="${cellSize}" class="chart-line" />
            <line x1="0" y1="${cellSize * 2}" x2="${cellSize}" y2="${cellSize * 2}" class="chart-line" />
            <line x1="${cellSize * 3}" y1="${cellSize * 2}" x2="${size}" y2="${cellSize * 2}" class="chart-line" />
            <line x1="0" y1="${cellSize * 3}" x2="${size}" y2="${cellSize * 3}" class="chart-line" />
            
            <!-- Inner Square connecting the corners to create the hollow center -->
            <path d="M${cellSize},${cellSize} L${cellSize * 3},${cellSize} L${cellSize * 3},${cellSize * 3} L${cellSize},${cellSize * 3} Z" class="chart-line" />`;

        const ascSignIndex = Math.floor(ascendant / 30);

        cellCoords.forEach((coord, i) => {
            const x = coord.x * cellSize;
            const y = coord.y * cellSize;
            const signIndex = (i + 11) % 12;

            // Sign Label — small, top-left corner of cell
            svg += `<text x="${x + 5}" y="${y + 16}" class="sign-text">${this.signs[signIndex]}</text>`;

            // Ascendant marker — top-right corner
            if (signIndex === ascSignIndex) {
                svg += `<text x="${x + cellSize - 28}" y="${y + 20}" class="asc-marker">AS</text>`;
            }

            // Planets in this sign
            const signPlanets = Object.entries(planetaryDetails).filter(([p, d]) => d.signIndex === signIndex);

            let pY = y + 40; // Start well below sign name
            const lineHeight = 15;  // Reduced from 18 for consistency

            signPlanets.forEach(([p, d]) => {
                let pClass = "planet-code";
                let suffix = "";
                if (d.status === 'Exalted') { pClass += " status-e"; suffix = "↑"; }
                if (d.status === 'Debilitated') { pClass += " status-d"; suffix = "↓"; }
                if (d.isRetrograde) { pClass += " status-r"; suffix += "R"; }

                const deg = Math.floor(d.degree);
                const min = Math.floor((d.degree % 1) * 60);

                svg += `<text x="${x + cellSize / 2}" y="${pY}" text-anchor="middle" class="planet-label">
                    <tspan class="${pClass}">${this.shortPlanets[p]}${suffix}</tspan>
                    <tspan class="planet-deg" dx="3">${deg}°${min}'</tspan>
                </text>`;
                pY += lineHeight;
            });
        });

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    nextSign(current, steps) {
        let sign = current + steps;
        while (sign > 12) sign -= 12;
        return sign;
    }
}

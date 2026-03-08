#!/usr/bin/env python3
"""Generates full-report.html for AstroPsycho"""

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Full Astro-Psychology Report — AstroPsycho</title>
<link rel="stylesheet" href="styles.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:10mm 12mm 16mm 12mm}
body{font-family:'Inter',sans-serif;background:#0a0a1f;color:#f8f8ff}
.no-print,.cosmic-bg,.stars,.stars2,.stars3,#hindiToggleBtn{display:none!important}
.cover{min-height:92vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:4rem 2rem;page-break-after:always;background:radial-gradient(ellipse at center,#1a1a4e,#0a0a1f);border:1px solid rgba(100,255,218,.3);border-radius:16px}
.cover h1{font-family:'Cinzel',serif;font-size:2.8rem;color:#f4c430;margin:.5rem 0}
.cover .sub{color:#64ffda;font-size:1.2rem;margin-bottom:2rem}
.cover .uname{font-size:2.2rem;font-weight:700;color:#fff;margin:1.5rem 0 .5rem}
.cover .binfo{color:#e6e6fa;line-height:2.2;font-size:.97rem}
.cover .brand{font-family:'Dancing Script',cursive;color:#f4c430;font-size:1.8rem;margin-top:2rem}
            /* PDF Specific Base Styles for Massive Page Count */
            body { font-family: 'Inter', system-ui, sans-serif; background: #0a0e1a; color: #f8f8ff; margin: 0; padding: 0; line-height: 1.8; }
            .container { max-width: 100%; padding: 0; margin: 0; }
            
            /* Aggressive Typography to consume space */
            h1 { font-family: 'Cinzel', serif; font-size: 4.5rem; color: #f4c430; text-align: center; margin-bottom: 2rem; }
            h2 { font-family: 'Cinzel', serif; font-size: 3rem; color: #64ffda; margin-top: 0; margin-bottom: 2rem; border-bottom: 2px solid rgba(100,255,218,0.3); padding-bottom: 1rem; }
            h3 { font-size: 2rem; margin-top: 2rem; margin-bottom: 1.5rem; color: #a78bfa; }
            h4 { font-size: 1.6rem; margin-top: 1.5rem; margin-bottom: 1rem; }
            p { font-size: 1.15rem; margin-bottom: 1.5rem; color: #e6e6fa; }
            li { font-size: 1.15rem; margin-bottom: 0.8rem; }

            /* Massive padding and margins for sections */
            section { margin-bottom: 4rem; padding: 3rem; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
            
            /* Aggressive Page Breaks */
            .page-break { page-break-after: always; clear: both; break-after: page; }
            .avoid-break { page-break-inside: avoid; break-inside: avoid; }
            h2 { page-break-before: always; break-before: page; }
            
            /* Spaced out grids and cards */
            .irow { display: grid; grid-template-columns: 1fr; gap: 2.5rem; margin-bottom: 2.5rem; page-break-inside: avoid; }
            .ic { background: rgba(0,0,0,0.3); padding: 2.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); border-left: 6px solid #64ffda; }
            .ic .il { font-size: 1.2rem; color: var(--moon-silver); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
            .ic .iv { font-size: 1.4rem; font-weight: 500; line-height: 1.6; }
            
            /* Huge Tables */
            .tw { overflow-x: auto; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 3rem; page-break-inside: auto; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; }
            table tr { page-break-inside: avoid; }
            th { text-align: left; padding: 2rem 1.5rem; background: rgba(100, 255, 218, 0.1); color: #64ffda; font-weight: 600; font-size: 1.2rem; letter-spacing: 1px; text-transform: uppercase; border-bottom: 2px solid rgba(100, 255, 218, 0.2); }
            td { padding: 2rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #e6e6fa; font-size: 1.15rem; }
            
            /* Reimagined Yogas & Dashas for space */
            .yd { background: rgba(0,0,0,0.2); padding: 2.5rem; border-radius: 12px; border: 1px solid rgba(100,255,218,0.2); margin-bottom: 2.5rem; }
            .rc { background: rgba(0,0,0,0.2); padding: 2.5rem; border-radius: 12px; border-left: 6px solid #64ffda; margin-bottom: 2.5rem; page-break-inside: avoid; }
            
            /* Cover Page Formatting */
            .cv-page { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 4rem; page-break-after: always; position: relative; overflow: hidden; }
            .cv-page::before { content: ''; position: absolute; top:0; left:0; right:0; bottom:0; background: radial-gradient(circle at center, rgba(100,255,218,0.1) 0%, transparent 70%); pointer-events: none; }
            .cv-title { font-family: 'Cinzel', serif; font-size: 5rem; color: #f4c430; margin-bottom: 1.5rem; letter-spacing: 4px; text-transform: uppercase; text-shadow: 0 0 20px rgba(244, 196, 48, 0.5); }
            .cv-sub { font-size: 2rem; color: #64ffda; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 4rem; opacity: 0.9; }
            .cv-info { font-size: 1.5rem; color: #e6e6fa; background: rgba(0,0,0,0.4); padding: 3rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); width: 80%; max-width: 800px; backdrop-filter: blur(10px); }
            .cv-info div { margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem; }
            .cv-info div:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
            
            /* Table of contents styling */
            .toc-item { display: flex; justify-content: space-between; padding: 1.5rem 0; border-bottom: 1px dashed rgba(255,255,255,0.1); font-size: 1.3rem; }
            .toc-item span:first-child { color: #64ffda; }
.ic p{color:#f8f8ff;font-size:.95rem;margin:0}
.b5row{display:grid;grid-template-columns:140px 1fr 50px;align-items:center;gap:.75rem;padding:.6rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.bbo{background:rgba(255,255,255,.08);border-radius:6px;height:11px;overflow:hidden}
.bbi{height:100%;border-radius:6px}
.yd{background:rgba(20,20,60,.9);border:1px solid rgba(100,255,218,.2);border-radius:8px;padding:.85rem 1rem;margin-bottom:.6rem;page-break-inside:avoid}
.yd h4{color:#64ffda;font-size:.88rem;margin-bottom:.25rem}
.yd p{color:#e6e6fa;font-size:.82rem;margin:0}
.akbox{background:linear-gradient(135deg,rgba(244,196,48,.08),rgba(244,196,48,.02));border:1px solid rgba(244,196,48,.3);border-radius:14px;padding:2rem;text-align:center;margin:1rem 0}
.avg{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-top:1rem}
.avc{background:rgba(0,0,0,.3);border:1px solid rgba(100,255,218,.2);border-radius:8px;padding:.75rem;text-align:center}
.avc .ap{font-size:1.8rem;font-weight:700}
.avc .al{font-size:.75rem;color:#e6e6fa;margin-top:.25rem}
.avc.high .ap{color:#ff8c42}
.avc.low .ap{color:#64ffda}
.avc.mid .ap{color:#f4c430}
.pbf{display:none}
@media print{
  .pbf{display:block!important;position:fixed!important;bottom:4mm!important;right:10mm!important;font-family:'Dancing Script',cursive!important;font-size:1.1rem!important;color:#f4c430!important;z-index:9999!important;font-weight:700!important}
  body{background:#0a0a1f!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;font-size:9pt!important}
  .cb svg{width:250px!important;height:250px!important}
  .rs,.cb,.ic{background:rgba(20,20,60,.95)!important;backdrop-filter:none!important}
  td,th{background:rgba(20,20,60,.9)!important}
  .bbo{background:rgba(255,255,255,.12)!important}
}
</style>
</head>
<body>
<div class="pbf">Astro Psycho by Ashish Chaurasia</div>
<div class="no-print" style="position:fixed;top:1rem;right:1.5rem;z-index:9999;display:flex;gap:.75rem">
  <a href="results.html" style="background:rgba(100,255,218,.15);color:#64ffda;border:1px solid #64ffda;padding:.55rem 1.1rem;border-radius:8px;text-decoration:none;font-size:.9rem">← Back</a>
  <button onclick="window.print()" style="background:linear-gradient(135deg,#f97316,#eab308);color:#0a0e1a;font-weight:700;padding:.65rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-size:.95rem">🖨️ Download Full PDF</button>
</div>
<div class="container" style="max-width:960px;margin:0 auto;padding:2rem 1rem">

<div class="cover">
  <div style="font-size:4.5rem;margin-bottom:1rem">🧠✨🪐</div>
  <h1>Personalized Astro-Psychology Report</h1>
  <p class="sub">Complete Vedic Astrology &amp; Psychological Profile</p>
  <div class="uname" id="cname">Loading...</div>
  <div class="binfo" id="cbirth"></div>
  <div style="color:rgba(255,255,255,.4);font-size:.8rem;margin-top:1.5rem" id="cdate"></div>
  <div class="brand">Astro Psycho by Ashish Chaurasia</div>
</div>

<div class="toc">
  <h2>📖 Table of Contents</h2>
'''

SECTIONS_HTML = '''
</div>

<div class="rs pb" id="s01">
<div class="sh"><span class="sn">01</span><h2>🪐 Birth Charts (Kundali)</h2></div>
<div class="crow">
  <div class="cb"><h4>Birth Chart (D-1 Lagna)</h4><div id="fr-d1"></div></div>
  <div class="cb"><h4>Navamsha Chart (D-9)</h4><div id="fr-d9"></div></div>
  <div class="cb"><h4>Current Transits (Gochar)</h4><div id="fr-transit"></div></div>
</div>
</div>

<div class="rs" id="s02">
<div class="sh"><span class="sn">02</span><h2>⭐ Planetary Positions &amp; Degrees</h2></div>
<div class="tw"><table><thead><tr><th>Planet</th><th>Rashi</th><th>D-9</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Status</th></tr></thead>
<tbody id="fr-planets"></tbody></table></div>
</div>

<div class="rs" id="s03">
<div class="sh"><span class="sn">03</span><h2>💪 Shadbala — Planetary Strength</h2></div>
<div id="fr-sbldr" style="margin-bottom:1rem"></div>
<div class="tw"><table><thead><tr><th>Planet</th><th>Sthana</th><th>Dig</th><th>Kala</th><th>Cheshta</th><th>Naisargika</th><th>Drik</th><th>Total</th><th>Grade</th></tr></thead>
<tbody id="fr-shadbala"></tbody></table></div>
</div>

<div class="rs pb" id="s04">
<div class="sh"><span class="sn">04</span><h2>⏱️ Current Dasha Period</h2></div>
<div id="fr-dasha"></div>
</div>

<div class="rs" id="s05">
<div class="sh"><span class="sn">05</span><h2>🏠 Detailed House Analysis (Bhava Phala)</h2></div>
<div id="fr-houses"></div>
</div>

<div class="rs pb" id="s06">
<div class="sh"><span class="sn">06</span><h2>🌍 Current Transits (Gochar)</h2></div>
<div id="fr-transits"></div>
</div>

<div class="rs" id="s07">
<div class="sh"><span class="sn">07</span><h2>🌙 Moon &amp; Mind Analysis (Chandra)</h2></div>
<div id="fr-moon"></div>
</div>

<div class="rs pb" id="s08">
<div class="sh"><span class="sn">08</span><h2>✨ Positive Yogas &amp; Blessings</h2></div>
<div id="fr-posyoga"></div>
</div>

<div class="rs" id="s09">
<div class="sh"><span class="sn">09</span><h2>⚠️ Doshas &amp; Challenges</h2></div>
<div id="fr-doshas"></div>
</div>

<div class="rs pb" id="s10">
<div class="sh"><span class="sn">10</span><h2>💍 Marriage &amp; Relationship Analysis</h2></div>
<div id="fr-marriage"></div>
</div>

<div class="rs pb" id="s11">
<div class="sh"><span class="sn">11</span><h2>🪐 Career Prediction (Brighu Nadi)</h2></div>
<div id="fr-career"></div>
</div>

<div class="rs" id="s12">
<div class="sh"><span class="sn">12</span><h2>📊 Ashtakavarga Points (Bindu)</h2></div>
<div id="fr-ashtak"></div>
</div>

<div class="rs pb" id="s13">
<div class="sh"><span class="sn">13</span><h2>🧠 Psychological Profile — Big Five</h2></div>
<div id="fr-big5"></div>
</div>

<div class="rs" id="s14">
<div class="sh"><span class="sn">14</span><h2>🔮 Soul Mission, Shadow Self &amp; Psychological Wounds</h2></div>
<div id="fr-soul"></div>
</div>

<div class="rs pb" id="s15">
<div class="sh"><span class="sn">15</span><h2>📿 Vedic Remedies &amp; Prescriptions (Upaya)</h2></div>
<div id="fr-remedies"></div>
</div>

<div class="rs pb" id="s16">
<div class="sh"><span class="sn">16</span><h2>💰 Financial &amp; Wealth Analysis (Dhana Yoga)</h2></div>
<div id="fr-wealth"></div>
</div>

<div class="rs pb" id="s17">
<div class="sh"><span class="sn">17</span><h2>🎓 Education &amp; Academic Journey (Vidya)</h2></div>
<div id="fr-education"></div>
</div>

<div class="rs pb" id="s18">
<div class="sh"><span class="sn">18</span><h2>🏢 Extensive Career Prediction (Dasamsha)</h2></div>
<div id="fr-career-ext"></div>
</div>

<div class="rs pb" id="s19">
<div class="sh"><span class="sn">19</span><h2>⚕️ Medical Astrology &amp; Health Risks (Ayur Jyotish)</h2></div>
<div id="fr-medical"></div>
</div>

<div class="rs pb" id="s20">
<div class="sh"><span class="sn">20</span><h2>🤝 Planetary Conjunctions &amp; Stelliums (Yuti)</h2></div>
<div id="fr-conjunctions"></div>
</div>

<div class="rs pb" id="s21">
<div class="sh"><span class="sn">21</span><h2>⚖️ Saturn Analysis &amp; Sade Sati (Shani)</h2></div>
<div id="fr-saturn"></div>
</div>

<div class="rs pb" id="s22">
<div class="sh"><span class="sn">22</span><h2>📅 Kundali Calendar &amp; Timing (Muhurta)</h2></div>
<div id="fr-muhurta"></div>
</div>

<div class="rs pb" id="s23">
<div class="sh"><span class="sn">23</span><h2>☀ Varshaphala — Annual Solar Return Chart</h2></div>
<div id="fr-varshaphala"></div>
</div>

<div class="rs pb" id="s24">
<div class="sh"><span class="sn">24</span><h2>🧭 Divisional Charts (Vargas D-2 to D-12)</h2></div>
<div id="fr-divisional"></div>
</div>

<div style="padding:1.25rem;border:1px solid rgba(255,107,157,.4);border-radius:10px;background:rgba(255,107,157,.05);margin-top:1.5rem">
<h3 style="color:#ff6b9d;margin-bottom:.5rem">⚠️ Disclaimer</h3>
<p style="color:#e6e6fa;font-size:.85rem;line-height:1.6">This report provides traditional Vedic insights blended with modern psychological frameworks for self-reflection and growth. It is NOT a clinical diagnosis. Crisis helplines — iCall: 9152987821 | AASRA: +91-9820466627</p>
</div>

</div>
'''

TOC_ROWS = [
    ("01","Birth Charts — D-1 Lagna, D-9 Navamsha, Transits","Kundali"),
    ("02","Planetary Positions, Degrees & Signs","Graha"),
    ("03","Shadbala — Six-Fold Planetary Strength","Bala"),
    ("04","Current Mahadasha & Antardasha Periods","Dasha"),
    ("05","Detailed House Analysis (Bhava Phala)","Bhava"),
    ("06","Current Planetary Transits (Gochar)","Gochar"),
    ("07","Moon & Mind Psychology (Chandra Lagna)","Chandra"),
    ("08","Positive Yogas & Life Blessings","Subha Yoga"),
    ("09","Doshas, Challenges & Afflictions","Ashubha"),
    ("10","Marriage & Relationship Analysis","Vivaha"),
    ("11","Career Prediction — Brighu Nadi Saturn","Karma"),
    ("12","Ashtakavarga Points by House","Bindu"),
    ("13","Psychological Profile — Big Five Traits","Manas"),
    ("14","Soul Mission, Shadow Self & Wounds","Atma"),
    ("15","Vedic Remedies & Prescriptions","Upaya"),
    ("16","Financial & Wealth Analysis","Dhana"),
    ("17","Education & Academic Journey","Vidya"),
    ("18","Extensive Career Prediction","Dasamsha"),
    ("19","Medical Astrology & Health Risks","Ayur"),
    ("20","Planetary Conjunctions & Stelliums","Yuti"),
    ("21","Saturn Analysis & Sade Sati Status","Shani"),
    ("22","Kundali Calendar & Timings","Muhurta"),
    ("23","Varshaphala Annual Solar Return","Chaitra"),
    ("24","Divisional Charts Repository","Vargas")
]

toc_html = ""
for num, title, right in TOC_ROWS:
    toc_html += f'<div class="ti"><div><span class="num">{num}</span>{title}</div><span class="right">{right}</span></div>\n'

JS_WRAPPER = '''
<script src="js/astrology-engine-v8.js"></script>
<script src="js/chart-renderer.js"></script>
<script src="js/recommendation-engine.js"></script>
<script src="js/pdf-report.js"></script>
<script src="js/wealth-engine.js"></script>
<script src="js/education-engine.js"></script>
<script src="js/career-engine.js"></script>
<script src="js/medical-engine.js"></script>
<script src="js/conjunctions-engine.js"></script>
<script src="js/sade-sati-engine.js"></script>
<script src="js/muhurta-engine.js"></script>
<script src="js/varshaphala-engine.js"></script>
<script src="js/divisional-engine.js"></script>
<script>
{js_code}
</script>
'''

with open("full-report.html", "w", encoding="utf-8") as f:
    f.write(HEAD)
    f.write(toc_html)
    f.write(SECTIONS_HTML)
    js_code = open("full-report-init.js", encoding="utf-8").read() if __import__('os').path.exists("full-report-init.js") else "// JS missing"
    f.write(JS_WRAPPER.format(js_code=js_code))
    f.write("\n</body>\n</html>")

print("full-report.html written successfully!")


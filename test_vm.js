const fs = require('fs');
const vm = require('vm');

const context = {
    console: console,
    localStorage: {
        getItem: () => JSON.stringify({
            birthDetails: {
                birthDate: '2000-01-01',
                birthTime: '12:00',
                latitude: '28.61',
                longitude: '77.20',
                timezone: '5.5',
                fullName: 'Test'
            }
        })
    },
    document: {
        addEventListener: () => {},
        getElementById: () => ({ style: {}, innerHTML: '', appendChild: () => {}, scrollIntoView: () => {} }),
        querySelectorAll: () => []
    },
    window: {},
    XMLHttpRequest: class {
        open() {}
        send() { this.status = 200; this.responseText = "{}"; }
    },
    setTimeout: setTimeout
};
vm.createContext(context);

try {
    const code = fs.readFileSync('js/astrology-engine-v8.js', 'utf8') + '\n; window.VedicAstrologyEngine = VedicAstrologyEngine;\n' + 
                 fs.readFileSync('js/career-engine.js', 'utf8') + '\n; window.BrighuCareerEngine = BrighuCareerEngine;';
    
    vm.runInContext(code, context);
    
    vm.runInContext(`
        const engine = new BrighuCareerEngine();
        engine.init().then(ok => {
            console.log("Engine init:", ok);
            if (ok) {
                try {
                    engine.renderAll();
                    console.log("RenderAll executed successfully");
                } catch(e) {
                    console.error("RenderAll error:", e);
                }
            }
        }).catch(e => console.error("Init error:", e));
    `, context);
} catch(e) {
    console.error("Setup error:", e);
}

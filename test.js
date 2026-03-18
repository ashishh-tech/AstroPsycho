const fs = require('fs');
global.localStorage = {
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
};
global.window = {};
global.document = {
    addEventListener: () => {},
    getElementById: () => ({ style: {}, innerHTML: '', appendChild: () => {} }),
    querySelectorAll: () => []
};

let astroSrc = fs.readFileSync('js/astrology-engine-v8.js', 'utf8');
let careerSrc = fs.readFileSync('js/career-engine.js', 'utf8');

eval(astroSrc);
eval(careerSrc);

const engine = new BrighuCareerEngine();

async function test() {
    console.log("Starting test...");
    const ok = await engine.init();
    console.log("Engine init result:", ok);
    if (!ok) {
        console.log("UserData:", engine.userData);
        return;
    }
    
    console.log("Calling renderAll()...");
    try {
        engine.renderAll();
        console.log("RenderAll finished without throwing an exception.");
    } catch(e) {
        console.log("Exception in renderAll:", e);
    }
}
test();

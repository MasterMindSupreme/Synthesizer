let init = false;
let playing = false;
let audioContext;
let OSC1;
let LFO1;
document.getElementById('play').addEventListener('click',
    async () => {
        if (!init) {
            await setup();
            init = true;
        }
        playing ? OSC1.disconnect(audioContext.destination) : OSC1.connect(audioContext.destination);
        playing = !playing;
    });
document.getElementById('freq').addEventListener('input',
    async () => {
        if (!init) {
            await setup();
            init = true;
        }
        let freq = document.getElementById("freq").value;
        const frequency = LFO1.parameters.get('frequency');
        frequency.setValueAtTime(freq, audioContext.currentTime);
    });


async function setup() {
    audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('OSC-processor.js');
    OSC1 = new AudioWorkletNode(audioContext, 'OSC-processor', {
        numberOfInputs: 1
    });
    OSC1.port.postMessage({
        sampleRate: audioContext.sampleRate
    });
    await audioContext.audioWorklet.addModule('LFO-processor.js');
    LFO1 = new AudioWorkletNode(audioContext, 'LFO-processor');
    LFO1.port.postMessage({
        sampleRate: audioContext.sampleRate
    });
    LFO1.connect(OSC1, 0, 0);
}
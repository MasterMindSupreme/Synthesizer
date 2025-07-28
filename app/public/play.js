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
        OSC1.port.postMessage({command: 'resetSamples'});
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

    OSC1.port.onmessage = (event) => {
      const samples = event.data;
      var canvas = document.getElementById("oscillatorView");
      drawWaveForm(samples, canvas);
    };

}

const devicePixelRatio = window.devicePixelRatio || 1;
let canvasSet = false;
function drawWaveForm(samples, canvas) {
    var line = canvas.getContext("2d");
    canvas.width = canvas.width;
    if (!canvasSet) {
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
        canvasSet = true;
    }
    
    console.log(canvas.width, canvas.height);
    line.scale(devicePixelRatio, devicePixelRatio);
    line.fillStyle = "#000000";
    line.fillRect(0,0,canvas.width,canvas.height)
    line.strokeStyle = '#FFFFFF';
    line.lineWidth = 0.4;
    line.moveTo(0.5, canvas.height / 2);
    for (let i = 0;i < samples.length;i++) {
        line.lineTo(i, canvas.height / 2 * (1 + samples[i]) * 1 / devicePixelRatio);
    }
    line.stroke();
}
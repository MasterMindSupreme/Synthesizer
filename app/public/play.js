import { Knob , globalKnobIndex } from './components/knob.js';
import { Volume , globalVolumeIndex } from './components/volume.js';
let init = false;
let playing = false;
let audioContext;
let OSC1;
let LFO1;

let knob1 = new Knob(globalKnobIndex, document.getElementsByTagName("body")[0], "Sample Knob 1", [-2, -1, 0, 1, 2]);

let volume1 = new Volume(globalVolumeIndex, document.getElementsByTagName("body")[0]);

/* open samples */
let sampleBuffer = null;
let sampleSource = null;
let sampleAudioContext;

function ensureSampleAudioContext() {
  if (!sampleAudioContext) {
    sampleAudioContext = new AudioContext();
  }
}

const sampleSelect = document.getElementById('sampleSelect');
const playSampleBtn = document.getElementById('playSampleBtn');

// load selected sample
sampleSelect.addEventListener('change', async () => {
  const fileName = sampleSelect.value;
  if (!fileName) return;

  ensureSampleAudioContext();

  try {
    const res = await fetch(`/samples/${fileName}`);
    const arrayBuffer = await res.arrayBuffer();
    sampleBuffer = await sampleAudioContext.decodeAudioData(arrayBuffer);
    console.log("Loaded sample:", fileName);
    playSampleBtn.disabled = false;
  } catch (err) {
    console.error("Sample load error:", err);
    playSampleBtn.disabled = true;
  }
});

// play sample and stop after 10 seconds
playSampleBtn.addEventListener('click', () => {
  if (!sampleBuffer || !sampleAudioContext) return;

  sampleSource = sampleAudioContext.createBufferSource();
  sampleSource.buffer = sampleBuffer;
  sampleSource.connect(sampleAudioContext.destination);
  sampleSource.start();
  sampleSource.stop(sampleAudioContext.currentTime + 10);
});

// this function fetches the list of samples from the server
async function loadSampleList() {
  try {
    const res = await fetch("/samples-list");
    const files = await res.json();
    const sampleSelect = document.getElementById("sampleSelect");

    // clear any existing options (except the placeholder)
    sampleSelect.innerHTML = '<option disabled selected value="">-- Choose a sample --</option>';

    // add one <option> per file
    files.forEach(file => {
      const option = document.createElement("option");
      option.value = file;
      option.textContent = file;
      sampleSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load sample list:", err);
  }
}
loadSampleList();
/*open samples */

document.addEventListener('DOMContentLoaded', () => {
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
            const modulatorFrequency = LFO1.parameters.get('frequency');
            modulatorFrequency.setValueAtTime(freq, audioContext.currentTime);
            OSC1.port.postMessage({
                command: 'resetSamples'
            });
        });
    knob1.inputEl.addEventListener('change',
        async () => {
            if (!init) {
                await setup();
                init = true;
            }
            console.log("qwerty");
            let freq = knob1.inputEl.value;
            const carrierFrequency = OSC1.parameters.get('frequency');
            carrierFrequency.setValueAtTime(440 * Math.pow(2, freq), audioContext.currentTime);
            OSC1.port.postMessage({
                command: 'resetSamples'
            });
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
        const carrierFrequency = OSC1.parameters.get('frequency');
        let freq = knob1.inputEl.value;
        carrierFrequency.setValueAtTime(440 * Math.pow(2, freq), audioContext.currentTime);
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
        line.scale(devicePixelRatio, devicePixelRatio);
        line.fillStyle = "#000000";
        line.fillRect(0, 0, canvas.width, canvas.height)
        line.strokeStyle = '#FFFFFF';
        line.lineWidth = 0.4;
        line.moveTo(0.5, canvas.height / 2);
        for (let i = 0; i < samples.length; i++) {
            line.lineTo(i, canvas.height / 2 * (1 + samples[i]) * 1 / devicePixelRatio);
        }
        line.stroke();
    }
});
import {
    Knob,
    globalKnobIndex
} from './components/knob.js';
import {
    Volume,
    globalVolumeIndex
} from './components/volume.js';

let init = false;
let playing = false;
export let audioContext = new AudioContext();
let OSC1;
let LFO1;
let ENV1;

let knob1 = new Knob(globalKnobIndex, document.getElementsByTagName("body")[0], "Sample Knob 1", [-2, -1, 0, 1, 2]);

let volume1 = new Volume(globalVolumeIndex, document.getElementsByTagName("body")[0]);

/* open samples */
let sampleBuffer = null;
let sampleSource = null;

const sampleSelect = document.getElementById('sampleSelect');
const playSampleBtn = document.getElementById('playSampleBtn');

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

function listenToKeys(callback) {
  window.addEventListener('keydown', (event) => {
    const key = event.key;

    callback({ key });
  });
}

var KeyToNoteMap = new Map([
    ['z', 'C4'],
    ['s', 'C#4'],
    ['x', 'D4'],
    ['d', 'D#4'],
    ['c', 'E4'],
    ['v', 'F4'],
    ['g', 'F#4'],
    ['b', 'G4'],
    ['h', 'G#4'],
    ['n', 'A4'],
    ['j', 'A#4'],
    ['m', 'B4'],

    // Top Row (C5 Octave)
    ['q', 'C5'],
    ['2', 'C#5'],
    ['w', 'D5'],
    ['3', 'D#5'],
    ['e', 'E5'],
    ['r', 'F5'],
    ['5', 'F#5'],
    ['t', 'G5'],
    ['6', 'G#5'],
    ['y', 'A5'],
    ['7', 'A#5'],
    ['u', 'B5'],
    ['i', 'C6'],
    ['9', 'C#6'],
    ['o', 'D6'],
    ['0', 'D#6'],
    ['p', 'E6'],
]);

var noteToMidiMap = new Map([

    // Octave 3 
    ['C3', 48],
    ['C#3', 49],
    ['D3', 50],
    ['D#3', 51],
    ['E3', 52],
    ['F3', 53],
    ['F#3', 54],
    ['G3', 55],
    ['G#3', 56],
    ['A3', 57],
    ['A#3', 58],
    ['B3', 59],

    // Octave 4 
    ['C4', 60],
    ['C#4', 61],
    ['D4', 62],
    ['D#4', 63],
    ['E4', 64],
    ['F4', 65],
    ['F#4', 66], 
    ['G4', 67],
    ['G#4', 68],
    ['A4', 69],
    ['A#4', 70],
    ['B4', 71],

    // Octave 5 
    ['C5', 72],
    ['C#5', 73],
    ['D5', 74],
    ['D#5', 75],
    ['E5', 76],
    ['F5', 77],
    ['F#5', 78],
    ['G5', 79],
    ['G#5', 80],
    ['A5', 81],
    ['A#5', 82],
    ['B5', 83],

    // Octave 6
    ['C6', 84],
    ['C#6', 85],
    ['D6', 86],
    ['D#6', 87],
    ['E6', 88]
]);

document.addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
});

document.addEventListener('DOMContentLoaded', () => {

    listenToKeys(async ({ key }) => {
        if (!init) {
            await setup();
            init = true;
        }
        var filename = (noteToMidiMap.get(KeyToNoteMap.get(key))-12) + ".wav";
        if ((noteToMidiMap.get(KeyToNoteMap.get(key))-12).toString() == "NaN") {
            return;
        }

        const response = await fetch('/osc-sample' + '?filename=' + filename + '&osc=1', {
            method: 'GET',
            headers: {
                'Content-Type': 'audio/wav'
            }
        });
        const rawBuffer = await response.arrayBuffer();
        let OSC1Sample = await audioContext.decodeAudioData(rawBuffer);
        OSC1.port.postMessage({command: "setSamples", samples: Array.from(OSC1Sample.getChannelData(0))});
        document.getElementById("play").click();
    });
    // load selected sample
    sampleSelect.addEventListener('change', async () => {
        const fileName = sampleSelect.value;
        if (!fileName) return;

        // ensureSampleAudioContext();

        // if (!init) {
        //     await setup();
        //     init = true;
        // }

        // try {
        //     const res = await fetch(`/samples/${fileName}`);
        //     const arrayBuffer = await res.arrayBuffer();
        //     sampleBuffer = await sampleAudioContext.decodeAudioData(arrayBuffer);
        //     let warper = new warp.Warper(audioContext);
        //     let pitch = await fetch("/pitch", {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             file: `/samples/${fileName}`
        //         })
        //     }).then(response => {
        //         return response.text();
        //     });
        //     console.log(pitch);
        //     if (pitch == null) {
        //         pitch = 440;
        //     }
        //     const noteAdjust = (12 * Math.log2(pitch / 440));
        //     console.log((12 * Math.log2(pitch / 440)));
        //     warper.playNow(sampleBuffer, noteAdjust);
        //     console.log("Loaded sample:", fileName);
        //     playSampleBtn.disabled = false;
        // } catch (err) {
        //     console.error("Sample load error:", err);
        //     playSampleBtn.disabled = true;
        // }
    });

    // play sample and stop after 10 seconds
    // playSampleBtn.addEventListener('click', () => {
    //     if (!sampleBuffer || !sampleAudioContext) return;

    //     sampleSource = sampleAudioContext.createBufferSource();
    //     sampleSource.buffer = sampleBuffer;
    //     sampleSource.connect(sampleAudioContext.destination);
    //     sampleSource.start();
    //     sampleSource.stop(sampleAudioContext.currentTime + 10);
    // });

    document.getElementById('play').addEventListener('click',
        async () => {
            if (!init) {
                await setup();
                init = true;
            }
            ENV1.port.postMessage({
                command: playing ? 'sustainOff' : 'sustainOn'
            });
            playing ? OSC1.disconnect(audioContext.destination) : ENV1.port.postMessage({
                command: 'resetIndex'
            }), OSC1.connect(audioContext.destination);
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
            let freq = knob1.inputEl.value;
            const carrierFrequency = OSC1.parameters.get('frequency');
            carrierFrequency.setValueAtTime(440 * Math.pow(2, freq), audioContext.currentTime);
            OSC1.port.postMessage({
                command: 'resetSamples'
            });
        });

    async function setup() {
        await audioContext.audioWorklet.addModule('OSC-processor.js');
        OSC1 = new AudioWorkletNode(audioContext, 'OSC-processor', {
            numberOfInputs: 2
        });
        OSC1.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        await audioContext.audioWorklet.addModule('ENV-processor.js');
        ENV1 = new AudioWorkletNode(audioContext, 'ENV-processor');
        ENV1.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        await audioContext.audioWorklet.addModule('LFO-processor.js');
        LFO1 = new AudioWorkletNode(audioContext, 'LFO-processor');
        LFO1.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        LFO1.connect(OSC1, 0, 0);
        ENV1.connect(OSC1, 0, 1);
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
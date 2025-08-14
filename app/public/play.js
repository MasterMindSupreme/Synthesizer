import {
    Knob,
    globalKnobIndex
} from './components/knob.js';
import {
    Volume,
    globalVolumeIndex
} from './components/volume.js';
import {
    ToggleButton
} from './components/toggle-button.js';

let init = false;
let playing = false;
export let audioContext = new AudioContext();
let OSC1;
let LFO1;
let ENV1;
let currentOSC = 1;

const knobRack = document.getElementById('knob-rack');
const octaveKnob = new Knob(globalKnobIndex, knobRack, "Octave", [-2, -1, 0, 1, 2]);
const semitoneKnob = new Knob(globalKnobIndex, knobRack, "Semitone", [-12, -6, 0, 6, 12]);
const fineKnob = new Knob(globalKnobIndex, knobRack, "Fine", [-100, -50, 0, 50, 100]);
const volumeSlider = new Volume(globalVolumeIndex, document.getElementById("OSCVolume"));

document.querySelectorAll('.toggle-button').forEach(btn => {
    new ToggleButton(btn);
});

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
    // Octave -1
    ['C-1', 0],
    ['C#-1', 1],
    ['D-1', 2],
    ['D#-1', 3],
    ['E-1', 4],
    ['F-1', 5],
    ['F#-1', 6],
    ['G-1', 7],
    ['G#-1', 8],
    ['A-1', 9],
    ['A#-1', 10],
    ['B-1', 11],

    // Octave 0
    ['C0', 12],
    ['C#0', 13],
    ['D0', 14],
    ['D#0', 15],
    ['E0', 16],
    ['F0', 17],
    ['F#0', 18],
    ['G0', 19],
    ['G#0', 20],
    ['A0', 21],
    ['A#0', 22],
    ['B0', 23],

    // Octave 1
    ['C1', 24],
    ['C#1', 25],
    ['D1', 26],
    ['D#1', 27],
    ['E1', 28],
    ['F1', 29],
    ['F#1', 30],
    ['G1', 31],
    ['G#1', 32],
    ['A1', 33],
    ['A#1', 34],
    ['B1', 35],

    // Octave 2 
    ['C2', 36],
    ['C#2', 37],
    ['D2', 38],
    ['D#2', 39],
    ['E2', 40],
    ['F2', 41],
    ['F#2', 42],
    ['G2', 43],
    ['G#2', 44],
    ['A2', 45],
    ['A#2', 46],
    ['B2', 47],

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
    ['E6', 88],
    ['F6', 89],
    ['F#6', 90],
    ['G6', 91],
    ['G#6', 92],
    ['A6', 93],
    ['A#6', 94],
    ['B6', 95],

    // Octave 7
    ['C7', 96],
    ['C#7', 97],
    ['D7', 98],
    ['D#7', 99],
    ['E7', 100],
    ['F7', 101],
    ['F#7', 102],
    ['G7', 103],
    ['G#7', 104],
    ['A7', 105],
    ['A#7', 106],
    ['B7', 107],

    // Octave 8
    ['C8', 108],
    ['C#8', 109],
    ['D8', 110],
    ['D#8', 111],
    ['E8', 112],
    ['F8', 113],
    ['F#8', 114],
    ['G8', 115],
    ['G#8', 116],
    ['A8', 117],
    ['A#8', 118],
    ['B8', 119],
    
    // Octave 9
    ['C9', 120],
    ['C#9', 121],
    ['D9', 122],
    ['D#9', 123],
    ['E9', 124],
    ['F9', 125],
    ['F#9', 126],
    ['G9', 127]

]);

let noteShift = 0;


document.addEventListener('DOMContentLoaded', () => {

    const devicePixelRatio = window.devicePixelRatio || 1;
    let canvasSet = false;

    let samples = new Array(2000).fill(0);
    drawWaveForm(samples, document.getElementById("oscillatorView"), "");

    document.addEventListener('click', async () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (!init) {
            await setup();
            init = true;
        }
    });

    const waveformDropdown = document.getElementById("waveformDropdown");
    waveformDropdown.addEventListener("change", () => {
        updateWaveform(waveformDropdown.textContent.split("\n")[waveformDropdown.selectedIndex+1].toLocaleLowerCase().replace(/[^a-zA-Z0-9]/g, ""));
    });

    const waveformSlider = document.getElementById("waveformSlider");
    waveformSlider.addEventListener("change", () => {
        updateWaveformSlider(waveformSlider.value / 100);
    });

    listenToKeys(async ({ key }) => {
        if (!init) {
            await setup();
            init = true;
        }
        var filename = (noteToMidiMap.get(KeyToNoteMap.get(key))-12 + noteShift) + ".wav";
        if ((noteToMidiMap.get(KeyToNoteMap.get(key))-12 + noteShift).toString() == "NaN") {
            return;
        }

        const response = await fetch('/osc-sample' + '?filename=' + filename + '&osc=1', {
            method: 'GET',
            headers: {
                'Content-Type': 'audio/wav'
            }
        });
        const rawBuffer = await response.arrayBuffer();
        let sampleFileName = document.getElementById("sampleSelect").options[document.getElementById("sampleSelect").selectedIndex].value;
        let OSC1Sample = await audioContext.decodeAudioData(rawBuffer);
        OSC1.port.postMessage({command: "setSamples", samples: Array.from(OSC1Sample.getChannelData(0)), fileName: sampleFileName});
        document.getElementById("play").click();
    });

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
    octaveKnob.inputEl.addEventListener('change', () => {
            updatePitch();
        });
    semitoneKnob.inputEl.addEventListener('change', () => {
            updatePitch();
        });
    fineKnob.inputEl.addEventListener('change', () => {
            updatePitch();
        });
    volumeSlider.slider.addEventListener('input', () => {
            updateVolume();
        });
    function updatePitch () {
        let octave = parseInt(octaveKnob.inputEl.value);
        let semitone = parseInt(semitoneKnob.inputEl.value);
        let fine = parseInt(fineKnob.inputEl.value);
        if (!OSC1) {
            return;
        }
        let carrierFrequency;
        if (currentOSC == 1) {
            carrierFrequency = OSC1.parameters.get('frequency');
        }
        if (currentOSC == 2) {
            carrierFrequency = OSC2.parameters.get('frequency');
        }
        if (currentOSC == 3) {
            carrierFrequency = OSC3.parameters.get('frequency');
        }
        noteShift = octave*12+semitone;
        try {
            carrierFrequency.setValueAtTime(440 * Math.pow(2, octave + semitone/12 + fine/12/100), audioContext.currentTime);
            OSC1.port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        }
    }
    function updateWaveformSlider (value) {
        if (!OSC1) {
            return;
        }
        let waveform;
        if (currentOSC == 1) {
            waveform = OSC1.parameters.get('waveform');
        }
        if (currentOSC == 2) {
            waveform = OSC2.parameters.get('waveform');
        }
        if (currentOSC == 3) {
            waveform = OSC3.parameters.get('waveform');
        }
        try {
            waveform.setValueAtTime(value, audioContext.currentTime);
            OSC1.port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        }
    }
    function updateWaveform (waveform) {
        if (!OSC1) {
            return;
        }
        if (currentOSC == 1) {
            OSC1.port.postMessage({
                command: waveform
            });
            OSC1.port.postMessage({
                command: "resetSamples"
            });
        }
        if (currentOSC == 2) {
            OSC2.port.postMessage({
                command: waveform
            });
        }
        if (currentOSC == 3) {
            OSC3.port.postMessage({
                command: waveform
            });
        }
    }
    function updateVolume () {
        let volume = parseInt(volumeSlider.label.textContent.replace("%", ""));
        if (!OSC1) {
            return;
        }
        let amplitude;
        if (currentOSC == 1) {
            amplitude = OSC1.parameters.get('amplitude');
        }
        if (currentOSC == 2) {
            amplitude = OSC2.parameters.get('amplitude');
        }
        if (currentOSC == 3) {
            amplitude = OSC3.parameters.get('amplitude');
        }
        try {
            amplitude.setValueAtTime(volume / 100, audioContext.currentTime);
            OSC1.port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        }
    }
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
        let freq = octaveKnob.inputEl.value;
        carrierFrequency.setValueAtTime(440 * Math.pow(2, freq), audioContext.currentTime);
        OSC1.port.onmessage = (event) => {
            const samples = event.data[0];
            var canvas = document.getElementById("oscillatorView");
            drawWaveForm(samples, canvas, event.data[1]);
        };

    }

    function drawWaveForm(samples, canvas, sampleName) {
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
        line.font = "20px Arial";
        line.fillStyle = "white";
        line.textAlign = "left";
        line.textBaseline = "top";
        line.fillText(sampleName, 0, 0);
    }
});
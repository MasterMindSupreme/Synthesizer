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
import { Rate } from './components/rate-comp.js';

let init = false;
let playing = false;
export let audioContext = new AudioContext();
let OSCList;
let ENVList;
let LFOList;
let FilterList;
let FilterChoice;
let OSC1;
let OSC2;
let OSC3;
let LFO1;
let LFO2;
let LFO3;
let ENV1;
let ENV2;
let ENV3;
let Filter1;
let Filter2;
let Filter3;
export let currentOSC = 1;
let currentLFO = 1;
let currentENV = 1;
let currentFilter = 1;

const knobRack = document.getElementById('tune-rack');
const octaveKnob = new Knob(globalKnobIndex, knobRack, "Octave", [-2, -1, 0, 1, 2]);
const semitoneKnob = new Knob(globalKnobIndex, knobRack, "Semitone", [-12, -6, 0, 6, 12]);
const fineKnob = new Knob(globalKnobIndex, knobRack, "Fine", [-100, -50, 0, 50, 100]);
const volumeSlider = new Volume(globalVolumeIndex, document.getElementById("OSCVolume"), "Volume");
const envelopeRack = document.getElementById('envelope-rack');
const attack = new Knob(globalKnobIndex, envelopeRack, "Attack", [0, 1, 2, 3]);
const decay = new Knob(globalKnobIndex, envelopeRack, "Decay", [0, 1, 2, 3]);
const sustain = new Knob(globalKnobIndex, envelopeRack, "Sustain", [0, 25, 50, 75, 100]);
const release = new Knob(globalKnobIndex, envelopeRack, "Release", [0, 1, 2, 3]);
const filterRack = document.getElementById('filter-rack');
const cutoff = new Knob(globalKnobIndex, filterRack, "Cut Off", [0, 25, 50, 75, 100]);
const resonance = new Knob(globalKnobIndex, filterRack, "Resonance", [0, 25, 50, 75, 100]);
const keyTracking = new Volume(globalVolumeIndex, document.getElementById("filterTracking"), "Tracking");
const LFORack = document.getElementById('rate-rack');
const phaseLFO = document.getElementById('LFO-rack');
const frequencyMod = new Rate(1, LFORack, "Rate");
const amplitudeMod = new Rate(1, LFORack, "Amp");
const LFOKeyTracking = new Volume(globalVolumeIndex, document.getElementById("LFOTracking"), "Tracking");
const phaseKnob = new Knob(globalKnobIndex, phaseLFO, "Phase", [0, 25, 50, 75, 100]);

const toggles = [];

/* open samples */
export let selectedSampleBuffer = null;
/* --- Open Sample / Preset Loader --- */
let sampleBuffer = null;
let sampleSource = null;
let sampleAudioContext;


// // play sample, cut off after 5 seconds
// playSampleBtn.addEventListener('click', () => {
//   if (!sampleBuffer || !sampleAudioContext) return;

//   sampleSource = sampleAudioContext.createBufferSource();
//   sampleSource.buffer = sampleBuffer;
//   sampleSource.connect(sampleAudioContext.destination);
//   sampleSource.start();
//   sampleSource.stop(sampleAudioContext.currentTime + 5);
// });

// fetch list of presets from server
async function loadSampleList() {
  try {
    const res = await fetch("/samples-list");
    const files = await res.json();

    // populate with server files
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


function listenToKeys(callback) {
  window.addEventListener('keydown', (event) => {
    const key = event.key;

    callback({ key });
  });
}

const KeyToNoteMap = new Map([
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

const noteToMidiMap = new Map([
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

let waveformNote;

document.addEventListener('DOMContentLoaded', () => {

    const devicePixelRatio = window.devicePixelRatio || 1;
    let canvasSet = false;
    let canvasSet2 = false;
    let canvasSet3 = false;
    let canvasSet4 = false;

    let samples = new Array(2000).fill(0);
    let envelopeValues = [attack.inputEl.value, decay.inputEl.value, sustain.inputEl.value, release.inputEl.value];
    let filterValues = [1,3,cutoff.inputEl.value];
    drawWaveForm(samples, document.getElementById("oscillatorView"), "");
    drawEnvelope(envelopeValues, document.getElementById("envelopeView"));
    drawLFO(samples, document.getElementById("LFOView"), "");
    drawFilter(filterValues, document.getElementById("filterView"));

    document.addEventListener('click', async () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (!init) {
            await setup();
            init = true;
        }
    });

    var OSCTabs = document.getElementsByClassName("osc-dropdown");

    var LFOTabs = document.getElementsByClassName("lfo-header");

    for (let i = 0; i < LFOTabs.length;i++) {
        LFOTabs[i].addEventListener("click", () => {
            currentLFO = i + 1;
            for (let j = 0; j < LFOTabs.length;j++) {
                LFOTabs[j].classList.remove("lfo-header-active");
            }
            LFOTabs[i].classList.add("lfo-header-active")
        });
    }
    
    for (let i = 0; i < OSCTabs.length;i++) {
        OSCTabs[i].parentElement.addEventListener("click", () => {
            currentOSC = i + 1;
        });
        OSCTabs[i].addEventListener("click", () => {
            if (OSCTabs[currentOSC - 1].value == "waveform") {
                document.getElementById("preset-loader").classList.add("invisible");
                document.getElementById("waveform-loader").classList.remove("invisible");
                OSCList != null ? OSCList[currentOSC - 1].port.postMessage({sampled: false}): null;
            } else {
                document.getElementById("preset-loader").classList.remove("invisible");
                document.getElementById("waveform-loader").classList.add("invisible");
                OSCList != null ? OSCList[currentOSC - 1].port.postMessage({sampled: true}): null;
            }
        });
    }

    document.getElementById("oscillatorPower").addEventListener("click", () => {
        if (init) {
            OSCList[currentOSC - 1].port.postMessage({
                play: !document.getElementById("oscillatorPower").classList.contains("active"),
            });
        }
    });

    const voices = new Map();

    async function loadSample(midi, OSCNumber) {
        const url = `OSC${OSCNumber} Samples/${midi}.wav`;
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`Missing sample: ${url}`);
            return null;
        }
        const arrBuf = await res.arrayBuffer();
        const audioBuf = await audioContext.decodeAudioData(arrBuf);
        return audioBuf;
    }

    async function playSample(midi, velocity, id) {
        const buf1 = await loadSample(midi + noteShift, 1);
        const buf2 = await loadSample(midi + noteShift, 2);
        const buf3 = await loadSample(midi + noteShift, 3);
        let sampleFileName = document.getElementById("openSampleInput").value;
        waveformNote = midi + noteShift;
        // updatePitch();
        const bufs = [buf1, buf2, buf3];
        for (let i = 0; i < OSCList.length;i++) {
            if (OSCTabs[i].value == "sample") {
                OSCList[i].port.postMessage({command: "setSamples", samples: Array.from(bufs[i].getChannelData(0)), fileName: sampleFileName.split("/").pop().split("\\").pop()});
            }
            else {
                // updatePitch();
                // document.getElementById("play").click();
            }
        }


        // const src = audioContext.createBufferSource();
        // src.buffer = buf;

        // const gain = audioContext.createGain();
        // gain.gain.value = Math.max(0, Math.min(1, velocity ?? 0.75));

        // src.connect(gain).connect(audioContext.destination);
        // src.start();

        // voices.set(id, { src, gain });
    }

    function stopSample(id) {
        const v = voices.get(id);
        if (!v) return;
        const now = audioContext.currentTime;
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setValueAtTime(v.gain.gain.value, now);
        voices.delete(id);
    }

    function onMIDISuccess(midiAccess) {
        const inputs = Array.from(midiAccess.inputs.values());
        if (inputs.length === 0) {
            alert("No MIDI inputs found.");
            return;
        }

        // Build a numbered list of input names
        const inputList = inputs.map((input, i) => `${i + 1}: ${input.name}`).join('\n');
        const choice = prompt(`Select a MIDI input:\n${inputList}\nEnter the number:`);

        const index = parseInt(choice) - 1;
        const selectedInput = inputs[index];

        if (selectedInput) {
            alert(`🎹 Listening to: ${selectedInput.name}`);
        } else {
            alert("Invalid selection.");
        }
        return index;
    }

    function onMIDIFailure() {
        alert("Failed to access MIDI devices.");
    }

    WebMidi.enable().then(async () => {
        const index = await navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        const input = WebMidi.inputs[index];
        if (!input) {
            return;
        }

        input.addListener("noteon", "all", async (e) => {
            if (!init) {
                await setup();
                init = true;
            }
            if (audioContext.state === "suspended") await audioContext.resume();
            const midi = e.note.number;
            const vel = e.note.attack;
            const ch = e.message.channel;
            const id = `m:${ch}:${midi}`;
            playSample(midi, vel, id).catch(console.error);
        });

        input.addListener("noteoff", "all", (e) => {
            const midi = e.note.number;
            const ch = e.message.channel;
            stopSample(`m:${ch}:${midi}`);
        });
    }).catch(err => alert(err));

    const oscillatorPowerButton = document.getElementById('oscillatorPower');
    oscillatorPowerButton.addEventListener('click', function() {
        this.classList.toggle('active');
    });

    const waveformDropdown = document.getElementById("waveformDropdown");
    waveformDropdown.addEventListener("change", () => {
        updateWaveform(waveformDropdown.textContent.split("\n")[waveformDropdown.selectedIndex+1].toLocaleLowerCase().replace(/[^a-zA-Z0-9]/g, ""));
    });

    const LFOWaveformDropdown = document.getElementById("LFOWaveformDropdown");
    LFOWaveformDropdown.addEventListener("change", () => {
        updateLFOWaveform(LFOWaveformDropdown.textContent.split("\n")[LFOWaveformDropdown.selectedIndex+1].toLocaleLowerCase().replace(/[^a-zA-Z0-9]/g, ""));
    });

    const waveformSlider = document.getElementById("waveformSlider");
    waveformSlider.addEventListener("change", () => {
        updateWaveformSlider(waveformSlider.value / 100);
    });

    const LFOWaveformSlider = document.getElementById("LFOWaveformSlider");
    LFOWaveformSlider.addEventListener("change", () => {
        updateLFOWaveformSlider(LFOWaveformSlider.value / 100);
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
        OSCList.forEach(async (OSC, index) => {
            if (OSCTabs[index].value == "sample") {
                for (let i = 0; i < ENVList.length;i++) {
                    ENVList[i].port.postMessage({
                        command: 'resetIndex'
                    });
                    // ENVList[i].port.postMessage({
                    //     command: 'sustainOff'
                    // });
                }
                const response = await fetch('/osc-sample' + '?filename=' + filename + '&osc=' + `${index+1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'audio/wav'
                    }
                });
                const rawBuffer = await response.arrayBuffer();
                // let sampleFileName = document.getElementById("sampleSelect").options[document.getElementById("sampleSelect").selectedIndex].value;
                let sampleFileName = document.getElementById("openSampleInput").value;
                let OSCSample;
                try {
                    OSCSample = await audioContext.decodeAudioData(rawBuffer);
                } catch {
                    return;
                }
                // waveformNote = parseInt(filename.split(".")[0]);
                // updatePitch();
                OSC.port.postMessage({command: "setSamples", samples: Array.from(OSCSample.getChannelData(0)), fileName: sampleFileName.split("/").pop().split("\\").pop()})
                // document.getElementById("play").click();
            }
            else {
                // updatePitch();
                // document.getElementById("play").click();
            }
        });
        
        // let LFOKT = LFO1.parameters.get("frequency");
        // let currentLFOKT = waveformNote - 60;
        // let LFOTracking = parseInt(LFOKeyTracking.label.textContent) / 100;
        // let originalFreq = frequencyMod.freqInput.value;
        // LFOKT.setValueAtTime((originalFreq*(Math.pow(2, (currentLFOKT)/12))*(LFOTracking) + originalFreq*(1-LFOTracking))/2, audioContext.currentTime);
        // // document.getElementById("play").click();
    });

    document.getElementById('play').addEventListener('click',
        async () => {
            if (!init) {
                await setup();
                init = true;
            }
            // ENV1.port.postMessage({
            //     command: playing ? 'sustainOff' : 'sustainOn'
            // });
            // playing ? Filter1.disconnect(audioContext.destination) : ENV1.port.postMessage({
            //     command: 'resetIndex'
            // }), Filter1.connect(audioContext.destination);
            playing = true; // !playing;
        });
    async function frequencyModFunction () {
            if (!init) {
                await setup();
                init = true;
            }
            let freq = frequencyMod.freqInput.value;
        
            freq = freq * frequencyMod.numerator / frequencyMod.denominator;
            const modulatorFrequency = LFOList[currentLFO - 1].parameters.get('frequency');
            modulatorFrequency.setValueAtTime(freq, audioContext.currentTime);
            OSCList.forEach((OSC, index) => {
                OSC.port.postMessage({
                    command: 'resetSamples'
                });
            });
            FilterList.forEach((Filter, index) => {
                Filter.port.postMessage({
                    command: 'resetSamples'
                });
            });
            LFOList[currentLFO - 1].port.postMessage({
                command: 'resetSamples'
            });

    }
    frequencyMod.element.addEventListener('click', async () =>
        await frequencyModFunction()
        );
    frequencyMod.element.addEventListener('input', async () =>
        await frequencyModFunction()
    );
    amplitudeMod.element.addEventListener('input',
        async () => {
            if (!init) {
                await setup();
                init = true;
            }
            let amp = amplitudeMod.freqInput.value;
            const modulatorFrequency = LFOList[currentLFO - 1].parameters.get('amplitude');
            modulatorFrequency.setValueAtTime(amp, audioContext.currentTime);
            OSCList.forEach((OSC, index) => {
                OSC.port.postMessage({
                    command: 'resetSamples'
                });
            });
            FilterList.forEach((Filter, index) => {
                Filter.port.postMessage({
                    command: 'resetSamples'
                });
            });
            LFOList[currentLFO - 1].port.postMessage({
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
    attack.inputEl.addEventListener('change', () => {
            updateEnvelope();
        });
    decay.inputEl.addEventListener('change', () => {
            updateEnvelope();
        });
    sustain.inputEl.addEventListener('change', () => {
            updateEnvelope();
        });
    release.inputEl.addEventListener('change', () => {
            updateEnvelope();
        });
    resonance.inputEl.addEventListener('change', () => {
        let resonanceVal = parseInt(resonance.inputEl.value);
        if (FilterList == undefined) {
            return;
        }
        let resonanceParam = FilterList[currentFilter - 1].parameters.get('resonance');
        try {
            resonanceParam.setValueAtTime(resonanceVal / 100, audioContext.currentTime);
            OSCList[currentOSC - 1].port.postMessage({
                command: 'resetSamples'
            });
            LFOList[currentLFO - 1].port.postMessage({
                command: 'resetSamples'
            });
            FilterList[currentFilter - 1].port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        } 
    });
    phaseKnob.inputEl.addEventListener('change', () => {
        let phaseVal = parseInt(phaseKnob.inputEl.value);
        if (LFOList == undefined) {
            return;
        }
        let phase = LFOList[currentLFO - 1].parameters.get('phase');
        try {
            phase.setValueAtTime(phaseVal / 100, audioContext.currentTime);
            OSCList[currentOSC - 1].port.postMessage({
                command: 'resetSamples'
            });
            LFOList[currentLFO - 1].port.postMessage({
                command: 'resetSamples'
            });
            FilterList[currentFilter - 1].port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        } 
        });
    cutoff.inputEl.addEventListener('change', () => {
        let cutoffVal = parseInt(cutoff.inputEl.value);
        if (FilterList == undefined) {
            return;
        }
        let alpha = FilterList[currentFilter - 1].parameters.get('alpha');
        try {
            alpha.setValueAtTime(cutoffVal / 100, audioContext.currentTime);
            OSCList[currentOSC - 1].port.postMessage({
                command: 'resetSamples'
            });
            filterValues = [FilterChoice + 1,3,cutoff.inputEl.value];
            drawFilter(filterValues, document.getElementById("filterView"));
        } catch {

        }
    });
    function updatePitch () {
        let octave = parseInt(octaveKnob.inputEl.value);
        let semitone = parseInt(semitoneKnob.inputEl.value);
        let fine = parseInt(fineKnob.inputEl.value);
        if (OSCList == undefined) {
            return;
        }
        let carrierFrequency = OSCList[currentOSC - 1].parameters.get('frequency');
        noteShift = octave*12+semitone;
        try {
            carrierFrequency.setValueAtTime(440 * Math.pow(2, octave + semitone/12 + fine/12/100 + (waveformNote ?? 60 - 60)/12), audioContext.currentTime);
            OSCList[currentOSC - 1].port.postMessage({
                command: 'resetSamples'
            });
            FilterList[currentFilter - 1].port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        }
    }
    function updateWaveformSlider (value) {
        if (OSCList == undefined) {
            return;
        }
        let waveform = OSCList[currentOSC - 1].parameters.get('waveform');
        try {
            waveform.setValueAtTime(value, audioContext.currentTime);
            OSCList[currentOSC - 1].port.postMessage({
                command: 'resetSamples'
            });
            FilterList[currentFilter - 1].port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        }
    }
    function updateLFOWaveformSlider (value) {
        if (!LFO1) {
            return;
        }
        let waveform;
        if (currentLFO == 1) {
            waveform = LFO1.parameters.get('waveform');
        }
        if (currentLFO == 2) {
            waveform = LFO2.parameters.get('waveform');
        }
        if (currentLFO == 3) {
            waveform = LFO3.parameters.get('waveform');
        }
        try {
            waveform.setValueAtTime(value, audioContext.currentTime);
            LFO1.port.postMessage({
                command: 'resetSamples'
            });
            Filter1.port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        }
    }
    function updateWaveform (waveform) {
        if (OSCList == undefined) {
            return;
        }
        OSCList[currentOSC - 1].port.postMessage({
            command: waveform
        });
        OSCList[currentOSC - 1].port.postMessage({
            command: "resetSamples"
        });
        Filter1.port.postMessage({
                command: 'resetSamples'
        });
    }
    function updateLFOWaveform (waveform) {
        if (!LFO1) {
            return;
        }
        if (currentLFO == 1) {
            LFO1.port.postMessage({
                command: waveform
            });
            LFO1.port.postMessage({
                command: "resetSamples"
            });
        }
        if (currentLFO == 2) {
            LFO2.port.postMessage({
                command: waveform
            });
        }
        if (currentLFO == 3) {
            LFO3.port.postMessage({
                command: waveform
            });
        }
        Filter1.port.postMessage({
                command: 'resetSamples'
        });
    }
    function updateVolume () {
        let volume = parseInt(volumeSlider.label.textContent.replace("%", ""));
        if (!OSC1) {
            return;
        }
        let amplitude = OSCList[currentOSC - 1].parameters.get('amplitude');
        try {
            amplitude.setValueAtTime(volume / 100, audioContext.currentTime);
            OSCList[currentOSC - 1].port.postMessage({
                command: 'resetSamples'
            });
            FilterList[currentFilter - 1].port.postMessage({
                command: 'resetSamples'
            });
        } catch {
            
        }
    }
    function updateEnvelope() {
        envelopeValues = [parseFloat(attack.inputEl.value), parseFloat(decay.inputEl.value), parseFloat(sustain.inputEl.value), parseFloat(release.inputEl.value)];
        var envelopeCanvas = document.getElementById("envelopeView");
        drawEnvelope(envelopeValues, envelopeCanvas);
    }
    async function setup() {
        await audioContext.audioWorklet.addModule('OSC-processor.js');
        OSC1 = new AudioWorkletNode(audioContext, 'OSC-processor', {
            numberOfInputs: 4
        });
        OSC1.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        OSC2 = new AudioWorkletNode(audioContext, 'OSC-processor', {
            numberOfInputs: 4
        });
        OSC2.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        OSC3 = new AudioWorkletNode(audioContext, 'OSC-processor', {
            numberOfInputs: 4
        });
        OSC3.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        OSCList = [OSC1, OSC2, OSC3];
        await audioContext.audioWorklet.addModule('ENV-processor.js');
        ENV1 = new AudioWorkletNode(audioContext, 'ENV-processor');
        ENV1.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        ENV2 = new AudioWorkletNode(audioContext, 'ENV-processor');
        ENV2.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        ENV3 = new AudioWorkletNode(audioContext, 'ENV-processor');
        ENV3.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        ENVList = [ENV1, ENV2, ENV3];
        await audioContext.audioWorklet.addModule('LFO-processor.js');
        LFO1 = new AudioWorkletNode(audioContext, 'LFO-processor', {
            numberOfInputs: 3
        });
        LFO1.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        LFO2 = new AudioWorkletNode(audioContext, 'LFO-processor', {
            numberOfInputs: 3
        });
        LFO2.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        LFO3 = new AudioWorkletNode(audioContext, 'LFO-processor', {
            numberOfInputs: 3
        });
        LFO3.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        LFOList = [LFO1, LFO2, LFO3];
        await audioContext.audioWorklet.addModule('Filter-processor.js');
        Filter1 = new AudioWorkletNode(audioContext, 'Filter-processor', {
            numberOfInputs: 3
        });
        Filter1.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        Filter2 = new AudioWorkletNode(audioContext, 'Filter-processor', {
            numberOfInputs: 3
        });
        Filter2.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        Filter3 = new AudioWorkletNode(audioContext, 'Filter-processor', {
            numberOfInputs: 3
        });
        Filter3.port.postMessage({
            sampleRate: audioContext.sampleRate
        });
        FilterList = [Filter1, Filter2, Filter3];
        document.querySelectorAll('.toggle-button').forEach((btn, index) => {
            toggles[index] = new ToggleButton(btn);
            btn.addEventListener("click", () => {
                try {
                    if (index < 3) {
                        for (var ENV in ENVList) {
                            ENV.disconnect(OSCList[currentOSC - 1]);
                        }
                        toggles[index].isActive ? ENVList[index % 3].connect(OSCList[currentOSC - 1], 0, 3) : ENVList[index % 3].disconnect(OSCList[currentOSC - 1], 0, 3);
                    } else if (index < 6) {
                        toggles[index].isActive ? LFOList[index % 3].connect(OSCList[currentOSC - 1], 0, index % 3) : LFOList[index % 3].disconnect(OSCList[currentOSC - 1], 0, index % 3);
                    } else if (index < 9) {
                        toggles[index].isActive ? (OSCList[currentOSC - 1].connect(FilterList[index % 3], 0, index % 3), FilterList[index % 3].connect(audioContext.destination)) : (OSCList[currentOSC - 1].disconnect(FilterList[index % 3], 0, index % 3), OSCList[currentOSC - 1].connect(audioContext.destination));
                    } else if (index < 12) {
                        toggles[index].isActive ? (LFOList[index % 3].connect(LFOList[index % 3], 0, index % 3)) : (LFOList[index % 3].disconnect(LFOList[index % 3], 0, index % 3));
                    } else if (index < 15) {
                        FilterChoice = index - 12;
                        if (FilterChoice == 0) {
                            FilterList[currentFilter - 1].port.postMessage({command: "lowPass"});
                        }
                        if (FilterChoice == 1) {
                            FilterList[currentFilter - 1].port.postMessage({command: "bandPass"});
                        }
                        if (FilterChoice == 2) {
                            FilterList[currentFilter - 1].port.postMessage({command: "highPass"});
                        }
                        filterValues = [FilterChoice + 1,3,cutoff.inputEl.value];
                        drawFilter(filterValues, document.getElementById("filterView"));
                    }
                }
                catch {
                    
                }
                OSCList[currentOSC - 1].port.postMessage({command: "resetSamples"});
                LFOList[currentLFO - 1].port.postMessage({command: "resetSamples"});
            });
        });
        OSCList.forEach(OSC => {
            OSC.connect(audioContext.destination);
        });
        const carrierFrequency = OSC1.parameters.get('frequency');
        let freq = octaveKnob.inputEl.value;
        carrierFrequency.setValueAtTime(440 * Math.pow(2, freq), audioContext.currentTime);
        OSC1.port.onmessage = (event) => {
            const samples = event.data[0];
            var oscillatorCanvas = document.getElementById("oscillatorView");
            if (currentOSC == 1) {
                drawWaveForm(samples, oscillatorCanvas, event.data[1]);
            }
        };
        OSC2.port.onmessage = (event) => {
            const samples = event.data[0];
            var oscillatorCanvas = document.getElementById("oscillatorView");
            if (currentOSC == 2) {
                drawWaveForm(samples, oscillatorCanvas, event.data[1]);
            }
        };
        OSC3.port.onmessage = (event) => {
            const samples = event.data[0];
            var oscillatorCanvas = document.getElementById("oscillatorView");
            if (currentOSC == 3) {
                drawWaveForm(samples, oscillatorCanvas, event.data[1]);
            }
        };
        LFO1.port.onmessage = (event) => {
            const samples = event.data[0];
            var LFOCanvas = document.getElementById("LFOView");
            drawLFO(samples, LFOCanvas, event.data[1]);
        };
        LFO2.port.onmessage = (event) => {
            const samples = event.data[0];
            var LFOCanvas = document.getElementById("LFOView");
            drawLFO(samples, LFOCanvas, event.data[1]);
        };
        LFO3.port.onmessage = (event) => {
            const samples = event.data[0];
            var LFOCanvas = document.getElementById("LFOView");
            drawLFO(samples, LFOCanvas, event.data[1]);
        };
        ENV1.port.onmessage = (event) => {
            const values = event.data[0];
            var ENVCanvas = document.getElementById("envelopeView");
            drawEnvelope(values, ENVCanvas);
        };
        ENV2.port.onmessage = (event) => {
            const values = event.data[0];
            var ENVCanvas = document.getElementById("envelopeView");
            drawEnvelope(values, ENVCanvas);
        };
        ENV3.port.onmessage = (event) => {
            const values = event.data[0];
            var ENVCanvas = document.getElementById("envelopeView");
            drawEnvelope(values, ENVCanvas);
        };
        Filter1.port.onmessage = (event) => {
            const samples = event.data[0];
            var oscillatorCanvas = document.getElementById("oscillatorView");
            drawWaveForm(samples, oscillatorCanvas, event.data[1]);
        };
        Filter2.port.onmessage = (event) => {
            const samples = event.data[0];
            var oscillatorCanvas = document.getElementById("oscillatorView");
            drawWaveForm(samples, oscillatorCanvas, event.data[1]);
        };
        Filter3.port.onmessage = (event) => {
            const samples = event.data[0];
            var oscillatorCanvas = document.getElementById("oscillatorView");
            drawWaveForm(samples, oscillatorCanvas, event.data[1]);
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
        line.fillRect(0, 0, canvas.width, canvas.height);
        line.strokeStyle = '#FFFFFF';
        line.lineWidth = 0.4;
        line.moveTo(-0.5, canvas.height / 2 * 1 / devicePixelRatio);
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

    function drawEnvelope(values, canvas) {
        var line = canvas.getContext("2d");
        canvas.width = canvas.width;
        if (!canvasSet2) {
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            canvas.width = canvas.clientWidth * devicePixelRatio;
            canvas.height = canvas.clientHeight * devicePixelRatio;
            canvasSet2 = true;
        }
        line.scale(devicePixelRatio, devicePixelRatio);
        line.fillStyle = "#000000";
        line.fillRect(0, 0, canvas.width, canvas.height);
        line.strokeStyle = '#FFFFFF';
        line.lineWidth = 0.4;
        line.beginPath();
        line.moveTo(0.01, canvas.height * 1 / devicePixelRatio);
        const length = 40;
        line.lineTo(values[0]*length, (0) * 1 / devicePixelRatio);
        line.lineTo((values[1] + values[0])*length, (canvas.height - canvas.height*values[2]/100) * 1 / devicePixelRatio);
        line.moveTo((values[1] + values[0])*length, (canvas.height - canvas.height*values[2]/100) * 1 / devicePixelRatio);
        line.lineTo((values[3] + values[1] + values[0])*length, (canvas.height) * 1 / devicePixelRatio);
        line.stroke();
        line.beginPath();
        line.moveTo((values[1] + values[0])*length + 1, (canvas.height - canvas.height*values[2]/100) * 1 / devicePixelRatio);
        line.arc((values[1] + values[0])*length + 1, (canvas.height - canvas.height*values[2]/100) * 1 / devicePixelRatio, 3.5, 0, Math.PI * 2);
        line.fillStyle = '#FFFFFF';
        line.fill();
    }
    function drawLFO(samples, canvas, sampleName) {
        var line = canvas.getContext("2d");
        canvas.width = canvas.width;
        if (!canvasSet3) {
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            canvas.width = canvas.clientWidth * devicePixelRatio;
            canvas.height = canvas.clientHeight * devicePixelRatio;
            canvasSet3 = true;
        }
        line.scale(devicePixelRatio, devicePixelRatio);
        line.fillStyle = "#000000";
        line.fillRect(0, 0, canvas.width, canvas.height);
        line.strokeStyle = '#FFFFFF';
        line.lineWidth = 0.4;
        line.moveTo(-0.5, canvas.height / 2 * 1 / devicePixelRatio);
        for (let i = 0; i < samples.length; i++) {
            line.lineTo(i, canvas.height / 2 * (5 + samples[i] - 1) / 5 * 1 / devicePixelRatio);
        }
        line.stroke();
        line.font = "20px Arial";
        line.fillStyle = "white";
        line.textAlign = "left";
        line.textBaseline = "top";
        line.fillText(sampleName, 0, 0);
    }
    function drawFilter(values, canvas) {
        var line = canvas.getContext("2d");
        canvas.width = canvas.width;
        if (!canvasSet4) {
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            canvas.width = canvas.clientWidth * devicePixelRatio;
            canvas.height = canvas.clientHeight * devicePixelRatio;
            canvasSet4 = true;
        }
        line.scale(devicePixelRatio, devicePixelRatio);
        line.fillStyle = "#000000";
        line.fillRect(0, 0, canvas.width, canvas.height);
        line.strokeStyle = '#FFFFFF';
        line.lineWidth = 0.4;
        line.beginPath();
        const length = 20;
        let xVal1;
        let xVal2;
        let xVal3;
        let xVal4;
        if (values[0] == 2) {
            xVal1 = 0;
            xVal2 = 0.25;
            xVal3 = 0.75;
            xVal4 = 1;
        }
        if (values[0] == 1) {
            xVal1 = -1;
            xVal2 = -0.5;
            xVal3 = 0.5;
            xVal4 = 1;
        }
        if (values[0] == 3) {
            xVal1 = 0;
            xVal2 = 0.5;
            xVal3 = 1.5;
            xVal4 = 2;
        }
        let xxDot;
        let yyDot;
        let xxDot2;
        let yyDot2;
        let dotChosen = false;
        const linePoints = [[xVal1,1],[xVal2,1],[xVal2,-1],[xVal3,-1],[xVal3,1],[xVal4,1]];
        for (let i = 0; i < linePoints.length; i++) {
            const constants = [
                [1],
                [1, 1]
            ];
            
            for (let anchor = 1; anchor < linePoints.length - 1; anchor++) {
                const nextNums = [1];
                for (let traverse = 0; traverse < constants[anchor].length - 1; traverse++) {
                    const nextNum = constants[anchor][traverse] + constants[anchor][traverse + 1];
                    nextNums.push(nextNum);
                }
                nextNums.push(1);
                constants.push(nextNums);
            }

            const samples = 1000;
            if (linePoints.length === 0) continue;

            let xx, yy;
            let BPAdjust = values[0] == 2 ? 2 : 1;
            for (let j = 0; j <= samples; j++) {
                xx = 0.0;
                yy = 0.0;
                for (let anchor = 0; anchor < linePoints.length; anchor++) {
                    const coeff = constants[linePoints.length - 1][anchor];
                    const basis = Math.pow((samples - j) / samples, linePoints.length - anchor - 1) *
                                Math.pow(j / samples, anchor);
                    xx += coeff * basis * linePoints[anchor][0];
                    yy += coeff * basis * linePoints[anchor][1];
                }
                if ((j * BPAdjust) / (samples) >= (values[0] == 1 ? 0.5 : 0) + values[2] / (100 * (values[0] == 2 ? 1 : 2)) && !dotChosen) {
                    xxDot = xx;
                    yyDot = yy;
                    dotChosen = true;
                }
                if (values[0] == 2 && (samples - j) / samples >= values[2] / 100 / 2) {
                    xxDot2 = xx;
                    yyDot2 = yy;
                }
                line.lineTo(xx*canvas.width * 1 / devicePixelRatio, (canvas.height / 2 + (values[1]/3)*yy*canvas.height / 2) * 1 / devicePixelRatio);
            }
        }
        line.stroke();
        line.beginPath();
        line.strokeStyle = '#000';
        line.lineWidth = 1.2;
        line.moveTo(linePoints[0][0]*canvas.width * 1 / devicePixelRatio, (canvas.height / 2 + (values[1]/3)*linePoints[0][1]*canvas.height / 2) * 1 / devicePixelRatio);
        line.lineTo(linePoints[linePoints.length - 1][0]*canvas.width * 1 / devicePixelRatio, (canvas.height / 2 + (values[1]/3)*linePoints[linePoints.length - 1][1]*canvas.height / 2) * 1 / devicePixelRatio);
        line.stroke();
        line.beginPath();
        line.moveTo(xxDot*canvas.width * 1 / devicePixelRatio, (canvas.height / 2 + (values[1]/3)*yyDot*canvas.height / 2) * 1 / devicePixelRatio);
        line.arc(xxDot*canvas.width * 1 / devicePixelRatio, (canvas.height / 2 + (values[1]/3)*yyDot*canvas.height / 2) * 1 / devicePixelRatio, 3.5, 0, Math.PI * 2);
        line.fill();
        if (values[0] == 2) {
            line.moveTo(xxDot2*canvas.width * 1 / devicePixelRatio, (canvas.height / 2 + (values[1]/3)*yyDot2*canvas.height / 2) * 1 / devicePixelRatio);
            line.arc(xxDot2*canvas.width * 1 / devicePixelRatio, (canvas.height / 2 + (values[1]/3)*yyDot2*canvas.height / 2) * 1 / devicePixelRatio, 3.5, 0, Math.PI * 2);
        }
        line.fillStyle = '#FFFFFF';
        line.fill();
    }
});
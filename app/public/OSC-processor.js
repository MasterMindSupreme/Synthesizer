class OSCProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{
                name: 'frequency',
                defaultValue: 440,
                minValue: 20,
                maxValue: 20000,
            },
            {
                name: 'amplitude',
                defaultValue: 0.75,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }

    constructor() {
        super();
        this.phase = 0;
        this.sampleRate = 48000;

        // NEW: morph state (0..1) and target waveform
        this.morphAmount = 0.0;          // 0 = pure sine, 1 = pure target
        this.morphTarget = 'triangle';   // 'triangle' | 'square' | 'sawtooth'
        
        this.samples = [];

        this.port.onmessage = (event) => {
            if (event.data.sampleRate) {
                this.sampleRate = event.data.sampleRate;
            }
            if (event.data.command === "resetSamples"){
                this.samples = [];
            }

            // NEW: accept morph messages from play.js
            if (event.data.command === 'setMorphAmount') {
                // clamp
                const v = Number(event.data.value);
                this.morphAmount = Math.max(0, Math.min(1, isFinite(v) ? v : 0));
            }
            if (event.data.command === 'setMorphTarget') {
                this.morphTarget = (event.data.value || 'triangle');
            }
        };
    }

    // target waveform sample from phase
    targetSample(phase) {
        switch (this.morphTarget) {
        case 'square': {
            const s = Math.sin(phase);
            return s === 0 ? 1 : Math.sign(s);
        }
        case 'triangle': {
            return (2 / Math.PI) * Math.asin(Math.sin(phase));
        }
        case 'sawtooth': {
            const p = phase % (2 * Math.PI);
            return (p / Math.PI) - 1;
        }
        default:
            return Math.sin(phase);
        }
    }

    process(inputs, outputs, parameters) {
        const input1 = inputs[0];
        const input2 = inputs[1];
        const output = outputs[0];
        const frequency = parameters.frequency;
        const amplitude = parameters.amplitude;
        const hertz = Math.PI * 2 / this.sampleRate;
        for (let i = 0; i < output[0].length; i++) {
            const currentFrequency = frequency.length === 1 ? frequency[0] : frequency[i];
            const currentAmplitude = amplitude.length === 1 ? amplitude[0] : amplitude[i];            
            for (let channel = 0; channel < output.length; channel++) {
                this.phase += currentFrequency * hertz * (input1[channel] == null ? 1 : input1[channel][i]);

                // const sample = currentAmplitude * Math.sin(this.phase);
                // output[channel][i] = sample * (input2[channel] == null ? 1 : input2[channel][i]);

                // base (sine) and target, then morph
                const s = Math.sin(this.phase);
                const t = this.targetSample(this.phase);
                const m = this.morphAmount;                 // 0..1
                const mixed = (1 - m) * s + m * t;          // linear crossfade

                // ENV multiplier (default 1)
                const env = (input2[channel] == null ? 1 : input2[channel][i]);

                const sample = mixed * currentAmplitude * env;
                output[channel][i] = sample;

                if (this.samples.length == 1000) {
                    this.port.postMessage(this.samples);
                    this.samples.push(sample);
                } else {
                    this.samples.push(sample);
                }
            }
            if (this.phase >= 2 * Math.PI) {
                this.phase -= 2 * Math.PI;
            }
        }
        return true;
    }
}

registerProcessor('OSC-processor', OSCProcessor);
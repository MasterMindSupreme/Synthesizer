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
        this.port.onmessage = (event) => {
            if (event.data.sampleRate) {
                this.sampleRate = event.data.sampleRate;
            }
            if (event.data.command === "resetSamples"){
                this.samples = [];
            }
        };
        this.samples = [];
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
                const sample = currentAmplitude * Math.sin(this.phase);
                output[channel][i] = sample * (input2[channel] == null ? 1 : input2[channel][i]);
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
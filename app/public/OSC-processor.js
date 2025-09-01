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
            {
                name: 'waveform',
                defaultValue: 0,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }

    constructor() {
        super();
        this.phase = 0;
        this.index = 0;
        this.play = true;
        this.sampleRate = 48000;
        this.sampled = true;
        this.waveType = "triangle";
        this.fileName = "";
        this.pushedSamples = false;
        this.samples = [];
        this.inputSamples = [];
        this.sampleIndex = [];
        this.maxSamples = [];
        this.port.onmessage = (event) => {
            if (event.data.sampleRate) {
                this.sampleRate = event.data.sampleRate;
            }
            if (event.data.command === "resetSamples"){
                this.samples = [];
                this.pushedSamples = false;
            }
            if (event.data.command === "setSamples"){
                this.samples = [];
                this.inputSamples.push(event.data.samples);
                this.maxSamples.push(event.data.samples.length);
                this.sampleIndex.push(this.index);
                this.sampled = true;
                this.fileName = event.data.fileName;
                this.pushedSamples = false;
            }
            if (event.data.command === "triangle"){
                this.waveType = "triangle";
            }
            if (event.data.command === "sawtooth"){
                this.waveType = "sawtooth";
            }
            if (event.data.command === "square"){
                this.waveType = "square";
            }
            if (event.data.play != null) {
                this.play = event.data.play;
            }
            if (event.data.sampled != null) {
                this.sampled = event.data.sampled;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input1 = inputs[0];
        const input2 = inputs[1];
        const input3 = inputs[2];
        const inputENV = inputs[3];
        const output = outputs[0];
        const frequency = parameters.frequency;
        const amplitude = parameters.amplitude;
        const waveform = parameters.waveform;
        const hertz = Math.PI * 2 / this.sampleRate;
        for (let i = 0; i < output[0].length; i++) {
            const currentFrequency = frequency.length === 1 ? frequency[0] : frequency[i];
            const currentAmplitude = amplitude.length === 1 ? amplitude[0] : amplitude[i];
            for (let channel = 0; channel < output.length; channel++) {
                let sample = 0;
                if (this.play) {
                    if (this.sampled && this.inputSamples.length > 0) {
                        sample = 0;
                        for (let j = 0;j < this.inputSamples.length;j++){
                            const index = this.index - this.sampleIndex[j];
                            if (index >= this.inputSamples[j].length) {
                                continue;
                            }
                            sample += currentAmplitude * (input1[0] == null ? this.inputSamples[j][index] : (this.inputSamples[j][Math.floor(index)]*(1 - index % 1) + this.inputSamples[j][Math.ceil(index)]*(index % 1)));
                        }
                        output[channel][i] = sample / 3;
                        if (this.sampleIndex[this.sampleIndex.length - 1] + this.inputSamples[this.inputSamples.length - 1].length <= this.index) {
                            this.inputSamples = [];
                            this.maxSamples = [];
                            this.sampleIndex = [];
                            this.index = 0;
                        }
                    } else if (!this.sampled) {
                        this.phase += (currentFrequency * hertz) * (input1[channel] == null ? 1 : input1[channel][i]) * (input2[channel] == null ? 1 : input2[channel][i]) * (input3[channel] == null ? 1 : input3[channel][i]);
                        let sharp = 0.5;
                        let slant = 0.00000001;
                        let sharper = 1/slant;
                        if (this.waveType == "sawtooth") {
                            sharp = 0.5 + waveform * 0.5;
                            slant = 0.00000001 + waveform * 0.9999999;
                            sharper = 1/slant;
                            sample = Math.asin(sharp*sharper*Math.sin(Math.atan(slant*(Math.sin(this.phase)/(1-slant*Math.cos(this.phase))))))/(sharp)*(1-sharp/2.75);
                        }
                        if (this.waveType == "square") {
                            sample = Math.sin(this.phase)/Math.pow(Math.sin(this.phase)**2, waveform/2)*0.97;
                        }
                        if (this.waveType == "triangle") {
                            sharp = 0.5 + waveform * 0.5;
                            slant = 0.00000001;
                            sharper = 1/slant;
                            sample = Math.asin(sharp*sharper*Math.sin(Math.atan(slant*(Math.sin(this.phase)/(1-slant*Math.cos(this.phase))))))/(sharp)*(1-sharp/2.75);
                        }
                        sample = currentAmplitude * sample / 3;
                        output[channel][i] = sample * (inputENV[channel] == null ? 1 : inputENV[channel][i]);
                        if (this.samples.length == 1000 && !this.pushedSamples){
                            this.port.postMessage([this.samples, this.fileName]);
                            this.pushedSamples = true;
                        } else if (this.samples.length <= 1000) {
                            this.samples.push(sample);
                        }
                    }
                    if (!this.sampled) {
                        if (this.samples.length == 1000) {
                            this.port.postMessage([this.samples, ""]);
                            this.samples.push(sample);
                            this.pushedSamples = true;
                        } else if (!this.pushedSamples) {
                            this.samples.push(sample);
                        }
                    }
                } else {
                    output[channel][i] = 0;
                }
            }
            if (this.phase >= 2 * Math.PI) {
                this.phase -= 2 * Math.PI;
            }
            if (this.sampled) {
                let increment = (input1[0] == null ? 0 : input1[0][i]) + (input2[0] == null ? 0 : input2[0][i]) + (input3[0] == null ? 0 : input3[0][i]);
                this.index = this.index + (increment == 0 ? 1 : increment);
            } else {
                this.index++;
            }
        }
        return true;
    }
}

registerProcessor('OSC-processor', OSCProcessor);
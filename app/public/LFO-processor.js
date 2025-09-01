class LowFrequencyOscillator extends AudioWorkletProcessor {
	static get parameterDescriptors() {
		return [{
				name: 'frequency',
				defaultValue: 440,
				minValue: 0,
				maxValue: 20000,
			},
			{
				name: 'amplitude',
				defaultValue: 1,
				minValue: 0,
				maxValue: 1000,
			},
			{
				name: 'waveform',
				defaultValue: 0,
				minValue: 0,
				maxValue: 1,
			},
			{
				name: 'phase',
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
			},
			{
				name: 'lift',
				defaultValue: 1,
				minValue: -4,
				maxValue: 4,
			},
		];
	}

	constructor() {
		super();
		this.phase = 0;
		this.sampleRate = 48000;
		this.samples = [];
        this.waveType = "triangle";
		this.port.onmessage = (event) => {
			if (event.data.sampleRate) {
				this.sampleRate = event.data.sampleRate;
			}
            if (event.data.command === "resetSamples"){
                this.samples = [];
                this.pushedSamples = false;
                this.sampled = false;
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
		};
	}

	process(inputs, outputs, parameters) {
		const input1 = inputs[0];
		const input2 = inputs[1];
		const input3 = inputs[2];
		const output = outputs[0];
		const frequency = parameters.frequency;
		const amplitude = parameters.amplitude;
        const waveform = parameters.waveform;
		const lift = parameters.lift;
		const phase = parameters.phase;
		const hertz = Math.PI * 2 / sampleRate;
		for (let i = 0; i < output[0].length; i++) {
			const currentFrequency = frequency.length === 1 ? frequency[0] : frequency[i];
			const currentAmplitude = amplitude.length === 1 ? amplitude[0] : amplitude[i];
			const currentPhase = phase.length === 1 ? phase[0] : phase[i];
			const currentLift = lift.length === 1 ? lift[0] : lift[i];
			let sample;
			for (let channel = 0; channel < output.length; channel++) {
				this.phase += currentFrequency * hertz * (input1[channel] == null ? 1 : input1[channel][i]) * (input2[channel] == null ? 1 : input2[channel][i]) * (input3[channel] == null ? 1 : input3[channel][i]);
				let sharp = 0.5;
				let slant = 0.00000001;
				let sharper = 1/slant;
				if (this.waveType == "sawtooth") {
					sharp = 0.5 + waveform * 0.5;
					slant = 0.00000001 + waveform * 0.9999999;
					sharper = 1/slant;
					sample = Math.asin(sharp*sharper*Math.sin(Math.atan(slant*(Math.sin(this.phase + currentPhase * Math.PI * 2)/(1-slant*Math.cos(this.phase + currentPhase * Math.PI * 2))))))/(sharp)*(1-sharp/2.75);
				}
				if (this.waveType == "square") {
					sample = Math.sin(this.phase + currentPhase * Math.PI * 2)/Math.pow(Math.sin(this.phase + currentPhase * Math.PI * 2)**2, waveform/2)*0.97;
				}
				if (this.waveType == "triangle") {
					sharp = 0.5 + waveform * 0.5;
					slant = 0.00000001;
					sharper = 1/slant;
					sample = Math.asin(sharp*sharper*Math.sin(Math.atan(slant*(Math.sin(this.phase + currentPhase * Math.PI * 2)/(1-slant*Math.cos(this.phase + currentPhase * Math.PI * 2))))))/(sharp)*(1-sharp/2.75);
				}
				sample = currentAmplitude * sample + currentLift;
				output[channel][i] = sample;
			}
			if (this.phase >= 2 * Math.PI) {
				this.phase -= 2 * Math.PI;
			}
			if (this.samples.length == 1000) {
				this.port.postMessage([this.samples, ""]);
				this.samples.push(sample);
				this.pushedSamples = true;
			} else if (!this.pushedSamples) {
				this.samples.push(sample);
			}
		}
		return true;
	}
}

registerProcessor('LFO-processor', LowFrequencyOscillator);
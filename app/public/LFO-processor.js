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
				maxValue: 100,
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
		};
	}

	process(inputs, outputs, parameters) {
		const output = outputs[0];
		const frequency = parameters.frequency;
		const amplitude = parameters.amplitude;
		const hertz = Math.PI * 2 / sampleRate;
		for (let i = 0; i < output[0].length; i++) {
			const currentFrequency = frequency.length === 1 ? frequency[0] : frequency[i];
			const currentAmplitude = amplitude.length === 1 ? amplitude[0] : amplitude[i];
			for (let channel = 0; channel < output.length; channel++) {
				this.phase += currentFrequency * hertz;
				const sample = currentAmplitude * Math.sin(this.phase) + 1;
				output[channel][i] = sample;
			}
			if (this.phase >= 2 * Math.PI) {
				this.phase -= 2 * Math.PI;
			}
		}
		return true;
	}
}

registerProcessor('LFO-processor', LowFrequencyOscillator);
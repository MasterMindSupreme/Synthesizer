class FilterProcessor extends AudioWorkletProcessor {

    static get parameterDescriptors() {
        return [{
                name: 'alpha',
                defaultValue: 0.0,
                minValue: 0.0,
                maxValue: 1.0,
            },
            {
                name: 'resonance',
                defaultValue: 0.0,
                minValue: 0.0,
                maxValue: 1
            },
        ];
    }

    constructor() {
        super();
        this.samples = [];
        this.filterType = "lowPass";
        this.M = 1;
        this.N = 1;
        this.index = 0;
        this.sampleRate = 48000;
        this.x_history = new Array(this.M + 1).fill(0);
        this.y_history = new Array(this.N + 1).fill(0);
        this.port.onmessage = (event) => {
            if (event.data.sampleRate) {
                this.sampleRate = event.data.sampleRate;
            }
            if (event.data.command === "resetSamples"){
                this.samples = [];
            }
            if (event.data.command === "lowPass"){
                this.filterType = "lowPass";
            }
            if (event.data.command === "bandPass"){
                this.filterType = "bandPass";
            }
            if (event.data.command === "highPass"){
                this.filterType = "highPass";
            }
        };
    }

    highPass(fc, Q) {
        // Logic does not work correctly, but is left here 
        // because of the interesting results
        const omega = 2 * Math.PI * fc / this.sampleRate;
        const alpha = Math.sin(omega) / (2 * Q);
        const cos_omega = Math.cos(omega);

        const b0 =  (1 + cos_omega) / 2;
        const b1 = -(1 + cos_omega);
        const b2 =  (1 + cos_omega) / 2;
        const a0 =  1 + alpha;
        const a1 = -2 * cos_omega;
        const a2 =  1 - alpha;

        return {
            b: [b0 / a0, b1 / a0, b2 / a0],
            a: [1, a1 / a0, a2 / a0]
        };
    }

    process(inputs, outputs, parameters) {
        const input1 = inputs[0][0] ?? [null];
        const input2 = inputs[1][0] ?? [null];
        const input3 = inputs[2][0] ?? [null];
        const output = outputs[0];
		const alpha = parameters.alpha;
		const resonance = parameters.resonance;
        for (let i = 0; i < output[0].length; i++) {
            let sample;
            for (let channel = 0; channel < output.length; channel++) {
                const currentAlpha = alpha.length === 1 ? alpha[0] : alpha[i];
                const currentCutOff = 20*(2**(currentAlpha*10));
                const currentResonance = resonance.length === 1 ? resonance[0] : resonance[i];
                const currentQ = 2**(1/2)/2 + (currentResonance**2) * 15;
                if (this.filterType == "lowPass"){
                    this.b_coeffs = [1, currentAlpha];
                    this.a_coeffs = [-(1-currentAlpha), 1-currentResonance];
                }
                if (this.filterType == "bandPass"){
                    // Not implemented yet
                    this.b_coeffs = [1];
                    this.a_coeffs = [1];
                }
                if (this.filterType == "highPass"){
                    let coeff = this.highPass(currentCutOff, currentQ);
                    this.b_coeffs = [coeff.b[0], coeff.b[1], coeff.b[2]];
                    this.a_coeffs = [coeff.a[0], coeff.a[1], coeff.a[2]];
                }
                this.M = this.b_coeffs.length - 1;
                this.N = this.a_coeffs.length - 1;
                for (let j = this.M; j > 0; j--) {
                    this.x_history[j] = this.x_history[j - 1];
                }
                this.x_history[0] = input1[i] ?? 0 + input2[i] ?? 0 + input3[i] ?? 0;
                let current_output = 0.0;
                for (let j = 0; j < this.b_coeffs.length; j++) {
                    current_output += this.b_coeffs[j] * this.x_history[j];
                }
                for (let j = 0; j < this.a_coeffs.length; j++) {
                    current_output -= this.a_coeffs[j] * this.y_history[j];
                    if (Number.isNaN(current_output) || !Number.isFinite(current_output)) {
                        current_output = 0;
                    }
                }
                sample = current_output;
                for (let j = this.N; j > 0; j--) {
                    this.y_history[j] = this.y_history[j - 1];
                }
                this.y_history[0] = current_output;
                for (let channel = 0; channel < output.length; channel++) {
                    output[channel][i] = sample;
                }
                if (this.samples.length == 1000) {
                    this.port.postMessage([this.samples, ""]);
                    this.samples.push(sample);
                    this.pushedSamples = true;
                } else {
                    this.samples.push(sample);
                }
            }
        this.index++;
        }
        return true;
    }
}

registerProcessor('Filter-processor', FilterProcessor);
const initialAlpha = 0.25;

class FilterProcessor extends AudioWorkletProcessor {

    static get parameterDescriptors() {
        return [{
                name: 'alpha',
                defaultValue: initialAlpha,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }

    constructor() {
        super();
        this.samples = [];
        this.M = 1;
        this.N = 1;
        this.x_history = new Array(this.M + 1).fill(0);
        this.y_history = new Array(this.N + 1).fill(0);
        this.b_coeffs = [initialAlpha];
        this.a_coeffs = [-(1 - initialAlpha)];
        this.port.onmessage = (event) => {
            if (event.data.command === "resetSamples"){
                this.samples = [];
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input1 = inputs[0][0];
        const output = outputs[0];
		const alpha = parameters.alpha;
        for (let i = 0; i < output[0].length; i++) {
            let sample;
            for (let channel = 0; channel < output.length; channel++) {
                
                const currentAlpha = alpha.length === 1 ? alpha[0] : alpha[i];
                this.b_coeffs = [currentAlpha];
                this.a_coeffs = [-(1-currentAlpha)];
                this.M = this.b_coeffs.length - 1;
                this.N = this.a_coeffs.length - 1;
                this.x_history = new Array(this.M + 1).fill(0);
                this.y_history = new Array(this.N + 1).fill(0);
                for (let j = this.M; j > 0; j--) {
                    this.x_history[j] = this.x_history[j - 1];
                }
                this.x_history[0] = input1[i];
                let current_output = 0.0;
                for (let j = 0; j < this.b_coeffs.length; j++) {
                    current_output += this.b_coeffs[j] * this.x_history[j];
                }
                for (let j = 0; j < this.a_coeffs.length; j++) {
                    current_output -= this.a_coeffs[j] * this.y_history[j];
                }
                sample = current_output * 1;
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
        }
        return true;
    }
}

registerProcessor('Filter-processor', FilterProcessor);
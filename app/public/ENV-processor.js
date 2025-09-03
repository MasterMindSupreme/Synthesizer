class ENVProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{
                name: 'attack',
                defaultValue: 0.25,
                minValue: 0,
                maxValue: 10,
            },
            {
                name: 'decay',
                defaultValue: 0.0,
                minValue: 0,
                maxValue: 10,
            },
            {
                name: 'sustain',
                defaultValue: 1.0,
                minValue: 0,
                maxValue: 1,
            },
            {
                name: 'release',
                defaultValue: 0.5,
                minValue: 0,
                maxValue: 10,
            },
        ];
    }

    constructor() {
        super();
        this.index = 0;
        this.sample = 0;
        this.sampleRate = 48000;
        this.port.onmessage = (event) => {
            if (event.data.sampleRate) {
                this.sampleRate = event.data.sampleRate;
            }
            if (event.data.command === "resetIndex"){
                this.index = 0;
            }
            if (event.data.command === "sustainOn"){
                this.sustainOn = true;
            }
            if (event.data.command === "sustainOff"){
                this.sustainOn = false;
            }
        };
        this.sustainOn = false;
    }

    process(inputs, outputs, parameters) {
        const input1 = inputs[0];
        const output = outputs[0];
        const attack = parameters.attack;
        const decay = parameters.decay;
        const sustain = parameters.sustain;
        const release = parameters.release;
        for (let i = 0; i < output[0].length; i++) {
            const currentAttack = attack.length === 1 ? attack[0] : attack[i];
            const currentDecay = decay.length === 1 ? decay[0] : decay[i];
            const currentSustain = sustain.length === 1 ? sustain[0] : sustain[i];
            const currentRelease = release.length === 1 ? release[0] : release[i]; 
            if (this.index == 0) {
                this.sample = 0;
                this.port.postMessage([attack, decay, sustain, release]);
            }
            for (let channel = 0; channel < output.length; channel++) {
                if (this.index < this.sampleRate * currentAttack) {
                    this.sample += 1 / (this.sampleRate * currentAttack);
                } else if (this.index < this.sampleRate * (currentAttack + currentDecay)) {
                    this.sample = 1 - (1 - currentSustain) * ((this.index - currentAttack * this.sampleRate) / (currentDecay * this.sampleRate));
                } else if (this.sustainOn) {
                    this.index--;
                } else if (this.index < this.sampleRate * (currentAttack + currentDecay + currentRelease)) {
                    this.sample = currentSustain - (this.index - this.sampleRate * (currentAttack + currentDecay)) / (this.sampleRate * currentRelease) * (currentSustain);
                } else {
                    this.sample = 0;
                }
                output[channel][i] = this.sample;
            }
            this.index++;
        }
        return true;
    }
}

registerProcessor('ENV-processor', ENVProcessor);
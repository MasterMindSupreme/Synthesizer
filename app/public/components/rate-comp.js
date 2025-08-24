export class Rate {
    constructor(id, parentElement, title ,initialFreq = 0) {
        this.id = id;
        this.title = title;
        this.frequency = initialFreq;
        this.numerator = 1;
        this.denominator = 1;
        this.isMultMode = false;
        this.parentElement = parentElement;
        
        this.createComponent();
        this.attachEventListeners();
    }

    createComponent() {
        const template = document.getElementById('rate-component-template');
        if (!template) {
            // Create component dynamically if template doesn't exist
            this.element = this.createComponentFromScratch();
        } else {
            this.element = template.cloneNode(true);
            this.element.id = `rate-component-${this.id}`;
            this.element.style.display = 'block';
        }

        if (this.title == "Amp"){
            this.element.querySelector("#HertzLabel").remove();
        }

        // Get references to all interactive elements
        this.freqInput = this.element.querySelector('.rate-freq-input');
        this.numeratorInput = this.element.querySelector('.rate-numerator');
        this.denominatorInput = this.element.querySelector('.rate-denominator');
        this.multToggle = this.element.querySelector('.rate-mult-toggle');
        this.slider = this.element.querySelector('.rate-slider');
        
        // Arrow buttons
        this.numUp = this.element.querySelector('.rate-num-up');
        this.numDown = this.element.querySelector('.rate-num-down');
        this.denomUp = this.element.querySelector('.rate-denom-up');
        this.denomDown = this.element.querySelector('.rate-denom-down');

        // Set initial values
        this.freqInput.value = this.frequency;
        this.slider.value = this.frequency;

        // Append to parent
        if (this.parentElement) {
            this.parentElement.appendChild(this.element);
        }
        this.element.querySelector('.rate-title').textContent = this.title;
    }

    attachEventListeners() {
        // Mult toggle button
        this.multToggle.addEventListener('click', () => {
            this.toggleMultMode();
        });

        // Frequency input
        this.freqInput.addEventListener('input', (e) => {
            this.frequency = parseFloat(e.target.value) || 0;
            this.slider.value = this.frequency;
            this.onValueChange();
        });

        // Slider
        this.slider.addEventListener('input', (e) => {
            this.frequency = parseFloat(e.target.value);
            this.freqInput.value = this.frequency;
            this.onValueChange();
        });

        // Numerator controls
        this.numeratorInput.addEventListener('input', (e) => {
            this.numerator = Math.max(1, parseInt(e.target.value) || 1);
            this.onValueChange();
        });

        this.numUp.addEventListener('click', () => {
            this.numerator++;
            this.numeratorInput.value = this.numerator;
            this.onValueChange();
        });

        this.numDown.addEventListener('click', () => {
            this.numerator = Math.max(1, this.numerator - 1);
            this.numeratorInput.value = this.numerator;
            this.onValueChange();
        });

        // Denominator controls
        this.denominatorInput.addEventListener('input', (e) => {
            this.denominator = Math.max(1, parseInt(e.target.value) || 1);
            this.onValueChange();
        });

        this.denomUp.addEventListener('click', () => {
            this.denominator++;
            this.denominatorInput.value = this.denominator;
            this.onValueChange();
        });

        this.denomDown.addEventListener('click', () => {
            this.denominator = Math.max(1, this.denominator - 1);
            this.denominatorInput.value = this.denominator;
            this.onValueChange();
        });

        // Keyboard shortcuts for arrow keys when inputs are focused
        this.numeratorInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.numUp.click();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.numDown.click();
            }
        });

        this.denominatorInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.denomUp.click();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.denomDown.click();
            }
        });
    }

    toggleMultMode() {
        this.isMultMode = !this.isMultMode;
        
        if (this.isMultMode) {
            this.element.classList.add('mult-mode');
            this.multToggle.classList.add('active');
        } else {
            this.element.classList.remove('mult-mode');
            this.multToggle.classList.remove('active');
        }
        
        this.onValueChange();
    }

    getValue() {
        if (this.isMultMode) {
            return {
                mode: 'multiplier',
                numerator: this.numerator,
                denominator: this.denominator,
                value: this.numerator / this.denominator
            };
        } else {
            return {
                mode: 'frequency',
                value: this.frequency
            };
        }
    }

    setValue(value) {
        if (typeof value === 'object') {
            if (value.mode === 'multiplier') {
                this.isMultMode = true;
                this.numerator = value.numerator || 1;
                this.denominator = value.denominator || 1;
                this.numeratorInput.value = this.numerator;
                this.denominatorInput.value = this.denominator;
                this.element.classList.add('mult-mode');
                this.multToggle.classList.add('active');
            } else {
                this.isMultMode = false;
                this.frequency = value.value || 0;
                this.freqInput.value = this.frequency;
                this.slider.value = this.frequency;
                this.element.classList.remove('mult-mode');
                this.multToggle.classList.remove('active');
            }
        } else {
            this.frequency = value;
            this.freqInput.value = this.frequency;
            this.slider.value = this.frequency;
        }
    }

    onValueChange() {
        // Dispatch custom event for value changes
        const event = new CustomEvent('rateChange', {
            detail: this.getValue()
        });
        this.element.dispatchEvent(event);
    }

    // Method to programmatically set the mode
    setMode(isMultMode) {
        if (this.isMultMode !== isMultMode) {
            this.toggleMultMode();
        }
    }
}
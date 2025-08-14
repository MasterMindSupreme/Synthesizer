export let globalKnobIndex = 1;
export class Knob {
    constructor(knobIndex, parent, title, values) {
        this.knobIndex = knobIndex;
        this.config = {
            elementId: `knob-component-num${this.knobIndex}`,
            title: title,
            min: values[0],
            max: values[values.length - 1],
            // Defines the values you want to see labeled on the dial
            labels: values,
            initialValue: 0,
            // The angle range for the knob's rotation in degrees.
            // -135 is bottom-left, 135 is bottom-right.
            angleRange: {
                start: -135,
                end: 135
            }
        };
        // --- Knob Logic ---
        if (this.knobIndex == 1) {
            this.knobContainer = document.getElementById("knob-component-num1");
            this.knobContainer.remove();
            this.knobContainer.style = "display: block;";
            parent.appendChild(this.knobContainer);
        } else {
            let newKnob = document.getElementById("knob-component-num1").cloneNode([true]);
            newKnob.id = `knob-component-num${this.knobIndex}`;
            newKnob.innerHTML = newKnob.innerHTML.replaceAll(`num1`, `num${this.knobIndex}`);
            this.knobContainer = newKnob;
            parent.appendChild(this.knobContainer);
        }

        if (!this.knobContainer) {
            console.error(`Knob container with ID "${this.config.elementId}" not found.`);
            return;
        }

        this.titleEl = this.knobContainer.querySelector(`#knob-title-num${this.knobIndex}`);
        this.dialEl = this.knobContainer.querySelector(`#knob-dial-num${this.knobIndex}`);
        this.inputEl = this.knobContainer.querySelector(`#knob-value-input-num${this.knobIndex}`);
        this.labelsContainer = this.knobContainer.querySelector(`#knob-labels-num${this.knobIndex}`);


        this.currentValue = this.config.initialValue;
        this.isDragging = false;

        this.dialEl.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.dialEl.addEventListener('touchstart', (e) => this.handleMouseDown(e));

        this.inputEl.addEventListener('change', () => {
            const newValue = parseFloat(this.inputEl.value);
            if (!isNaN(newValue)) {
                this.updateKnob(newValue, false);
            }
        });

        // Re-generate labels on window resize to ensure correct positioning
        window.addEventListener('resize', this.generateLabels);
        this.init();
        globalKnobIndex++;
    }


    init() {
        this.titleEl.textContent = this.config.title;

        // Configure input
        this.inputEl.min = this.config.min;
        this.inputEl.max = this.config.max;
        this.inputEl.step = 1;

        // Generate and position labels
        this.generateLabels();

        // Set initial value and rotation
        this.updateKnob(this.config.initialValue, false);

    }

    generateLabels() {
        if (!this.labelsContainer) {
            return;
        }
        this.labelsContainer.innerHTML = '';
        const dialRadius = this.labelsContainer.offsetWidth / 2;
        const labelRadius = dialRadius * 1.05; // Position labels just inside the container edge

        this.config.labels.forEach(value => {
            const angle = this.valueToAngle(value);
            const angleRad = (angle - 90) * (Math.PI / 180);

            const label = document.createElement('div');
            label.textContent = value;
            label.className = 'absolute text-5xl font-medium text-gray-600';

            const x = dialRadius + labelRadius * Math.cos(angleRad);
            const y = dialRadius + labelRadius * Math.sin(angleRad);

            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            // Center the label on its calculated position
            label.style.transform = 'translate(-50%, -50%)';

            this.labelsContainer.appendChild(label);
        });
    }

    // --- Core Update Function ---
    updateKnob(value, triggerInputChange = true) {
        // Clamp value within min/max bounds
        const clampedValue = Math.max(this.config.min, Math.min(this.config.max, value));
        this.currentValue = clampedValue;

        // Update dial rotation
        const angle = this.valueToAngle(clampedValue);
        this.dialEl.style.transform = `rotate(${angle}deg)`;

        // Update input field
        this.inputEl.value = clampedValue.toFixed(0);

        // Optionally trigger the input's change event for external listeners
        if (triggerInputChange) {
            this.inputEl.dispatchEvent(new Event('change', {
                bubbles: true
            }));
        }
    }

    valueToAngle(value) {
        const {
            min,
            max,
            angleRange
        } = this.config;
        const valueRatio = (value - min) / (max - min);
        const totalAngleSpan = angleRange.end - angleRange.start;
        return angleRange.start + (valueRatio * totalAngleSpan);
    }

    angleToValue(angle) {
        const {
            min,
            max,
            angleRange
        } = this.config;
        const totalAngleSpan = angleRange.end - angleRange.start;

        // Clamp angle to the allowed range
        const clampedAngle = Math.max(angleRange.start, Math.min(angleRange.end, angle));

        const angleRatio = (clampedAngle - angleRange.start) / totalAngleSpan;
        const value = min + (angleRatio * (max - min));
        return value;
    }

    handleMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.knobContainer.classList.add('dragging');
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), {
            passive: false
        });
        window.addEventListener('touchend', (e) => this.handleMouseUp(e));
    }

    handleMouseUp() {
        this.isDragging = false;
        this.knobContainer.classList.remove('dragging');
        window.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.removeEventListener('mouseup', (e) => this.handleMouseUp(e));
        window.removeEventListener('touchmove', (e) => this.handleTouchMove(e));
        window.removeEventListener('touchend', (e) => this.handleMouseUp(e));
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.updateValueFromEvent(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        this.updateValueFromEvent(touch.clientX, touch.clientY);
    }

    updateValueFromEvent(clientX, clientY) {
        const rect = this.dialEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;

        // Calculate angle from center to mouse/touch point
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        angle += 90; // Adjust so 0 degrees is at the top

        if (angle > 180) {
            angle -= 360;
        }

        const newValue = this.angleToValue(angle);
        this.updateKnob(newValue);
    }

}
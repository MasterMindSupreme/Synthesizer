let globalKnobIndex = 1;  
class Knob {
    constructor(knobIndex, parent, title, values, unit = '') {
        this.knobIndex = knobIndex;
        this.unit = unit;
        this.config = {
            elementId: `knob-component-num${this.knobIndex}`,
            title: title,
            min: values[0],
            max: values[values.length - 1],
            labels: values,
            initialValue: values[0], // Start at minimum for envelope
            angleRange: {
                start: -135,
                end: 135
            }
        };

        // Create knob container
        if (this.knobIndex == 1) {
            this.knobContainer = document.getElementById("knob-component-num1");
            this.knobContainer.remove();
            this.knobContainer.style = "display: block;";
            parent.appendChild(this.knobContainer);
        } else {
            let newKnob = document.getElementById("knob-component-num1").cloneNode(true);
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

        window.addEventListener('resize', () => this.generateLabels());
        this.init();
        globalKnobIndex++;
    }

    init() {
        this.titleEl.textContent = this.config.title;

        this.inputEl.min = this.config.min;
        this.inputEl.max = this.config.max;
        this.inputEl.step = 0.1;

        this.generateLabels();
        this.updateKnob(this.config.initialValue, false);
    }

    generateLabels() {
        this.labelsContainer.innerHTML = '';
        const dialRadius = this.labelsContainer.offsetWidth / 2;
        const labelRadius = dialRadius * 0.9;
    
        let labelsToShow;
    
        // Check if this is a 4-value array (like envelope controls)
        if (this.config.labels.length === 4) {
            // Show first, middle, and last values with better spacing
            labelsToShow = [
                { value: this.config.labels[0], angle: -135 },           // First value at bottom-left
                { value: this.config.labels[1], angle: -65},
                { value: this.config.labels[2], angle: 65 },              // Third value at top  
                { value: this.config.labels[3], angle: 135 }             // Last value at bottom-right
            ];
        } else {
            // For other controls, show min and max using calculated angles
            labelsToShow = this.config.labels.map(value => ({
                value: value,
                angle: this.valueToAngle(value)
            }));
        }
    
        labelsToShow.forEach(({ value, angle }) => {
            const angleRad = (angle - 90) * (Math.PI / 180);
    
            const label = document.createElement('div');
            label.textContent = value + (this.unit || '');
            label.className = 'absolute text-2xl font-medium text-gray-600';
    
            const x = dialRadius + labelRadius * Math.cos(angleRad);
            const y = dialRadius + labelRadius * Math.sin(angleRad);
    
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            label.style.transform = 'translate(-50%, -50%)';
    
            this.labelsContainer.appendChild(label);
        });
    }

    updateKnob(value, triggerInputChange = true) {
        const clampedValue = Math.max(this.config.min, Math.min(this.config.max, value));
        this.currentValue = clampedValue;

        const angle = this.valueToAngle(clampedValue);
        this.dialEl.style.transform = `rotate(${angle}deg)`;

        // Show unit in input display
        this.inputEl.value = clampedValue.toFixed(0);

        if (triggerInputChange) {
            this.inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    valueToAngle(value) {
        const { min, max, angleRange } = this.config;
        const valueRatio = (value - min) / (max - min);
        const totalAngleSpan = angleRange.end - angleRange.start;
        return angleRange.start + (valueRatio * totalAngleSpan);
    }

    angleToValue(angle) {
        const { min, max, angleRange } = this.config;
        const totalAngleSpan = angleRange.end - angleRange.start;
        const clampedAngle = Math.max(angleRange.start, Math.min(angleRange.end, angle));
        const angleRatio = (clampedAngle - angleRange.start) / totalAngleSpan;
        const value = min + (angleRatio * (max - min));
        return value;
    }

    handleMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.knobContainer.classList.add('dragging');
                
        const mouseMoveHandler = (e) => this.handleMouseMove(e);
        const mouseUpHandler = (e) => this.handleMouseUp(e, mouseMoveHandler, mouseUpHandler, touchMoveHandler, touchEndHandler);
        const touchMoveHandler = (e) => this.handleTouchMove(e);
        const touchEndHandler = (e) => this.handleMouseUp(e, mouseMoveHandler, mouseUpHandler, touchMoveHandler, touchEndHandler);
                
        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
        window.addEventListener('touchmove', touchMoveHandler, { passive: false });
        window.addEventListener('touchend', touchEndHandler);
    }

    handleMouseUp(e, mouseMoveHandler, mouseUpHandler, touchMoveHandler, touchEndHandler) {
        this.isDragging = false;
        this.knobContainer.classList.remove('dragging');
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
        window.removeEventListener('touchmove', touchMoveHandler);
        window.removeEventListener('touchend', touchEndHandler);
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.updateValueFromEvent(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.updateValueFromEvent(touch.clientX, touch.clientY);
    }

    updateValueFromEvent(clientX, clientY) {
        const rect = this.dialEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;

        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        angle += 90;

        if (angle > 180) {
            angle -= 360;
        }

        const newValue = this.angleToValue(angle);
        this.updateKnob(newValue);
    }
}
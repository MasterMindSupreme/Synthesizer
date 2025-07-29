document.addEventListener('DOMContentLoaded', () => {
    const config = {
        elementId: 'knob-component-1',
        title: 'Octave',
        min: -2,
        max: 2,
        // Defines the values you want to see labeled on the dial
        labels: [-2, -1, 0, 1, 2], 
        initialValue: -2,
        // The angle range for the knob's rotation in degrees.
        // -135 is bottom-left, 135 is bottom-right.
        angleRange: {
            start: -135,
            end: 135
        }
    };

    // --- Knob Logic ---
    const knobContainer = document.getElementById(config.elementId);
    if (!knobContainer) {
        console.error(`Knob container with ID "${config.elementId}" not found.`);
        return;
    }

    const titleEl = knobContainer.querySelector('#knob-title');
    const dialEl = knobContainer.querySelector('#knob-dial');
    const inputEl = knobContainer.querySelector('#knob-value-input');
    const labelsContainer = knobContainer.querySelector('#knob-labels');

    let currentValue = config.initialValue;
    let isDragging = false;

    function init() {
        titleEl.textContent = config.title;

        // Configure input
        inputEl.min = config.min;
        inputEl.max = config.max;
        inputEl.step = 0.1;

        // Generate and position labels
        generateLabels();

        // Set initial value and rotation
        updateKnob(config.initialValue, false);
    }

    function generateLabels() {
        labelsContainer.innerHTML = ''; 
        const dialRadius = labelsContainer.offsetWidth / 2;
        const labelRadius = dialRadius * 0.95; // Position labels just inside the container edge

        config.labels.forEach(value => {
            const angle = valueToAngle(value);
            const angleRad = (angle - 90) * (Math.PI / 180); 

            const label = document.createElement('div');
            label.textContent = value;
            label.className = 'absolute text-lg font-medium text-gray-600';
            
            const x = dialRadius + labelRadius * Math.cos(angleRad);
            const y = dialRadius + labelRadius * Math.sin(angleRad);

            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            // Center the label on its calculated position
            label.style.transform = 'translate(-50%, -50%)';

            labelsContainer.appendChild(label);
        });
    }

    // --- Core Update Function ---
    function updateKnob(value, triggerInputChange = true) {
        // Clamp value within min/max bounds
        const clampedValue = Math.max(config.min, Math.min(config.max, value));
        currentValue = clampedValue;

        // Update dial rotation
        const angle = valueToAngle(clampedValue);
        dialEl.style.transform = `rotate(${angle}deg)`;

        // Update input field
        inputEl.value = clampedValue.toFixed(1);

        // Optionally trigger the input's change event for external listeners
        if (triggerInputChange) {
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    function valueToAngle(value) {
        const { min, max, angleRange } = config;
        const valueRatio = (value - min) / (max - min);
        const totalAngleSpan = angleRange.end - angleRange.start;
        return angleRange.start + (valueRatio * totalAngleSpan);
    }

    function angleToValue(angle) {
        const { min, max, angleRange } = config;
        const totalAngleSpan = angleRange.end - angleRange.start;

        // Clamp angle to the allowed range
        const clampedAngle = Math.max(angleRange.start, Math.min(angleRange.end, angle));
        
        const angleRatio = (clampedAngle - angleRange.start) / totalAngleSpan;
        const value = min + (angleRatio * (max - min));
        return value;
    }

    function handleMouseDown(e) {
        e.preventDefault();
        isDragging = true;
        knobContainer.classList.add('dragging');
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleMouseUp);
    }

    function handleMouseUp() {
        isDragging = false;
        knobContainer.classList.remove('dragging');
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        updateValueFromEvent(e.clientX, e.clientY);
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        updateValueFromEvent(touch.clientX, touch.clientY);
    }

    function updateValueFromEvent(clientX, clientY) {
        const rect = dialEl.getBoundingClientRect();
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

        const newValue = angleToValue(angle);
        updateKnob(newValue);
    }

    dialEl.addEventListener('mousedown', handleMouseDown);
    dialEl.addEventListener('touchstart', handleMouseDown);

    inputEl.addEventListener('change', () => {
        const newValue = parseFloat(inputEl.value);
        if (!isNaN(newValue)) {
            updateKnob(newValue, false);
        }
    });
    
    // Re-generate labels on window resize to ensure correct positioning
    window.addEventListener('resize', generateLabels);

    init();
});

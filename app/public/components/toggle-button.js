class ToggleButton {
    constructor(element) {
        this.element = element;
        this.isActive = false;
        this.type = element.dataset.type || 'ENV';
        this.number = this.extractNumber(element.textContent) || 1;
        
        this.element.addEventListener('click', () => this.toggle());
    }

    toggle() {
        this.isActive = !this.isActive;
        this.updateAppearance();
        this.onToggle();
    }

    updateAppearance() {
        this.element.classList.toggle('active', this.isActive);
    }

    setState(active) {
        this.isActive = active;
        this.updateAppearance();
    }

    onToggle() {
        this.element.dispatchEvent(new CustomEvent('toggleChange', {
            detail: { type: this.type, number: this.number, active: this.isActive }
        }));
    }

    extractNumber(text) {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }
}

export default ToggleButton;
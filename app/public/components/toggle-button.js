export class ToggleButton {
    singleToggle = ["ENV", "LP", "BP", "HP"];
    constructor(element) {
        this.element = element;
        this.isActive = false;
        this.type = element.dataset.type || 'ENV';
        this.number = this.extractNumber(element.textContent) || 1;
        this.element.addEventListener('click', () => this.toggle());
    }

    toggle() {
        if (this.singleToggle.includes(this.element.textContent.split(" ")[0])){
            const toggleChoice = this.element.textContent.split(" ")[0];
            var buttons = document.getElementsByClassName("toggle-button");
            for (let i = 0;i < buttons.length;i++){
                if (buttons[i].textContent.split(" ")[0] == toggleChoice && buttons[i].textContent != this.element.textContent) {
                    buttons[i].isActive = false;
                    buttons[i].classList.toggle('active', buttons[i].isActive);
                }
                if (buttons[i].textContent.split(" ")[0].substring(1) == "P" && this.element.textContent.split(" ")[0].substring(1) == "P"){
                    buttons[i].isActive = false;
                    buttons[i].classList.toggle("active", false);
                }
            }
            this.isActive = true;
        } else {
            this.isActive = !this.isActive;
        }
        this.updateAppearance();
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
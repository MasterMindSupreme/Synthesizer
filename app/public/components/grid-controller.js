export default class GridController {
    constructor(container, columnRules = {}) {
        this.container = container;
        this.columnRules = columnRules; // { columnIndex: 'single' | 'multiple' }
        this.buttons = Array.from(container.querySelectorAll('.toggle-button'));
        this.setupGrid();
    }

    setupGrid() {
        const computedStyle = getComputedStyle(this.container);
        const columns = computedStyle.gridTemplateColumns.split(' ').length;
        
        this.buttons.forEach((button, index) => {
            const columnIndex = index % columns;
            button.addEventListener('click', () => {
                this.handleButtonClick(button, columnIndex);
            });
        });
    }

    handleButtonClick(clickedButton, columnIndex) {
        const rule = this.columnRules[columnIndex] || 'multiple';
        
        if (rule === 'single') {
            // Single selection will deactivate all other buttons in this column
            this.getColumnButtons(columnIndex).forEach(button => {
                if (button !== clickedButton) {
                    button.classList.remove('active');
                    if (button.toggleButtonInstance) {
                        button.toggleButtonInstance.isActive = false;
                    }
                }
            });
        }
    }

    getColumnButtons(columnIndex) {
        const computedStyle = getComputedStyle(this.container);
        const columns = computedStyle.gridTemplateColumns.split(' ').length;
        
        return this.buttons.filter((_, index) => index % columns === columnIndex);
    }
}

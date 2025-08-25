export let globalVolumeIndex = 1;

export class Volume {
    constructor(volumeIndex, parent, title) {
        this.volumeIndex = volumeIndex;
        if (this.volumeIndex == 1) {
            this.volumeContainer = document.getElementById("volume-component-num1");
            this.volumeContainer.remove();
            this.volumeContainer.style = "display: flex;";
            parent.appendChild(this.volumeContainer);
        } else {
            let newVolume = document.getElementById("volume-component-num1").cloneNode([true]);
            newVolume.id = `volume-component-num${this.volumeIndex}`;
            newVolume.innerHTML = newVolume.innerHTML.replaceAll(`num1`, `num${this.volumeIndex}`);
            this.volumeContainer = newVolume;
            parent.appendChild(this.volumeContainer);
        }
        this.volumeContainer.querySelector(".volume-title").textContent = title;
        this.slider = document.getElementById(`volume-slider-num${volumeIndex}`);
        this.label = document.getElementById(`volume-label-num${volumeIndex}`);
        this.label.textContent = `${this.slider.value}%`;
        if (title == "Tracking") {
            this.slider.value = 0;
            this.label.textContent = `${this.slider.value}%`;
        }
        this.slider.addEventListener("input", () => {
            this.label.textContent = `${this.slider.value}%`;
        });

        globalVolumeIndex++;
    }
}

const slider = document.getElementById("volume-slider");
const label = document.getElementById("volume-label");

slider.addEventListener("input", () => {
    label.textContent = `${slider.value}%`;
});

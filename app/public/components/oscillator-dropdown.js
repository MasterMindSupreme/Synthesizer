const OSC1 = document.getElementById('OSC1');
const OSC2 = document.getElementById('OSC2');
const OSC3 = document.getElementById('OSC3');


OSC1.addEventListener('click', () => {
  OSC1.classList.add("osc-header-active");
  OSC2.classList.remove("osc-header-active");
  OSC3.classList.remove("osc-header-active");
});

OSC2.addEventListener('click', () => {
  OSC1.classList.remove("osc-header-active");
  OSC2.classList.add("osc-header-active");
  OSC3.classList.remove("osc-header-active");
});

OSC3.addEventListener('click', () => {
  OSC1.classList.remove("osc-header-active");
  OSC2.classList.remove("osc-header-active");
  OSC3.classList.add("osc-header-active");
});
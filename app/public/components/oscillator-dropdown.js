const osc1Type = document.getElementById('osc1Type');

osc1Type.addEventListener('change', () => {
  const mode = osc1Type.value;      // 'sample' | 'waveform' | 'wavetable'
  window.dispatchEvent(new CustomEvent('osc-type-change', { detail: { osc: 1, mode } }));
});

window.addEventListener('osc-type-change', (e) => {
  console.log(`OSC ${e.detail.osc} -> ${e.detail.mode}`);
});
const openBtn   = document.getElementById('openSampleBtn');
const openInput = document.getElementById('openSampleInput');
const openName  = document.getElementById('openSampleName');

let selectedSampleBuffer = null;

openBtn.addEventListener('click', () => openInput.click());

openInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    openName.textContent = file.name;

    // decode to AudioBuffer (use existing AudioContext from play.js)
    if (!window.audioContext) return;
    const arrayBuffer = await file.arrayBuffer();
    selectedSampleBuffer = await audioContext.decodeAudioData(arrayBuffer);
});

// helper to play the selected sample somewhere else
window.playSelectedSample = function(maxSeconds = 10) {
    if (!selectedSampleBuffer || !window.audioContext) return;
    const src = audioContext.createBufferSource();
    src.buffer = selectedSampleBuffer;
    src.connect(audioContext.destination);
    src.start();
    src.stop(audioContext.currentTime + maxSeconds);
};

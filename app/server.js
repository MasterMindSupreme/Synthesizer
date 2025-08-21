const Keyboard = require('./public/keyboard.js');
const PitchFinder = require("pitchfinder");
const WavDecoder = require("wav-decoder");
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const { buffer } = require("stream/consumers");

//const myKeyboard = new Keyboard(); // <-- ADD THIS
//myKeyboard.init();                 // <-- ADD THIS

app.use(bodyParser.text({ limit: '500mb' }));

app.use(bodyParser.json({ limit: '500mb' }));

app.use(express.text())

app.use(express.static(__dirname + '/public'));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/pitch', (req, res) => {
  let pitchDetector = PitchFinder.YIN();
  let file = req.body.buffer == null ? fs.readFileSync(path.join(__dirname, "public", req.body.file)) : Buffer.from((req.body.buffer.split(",")));
  let pitch = pitchDetector(WavDecoder.decode.sync(file).channelData[0].subarray(0, Math.min(24000, WavDecoder.decode.sync(file).channelData[0].length - 1)));
  res.send(pitch);
});

function saveWavToFile(buffer, directory, filename) {
    const filePath = path.join(__dirname, directory, filename);
    try {
        fs.writeFileSync(filePath, Buffer.from(buffer.split(",")));
    } catch (error) {
        console.error('Error saving WAV file:', error);
    }
}

function loadWavFile(directory, filename) {
    const filePath = path.join(__dirname, directory, filename);
    try {
        return fs.readFileSync(filePath);
    } catch (error) {
        console.error('Error loading WAV file:', error);
    }
}

app.post('/osc-samples', (req, res) => {
    saveWavToFile(req.body, `./public/OSC${req.query.osc} Samples`, req.query.filename);
    res.status(200).send('File saved');
});

app.get('/osc-sample', (req, res) => {
    const content = loadWavFile(`./public/OSC${req.query.osc} Samples`, req.query.filename);
    res.status(200).send(content);
});

app.get('/samples-list', (req, res) => {
  const samplesDir = path.join(__dirname, 'public', 'samples');

  fs.readdir(samplesDir, (err, files) => {
    if (err) {
      console.error("Failed to read samples directory:", err);
      return res.status(500).send("Error reading sample files");
    }

    const wavFiles = files.filter(file => file.endsWith('.wav'));
    res.json(wavFiles);
  });
});

// --- 3. ADD API ENDPOINTS TO CONTROL THE KEYBOARD ---
const synth = new Keyboard();
synth.init(); // Initialize once when server starts

function setupKeyboardInput() {
  console.log('\n🎹 Keyboard ready! Press keys to play sounds:');
  console.log('Keys: Q W E R T Y U I O P (upper row)');
  console.log('      Z X C V B N M (lower row)');
  console.log('      2 3 5 6 7 9 0 (black keys)');
  console.log('      S D G H J (black keys)');
  console.log('Press Ctrl+C to exit\n');

  // Set up stdin to receive keyboard input
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  // Track pressed keys to handle key release
  const pressedKeys = new Set();

  process.stdin.on('data', (key) => {
      // Handle Ctrl+C to exit
      if (key === '\u0003') {
          console.log('\nExiting...');
          process.exit();
      }

      // Convert key to lowercase for consistency
      const keyPressed = key.toLowerCase();

      // Handle key press (only if not already pressed)
      if (!pressedKeys.has(keyPressed)) {
          pressedKeys.add(keyPressed);
          
          const result = synth.playNote(keyPressed);
          if (result) {
              console.log(`🎵 Playing key: ${keyPressed.toUpperCase()}`);
          } else {
              // Only show warning for mapped keys that failed
              const note = synth.getNote(keyPressed);
              if (note) {
                  console.log(`❌ Failed to play key: ${keyPressed.toUpperCase()}`);
              }
              // Don't show anything for unmapped keys (like space, enter, etc.)
          }
      }

      // Simulate key release after a short delay
      setTimeout(() => {
          if (pressedKeys.has(keyPressed)) {
              pressedKeys.delete(keyPressed);
              synth.stopNote(keyPressed);
          }
      }, 500); // Hold note for 500ms
  });
}


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);


  setTimeout(() => {
    setupKeyboardInput();
}, 1000); // Wait 1 second for server to fully start
});

// Handle process exit
process.on('SIGINT', () => {
console.log('\nShutting down server...');
synth.stopAllNotes();
process.exit();
});

process.on('SIGTERM', () => {
console.log('\nShutting down server...');
synth.stopAllNotes();
process.exit();
});
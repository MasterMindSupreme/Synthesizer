const PitchFinder = require("pitchfinder");
const WavDecoder = require("wav-decoder");
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const { buffer } = require("stream/consumers");

app.use(bodyParser.text({ limit: '500mb' }));

app.use(express.text())

app.use(express.static(__dirname + '/public'));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/pitch', (req, res) => {
  let pitchDetector = PitchFinder.YIN();
  let file = fs.readFileSync(path.join(__dirname, "public", req.body.file));
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

app.post('/osc-samples', (req, res) => {
    saveWavToFile(req.body, `./public/OSC${req.query.osc} Samples`, req.query.filename);
    res.status(200).send('File saved');
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


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

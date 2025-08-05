const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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

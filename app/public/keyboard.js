const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class keyboard {
    constructor() {
        this.audioContext = null;
        this.activeAudioSources = new Map(); 
        this.sampleBuffers = new Map(); 
        this.loadedSamples = new Set(); // FIXED: Added back this property
        this.activePlaying = new Set(); // ADD THIS LINE

        this.KeyToNoteMap = new Map([
            ['z', 'C4'],
            ['s', 'C#4'],
            ['x', 'D4'],
            ['d', 'D#4'],
            ['c', 'E4'],
            ['v', 'F4'],
            ['g', 'F#4'],
            ['b', 'G4'],
            ['h', 'G#4'],
            ['n', 'A4'],
            ['j', 'A#4'],
            ['m', 'B4'],

            // Top Row (C5 Octave)
            ['q', 'C5'],
            ['2', 'C#5'],
            ['w', 'D5'],
            ['3', 'D#5'],
            ['e', 'E5'],
            ['r', 'F5'],
            ['5', 'F#5'],
            ['t', 'G5'],
            ['6', 'G#5'],
            ['y', 'A5'],
            ['7', 'A#5'],
            ['u', 'B5'],
            ['i', 'C6'],
            ['9', 'C#6'],
            ['o', 'D6'],
            ['0', 'D#6'],
            ['p', 'E6'],
        ]);

        this.noteToMidiMap = new Map([
            // Octave 4 
            ['C4', 60],
            ['C#4', 61],
            ['D4', 62],
            ['D#4', 63],
            ['E4', 64],
            ['F4', 65],
            ['F#4', 66], 
            ['G4', 67],
            ['G#4', 68],
            ['A4', 69],
            ['A#4', 70],
            ['B4', 71],

            // Octave 5 
            ['C5', 72],
            ['C#5', 73],
            ['D5', 74],
            ['D#5', 75],
            ['E5', 76],
            ['F5', 77],
            ['F#5', 78],
            ['G5', 79],
            ['G#5', 80],
            ['A5', 81],
            ['A#5', 82],
            ['B5', 83],

            // Octave 6
            ['C6', 84],
            ['C#6', 85],
            ['D6', 86],
            ['D#6', 87],
            ['E6', 88]
        ]);

        this.settings = {
            volume: 0.5,        
            attack: 0.01,
            decay: 0.1,
            sustain: 0.8,
            release: 0.3
        };

        this.samplePath = './public/OSC1 Samples/';
        this.availableSamples = new Set();
    }

    init() {
        try {
            console.log("Initializing simple keyboard...");
            this.checkAvailableSamples();
            console.log(`Found ${this.availableSamples.size} sample files`);
            return true;
        } catch (error) {
            console.error("Failed to initialize:", error);
            return false;
        }
    }

    checkAvailableSamples() {
        try {
            const files = fs.readdirSync(this.samplePath);
            files.forEach(file => {
                if (file.endsWith('.wav')) {
                    const midiNumber = parseInt(file.replace('.wav', ''));
                    if (!isNaN(midiNumber)) {
                        this.availableSamples.add(midiNumber);
                    }
                }
            });
        } catch (error) {
            console.warn("Could not read sample directory:", error.message);
        }
    }

    getNote(key) {
        return this.KeyToNoteMap.get(key.toLowerCase()); 
    }

    getMidiNumber(note) {
        return this.noteToMidiMap.get(note);
    }

    hasSample(midiNumber) {
        return this.availableSamples.has(midiNumber);
    }

    // Play audio using system audio player (works on macOS, Linux, Windows)
    playAudioFile(filePath) {
        try {
            let player;
            
            // Determine the audio player based on platform
            switch (process.platform) {
                case 'darwin': // macOS
                    player = spawn('afplay', [filePath]);
                    break;
                case 'linux':
                    // Try different players
                    if (this.commandExists('paplay')) {
                        player = spawn('paplay', [filePath]);
                    } else if (this.commandExists('aplay')) {
                        player = spawn('aplay', [filePath]);
                    } else if (this.commandExists('mpg123')) {
                        player = spawn('mpg123', [filePath]);
                    } else {
                        throw new Error('No audio player found. Install paplay, aplay, or mpg123');
                    }
                    break;
                case 'win32': // Windows
                    // Use PowerShell to play audio
                    player = spawn('powershell', [
                        '-c', 
                        `(New-Object Media.SoundPlayer '${filePath}').PlaySync()`
                    ]);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${process.platform}`);
            }

            player.on('error', (error) => {
                console.warn(`Audio player error: ${error.message}`);
            });

            return player;
        } catch (error) {
            console.warn(`Failed to play audio: ${error.message}`);
            return null;
        }
    }

    // Check if command exists
    commandExists(command) {
        try {
            require('child_process').execSync(`which ${command}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    playNote(key) {
        console.log('DEBUG - this.activePlaying:', this.activePlaying);
        console.log('DEBUG - this:', this);
        console.log('DEBUG - Object.keys(this):', Object.keys(this));
        const note = this.getNote(key);
        if (!note) {
            console.warn(`No note mapped to key: ${key}`);
            return false;
        }

        const midiNumber = this.getMidiNumber(note);
        if (midiNumber === undefined) {
            console.warn(`No MIDI number found for note: ${note}`);
            return false;
        }

        if (!this.hasSample(midiNumber)) {
            console.warn(`No sample file found for MIDI note: ${midiNumber}`);
            return false;
        }

        const sampleFile = path.join(this.samplePath, `${midiNumber}.wav`);
        
        if (!fs.existsSync(sampleFile)) {
            console.warn(`Sample file does not exist: ${sampleFile}`);
            return false;
        }

        // Play the audio file
        const player = this.playAudioFile(sampleFile);
        if (!player) {
            return false;
        }

        this.activePlaying.add(key);

        // Remove from active playing when done
        player.on('close', () => {
            this.activePlaying.delete(key);
        });

        console.log(`🎵 Playing ${note} (MIDI ${midiNumber}) on key: ${key}`);
        return true;
    }

    stopNote(key) {
        if (this.activePlaying.has(key)) {
            // Note: with this simple approach, we can't really stop individual notes
            // since we're using system audio players
            console.log(`Note on key '${key}' is playing but cannot be stopped individually`);
            return true;
        }
        return false;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('Settings updated:', this.settings);
    }

    // Test method
    testKeyboard() {
        console.log('\n🎹 Testing keyboard...');
        const testKeys = ['q', 'w', 'e'];
        
        testKeys.forEach((key, index) => {
            setTimeout(() => {
                console.log(`Testing key: ${key}`);
                this.playNote(key);
            }, index * 1000);
        });
    }
}

module.exports = keyboard;
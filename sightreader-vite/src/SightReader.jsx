import React, { useState, useEffect, useRef } from 'react';
import * as ABCJS from 'abcjs';
import * as Pitchfinder from 'pitchfinder';

const FileSelector = ({ onFileSelect }) => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch('/music/beginner.pls'); // Adjust as needed
                const data = await response.text();
                const fileList = data.split('\n').filter(file => file.trim() !== '');
                setFiles(fileList);
            } catch (error) {
                console.error('Error loading file list:', error);
            }
        };

        fetchFiles();
    }, []);

    const handleFileChange = async (event) => {
        const file = event.target.value;
        setSelectedFile(file);
        if (file) {
            try {
                const response = await fetch(`/music/${file}`);
                const data = await response.text();
                onFileSelect(data);
            } catch (error) {
                console.error('Error loading file:', error);
            }
        }
    };

    return (
        <div>
            <label>File:</label>
            <select onChange={handleFileChange} value={selectedFile}>
                <option value="">---Select an ABC File---</option>
                {files.map((file, index) => (
                    <option key={index} value={file}>{file}</option>
                ))}
            </select>
        </div>
    );
};

const AbcRenderer = ({ abcText }) => {
    const abcContainerRef = useRef(null);

    useEffect(() => {
        if (abcText && abcContainerRef.current) {
            ABCJS.renderAbc(abcContainerRef.current, abcText, { responsive: "resize", scale: 1.5 });
        }
    }, [abcText]);

    return <div ref={abcContainerRef} id="notation"></div>;
};

const PlaybackControls = ({ abcText, tempo }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
    const synthRef = useRef(null);

    const startPlayback = async () => {
        if (!synthRef.current || !abcText) return;
    
        setIsPlaying(true);
        try {
            const cleanedAbcText = cleanAbcNotation(abcText);
            console.log("Cleaned ABC Text:", cleanedAbcText);
    
            const visualObjs = ABCJS.renderAbc("notation", cleanedAbcText);
            if (!visualObjs || visualObjs.length === 0) {
                throw new Error("ABCJS.renderAbc() did not return a valid visual object.");
            }
    
            const visualObj = visualObjs[0];
            if (!visualObj || !visualObj.lines || visualObj.lines.length === 0) {
                throw new Error("ABCJS did not generate a valid visual object. Possible parsing issue.");
            }
    
            console.log("Initializing Synth with VisualObj:", visualObj);
    
            if (audioContextRef.current.state === "suspended") {
                await audioContextRef.current.resume();
            }
    
            synthRef.current = new ABCJS.synth.CreateSynth();
    
            // ✅ **Fix: Generate MIDI sequence before calling `init()`**
            const midiSequence = ABCJS.synth.createSynthControl().sequence;
            if (!midiSequence || midiSequence.length === 0) {
                throw new Error("ABCJS failed to generate MIDI sequence.");
            }
    
            console.log("MIDI sequence successfully generated.");
    
            const initSuccess = await synthRef.current.init({
                audioContext: audioContextRef.current,
                visualObj: visualObj,
                millisecondsPerMeasure: (60000 / tempo) * 4
            });
    
            if (!initSuccess) {
                throw new Error("ABCJS Synth failed to initialize.");
            }
    
            console.log("Synth initialized. Checking MIDI data...");
    
            if (!synthRef.current.sequence || synthRef.current.sequence.length === 0) {
                throw new Error("Synth sequence is still missing after init.");
            }
    
            console.log("MIDI sequence loaded. Calling prime()...");
    
            await synthRef.current.prime();
            console.log("Synth primed. Starting playback...");
    
            await synthRef.current.start();
        } catch (error) {
            console.error("Playback error:", error);
            setIsPlaying(false);
        }
    };
    

    const stopPlayback = () => {
        if (synthRef.current) {
            synthRef.current.stop();
            setIsPlaying(false);
        }
    };

    return (
        <div>
            <button onClick={isPlaying ? stopPlayback : startPlayback}>
                {isPlaying ? "Stop" : "Start"}
            </button>
        </div>
    );
};

const PitchDetection = () => {
    const [pitch, setPitch] = useState(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const pitchDetectorRef = useRef(null);

    useEffect(() => {
        const startMic = async () => {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = audioContextRef.current.createMediaStreamSource(stream);
                analyserRef.current = audioContextRef.current.createAnalyser();
                source.connect(analyserRef.current);

                pitchDetectorRef.current = new Pitchfinder.YIN({ sampleRate: audioContextRef.current.sampleRate });

                const detectPitch = () => {
                    const array32 = new Float32Array(analyserRef.current.fftSize);
                    analyserRef.current.getFloatTimeDomainData(array32);
                    const detectedPitch = pitchDetectorRef.current(array32);
                    setPitch(detectedPitch ? detectedPitch.toFixed(2) : null);
                };

                const pitchInterval = setInterval(detectPitch, 100);
                return () => clearInterval(pitchInterval);
            } catch (error) {
                console.error("Error accessing microphone:", error);
            }
        };

        startMic();
    }, []);

    return <div>Detected Pitch: {pitch ? `${pitch} Hz` : "No pitch detected"}</div>;
};

const SightReader = () => {
    const [abcText, setAbcText] = useState('');
    const [tempo, setTempo] = useState(120);

    return (
        <div className="container">
            <h3>ABC Sightreader</h3>
            <FileSelector onFileSelect={setAbcText} />
            <label>Tempo:</label>
            <input type="number" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
            <PlaybackControls abcText={abcText} tempo={tempo} />
            <AbcRenderer abcText={abcText} />
            <PitchDetection />
            <textarea value={abcText} onChange={(e) => setAbcText(e.target.value)} />
        </div>
    );
};

export default SightReader;

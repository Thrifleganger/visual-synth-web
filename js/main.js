'use-strict';

class Patch {
    constructor() {
        this.synth = null;
        this.reverb = null;
        this.delay = null;
        this.gain = null;
        this.pan = null;
    }
}

let currentPatch;
let secondaryMoversIntervals = [];
let touchEventActivated;
let availableNotes = new Map();

let fftSize = 256;
let fftAnalysisArray = [];
let spectrumAnalysisArray = [];

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    positionAndStyleCanvas(canvas);
    initializeRotaryControllers();
}

function draw() {
    clear();
    drawAmplitudeEnvelope();
    updatePrimeMovers();
    updateSecondaryMovers();
    if (fftAnalysisArray.length > 1) {
        noStroke();
        fill(255,255,255,40)
        let w = width / fftSize;
        for (let i = 0; i < fftSize; i++) {
            let index = Math.floor(map(i, 0, fftSize, 0, width));
            rect(index, height - (map(fftAnalysisArray[i], -120, 0, 0, height)), w, height, 20);
        }
    }
    if (spectrumAnalysisArray.length > 1) {
        stroke(255);
        beginShape();
        fill(255, 255, 255, 80);
        for (let i = 0; i < fftSize; i++) {
            let index = Math.floor(map(i, 0, fftSize, 0, width));
            vertex(index, height * 0.75 + (map(spectrumAnalysisArray[i], -1, 1, -height/4, height/4)));
        }
        endShape();

    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    resizeSliders();
}

function touchStarted() {
    handleGenericPressedEvent(touches);
    touchEventActivated = true;
}
function mousePressed(event) {
    if (!touchEventActivated) {
        handleGenericPressedEvent([ {x: event.x, y: event.y } ]);
    }
}
function handleGenericPressedEvent(coordinates) {
    if (typeof currentPatch === "undefined") {
        initializePatch();
    }
    coordinates.forEach(coordinate => {
        primeMovers.push(new PrimeMover(coordinate.x, coordinate.y));
        let intervalId = setInterval(() => secondaryMovers.push(new SecondaryMover(coordinate.x)),
            Number.parseInt(random(30, 150)));
        secondaryMoversIntervals.push(intervalId);
        availableNotes.set(Math.floor(map(coordinate.x, 0, width, 0, 12)), {
            "state" : "triggered",
            "intervalId": intervalId
        });
    });
    let triggeredNotes = Array.from(availableNotes)
        .filter(([key, value]) => value.state === 'triggered')
        .map(([key, value]) => key);

    currentPatch.synth.triggerAttack(triggeredNotes.map(note => generateFrequencyBasedNoteNumber(note)));
    triggeredNotes.forEach(key => {
        availableNotes.get(key).state = "playing";
        availableNotes.get(key).frequency = generateFrequencyBasedNoteNumber(key);
    });
}

function touchEnded() {
    handleGenericReleasedEvent(touches);
}
function mouseReleased() {
    if (!touchEventActivated) {
        handleGenericReleasedEvent([]);
    }
}
function handleGenericReleasedEvent(coordinates) {

    let notesWithTouchStillActivated = [];
    coordinates.forEach(coordinate => {
        notesWithTouchStillActivated.push(Math.floor(map(coordinate.x, 0, width, 0, 12)));
    });
    let currentlyPlayingNotes = Array.from(availableNotes)
        .filter(([key, value]) => value.state === 'playing')
        .map(([key, value]) => key);
    let notesToBeReleased = currentlyPlayingNotes.filter(note => !notesWithTouchStillActivated.includes(note));
    currentPatch.synth.triggerRelease(notesToBeReleased.map(note => availableNotes.get(note).frequency));
    secondaryMoversIntervals.forEach(intervalId => clearInterval(intervalId));
    notesToBeReleased.forEach(note => availableNotes.delete(note));
}

function initializePatch() {
    currentPatch = new Patch();
    createFMSynth();
    currentPatch.gain = new Tone.Gain();

    currentPatch.delay = new Tone.PingPongDelay({
        delayTime: patchParameters.delayTime,
        maxDelayTime: 4
    });
    currentPatch.delay.feedback.value = patchParameters.delayFeedback;
    currentPatch.delay.wet.value = patchParameters.delayMix;
    currentPatch.reverb = new Tone.Freeverb(0.96);
    currentPatch.reverb.wet.value = patchParameters.reverbMix;
    let finalGainNode = new Tone.Gain();
    currentPatch.fftAnalyzer = new Tone.Analyser({
        "size": fftSize,
        "type": "fft",
        "smoothing": 0.9
    });
    currentPatch.spectrumAnalyzer = new Tone.Analyser({
        "size": fftSize,
        "type": "waveform",
        "smoothing": 3
    });

    //Connections
    currentPatch.synth.connect(currentPatch.gain);
    currentPatch.gain.connect(finalGainNode);

    currentPatch.gain.send("delay-bus", 0);
    currentPatch.gain.send("reverb-bus", 0);
    currentPatch.delay.receive("delay-bus");
    currentPatch.reverb.receive("reverb-bus");

    currentPatch.delay.connect(finalGainNode);
    currentPatch.reverb.connect(finalGainNode);

    finalGainNode.fan(Tone.Master);
    finalGainNode.fan(currentPatch.fftAnalyzer);
    finalGainNode.fan(currentPatch.spectrumAnalyzer);

    setInterval(function() {
        fftAnalysisArray = currentPatch.fftAnalyzer.getValue();
        spectrumAnalysisArray = currentPatch.spectrumAnalyzer.getValue();
    }, 60);
}

function reconfigurePatch() {
    currentPatch.synth.voices.forEach(synth => configureFMSynthParameters(synth));
    currentPatch.gain.value = patchParameters.volume;
    currentPatch.delay.delayTime.value = patchParameters.delayTime;
    currentPatch.delay.feedback.value = patchParameters.delayFeedback;
    currentPatch.delay.wet.value = patchParameters.delayMix;
    currentPatch.reverb.wet.value = patchParameters.reverbMix;
}

function createFMSynth() {
    let fmPolySynth = new Tone.PolySynth(5, Tone.FMSynth);
    fmPolySynth.voices.forEach(fmSynth => configureFMSynthParameters(fmSynth));
    currentPatch.synth = fmPolySynth;
}

function configureFMSynthParameters(synth) {
    synth.harmonicity.value = patchParameters.modRatio;
    synth.modulationIndex.value = patchParameters.modIndex;
    synth.modulation.type = "sine";

    synth.envelope.attack = patchParameters.attack;
    synth.envelope.decay = patchParameters.decay;
    synth.envelope.sustain = patchParameters.sustain;
    synth.envelope.release = patchParameters.release;

    synth.modulationEnvelope.attack = 0.1;
    synth.modulationEnvelope.decay = patchParameters.modDuration;
    synth.modulationEnvelope.sustain = 0.1;
    synth.modulationEnvelope.release = 0.1;
}

function generateFrequencyBasedNoteNumber(noteNumber) {
    // Add 12, since Midi note numbers start from C0
    let currentNoteNumber = globalParameters.currentOctave * 12 + 12 + noteNumber;
    let frequency = Math.floor(Tone.Midi(currentNoteNumber).toFrequency());
    console.log(`Notenumber: ${currentNoteNumber}, Frequency: ${frequency}`)
    return frequency;
}

function positionAndStyleCanvas(canvas) {
    canvas.parent('main-canvas-container');
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-99');
}
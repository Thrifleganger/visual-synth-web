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

    //Connections
    currentPatch.synth.connect(currentPatch.gain);
    currentPatch.gain.connect(Tone.Master);
}

function reconfigurePatch() {
    currentPatch.synth.voices.forEach(synth => configureFMSynthParameters(synth));
    currentPatch.gain.value = patchParameters.volume;
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
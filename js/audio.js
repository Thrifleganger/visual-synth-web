'use-strict'

class Patch {
    constructor() {
        this.volume = null;
        this.pan = null;
        this.tone = null;
        this.synth = null;
        this.reverb = null;
        this.delay = null;
    }
}

let currentPatch;
let availableNotes = new Map();

function initializePatch() {
    disposeAllResources();
    currentPatch = new Patch();
    switch (globalParameters.currentPatch) {
        case 0: createFMSynth();
            break;
        case 1: createArpeggiator();
            break;
        default:
            currentPatch.synth = Tone.noOp();
    }

    currentPatch.volume = new Tone.Gain();
    currentPatch.pan = new Tone.Panner();
    currentPatch.tone = new Tone.Filter({
        type: "lowpass",
        frequency: map(patchParameters.tone, 0, 1, 250, 10000)
    });

    currentPatch.delay = new Tone.PingPongDelay({
        delayTime: patchParameters.delayTime,
        maxDelayTime: 4
    });
    currentPatch.delay.feedback.value = patchParameters.delayFeedback;
    currentPatch.delay.wet.value = patchParameters.delayMix;
    currentPatch.reverb = new Tone.Freeverb(0.96);
    currentPatch.reverb.wet.value = patchParameters.reverbMix;

    currentPatch.fftAnalyzer = new Tone.Analyser({
        size: fftSize,
        type: "fft",
        smoothing: 0.9
    });
    currentPatch.spectrumAnalyzer = new Tone.Analyser({
        size: fftSize,
        type: "waveform",
        smoothing: 0.2
    });

    //Connections
    currentPatch.synth.connect(currentPatch.volume);
    currentPatch.volume.connect(currentPatch.pan);
    currentPatch.pan.connect(currentPatch.tone);
    currentPatch.tone.send("delay-bus", 0);
    currentPatch.tone.send("reverb-bus", 0);
    currentPatch.delay.receive("delay-bus");
    currentPatch.reverb.receive("reverb-bus");

    let finalOutputNode = new Tone.Limiter(-30);
    currentPatch.delay.connect(finalOutputNode);
    currentPatch.reverb.connect(finalOutputNode);

    finalOutputNode.fan(Tone.Master);
    finalOutputNode.fan(currentPatch.fftAnalyzer);
    finalOutputNode.fan(currentPatch.spectrumAnalyzer);

    setInterval(function() {
        fftAnalysisArray = currentPatch.fftAnalyzer.getValue();
        spectrumAnalysisArray = currentPatch.spectrumAnalyzer.getValue();
    }, 60);
}

function reconfigurePatch() {
    switch (globalParameters.currentPatch) {
        case 0: currentPatch.synth.voices.forEach(synth => configureFMSynthParameters(synth));
            break;
        case 1: configureArpeggiatorParameters(currentPatch.synth);
            break;
    }
    currentPatch.volume.gain.value = patchParameters.volume;
    currentPatch.pan.pan.value = patchParameters.pan;
    currentPatch.tone.frequency.value = map(patchParameters.tone, 0, 1, 250, 10000);
    currentPatch.delay.delayTime.value = patchParameters.delayTime;
    currentPatch.delay.feedback.value = patchParameters.delayFeedback;
    currentPatch.delay.wet.value = patchParameters.delayMix;
    currentPatch.reverb.wet.value = patchParameters.reverbMix;
}

function generateMidiNoteNumber(noteNumber) {
    // Add 12, since Midi note numbers start from C0
    return globalParameters.currentOctave * 12 + 12 + noteNumber;
}

function triggerAttack(triggeredNotes, velocity) {
    switch (globalParameters.currentPatch) {
        case 0: currentPatch.synth.triggerAttack(triggeredNotes.map(midiNote => Math.floor(Tone.Midi(midiNote).toFrequency())),
            undefined, velocity * 0.1);
            break;
        case 1: Tone.Transport.start();
            startArpeggiation(triggeredNotes[0], velocity);
            break;
    }
}

function triggerRelease(notesToBeReleased) {
    switch (globalParameters.currentPatch) {
        case 0: currentPatch.synth.triggerRelease(notesToBeReleased.map(midiNote => Math.floor(Tone.Midi(midiNote).toFrequency())));
            break;
        case 1: Tone.Transport.stop();
            currentPatch.pattern.stop();
            break;
    }
}

function disposeAllResources() {
    if (currentPatch == null) {
        return;
    }
    let allPossibleToneNodes = [currentPatch.volume, currentPatch.pan, currentPatch.tone, currentPatch.delay,
        currentPatch.reverb, currentPatch.synth, currentPatch.pattern];
    for (let node in allPossibleToneNodes) {
        if (allPossibleToneNodes[node] != null) {
            try {
                allPossibleToneNodes[node].disconnect();
                allPossibleToneNodes[node].dispose()
            } catch (e) {
            }
        }
    }
}
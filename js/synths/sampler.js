function createSampler(path) {
    currentPatch.synth = new Tone.Sampler({
        "C4" : path
    });
    currentPatch.synth.connect(currentPatch.volume);
}

function startSampler(noteNumber, velocity) {
    currentPatch.synth.triggerAttack(noteNumber, velocity);
}

function stopSampler(noteNumber) {
    currentPatch.synth.triggerRelease(noteNumber);
}
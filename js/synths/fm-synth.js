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
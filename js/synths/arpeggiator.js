function createArpeggiator() {
    currentPatch.synth = new Tone.Synth({
        oscillator: {
            type: "sine"
        }
    });
    currentPatch.pattern = new Tone.Pattern({
        callback: function (time, note) {
            currentPatch.synth.triggerAttackRelease(note, "16n", undefined, 0.1);
        },
        pattern: Tone.CtrlPattern.Type.UpDown
    });
    currentPatch.pattern.interval = "16n";
}

function startArpeggiation(noteNumber, velocity) {
    let notes = [];
    for (let i of Array(Math.round(patchParameters.arpeggiatorOctaves)).keys()) {
        notes = notes.concat(getArpeggiatorSemitones().map(note => note + (i * 12)));
    }
    currentPatch.pattern.callback = function(time, note) {
        currentPatch.synth.triggerAttackRelease(note, "16n", undefined, 0.1 * velocity);
    };
    currentPatch.pattern.values = notes.map(note => Tone.Midi(note + noteNumber).toFrequency());
    currentPatch.pattern.playbackRate = patchParameters.arpeggiatorSpeed;
    currentPatch.pattern.start();
}

function configureArpeggiatorParameters(synth) {
    synth.envelope.attack = patchParameters.attack;
    synth.envelope.decay = patchParameters.decay;
    synth.envelope.sustain = patchParameters.sustain;
    synth.envelope.release = patchParameters.release;
}
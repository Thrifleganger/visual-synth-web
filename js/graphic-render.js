'use strict';

let drawEnvelopeAlpha = 0;

let primeMovers = [];
let secondaryMovers = [];

let fftSize = 256;
let fftAnalysisArray = [];
let spectrumAnalysisArray = [];

function drawAmplitudeEnvelope() {
    if (globalParameters["drawEnvelope"]) {
        drawEnvelopeAlpha = 255;
    } else {
        drawEnvelopeAlpha -= 5;
    }
    if (drawEnvelopeAlpha > 0 && globalParameters.displayAnimation) {
        var totalTime = parseFloat(patchParameters.attack) + parseFloat(patchParameters.decay) + parseFloat(patchParameters.release);
        var attackX = map(patchParameters.attack, 0, totalTime, 0, width);
        var attackY = height - height / 2;
        var decayX = map(patchParameters.decay, 0, totalTime, 0, width) + attackX;
        var decayY = height - height * (patchParameters.sustain / 2);

        stroke(255, 255, 255, drawEnvelopeAlpha);
        strokeWeight(4);
        line(0, height, attackX, attackY);
        line(attackX, attackY, decayX, decayY);
        line(decayX, decayY, width, height);

        noStroke();
        fill(255, 255, 255, drawEnvelopeAlpha);
        ellipse(attackX, attackY, 20, 20);
        ellipse(decayX, decayY, 20, 20);
    }
}

function updatePrimeMovers() {
    if (primeMovers.length === 0) {
        return;
    }
    if (!globalParameters.displayAnimation) {
        primeMovers = [];
        return;
    }
    primeMovers.removeIf(mover => mover.isOutOfCanvas());
    for(let i = 0; i < primeMovers.length; i++) {
        if(i > 0) {
            primeMovers[i].drawConnection(primeMovers[i-1]);
        }
        primeMovers[i].update();
        primeMovers[i].display();
    }
}

function updateSecondaryMovers() {
    if (secondaryMovers.length === 0) {
        return;
    }
    if(!globalParameters.displayAnimation) {
        secondaryMovers = [];
        return;
    }
    secondaryMovers.removeIf(mover => mover.isOutOfCanvas());
    secondaryMovers.forEach(mover => {
        mover.update();
        mover.display();
    })
}

function drawSpectrum() {
    if (fftAnalysisArray.length > 1 && globalParameters.displayWaveform) {
        noStroke();
        fill(255,255,255,40);
        let w = width / fftSize;
        for (let i = 0; i < fftSize; i++) {
            let index = Math.floor(map(i, 0, fftSize, 0, width));
            rect(index, height - (map(fftAnalysisArray[i], -120, 0, 0, height)), w, height, 20);
        }
    }
}

function drawWaveform() {
    if (spectrumAnalysisArray.length > 1 && globalParameters.displayWaveform) {
        stroke(255);
        strokeWeight(1);
        beginShape();
        fill(255, 255, 255, 80);
        for (let i = 0; i < fftSize; i++) {
            let index = Math.floor(map(i, 0, fftSize, 0, width));
            vertex(index, height * 0.75 + (map(spectrumAnalysisArray[i], -1, 1, -height/4, height/4)));
        }
        endShape();

    }
}
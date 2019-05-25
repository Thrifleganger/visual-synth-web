'use strict';

let drawEnvelopeAlpha = 0;

function drawAmplitudeEnvelope() {
    if (patchParameters["drawEnvelope"]) {
        drawEnvelopeAlpha = 255;
    } else {
        drawEnvelopeAlpha -= 5;
    }
    if (drawEnvelopeAlpha > 0) {
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
    secondaryMovers.removeIf(mover => mover.isOutOfCanvas());
    secondaryMovers.forEach(mover => {
        mover.update();
        mover.display();
    })
}
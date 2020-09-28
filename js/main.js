'use-strict';

let secondaryMoversIntervals = [];
let touchEventActivated;

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
    drawSpectrum();
    //drawWaveform();
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
            "volume": map(coordinate.y, 0, height, 0, 1),
            "intervalId": intervalId
        });
    });
    let triggeredNotes = Array.from(availableNotes)
        .filter(([key, value]) => value.state === 'triggered');

    triggerAttack(triggeredNotes.map(([key,value]) => generateMidiNoteNumber(key)),
        Math.min(triggeredNotes.map(([key,value]) => value.volume))
    );
    triggeredNotes.forEach(([key, value]) => {
        availableNotes.get(key).state = "playing";
        availableNotes.get(key).frequency = generateMidiNoteNumber(key);
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
    triggerRelease(notesToBeReleased.map(note => availableNotes.get(note).frequency));
    secondaryMoversIntervals.forEach(intervalId => clearInterval(intervalId));
    notesToBeReleased.forEach(note => availableNotes.delete(note));
}

function positionAndStyleCanvas(canvas) {
    canvas.parent('main-canvas-container');
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-99');
}
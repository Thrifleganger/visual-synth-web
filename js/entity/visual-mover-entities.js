'use-strict'

class PrimeMover {

    constructor(x, y) {
        this.location = createVector(x, y);
        this.velocity = createVector(0, - globalParameters.speed);
        this.connectionThreshold = height/5;
    };

    update() {
        this.location.add(this.velocity);
    }

    isOutOfCanvas() {
        return this.location.y < 0;
    }

    display() {
        noStroke();
        fill(globalParameters.color);
        let size = map(this.location.y, 0, height, width * 0.0125, width * 0.0625);
        ellipse(this.location.x, this.location.y, size, size);
    }

    drawConnection(previousMover) {
        if (abs(this.location.y - previousMover.y) < this.connectionThreshold) {
            stroke(globalParameters.color);
            noFill();
            strokeWeight(1);
            let diffX = this.location.x - previousMover.x;
            let diffY = this.location.y - previousMover.y;
            if(diffY < 50) diffY = random(-50, 50);
            if(diffX < 50) diffX = random(-50, 50);
            bezier(this.location.x, this.location.y,
                this.location.x - random(0,diffX), this.location.y - random(0,diffY),
                this.location.x - random(0,diffX), this.location.y - random(0,diffY),
                previousMover.x, previousMover.y);
        }
    }

    get x() {
        return this.location.x;
    }

    get y() {
        return this.location.y;
    }

    set speed(value) {
        this.velocity = createVector(0, - globalParameters.speed);
    }
}

class SecondaryMover {

    constructor(x) {
        let initialSpeed = - globalParameters.speed * random(2,4);
        this.size = random(width * 0.01, width * 0.05);
        this.location = createVector(random(x - (width * 0.0625), x + (width * 0.0625)), height + 20);
        this.velocity = createVector(0, initialSpeed);
        this.alpha = Number.parseInt(random(50, 200));
    }

    update() {
        this.location.add(this.velocity);
    }

    isOutOfCanvas() {
        return this.location.y < 0;
    }

    display() {
        noStroke();
        fill(color(red(globalParameters.color), green(globalParameters.color), blue(globalParameters.color), this.alpha));
        ellipse(this.location.x, this.location.y, this.size, this.size);
    }

    get x() {
        return this.location.x;
    }

    get y() {
        return this.location.y;
    }

    set speed(value) {
        let initialSpeed = - globalParameters.speed * random(2,4);
        this.velocity = createVector(0, initialSpeed);
    }
}
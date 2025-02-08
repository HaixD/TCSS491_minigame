/** @typedef {import("../types/vector")} */
/** @typedef {import("../types/instance-vector")} */
/** @typedef {import("../util")} */

class PhysicsEntity {
    #counterAcceleration;

    /**
     * @param {Vector | undefined} terminalVelocity
     */
    constructor(terminalVelocity) {
        this.terminalVelocity = terminalVelocity || new Vector(Infinity, Infinity);
        this.velocity = new InstanceVector();
        this.acceleration = new InstanceVector();
        this.#counterAcceleration = new InstanceVector();
    }

    /**
     * Updates the velocity based on the current acceleration
     * @param {number} deltaTime
     * @returns displacement
     */
    updateVelocity(deltaTime) {
        const initialVelocity = this.velocity.asVector().map(Math.abs);

        // apply acceleration
        this.velocity.add(this.acceleration.multiply(deltaTime));

        const intermediateVelocity = this.velocity.asVector();

        // apply counter acceleration
        this.acceleration.set(0, 0);
        this.#addCounterAcceleration(intermediateVelocity);
        this.velocity.add(this.acceleration.multiply(deltaTime));

        if (!this.#counterAcceleration.isZero()) {
            if (isDirectionalCounter(intermediateVelocity.x, this.velocity.x)) {
                this.velocity.x = 0;
            }
            if (isDirectionalCounter(intermediateVelocity.y, this.velocity.y)) {
                this.velocity.y = 0;
            }
        }

        // apply terminal velocity
        const currentVelocity = this.velocity.map(Math.abs);
        if (isBetween(this.terminalVelocity.x, initialVelocity.x, currentVelocity.x)) {
            this.velocity.x = Math.max(
                Math.min(this.velocity.x, this.terminalVelocity.x),
                -this.terminalVelocity.x
            );
        }
        if ((isBetween(this.terminalVelocity.y), initialVelocity.y, currentVelocity.y)) {
            this.velocity.y = Math.max(
                Math.min(this.velocity.y, this.terminalVelocity.y),
                -this.terminalVelocity.y
            );
        }

        // reset temporary states
        this.acceleration.set(0, 0);
        this.#counterAcceleration.set(0, 0);

        return this.velocity.asVector().multiply(deltaTime);
    }

    /**
     * Adds the given acceleration to this Physics Entity's state
     * @param {Vector} acceleration
     */
    applyAcceleration(acceleration) {
        this.acceleration.add(acceleration);
    }

    /**
     * Applies an acceleration that goes in the opposite direction of velocity.
     * @param {Vector} acceleration
     */
    applyCounterAcceleration(acceleration) {
        this.#counterAcceleration.add(acceleration);
    }

    /**
     * Adds counterAcceleration to acceleration in the opposite direction of intermediate velocity
     * @param {Vector} intermediateVelocity
     */
    #addCounterAcceleration(intermediateVelocity) {
        if (intermediateVelocity.x > 0) {
            this.acceleration.add(new Vector(-this.#counterAcceleration.x, 0));
        } else if (intermediateVelocity.x < 0) {
            this.acceleration.add(new Vector(this.#counterAcceleration.x, 0));
        }

        if (intermediateVelocity.y > 0) {
            this.acceleration.add(new Vector(-this.#counterAcceleration.y, 0));
        } else if (intermediateVelocity.y < 0) {
            this.acceleration.add(new Vector(this.#counterAcceleration.y, 0));
        }
    }
}

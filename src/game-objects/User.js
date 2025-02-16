/** @typedef {import("../engine/types/instance-vector")} */

class User extends GameObject {
    static TYPE_ID = Symbol(User.name);

    /** @type {Vector | null} */
    #lastRightPosition;

    /**
     * @param {InstanceVector} position
     */
    constructor(position) {
        super();

        this.position = position;
        this.#lastRightPosition = null;
    }

    /**
     * Updates the state of this Game Object
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);

        if (events.mouseDown & 0b10) {
            if (this.#lastRightPosition === null) {
                this.#lastRightPosition = events.canvasMousePosition.asVector();
            } else {
                const currentMousePosition = events.canvasMousePosition.asVector();
                this.position.add(currentMousePosition.subtract(this.#lastRightPosition).negate());
                this.#lastRightPosition = currentMousePosition;
            }
        } else {
            this.#lastRightPosition = null;
        }
    }
}

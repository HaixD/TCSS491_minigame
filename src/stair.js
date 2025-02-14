/** @typedef {import("./obstacle")} */

class Stair extends Obstacle {
    #direction;
    static TYPE_ID = Stair.name;
    static DIRECTION = {
        LEFT: Symbol("left"),
        RIGHT: Symbol("right"),
    };

    /**
     * @param {InstanceVector} position
     * @param {Vector} shape
     * @param {Stair.DIRECTION[keyof Stair.DIRECTION]} direction direction in which stair in staircase ascends
     */
    constructor(position, shape, direction) {
        super(position, shape);

        this.#direction = direction === Stair.DIRECTION.LEFT ? -1 : 1;
    }

    /**
     * Returns true if the directions of this stair and xDisplacement are not zero and are not equal
     * @param {number} xDisplacement
     */
    isDirectionalCounter(xDisplacement) {
        return isDirectionalCounter(this.#direction, xDisplacement);
    }
}

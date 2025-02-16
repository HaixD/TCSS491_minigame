/** @typedef {import("./vector")} */

class Boundary {
    /**
     * @param {number} left
     * @param {number} right
     * @param {number} top
     * @param {number} bottom
     */
    constructor(left, right, top, bottom) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    /**
     * Checks if this Boundary collides with the other Boundary
     * @param {Boundary} other
     * @returns true if there is a collision and false otherwise
     */
    containsBoundary(other) {
        return !(
            this.left > other.right ||
            other.left > this.right ||
            this.top > other.bottom ||
            other.top > this.bottom
        );
    }

    asShape() {
        return new Vector(this.right - this.left, this.bottom - this.top);
    }

    /**
     *
     * @param {Vector | InstanceVector} other
     * @returns true if the point exists within this Boundary and false otherwise
     */
    containsPoint(other) {
        return this.containsBoundary(new Boundary(other.x, other.x, other.y, other.y));
    }
}

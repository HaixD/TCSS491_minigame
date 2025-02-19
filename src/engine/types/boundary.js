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
     * Returns an invalid boundary meant for fitting points
     */
    static getInvalidBoundary() {
        return new Boundary(Infinity, -Infinity, Infinity, -Infinity);
    }

    /**
     * Expands this boundary to fit the given point
     * @param {Vector | InstanceVector} vector
     */
    fitPoint(vector) {
        this.left = this.left < vector.x ? this.left : vector.x;
        this.right = this.right > vector.x ? this.right : vector.x;
        this.top = this.top < vector.x ? this.top : vector.y;
        this.bottom = this.bottom > vector.x ? this.bottom : vector.y;
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

    /**
     * Moves all sides of this Boundary by the given amount
     * @param {Vector | InstanceVector} vector
     */
    move(vector) {
        this.left += vector.x;
        this.right += vector.x;
        this.top += vector.y;
        this.bottom += vector.y;
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

    /**
     * Returns a copy of this vector
     */
    copy() {
        return new Boundary(this.left, this.right, this.top, this.bottom);
    }

    /**
     * Resolves the collision of this Boundary with the other (other Boundary treated as immovable)
     * @param {Vector} displacement
     * @param {Boundary} other
     * @returns the displacement this Boundary needs to not be in collision
     */
    resolveCollision(displacement, other) {
        const ERROR = 0.01;

        const horizontalDifference = Math.max(
            0,
            displacement.x > 0
                ? this.right - other.left
                : displacement.x < 0
                ? other.right - this.left
                : 0
        );
        const verticalDifference = Math.max(
            0,
            displacement.y > 0
                ? this.bottom - other.top
                : displacement.y < 0
                ? other.bottom - this.top
                : 0
        );

        const direction = displacement.normalize().negate();
        const tHorizontal = Math.abs(horizontalDifference / direction.x);
        const tVertical = Math.abs(verticalDifference / direction.y);

        const state = isNaN(tHorizontal) * 0b10 + isNaN(tVertical) * 0b1;
        switch (state) {
            case 0b00: {
                const newDisplacement = direction.multiply(
                    Math.min(tHorizontal, tVertical) + ERROR
                );

                if (tHorizontal < tVertical) {
                    return new Vector(newDisplacement.x, 0);
                } else if (tVertical < tHorizontal) {
                    return new Vector(0, newDisplacement.y);
                }

                return new Vector();
            }
            case 0b10:
                return direction.multiply(tVertical + ERROR);
            case 0b01:
                return direction.multiply(tHorizontal + ERROR);
        }

        return new Vector();
    }
}

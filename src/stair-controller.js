/** @typedef {import("./stair")} */
/** @typedef {import("./engine/components/collider-rect")} */

class StairController {
    #stairMode;

    /**
     * @param {ColliderRect} snapUpCollider
     * @param {ColliderRect} snapDownCollider
     * @param {number} displacementThreshold
     */
    constructor(snapUpCollider, snapDownCollider, displacementThreshold) {
        this.snapUpCollider = snapUpCollider;
        this.snapDownCollider = snapDownCollider;
        this.displacementThreshold = displacementThreshold;

        this.#stairMode = false;

        if (!this.snapUpCollider.collisionTargets.has(Stair.TYPE_ID)) {
            throw Error("snapUpCollider should have Stair as one of its collision targets");
        }
        if (
            !this.snapDownCollider.collisionTargets.has(Stair.TYPE_ID) ||
            this.snapDownCollider.collisionTargets.size != 1
        ) {
            throw Error("snapDownCollider should have Stair as its only collision target");
        }
    }

    /**
     * Resolves all collisions passed into this function.
     *
     * Note: This function should only be used for resolving collisions with this.snapUpCollider
     * @param {Vector} displacement
     * @param {ColliderRect[]} collisions list of all collisions with this.snapUpCollider
     */
    #resolveCollisions(displacement, collisions) {
        let stairFound = false;

        const adjustment = new InstanceVector();
        for (const collider of collisions) {
            if (collider.parent.getTypeID() === Stair.TYPE_ID) {
                stairFound = true;
            }
            adjustment.add(this.snapUpCollider.resolveCollision(displacement, collider));
        }

        this.#stairMode = stairFound;

        return adjustment.asVector();
    }

    /**
     * Gets the highest collision in collisions
     * @param {ColliderRect[]} collisions
     */
    #getHighestStair(collisions) {
        /** @type {{y: number, collider: null | ColliderRect}} */
        const highestCollider = { y: Infinity, collider: null };

        for (const collider of collisions) {
            if (collider.parent.getTypeID() !== Stair.TYPE_ID) continue;
            if (collider.position.y < highestCollider.y) {
                highestCollider.y = collider.position.y;
                highestCollider.collider = collider;
            }
        }

        return highestCollider.collider;
    }

    /**
     * Attempts to snap the player down if possible, otherwise snaps the player up.
     * If player cannot snap then the snap up collider is treated as a normal collider.
     *
     * @param {Vector} displacement
     */
    updateState(displacement) {
        const selfY = this.snapUpCollider.getBoundary().bottom;

        // snap down
        if (this.#stairMode && isBetween(displacement.y, 0, this.displacementThreshold)) {
            const collisions = [...this.snapDownCollider.getCollisions()];
            const collider = this.#getHighestStair(collisions);

            if (collider !== null) {
                /** @type {Stair} */
                const stair = collider.parent;

                if (stair.isDirectionalCounter(displacement.x)) {
                    return new Vector(0, collider.position.y - selfY);
                }
            }
        }

        // snap up
        {
            const collisions = [...this.snapUpCollider.getCollisions()];
            const collider = this.#getHighestStair(collisions);

            if (collider === null) {
                return this.#resolveCollisions(displacement, collisions);
            } else {
                /** @type {Stair} */
                const stair = collider.parent;

                if (stair.isDirectionalCounter(displacement.x)) {
                    return this.#resolveCollisions(displacement, collisions);
                } else {
                    return new Vector(0, collider.position.y - selfY);
                }
            }
        }
    }
}

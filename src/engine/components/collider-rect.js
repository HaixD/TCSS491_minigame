/** @typedef {import("../types/vector")} */
/** @typedef {import("../types/instance-vector")} */
/** @typedef {import("../types/boundary")} */
/** @typedef {import("../types/game-object")} */
/** @typedef {import("../types/component")} */

/** @typedef {{nextColliderID: number, colliders: {[key: string]: ColliderRect}}} ColliderContext */

/**
 * ColliderRect exists to detect and resolve collisions between 2 or more rectangles
 *
 * NOTE: for "perfect fit" scenarios, ensure there is between [1, 0) unit of space (things will appear to be a perfect fit)
 */
class ColliderRect {
    /** @type {{[context: string]: ColliderContext}}} */
    static #contexts = {};
    static #activeContext = "";

    #colliderID;
    #context;

    /**
     * @param {GameObject} parent
     * @param {InstanceVector} position
     * @param {Vector} offset
     * @param {Vector} shape
     * @param {...Symbol} collisionTargets
     */
    constructor(parent, position, offset, shape, ...collisionTargets) {
        this.parent = parent;
        this.position = position;
        this.offset = offset;
        this.shape = shape;
        this.collisionTargets = new Set(collisionTargets);

        if (ColliderRect.#activeContext === "") {
            throw new Error("No active context set");
        }
        this.#context = ColliderRect.#contexts[ColliderRect.#activeContext];

        this.#colliderID = this.#context.nextColliderID++;
        this.#context.colliders[this.#colliderID] = this;
    }

    /**
     * Adds a context under the given key and sets the active context to that key
     *
     * Note: this function should only be used by the game engine, only use to override default behavior
     * @param {string} key
     */
    static addContext(key) {
        ColliderRect.#contexts[key] = { nextColliderID: 0, colliders: {} };
        ColliderRect.setContext(key);
    }

    /**
     * Sets the active context to the given key
     *
     * Note: this function should only be used by the game engine, only use to override default behavior
     * @param {string} key
     */
    static setContext(key) {
        if (!(key in ColliderRect.#contexts)) {
            throw new Error("Context does not exist");
        }
        ColliderRect.#activeContext = key;
    }

    delete() {
        delete this.#context.colliders[this.#colliderID];
    }

    /**
     * Finds the first colliding rectangle and returns it.
     * @returns The ColliderRect object which collides with this one
     */
    *getCollisions() {
        for (const collider of Object.values(this.#context.colliders)) {
            if (collider.parent.delete) {
                collider.delete();
                continue;
            }

            if (
                this !== collider &&
                this.collisionTargets.has(collider.parent.constructor.TYPE_ID) &&
                this.collidesWith(collider)
            ) {
                yield collider;
            }
        }
    }

    /**
     * Gets all colliders colliding with the given boundary in the current active context
     * @param {...Symbol} collisionTargets
     * @param {Boundary} boundary
     * @returns The ColliderRect object which collides with this one
     */
    static *scanColliders(boundary, ...collisionTargets) {
        const colliders = ColliderRect.#contexts[ColliderRect.#activeContext].colliders;
        for (const collider of Object.values(colliders)) {
            if (collider.parent.delete) {
                collider.delete();
                continue;
            }

            if (
                collisionTargets.has(collider.parent.getTypeID()) &&
                boundary.containsBoundary(collider.getBoundary())
            ) {
                yield collider;
            }
        }
    }

    /**
     * Gets the x and y starts and ends of this ColliderRect.
     * @returns The bounds of this ColliderRect
     */
    getBoundary() {
        const start = this.position.asVector().add(this.offset);
        const end = start.add(this.shape);

        return new Boundary(start.x, end.x, start.y, end.y);
    }

    /**
     * Checks if this ColliderRect collides with the other ColliderRect
     * @param {ColliderRect} other
     * @returns true if there is a collision and false otherwise
     */
    collidesWith(other) {
        return this.getBoundary().containsBoundary(other.getBoundary());
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    drawCollider(ctx) {
        const position = this.position.asVector().add(this.offset);

        ctx.strokeRect(position.x, position.y, this.shape.x, this.shape.y);
    }

    /**
     * Resolves the collision of this ColliderRect with the other (other ColliderRect treated as immovable)
     * @param {Vector} displacement
     * @param {ColliderRect} other
     * @returns the displacement this ColliderRect needs to not be in collision
     */
    resolveCollision(displacement, other) {
        const ERROR = 0.01;

        const otherBounds = other.getBoundary();
        const selfBounds = this.getBoundary();

        const horizontalDifference = Math.max(
            0,
            displacement.x > 0
                ? selfBounds.right - otherBounds.left
                : displacement.x < 0
                ? otherBounds.right - selfBounds.left
                : 0
        );
        const verticalDifference = Math.max(
            0,
            displacement.y > 0
                ? selfBounds.bottom - otherBounds.top
                : displacement.y < 0
                ? otherBounds.bottom - selfBounds.top
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

    /**
     * Resolves all collisions currently happening with this ColliderRect
     * @param {Vector} displacement
     * @returns the displacement this ColliderRect needs to not be in collision
     */
    resolveCollisions(displacement) {
        const collisions = this.getCollisions();
        let neededDisplacement = new InstanceVector();

        while (true) {
            const { value: collider, done } = collisions.next();
            if (done) break;

            neededDisplacement.add(this.resolveCollision(displacement, collider));
        }

        return neededDisplacement.asVector();
    }
}

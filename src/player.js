/** @typedef {import("./engine/types/game-object")} */
/** @typedef {import("./engine/components/sprite")} */
/** @typedef {import("./engine/components/falling-player-controller")} */
/** @typedef {import("./engine/util")} */
/** @typedef {import("./bullet")} */

class Player extends GameObject {
    static TYPE_ID = Symbol(Player.name);

    static #scale = 5;
    static #shape = new Vector(12, 24);

    /**
     * @param {InstanceVector} position
     */
    constructor(position) {
        super();

        this.position = position;

        const playerShape = Player.#shape.multiply(Player.#scale);
        const legHeight = playerShape.y / 2;
        const snapHeight = 40;
        this.legCollider = new ColliderRect(
            this,
            this.position,
            new Vector(0, playerShape.y - legHeight),
            new Vector(playerShape.x, legHeight),
            Obstacle.TYPE_ID
        );
        this.torsoCollider = new ColliderRect(
            this,
            this.position,
            new Vector(),
            new Vector(playerShape.x, playerShape.y - legHeight),
            Obstacle.TYPE_ID
        );
        this.snapCollider = new ColliderRect(
            this,
            this.position,
            new Vector(0, playerShape.y),
            new Vector(playerShape.x, snapHeight),
            Obstacle.TYPE_ID
        );
        this.controller = new FallingPlayerController(
            new Vector(750, Infinity),
            1500,
            1500,
            7500,
            1000,
            2000,
            0,
            2000,
            0,
            2000,
            1000,
            700
        );
        this.lastBlockedDirections = FallingPlayerController.BLOCK_DIRECTION.NO_BLOCK;
    }

    /**
     * Gets the boundary of this Game Object
     * @returns {Boundary | null}
     */
    getBoundary() {
        const shape = Player.#shape.multiply(Player.#scale);

        return new Boundary(
            this.position.x,
            this.position.x + shape.x,
            this.position.y,
            this.position.y + shape.y
        );
    }

    /**
     * @override
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);

        const table = FallingPlayerController.BLOCK_DIRECTION;
        const grounded = Boolean(this.lastBlockedDirections & table.BELOW);

        if (events.leftClick !== null) {
            const difference = this.position
                .asVector()
                .add(this.torsoCollider.shape.multiply(0.5))
                .subtract(events.leftClick)
                .multiply(5);
            this.controller.velocity.add(difference);
        }
        if (events.scroll) {
            const sceneNumber = events.scroll > 0 ? 1 : 2;
            GameEngine.setScene(`scene${sceneNumber}`);
        }

        let offset = new Vector();

        if (events.keys[" "]) {
            offset = offset.add(0, -1);
        }
        if (events.keys["a"]) {
            offset = offset.add(-1);
        }
        if (events.keys["d"]) {
            offset = offset.add(1);
        }

        const displacement = this.controller.updateAll(
            deltaTime,
            offset,
            this.lastBlockedDirections
        );
        this.position.add(displacement);

        const torsoAdjustment = this.torsoCollider.resolveCollisions(displacement);
        this.position.add(torsoAdjustment);

        let legAdjustment = new Vector();
        if (grounded) {
            legAdjustment = this.snapUp(displacement);
        } else {
            legAdjustment = this.legCollider.resolveCollisions(displacement);
            // legAdjustment = legAdjustment.add(this.snapDown(displacement));
        }
        this.position.add(legAdjustment);

        this.lastBlockedDirections = table.NO_BLOCK;
        this.lastBlockedDirections |= table.LEFT * (torsoAdjustment.x > 0 || legAdjustment.x > 0);
        this.lastBlockedDirections |= table.RIGHT * (torsoAdjustment.x < 0 || legAdjustment.x < 0);
        this.lastBlockedDirections |= table.ABOVE * (torsoAdjustment.y > 0);
        this.lastBlockedDirections |= table.BELOW * (legAdjustment.y < 0);
    }

    /**
     * @override
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx, offset) {
        super.draw(ctx, offset);

        // debugging
        this.torsoCollider.drawCollider(ctx, offset);
        this.legCollider.drawCollider(ctx, offset);
        this.snapCollider.drawCollider(ctx, offset);
    }

    snapUp(displacement) {
        const highestCollider = { y: Infinity, collider: null };

        const collisions = this.legCollider.getCollisions();
        while (true) {
            const { value: collider, done } = collisions.next();
            if (done) break;

            if (collider.position.y < highestCollider.y) {
                highestCollider.y = collider.position.y;
                highestCollider.collider = collider;
            }
        }

        if (highestCollider.collider === null) {
            return this.legCollider.resolveCollisions(displacement);
        }

        return this.legCollider.resolveCollision(new Vector(0, 1), highestCollider.collider);
    }

    snapDown(displacement) {
        const lowestCollider = { y: -Infinity, collider: null };
        const collisions = this.snapCollider.getCollisions();

        while (true) {
            const { value: collider, done } = collisions.next();
            if (done) break;
            if (lowestCollider.collider !== null) return new Vector();

            if (collider.position.y > lowestCollider.y) {
                lowestCollider.y = collider.position.y;
                lowestCollider.collider = collider;
            }
        }

        if (lowestCollider.y < this.snapCollider.position.y) {
            return new Vector();
        }

        return new Vector(
            0,
            lowestCollider.collider !== null ? lowestCollider.y - this.snapCollider.position.y : 0
        );
    }
}

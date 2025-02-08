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

        this.sprite = new Sprite(this.position, {
            idle: new Spritesheet(
                AssetManager.getImage("anims/placeholder-walk.png"),
                new Vector(),
                Player.#shape,
                Player.#scale,
                1,
                10
            ),
            run: new Spritesheet(
                AssetManager.getImage("anims/placeholder-walk.png"),
                new Vector(),
                Player.#shape,
                Player.#scale,
                4,
                0.1
            ),
        });

        const playerShape = Player.#shape.multiply(Player.#scale);
        const legHeight = playerShape.y / 8;
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
        this.controller = new FallingPlayerController(
            new Vector(750, Infinity),
            1500,
            1500,
            7500,
            1000,
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
            this.sprite.setHorizontalFlip(true);
            offset = offset.add(-1);
        }
        if (events.keys["d"]) {
            this.sprite.setHorizontalFlip(false);
            offset = offset.add(1);
        }

        if (offset.isZero()) {
            this.sprite.setState("idle");
        } else {
            this.sprite.setState("run");
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
            legAdjustment = this.legCollider.resolveCollisions(new Vector(0, 1));
        } else {
            legAdjustment = this.legCollider.resolveCollisions(displacement);
        }
        this.position.add(legAdjustment);

        this.sprite.setVerticalFlip(!grounded && this.controller.velocity.y > 0);
        this.sprite.incrementTimeline(deltaTime);

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

        // this.sprite.drawSprite(ctx, offset);

        // debugging
        this.torsoCollider.drawCollider(ctx, offset);
        this.legCollider.drawCollider(ctx, offset);
        // this.sprite.drawOutline(ctx, offset);
    }

    testCollisions(deltaTime) {
        const initialVelocity = this.controller.velocity.asVector();
        const initialPosition = this.position.asVector();

        this.controller.updateNatural();
        const displacement = this.controller.updateVelocity(deltaTime);
        this.position.add(displacement);
        const test = this.torsoCollider.resolveCollisions(displacement);

        this.controller.overrideVelocity(initialVelocity);
        this.position.set(initialPosition);

        return test;
    }
}

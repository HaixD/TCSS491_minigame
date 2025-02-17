/** @typedef {import("./engine/types/game-object")} */
/** @typedef {import("./engine/components/sprite")} */
/** @typedef {import("./engine/components/falling-player-controller")} */
/** @typedef {import("./engine/util")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/gameengine")} */

class Player extends GameObject {
    static TYPE_ID = Symbol(Player.name);

    static #scale = 4.99;
    static #shape = new Vector(12, 24);

    /**
     * @param {InstanceVector} position
     */
    constructor(position) {
        super();

        this.position = position;

        const playerShape = Player.#shape.multiply(Player.#scale);
        this.collider = new ColliderRect(
            this,
            this.position,
            new Vector(),
            new Vector(playerShape.x, playerShape.y),
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
        this.sprite = new Sprite(this.position, {
            run: new Spritesheet(
                AssetManager.getImage("/anims/placeholder-walk.png"),
                new Vector(),
                Player.#shape,
                Player.#scale,
                4,
                0.5
            ),
        });
        this.sprite.setState("run");

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

        this.#handleExtraEvents(events);
        const desiredDirection = this.#getOffset(events);

        let displacement = this.controller.updateAll(
            deltaTime,
            desiredDirection,
            this.lastBlockedDirections
        );
        this.position.add(displacement);

        const adjustment = this.collider.resolveCollisions(displacement);
        this.position.add(adjustment);

        // compute last blocked directions with a 1 update delay (so things match up visually)
        this.lastBlockedDirections = table.NO_BLOCK;
        this.lastBlockedDirections |= table.LEFT * (adjustment.x > 0);
        this.lastBlockedDirections |= table.RIGHT * (adjustment.x < 0);
        this.lastBlockedDirections |= table.ABOVE * (adjustment.y > 0);
        this.lastBlockedDirections |= table.BELOW * (adjustment.y < 0);

        this.sprite.incrementTimeline(deltaTime);
        this.sprite.setHorizontalFlip(this.controller.velocity.x < 0);
        this.sprite.rotation += deltaTime;
    }

    /**
     * @override
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx) {
        super.draw(ctx);

        this.sprite.drawSprite(ctx);

        // debugging
        this.collider.drawCollider(ctx);
        this.sprite.drawOutline(ctx);
    }

    /**
     * @param {InputEvents} events
     */
    #handleExtraEvents(events) {
        if (events.leftClick !== null) {
            const difference = this.position
                .asVector()
                .add(this.collider.shape.multiply(0.5))
                .subtract(events.worldMousePosition)
                .multiply(5);
            this.controller.velocity.add(difference);
        }
        if (events.scroll) {
            const sceneNumber = events.scroll > 0 ? 1 : 2;
            GameEngine.setScene(`scene${sceneNumber}`);
        }

        const scene = GameEngine.getActiveScene();
        if (events.keys["="]) {
            scene.scale += 0.05;
        }
        if (events.keys["-"]) {
            scene.scale = Math.max(0.05, scene.scale - 0.05);
        }
    }

    /**
     * @param {InputEvents} events
     */
    #getOffset(events) {
        const offset = new InstanceVector();

        if (events.keys[" "]) {
            offset.add(0, -1);
        }
        if (events.keys["a"]) {
            offset.add(-1);
        }
        if (events.keys["d"]) {
            offset.add(1);
        }

        return offset.asVector();
    }
}

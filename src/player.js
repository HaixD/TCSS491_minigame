/** @typedef {import("./engine/types/game-object")} */
/** @typedef {import("./engine/components/sprite")} */
/** @typedef {import("./engine/components/falling-player-controller")} */
/** @typedef {import("./engine/util")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./stair-controller")} */

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
        const legHeight = playerShape.y / 2;
        const snapHeight = 40;
        this.topCollider = new ColliderRect(
            this,
            this.position,
            new Vector(),
            new Vector(playerShape.x, playerShape.y - legHeight),
            Obstacle.TYPE_ID,
            Stair.TYPE_ID
        );
        this.middleCollider = new ColliderRect(
            this,
            this.position,
            new Vector(0, playerShape.y - legHeight),
            new Vector(playerShape.x, legHeight),
            Obstacle.TYPE_ID,
            Stair.TYPE_ID
        );
        this.bottomCollider = new ColliderRect(
            this,
            this.position,
            new Vector(0, playerShape.y),
            new Vector(playerShape.x, snapHeight),
            Stair.TYPE_ID
        );
        this.stairController = new StairController(
            this.middleCollider,
            this.bottomCollider,
            Infinity
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
                new Vector(12, 24),
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

        const topAdjustment = this.topCollider.resolveCollisions(displacement);
        this.position.add(topAdjustment);

        const stairAdjustment = this.stairController.updateState(displacement);
        this.position.add(stairAdjustment);

        // compute last blocked directions with a 1 update delay (so things match up visually)
        this.lastBlockedDirections = table.NO_BLOCK;
        this.lastBlockedDirections |= table.LEFT * (topAdjustment.x > 0 || stairAdjustment.x > 0);
        this.lastBlockedDirections |= table.RIGHT * (topAdjustment.x < 0 || stairAdjustment.x < 0);
        this.lastBlockedDirections |= table.ABOVE * (topAdjustment.y > 0);
        this.lastBlockedDirections |= table.BELOW * (stairAdjustment.y < 0);

        this.sprite.incrementTimeline(deltaTime);
        this.sprite.setHorizontalFlip(this.controller.velocity.x < 0);
        // this.sprite.rotation += deltaTime;
    }

    /**
     * @override
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx) {
        super.draw(ctx);

        // this.sprite.drawSprite(ctx);

        // debugging
        this.topCollider.drawCollider(ctx);
        this.middleCollider.drawCollider(ctx);
        // this.sprite.drawOutline(ctx);
        // this.bottomCollider.drawCollider(ctx);
    }

    /**
     * @param {InputEvents} events
     */
    #handleExtraEvents(events) {
        if (events.leftClick !== null) {
            const difference = this.position
                .asVector()
                .add(this.topCollider.shape.multiply(0.5))
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

/** @typedef {import("../../engine/types/game-object")} */
/** @typedef {import("../../engine/components/sprite")} */
/** @typedef {import("../../engine/components/falling-player-controller")} */
/** @typedef {import("../../engine/util")} */
/** @typedef {import("../../engine/assetmanager")} */
/** @typedef {import("../../engine/gameengine")} */
/** @typedef {import("../../engine/types/instance-vector")} */
/** @typedef {import("../../engine/types/game-object")} */

class Player extends GameObject {
    static TYPE_ID = Symbol(Player.name);

    static #scale = 4.99;
    static #shape = new Vector(12, 24);
    static #scaledShape = Player.#shape.multiply(Player.#scale);
    static #scaledHalfShape = Player.#scaledShape.multiply(0.5);

    /**
     * @param {InstanceVector} position
     */
    constructor(position) {
        super();

        this.position = position;

        this.attackState = new AttackState();
        this.collider = new ColliderRect(
            this,
            this.position,
            new Vector(),
            Player.#scaledShape,
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
            0,
            0
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

        this.lastBlockedDirections = FallingPlayerController.BLOCK_DIRECTION.NO_BLOCK;
    }

    /**
     * Gets the boundary of this Game Object
     * @returns {Boundary | null}
     */
    getBoundary() {
        return new Boundary(
            this.position.x,
            this.position.x + Player.#scaledShape.x,
            this.position.y,
            this.position.y + Player.#scaledShape.y
        );
    }

    /**
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);
        const table = FallingPlayerController.BLOCK_DIRECTION;
        const attackState = this.attackState.updateState(events);

        // movement
        const displacement = this.controller.updateAll(
            deltaTime,
            this.#getOffset(events),
            this.lastBlockedDirections
        );
        this.position.add(displacement);
        const adjustment = this.collider.resolveCollisions(displacement);
        this.position.add(adjustment);

        this.lastBlockedDirections = table.NO_BLOCK;
        this.lastBlockedDirections |= table.LEFT * (adjustment.x > 0);
        this.lastBlockedDirections |= table.RIGHT * (adjustment.x < 0);
        this.lastBlockedDirections |= table.ABOVE * (adjustment.y > 0);
        this.lastBlockedDirections |= table.BELOW * (adjustment.y < 0);

        // update components
        this.sprite.incrementTimeline(deltaTime);
        this.sprite.setHorizontalFlip(
            events.worldMousePosition.x < this.position.x + Player.#scaledHalfShape.x
        );
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
        // this.collider.drawCollider(ctx);
        // this.sprite.drawOutline(ctx);
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

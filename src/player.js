/** @typedef {import("./engine/types/game-object")} */
/** @typedef {import("./engine/components/sprite")} */
/** @typedef {import("./engine/components/falling-player-controller")} */
/** @typedef {import("./engine/util")} */
/** @typedef {import("./bullet")} */

class Player extends GameObject {
    static TYPE_ID = Symbol(Player.name);

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
                new Vector(12, 24),
                5,
                1,
                10
            ),
            run: new Spritesheet(
                AssetManager.getImage("anims/placeholder-walk.png"),
                new Vector(),
                new Vector(12, 24),
                5,
                4,
                0.1
            ),
        });
        this.collider = new ColliderRect(
            this,
            this.position,
            new Vector(0, 0),
            new Vector(12 * 5, 24 * 5),
            Obstacle.TYPE_ID
        );
        this.controller = new FallingPlayerController(
            new Vector(500, Infinity),
            1000,
            5000,
            1000,
            1000,
            2000,
            0,
            0
        );

        this.groundFrames = 0;
        this.blockFrames = 0;
    }

    /**
     * Gets the boundary of this Game Object
     * @returns {Boundary | null}
     */
    getBoundary() {
        return this.collider.getBoundary();
    }

    /**
     * @override
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);

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
            this.groundFrames <= 0,
            this.blockFrames <= 0
        );
        this.position.add(displacement);

        const adjustment = this.collider.resolveCollisions(displacement);
        this.position.add(adjustment);

        this.blockFrames = adjustment.x !== 0 ? this.blockFrames - 1 : 2;
        this.groundFrames = adjustment.y < 0 ? this.groundFrames - 1 : 2;

        this.sprite.setVerticalFlip(adjustment.y >= 0 && this.controller.velocity.y > 0);
        this.sprite.incrementTimeline(deltaTime);
    }

    /**
     * @override
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx, offset) {
        super.draw(ctx, offset);

        this.sprite.drawSprite(ctx, offset);

        // debugging
        this.collider.drawCollider(ctx, offset);
        // this.sprite.drawOutline(ctx, offset);
    }

    testCollisions(deltaTime) {
        const initialVelocity = this.controller.velocity.asVector();
        const initialPosition = this.position.asVector();

        this.controller.updateNatural();
        const displacement = this.controller.updateVelocity(deltaTime);
        this.position.add(displacement);
        const test = this.collider.resolveCollisions(displacement);

        this.controller.overrideVelocity(initialVelocity);
        this.position.set(initialPosition);

        return test;
    }
}

/** @typedef {import("./engine/types/game-object")} */

class Obstacle extends GameObject {
    static TYPE_ID = Symbol(Obstacle.name);

    /**
     * @param {InstanceVector} position
     * @param {Vector} shape
     */
    constructor(position, shape) {
        super();
        this.position = position;
        this.shape = shape;
        this.collider = new ColliderRect(this, this.position, new Vector(), this.shape);
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
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx, offset) {
        const position = this.position.asVector().subtract(offset);

        ctx.fillRect(position.x, position.y, this.shape.x, this.shape.y);
    }
}

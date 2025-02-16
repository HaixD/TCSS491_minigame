class Room extends GameObject {
    static SIZE = Tile.SIZE * 16;

    /**
     * @param {Vector} position
     */
    constructor(position) {
        super();

        this.position = position;
    }

    getBoundary() {
        return new Boundary(
            this.position.x,
            this.position.x + Room.SIZE,
            this.position.y,
            this.position.y + Room.SIZE
        );
    }

    /**
     * Draws this Game Object on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx, offset) {
        super.draw(ctx, offset);

        const { x, y } = this.position.subtract(offset);
        ctx.strokeRect(x, y, Room.SIZE, Room.SIZE);
    }
}

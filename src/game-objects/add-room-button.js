class AddRoomButton extends GameObject {
    #boundary;
    #mouseOver;

    /**
     * @param {number} row
     * @param {number} col
     */
    constructor(row, col) {
        super();

        this.row = row;
        this.col = col;
        this.position = new Vector(col, row).multiply(Room.SIZE);
        this.#boundary = this.getBoundary();
        this.#mouseOver = false;
    }

    /**
     * Updates the state of this Game Object
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);

        this.#mouseOver = this.#boundary.containsPoint(events.worldMousePosition);

        if (events.leftClick !== null && this.#mouseOver) {
            GameMap.addRoom(this.row, this.col, new Room(this.row, this.col));
        }
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

        if (this.#mouseOver) {
            ctx.save();

            ctx.lineWidth = 2;

            const { x, y } = this.position.subtract(offset);
            ctx.strokeRect(x, y, Room.SIZE, Room.SIZE);

            ctx.restore();
        }
    }
}

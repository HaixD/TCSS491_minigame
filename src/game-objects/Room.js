/** @typedef {import("./tile")} */

class Room extends GameObject {
    static TILE_SIZE = 16;
    static SIZE = Tile.SIZE * Room.TILE_SIZE;

    #boundary;
    #mouseOver;
    /** @type {Vector | null} */
    #mouseTilePosition;
    /** @type {number[][]} */
    #tiles;

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
        this.#mouseTilePosition = null;
        this.#tiles = Array(Room.TILE_SIZE)
            .fill(0)
            .map(() =>
                Array(Room.TILE_SIZE)
                    .fill(0)
                    .map(() => Tile.AIR)
            );
    }

    /**
     * Updates the state of this Game Object
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);

        this.#mouseOver = this.#boundary.containsPoint(events.worldMousePosition);

        if (this.#mouseOver) {
            const relativePosition = events.worldMousePosition.asVector().subtract(this.position);
            const row = Math.min(Math.floor(relativePosition.y / Tile.SIZE), Room.TILE_SIZE - 1);
            const col = Math.min(Math.floor(relativePosition.x / Tile.SIZE), Room.TILE_SIZE - 1);

            this.#mouseTilePosition = new Vector(col, row);

            if (events.mouseDown === 1) {
                console.log(GUI.getTile());
                this.#tiles[row][col] = GUI.getTile();
            }
        } else {
            this.#mouseTilePosition = null;
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
     */
    draw(ctx) {
        super.draw(ctx);

        ctx.save();

        ctx.lineWidth = 2;

        const position = this.position;
        ctx.strokeRect(position.x, position.y, Room.SIZE, Room.SIZE);

        this.#tiles.forEach((row, r) =>
            row.forEach((tile, c) => {
                const tilePosition = position.add(new Vector(c, r).multiply(Tile.SIZE));
                Tile.drawTile(tile, ctx, tilePosition);
            })
        );

        if (this.#mouseTilePosition !== null) {
            const { x: tileX, y: tileY } = position.add(
                this.#mouseTilePosition.multiply(Tile.SIZE)
            );
            ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
            ctx.fillRect(tileX, tileY, Tile.SIZE, Tile.SIZE);
        }

        ctx.restore();
    }
}

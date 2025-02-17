/** @typedef {import("./game-objects/chunk")} */
/** @typedef {import("./engine/types/boundary")} */

class GameMap {
    /** @type {{[x: string]: {[y: string]: Chunk}}} */
    static #chunks = {};
    static #bounds = new Boundary(Infinity, -Infinity, Infinity, -Infinity);
    static #hasPlayer = false;

    constructor() {
        throw new Error("GameMap is a static class and should not have any instances");
    }

    static setTile(x, y, tile) {
        if (x > this.#bounds.right) this.#bounds.right = x;
        if (x < this.#bounds.left) this.#bounds.left = x;
        if (y > this.#bounds.bottom) this.#bounds.bottom = y;
        if (y < this.#bounds.top) this.#bounds.top = y;

        const chunkX = Math.floor(x / Chunk.SIZE) * Chunk.SIZE;
        const chunkY = Math.floor(y / Chunk.SIZE) * Chunk.SIZE;

        const chunk = this.#getChunk(chunkX, chunkY);

        chunk.setTile(x, y, tile);
    }

    static asArray() {
        const shape = this.#bounds
            .asShape()
            .multiply(1 / 48)
            .map(Math.ceil)
            .add(1, 1);
        console.log(shape.toString());

        /** @type {number[][]} */
        const map = Array(shape.x)
            .fill(0)
            .map(() =>
                Array(shape.y)
                    .fill(0)
                    .map(() => Tile.AIR)
            );
        for (const col of Object.values(this.#chunks)) {
            for (const chunk of Object.values(col)) {
                for (const { x, y, tile } of chunk.getTiles()) {
                    const xIndex = Math.floor((x - this.#bounds.left) / 48);
                    const yIndex = Math.floor((y - this.#bounds.top) / 48);
                    map[xIndex][yIndex] = tile;
                }
            }
        }

        return map;
    }

    /**
     * @param {Chunk} chunk
     */
    static #addChunk(chunk) {
        this.#chunks[chunk.position.x] ||= {};
        this.#chunks[chunk.position.x][chunk.position.y] = chunk;

        GameEngine.addGameObject("tile", chunk);
    }

    /**
     * @param {number} chunkX
     * @param {number} chunkY
     */
    static #getChunk(chunkX, chunkY) {
        if (this.#chunks[chunkX] === undefined || this.#chunks[chunkX][chunkY] === undefined) {
            const chunk = new Chunk(new Vector(chunkX, chunkY));
            this.#addChunk(chunk);
            return chunk;
        }

        return this.#chunks[chunkX][chunkY];
    }
}

/** @typedef {import("./game-objects/chunk")} */
/** @typedef {import("./engine/types/boundary")} */

class GameMap {
    /** @type {{[x: string]: {[y: string]: Chunk}}} */
    static #chunks = {};

    constructor() {
        throw new Error("GameMap is a static class and should not have any instances");
    }

    static setTile(x, y, tile) {
        const chunkX = Math.floor(x / Chunk.SIZE) * Chunk.SIZE;
        const chunkY = Math.floor(y / Chunk.SIZE) * Chunk.SIZE;

        if (tile === Tile.AIR && !this.#hasChunk(chunkX, chunkY)) {
            return;
        }

        const chunk = this.#getChunk(chunkX, chunkY);
        chunk.setTile(x, y, tile);

        if (chunk.isEmpty()) {
            this.#deleteChunk(chunkX, chunkY);
            console.log(this.#chunks);
        }
    }

    static asArray() {
        const shape = bounds
            .asShape()
            .multiply(1 / 48)
            .map(Math.ceil)
            .add(1, 1);

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
                    const xIndex = Math.floor((x - bounds.left) / 48);
                    const yIndex = Math.floor((y - bounds.top) / 48);
                    map[xIndex][yIndex] = tile;
                }
            }
        }

        return map;
    }

    static clear() {
        for (const chunk of this.#getChunks()) {
            chunk.triggerDelete();
        }

        this.#chunks = {};
    }

    static *#getChunks() {
        for (const col of Object.values(this.#chunks)) {
            for (const chunk of Object.values(col)) {
                yield chunk;
            }
        }
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
        if (!this.#hasChunk(chunkX, chunkY)) {
            const chunk = new Chunk(new Vector(chunkX, chunkY));
            this.#addChunk(chunk);
            return chunk;
        }

        return this.#chunks[chunkX][chunkY];
    }

    static #hasChunk(chunkX, chunkY) {
        return chunkX in this.#chunks && chunkY in this.#chunks[chunkX];
    }

    static #deleteChunk(chunkX, chunkY) {
        if (this.#hasChunk(chunkX, chunkY)) {
            this.#chunks[chunkX][chunkY].triggerDelete();
            delete this.#chunks[chunkX][chunkY];
            if (Object.keys(this.#chunks[chunkX]).length === 0) {
                delete this.#chunks[chunkX];
            }
        }
    }
}

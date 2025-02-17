class Tile {
    static SIZE = 48;

    static AIR = 0;
    static DIRT = 1;

    constructor() {
        throw new Error("Tile is a static class and should not have any instances");
    }

    /**
     * @param {number} tile
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     */
    static drawTile(tile, ctx, position) {
        const args = [position.x, position.y, 48, 48];
        switch (tile) {
            case Tile.DIRT:
                ctx.drawImage(AssetManager.getImage("/images/dirt.png"), ...args);
                break;
        }
    }
}

/** @typedef {import("./Tile")} */

class GridUI extends GameObject {
    getBoundary() {
        return new Boundary(-Infinity, Infinity, -Infinity, Infinity);
    }

    /**
     * Draws this Game Object on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx, offset) {
        super.draw(ctx, offset);

        ctx.save();

        ctx.strokeStyle = "gray";

        const scene = GameEngine.getActiveScene();
        const viewBounds = scene.getViewBounds();

        const left = Math.floor(viewBounds.left / Tile.SIZE) * Tile.SIZE;
        const right = Math.ceil(viewBounds.right / Tile.SIZE) * Tile.SIZE;
        const top = Math.floor(viewBounds.top / Tile.SIZE) * Tile.SIZE;
        const bottom = Math.ceil(viewBounds.bottom / Tile.SIZE) * Tile.SIZE;

        for (let x = left; x <= right; x += Tile.SIZE) {
            ctx.beginPath();

            ctx.moveTo(x - offset.x, viewBounds.top - offset.y);
            ctx.lineTo(x - offset.x, viewBounds.bottom - offset.y);

            ctx.stroke();
        }

        for (let y = top; y <= bottom; y += Tile.SIZE) {
            ctx.beginPath();

            ctx.moveTo(viewBounds.left - offset.x, y - offset.y);
            ctx.lineTo(viewBounds.right - offset.x, y - offset.y);

            ctx.stroke();
        }

        ctx.restore();
    }
}

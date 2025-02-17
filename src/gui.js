/** @typedef {import("./game-objects/tile")} */

class GUI {
    static #selectedTile = Tile.AIR;

    /**
     * @param {HTMLElement} target
     * @param {number} tile
     */
    static selectTile(target, tile) {
        for (const element of document.querySelectorAll("#tiles .tool-toggle")) {
            element.classList.remove("selected");
        }
        for (const element of document.querySelectorAll("#objects .tool-toggle")) {
            element.classList.remove("selected");
        }

        target.classList.add("selected");

        this.#selectedTile = tile;
    }

    static getTile() {
        return GUI.#selectedTile;
    }

    static saveMap() {
        const blob = new Blob([`const TILES = ${JSON.stringify(GameMap.asArray())}`], {
            type: "text/javascript",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "map.js";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}

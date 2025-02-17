/** @typedef {import("./game-objects/tile")} */

class GUI {
    static #selectedTile = Tile.AIR;

    /**
     * @param {HTMLElement} target
     * @param {number} tile
     */
    static selectTile(target, tile) {
        for (const element of document.getElementsByClassName("brush")) {
            element.classList.remove("selected");
        }
        target.classList.add("selected");

        this.#selectedTile = tile;
    }

    static getTile() {
        return GUI.#selectedTile;
    }
}

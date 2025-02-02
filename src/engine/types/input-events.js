/** @typedef {import("./vector")} */
/** @typedef {import("./instance-vector")} */

class InputEvents {
    constructor() {
        /** @type {Vector | null} */
        this.leftClick = null;
        /** @type {Vector | null} */
        this.rightClick = null;
        /** @type {number | null} */
        this.scroll = null;

        /** @type {{[key: string]: boolean}} */
        this.keys = {};
        this.mousePosition = new InstanceVector();
        this.mouseDown = false;
    }

    reset() {
        this.leftClick = null;
        this.rightClick = null;
        this.scroll = null;
    }
}

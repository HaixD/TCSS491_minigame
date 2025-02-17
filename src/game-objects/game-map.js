/** @typedef {import("./Room")} */
/** @typedef {import("./add-room-button")} */

class GameMap {
    /** @type {{[row: string]: {[col: string]: Room}}} */
    static #rooms = {};
    /** @type {{[row: string]: {[col: string]: AddRoomButton}}} */
    static #addRoomButtons = {};

    constructor() {
        throw new Error("GameMap is a static class and should not have any instances");
    }

    static init() {
        GameMap.addRoom(0, 0, new Room(0, 0));
    }

    /**
     * @param {number} row
     * @param {number} col
     * @param {Room} room
     */
    static addRoom(row, col, room) {
        const oldRoom = GameMap.getRoom(row, col);
        const button = GameMap.#getAddRoomButton(row, col);

        if (oldRoom !== null) {
            throw new Error(`Room already exists for row: ${row}, col: ${col}`);
        }
        if (button !== null) {
            button.triggerDelete();
        }

        this.#rooms[row] ||= {};
        this.#rooms[row][col] = room;

        GameEngine.addGameObject("room", room);
        GameMap.#addRoomButton(row - 1, col);
        GameMap.#addRoomButton(row + 1, col);
        GameMap.#addRoomButton(row, col - 1);
        GameMap.#addRoomButton(row, col + 1);
    }

    /**
     * @param {number} row
     * @param {number} col
     */
    static getRoom(row, col) {
        if (this.#rooms[row] === undefined || this.#rooms[row][col] === undefined) {
            return null;
        }

        return this.#rooms[row][col];
    }

    /**
     * @param {number} row
     * @param {number} col
     */
    static #getAddRoomButton(row, col) {
        if (
            this.#addRoomButtons[row] === undefined ||
            this.#addRoomButtons[row][col] === undefined
        ) {
            return null;
        }

        return this.#addRoomButtons[row][col];
    }

    /**
     * @param {number} row
     * @param {number} col
     */
    static #addRoomButton(row, col) {
        const oldButton = GameMap.#getAddRoomButton(row, col);
        const room = GameMap.getRoom(row, col);
        if (oldButton !== null || room !== null) {
            return;
        }

        const button = new AddRoomButton(row, col);

        this.#addRoomButtons[row] ||= {};
        this.#addRoomButtons[row][col] = button;

        GameEngine.addGameObject("room", button);
    }
}

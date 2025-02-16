/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./game-objects/Camera")} */
/** @typedef {import("./game-objects/User")} */

async function main() {
    const TILE_SIZE = 16 * 3;
    const ROOM_SIZE = 16 * TILE_SIZE;

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    GameEngine.init(ctx);
    ctx.imageSmoothingEnabled = false;

    GameEngine.createScene("main", scene => {
        scene.addLayer("NULL");
        scene.addGameObject("NULL", new User());
        scene.addGameObject("NULL", new Camera());
    });

    // start
    GameEngine.start();
}

main();

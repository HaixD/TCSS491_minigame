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
        // make game objects
        const user = new User(new InstanceVector(Room.SIZE / 2, Room.SIZE / 2));
        const camera = new Camera(user.position, new Vector(-canvas.width / 2, -canvas.height / 2));

        GameMap.init();

        scene.addGameObject("NULL", user);
        scene.addGameObject("NULL", camera);

        scene.setOffset(camera.position);
    });

    // start
    GameEngine.start();
}

main();

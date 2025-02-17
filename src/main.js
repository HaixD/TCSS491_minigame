/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./game-objects/camera")} */
/** @typedef {import("./game-objects/user")} */

async function main() {
    document.querySelector("#brushes > *:first-child").onclick();

    await AssetManager.getImage("/images/dirt.png");

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    GameEngine.init(ctx);

    ctx.imageSmoothingEnabled = false;
    ctx.translate(-0.5, -0.5);

    GameEngine.createScene("main", scene => {
        // make game objects
        const user = new User(
            new InstanceVector(Room.SIZE / 2, Room.SIZE / 2),
            new Vector(-canvas.width / 2, -canvas.height / 2)
        );

        scene.addLayer("NULL");
        scene.addLayer("ui");
        scene.addLayer("room");

        GameMap.init();

        scene.addGameObject("NULL", user);
        scene.addGameObject("ui", new GridUI());

        scene.setOffset(user.cameraPosition);
    });

    // start
    GameEngine.start();
}

main();

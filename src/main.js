/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./engine/components/collider-rect")} */
/** @typedef {import("./engine/components/position")} */
/** @typedef {import("./game-objects/player")} */
/** @typedef {import("./game-objects/interpolated-camera")} */

async function main() {
    // preload all assets
    await AssetManager.getImage("anims/placeholder-walk.png");

    // create game engine
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    GameEngine.init(ctx);
    ctx.imageSmoothingEnabled = false;

    GameEngine.createScene("main", scene => {
        const player = new Player(new InstanceVector());
        const camera = new InterpolatedCamera(
            player.position,
            5,
            0,
            new Vector(-canvas.width / 2, -canvas.height / 2).add(
                player.getBoundary().asShape().multiply(0.5)
            )
        );

        scene.setOffset(camera.position);
        scene.addLayer("FAKE_LAYER");
        scene.addLayer("back");
        scene.addLayer("middle");
        scene.addLayer("front");

        scene.addGameObject("FAKE_LAYER", camera);
        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-50000, 200), new Vector(100000, 20))
        );
        scene.addGameObject("back", player);
    });

    // start
    GameEngine.start();
}

main();

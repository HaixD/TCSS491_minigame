/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./engine/components/collider-rect")} */
/** @typedef {import("./engine/components/position")} */
/** @typedef {import("./player")} */
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

    // set up game
    const scene = new Scene(ctx);
    const player = new Player(new InstanceVector());
    const camera = new InterpolatedCamera(
        player.position,
        5,
        0,
        new Vector(
            -canvas.width / 2 + player.collider.shape.x / 2,
            -canvas.height / 2 + player.collider.shape.y / 2
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
        new Obstacle(new InstanceVector(1000, -800), new Vector(20, 1000))
    );
    scene.addGameObject(
        "front",
        new Obstacle(new InstanceVector(-1000, -800), new Vector(20, 1000))
    );
    scene.addGameObject(
        "front",
        new Obstacle(new InstanceVector(-2000, 200), new Vector(4000, 20))
    );
    scene.addGameObject("back", player);

    GameEngine.addScene("test", scene);
    GameEngine.start();
}

main();

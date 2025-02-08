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

    // set up scene #1
    GameEngine.createScene("scene1", scene => {
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
            new Obstacle(new InstanceVector(1000, -800), new Vector(20, 1000))
        );
        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-1000, -800), new Vector(20, 1000))
        );
        scene.addGameObject("front", new Obstacle(new InstanceVector(0, 100), new Vector(50, 50)));
        scene.addGameObject("front", new Obstacle(new InstanceVector(-50, 0), new Vector(50, 50)));
        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-900, 190), new Vector(50, 10))
        );
        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-950, 180), new Vector(50, 10))
        );
        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-1000, 170), new Vector(50, 10))
        );
        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-2000, 200), new Vector(4000, 20))
        );
        scene.addGameObject("back", player);
    });

    // set up scene #2
    GameEngine.createScene("scene2", scene => {
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
    });

    setTimeout(() => {
        GameEngine.setScene("scene2");
    }, 1000);

    // start
    GameEngine.start();
}

main();

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
            new Obstacle(new InstanceVector(1000, -1000), new Vector(20, 1200))
        );
        // scene.addGameObject(
        //     "front",
        //     new Obstacle(new InstanceVector(-1000, -1000), new Vector(20, 1200))
        // );

        scene.addGameObject("front", new Obstacle(new InstanceVector(0, 100), new Vector(50, 50)));
        scene.addGameObject("front", new Obstacle(new InstanceVector(-50, 0), new Vector(50, 50)));

        for (let i = 0; i < 10; ++i) {
            scene.addGameObject(
                "front",
                new Stair(
                    new InstanceVector(-700 - 40 * i, 200 - 20 * i),
                    new Vector(40, 20),
                    Stair.DIRECTION.LEFT
                )
            );
            scene.addGameObject(
                "front",
                new Stair(
                    new InstanceVector(-2000 - 40 * i, 200 - 40 * i),
                    new Vector(40, 40),
                    Stair.DIRECTION.LEFT
                )
            );
        }

        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-2000, 200), new Vector(4000, 20))
        );
        scene.addGameObject(
            "front",
            new Obstacle(new InstanceVector(-2000, -1000), new Vector(4000, 20))
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
            new Obstacle(new InstanceVector(-50000, 200), new Vector(100000, 20))
        );
        scene.addGameObject("back", player);
    });

    // start
    GameEngine.start();
}

main();

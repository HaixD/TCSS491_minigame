/** @typedef {import ('./boundary')} */
/** @typedef {import('./game-object')} */
/** @typedef {import('./input-events')} */

/** @typedef {{[key: string]: GameObject}} Layer */

class Scene {
    #offset;
    /** @type {{[key: string]: Layer}} */
    #gameObjects;
    /** @type {{[key: string]: number}} */
    #nextLayerID;

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.#offset = new InstanceVector();
        this.#gameObjects = {};
        this.#nextLayerID = {};
    }

    /**
     * Adds a layer to the end of the current Game Object layers
     * @param {string} layer
     */
    addLayer(layer) {
        this.#gameObjects[layer] = {};
        this.#nextLayerID[layer] = 0;
    }

    /**
     * Deletes the given layer key
     * @param {string} layer
     */
    deleteLayer(layer) {
        if (!his.#gameObjects[layer]) {
            throw new Error(`Layer '${layer}' does not exist`);
        }
        delete this.#gameObjects[layer];
    }

    /**
     * Adds the Game Object to the layer
     * @param {string} layer
     * @param {GameObject} gameObject
     */
    addGameObject(layer, gameObject) {
        let layerObject = this.#gameObjects[layer];
        if (!layerObject) {
            this.addLayer(layer);
            layerObject = this.#gameObjects[layer];
        }
        layerObject[this.#nextLayerID[layer]++] = gameObject;
    }

    /**
     * Sets the offset to the given InstanceVector
     * @param {InstanceVector} instanceVector
     */
    setOffset(instanceVector) {
        this.#offset = instanceVector;
    }

    /**
     * Calculates the view Boundary and returns it
     * @returns the view Boundary
     */
    getViewBounds() {
        return new Boundary(
            this.#offset.x,
            this.#offset.x + this.ctx.canvas.width,
            this.#offset.y,
            this.#offset.y + this.ctx.canvas.height
        );
    }

    /**
     * Updates all Game Objects belonging to this scene.
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        for (const layer of Object.values(this.#gameObjects)) {
            for (const [gameObjectKey, gameObject] of Object.entries(layer)) {
                if (gameObject.isDeleted()) {
                    delete layer[gameObjectKey];
                    continue;
                }
                gameObject.update(deltaTime, events);
            }
        }
    }

    /**
     * Triggers the draw function of Game Objects if they are in bounds of this scene.
     */
    render() {
        if (isNaN(this.#offset.x) || isNaN(this.#offset.y)) {
            throw new Error("Invalid offset (either offset.x or offset.y is NaN)");
        }
        const viewBounds = this.getViewBounds();
        for (const layer of Object.values(this.#gameObjects)) {
            for (const gameObject of Object.values(layer)) {
                const boundary = gameObject.getBoundary();
                if (
                    !gameObject.isDrawReady() ||
                    boundary === null ||
                    !viewBounds.containsBoundary(boundary)
                ) {
                    continue;
                }
                gameObject.draw(this.ctx, this.#offset.asVector());
            }
        }
    }

    /**
     * Converts screen Vector to world Vector
     * @param {Vector} screenVector vector of sceen position (not in world)
     */
    getWorldVector(screenVector) {
        return this.#offset.asVector().add(screenVector);
    }
}

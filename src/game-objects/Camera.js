class Camera extends GameObject {
    static TYPE_ID = Symbol(Camera.name);
    static SCALES = [0.125, 0.25, 0.5, 1, 2, 4, 8];

    #scaleIndex;

    /**
     * @param {InstanceVector} parent
     * @param {Vector} offset
     */
    constructor(parent, offset) {
        super();

        this.parent = parent;
        this.offset = offset;

        this.position = new InstanceVector(parent).add(offset);
        this.#scaleIndex = 3;
    }

    update(deltaTime, events) {
        super.update(deltaTime, events);

        this.position.set(this.offset.add(this.parent));

        if (events.scroll !== null) {
            if (events.scroll < 0) {
                this.#scaleIndex = Math.min(this.#scaleIndex + 1, Camera.SCALES.length - 1);
            } else {
                this.#scaleIndex = Math.max(this.#scaleIndex - 1, 0);
            }

            GameEngine.getActiveScene().scale = Camera.SCALES[this.#scaleIndex];
        }
    }
}

class Camera extends GameObject {
    static TYPE_ID = Symbol(Camera.name);

    /**
     * @param {InstanceVector} parent
     * @param {Vector} offset
     */
    constructor(parent, offset) {
        super();

        this.offset = offset;
        this.position = offset.add(parent);
    }

    update(deltaTime, events) {
        this.position = this.offset.add(parent);
    }
}

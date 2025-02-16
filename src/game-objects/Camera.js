class Camera extends GameObject {
    static TYPE_ID = Symbol(Camera.name);

    /**
     * @param {InstanceVector} parent
     * @param {Vector} offset
     */
    constructor(parent, offset) {
        super();

        this.parent = parent;
        this.offset = offset;

        this.position = new InstanceVector(parent).add(offset);
    }

    update(deltaTime, events) {
        super.update(deltaTime, events);

        this.position.set(this.offset.add(this.parent));
    }
}

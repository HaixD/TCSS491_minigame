class Room extends GameObject {
    static SIZE = Tile.SIZE * 16;

    /**
     * @param {Vector} position
     */
    constructor(position) {
        super();

        this.position = position;
    }

    getBoundary() {
        return new Boundary(
            this.position.x,
            this.position.x + Room.SIZE,
            this.position.y,
            this.position.y + Room.SIZE
        );
    }
}

class Tile {
    static SIZE = 48;
    static TYPE = {
        AIR: Symbol("air"),
        DIRT: Symbol("dirt"),
    };

    constructor() {
        throw new Error("Tile is a static class and should not have any instances");
    }
}

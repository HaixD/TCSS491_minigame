class Tile {
    static SIZE = 48;

    static AIR = 0;
    static DIRT = 1;
    static DIRT_IMAGE = AssetManager.getImage("/images/dirt.png");

    constructor() {
        throw new Error("Tile is a static class and should not have any instances");
    }
}

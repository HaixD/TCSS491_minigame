class User extends GameObject {
    static TYPE_ID = Symbol(User.name);

    /**
     * @param {InstanceVector} Position
     */
    constructor(position) {
        super();

        this.position = position;
    }
}

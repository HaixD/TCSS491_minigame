/** @typedef {import("../engine/types/game-object")} */
/** @typedef {import("../engine/types/input-events")} */
/** @typedef {import("../engine/types/instance-vector")} */

class InterpolatedCamera extends GameObject {
    static TYPE_ID = Symbol(InterpolatedCamera.name);

    /**
     * @param {InstanceVector} instanceVector
     * @param {number} speed
     * @param {number} maxDistance
     * @param {Vector} offset
     */
    constructor(instanceVector, speed, maxDistance, offset) {
        super();
        this.parent = instanceVector;
        this.position = new InstanceVector(instanceVector).add(offset);
        this.speed = speed;
        this.maxDistance = maxDistance;
        this.offset = offset;
    }

    /**
     * @override
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);
        const targetPosition = this.parent.asVector().add(this.offset);
        const oldPosition = this.position.asVector();

        const difference = targetPosition.subtract(oldPosition);

        if (difference.getMagnitude() > this.maxDistance) {
            const realTargetPosition = targetPosition.subtract(
                difference.normalize().multiply(this.maxDistance)
            );
            const realDifference = realTargetPosition.subtract(oldPosition);

            let newPosition = oldPosition.add(realDifference.multiply(deltaTime * this.speed));

            if (
                realTargetPosition.subtract(newPosition).getMagnitude() >=
                realDifference.getMagnitude()
            ) {
                newPosition = realTargetPosition;
            }

            this.position.set(newPosition);
        }
    }
}

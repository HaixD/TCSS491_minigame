/**
 * movement priority:
 * dodge
 * attack
 * new movement input
 * attack idle period
 * movement held
 */
class AttackState {
    /**
     * Minimum time (seconds) mouse should be held for held actions
     */
    static #HOLD_THRESHOLD = 0.5;
    /**
     * Maximum time (seconds) between action and input to continue attack chain
     */
    static #WAIT_TRHESHOLD = 0.5;

    static IDLE = Symbol("IDLE");
    static NORMAL_1 = Symbol("NORMAL_1");
    static NORMAL_2 = Symbol("NORMAL_2");
    static NORMAL_3 = Symbol("NORMAL_3");
    static NORMAL_4 = Symbol("NORMAL_4");
    static NORMAL_5 = Symbol("NORMAL_5");
    static SKILL_1 = Symbol("SKILL_1");
    static SKILL_2 = Symbol("SKILL_2");
    static CHARGING = Symbol("CHARGING");
    static CHARGED_1 = Symbol("CHARGED_1");
    static CHARGED_2 = Symbol("CHARGED_2");
    static CHARGED_3 = Symbol("CHARGED_3");
    static ULTIMATE = Symbol("ULTIMATE");
    static DODGE = Symbol("DODGE");
    // PARRY
    // DODGE COUNTER
    // DASH ATTACK

    /** Time (miliseconds) of last click start (start of mouse down) */
    #clickStart;
    /** Time (miliseconds) of last click end (start of mouse up) */
    #clickEnd;
    /** Whether the mouse was held down in the previous update call */
    #mouseDowned;
    /** Amount of time before input needs listening (dodge does not experience input cooldown) */
    #inputCooldown;
    /** Amount of time before dodge can be done again */
    #dodgeCooldown;
    /** Whether the dodge key (Shift) has been lifted since last pressed */
    #dodgeLifted;
    #state;
    #stacks;

    constructor() {
        this.#clickStart = 0;
        this.#clickEnd = 0;
        this.#mouseDowned = false;
        this.#inputCooldown = 0;
        this.#dodgeCooldown = 0;
        this.#dodgeLifted = true;
        this.#stacks = 0;
        this.#state = AttackState.IDLE;
    }

    /**
     * Updates the attakc state
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    updateState(events) {
        const now = Date.now();

        // handle dodge
        if (!events.keys["Shift"]) {
            this.#dodgeLifted = true;
        } else if (this.#dodgeLifted && now > this.#dodgeCooldown) {
            this.#dodgeLifted = false;
            this.#state = AttackState.DODGE;
            this.#applyInputCooldown(0.2);
            this.#applyDodgeCooldown(0.5);
            return this.#state;
        }

        if (now <= this.#inputCooldown) {
            return null;
        }

        const { click, hold, canceled } = this.#updateInput(events);
        const initialState = this.#state;

        switch (this.#state) {
            case AttackState.IDLE:
                if (click) this.#state = AttackState.NORMAL_1;
                break;
            case AttackState.NORMAL_1:
                if (click) this.#state = AttackState.NORMAL_2;
                else if (canceled) this.#state = AttackState.IDLE;
                break;
            case AttackState.NORMAL_2:
                if (click) this.#state = AttackState.NORMAL_3;
                else if (canceled) this.#state = AttackState.IDLE;
                break;
            case AttackState.NORMAL_3:
                if (click) this.#state = AttackState.NORMAL_1;
                else if (canceled) this.#state = AttackState.IDLE;
                break;
            case AttackState.DODGE:
                if (click) this.#state = AttackState.NORMAL_1;
                else this.#state = AttackState.IDLE;
                break;
        }

        return this.#state !== initialState ? this.#state : null;
    }

    #applyInputCooldown(seconds) {
        this.#inputCooldown = Date.now() + seconds * 1000;
    }

    #applyDodgeCooldown(seconds) {
        this.#dodgeCooldown = Date.now() + seconds * 1000;
    }

    /**
     * Updates the attakc state
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    #updateInput(events) {
        const now = Date.now();
        const mouseDown = events.mouseDown === 1;

        let timeSinceClickStart = 0;
        let clickDuration = 0;

        if (mouseDown) {
            if (!this.#mouseDowned) {
                this.#clickStart = now;
            }

            clickDuration = now - this.#clickStart;
            timeSinceClickStart = clickDuration;
        } else {
            if (this.#mouseDowned) {
                this.#clickEnd = now;
            }

            timeSinceClickStart = now - this.#clickStart;
        }

        this.#mouseDowned = mouseDown;

        timeSinceClickStart /= 1000;
        clickDuration /= 1000;

        const click = this.#clickStart === now;
        const hold = clickDuration >= AttackState.#HOLD_THRESHOLD;
        const canceled = timeSinceClickStart > AttackState.#WAIT_TRHESHOLD;

        return { click, hold, canceled };
    }
}

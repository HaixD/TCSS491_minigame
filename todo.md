# Short-Term Todos
- player controller which ignores all input to play an animation
- maximize use of `Vector` instead of separate `x` and `y` variables
- temporary `ColliderRect` for attacks
- make camera only follow player horizontally (fixed vertical position)
- dummy enemy (no ai, just takes damage)
- fix documentation
# Long-Term Todos
- attack (skills, combos), dodge, and parry system
- ensure game works with higher quality assets
# Currently Unnecessary Todos
- some implementation of a slope
    - in a slope, moving horizontally will move in the direction of the slope but this can be overridden by moving vertically
- add bounciness to player controller
- remove `Point` if a replacement is made
- force user to play in full screen (?)
- fix timed events so that things can occur precisely (a bullet cannot despawn in exactly 250ms since it must align with the `deltaTime`)
    - precise update function for `GameObject` and game updates will check if an "interval" is encountered after adding `deltaTime` 
- `SpriteBuilder` class which creates animated sprites from multiple image sources (?)
- camera zoom (?)
- particles (?)
- `InstanceVector` (alternative) class which always copies the `x` or/and `y` of another `InstanceVector` maybe with an offset too

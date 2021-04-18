import Vec2 from "../Vec2";

/**
 * An object representing the data collected from a physics hit between two geometric objects.
 * Inspired by the helpful collision documentation @link(here)(https://noonat.github.io/intersect/).
 */
export default class Hit {
    /** The time of the collision. Only numbers 0 through 1 happen in this frame. */
    time: number;
    /** The near times of the collision */
    nearTimes: Vec2 = Vec2.ZERO;
    /** The position of the collision */
    pos: Vec2 = Vec2.ZERO;
    /** The overlap distance of the hit */
    delta: Vec2 = Vec2.ZERO;
    /** The normal vector of the hit */
    normal: Vec2 = Vec2.ZERO;
}
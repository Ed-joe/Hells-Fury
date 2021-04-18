import Vec2 from "../Vec2";

/** An object that has a position */
export default interface Positioned {
    /** The center of this object. */
    position: Vec2;

    /** The center of this object relative to the viewport. */
    readonly relativePosition: Vec2;
}
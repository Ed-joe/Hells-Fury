import Vec2 from "../Vec2";
import AABB from "../Shapes/AABB";

/** An object that is a region, with a size, scale, and boundary. */
export default interface Region {
    /** The size of this object. */
    size: Vec2;

    /** The scale of this object. */
    scale: Vec2;

    /** The size of the object taking into account the zoom and scale */
    readonly sizeWithZoom: Vec2;

    /** The bounding box of this object. */
    boundary: AABB;
}

export function isRegion(arg: any): boolean {
    return arg && arg.size && arg.scale && arg.boundary;
}
import Physical from "../Interfaces/Physical";
import AABB from "../Shapes/AABB";
import Vec2 from "../Vec2";
import Hit from "./Hit";

/**
 * A class that contains the area of overlap of two colliding objects to allow for sorting by the physics system.
 */
export default class AreaCollision {
    /** The area of the overlap for the colliding objects */
    area: number;

    /** The AABB of the other collider in this collision */
    collider: AABB;

    /** Type of the collision */
    type: string;

    /** Ther other object in the collision */
    other: Physical;

    /** The tile, if this was a tilemap collision */
    tile: Vec2;

    /** The physics hit for this object */
    hit: Hit;

    /**
     * Creates a new AreaCollision object
     * @param area The area of the collision
     * @param collider The other collider
     */
	constructor(area: number, collider: AABB, other: Physical, type: string, tile: Vec2){
		this.area = area;
        this.collider = collider;
        this.other = other;
        this.type = type;
        this.tile = tile;
	}
}
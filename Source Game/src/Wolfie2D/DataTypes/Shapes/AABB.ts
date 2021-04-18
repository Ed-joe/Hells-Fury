import Shape from "./Shape";
import Vec2 from "../Vec2";
import MathUtils from "../../Utils/MathUtils";
import Circle from "./Circle";
import Hit from "../Physics/Hit";

/**
 * An Axis-Aligned Bounding Box. In other words, a rectangle that is always aligned to the x-y grid.
 * Inspired by the helpful collision documentation @link(here)(https://noonat.github.io/intersect/).
 */
export default class AABB extends Shape {
    center: Vec2;
    halfSize: Vec2;

    /**
     * Creates a new AABB
     * @param center The center of the AABB
     * @param halfSize The half size of the AABB - The distance from the center to an edge in x and y
     */
    constructor(center?: Vec2, halfSize?: Vec2){
        super();
        this.center = center ? center : new Vec2(0, 0);
        this.halfSize = halfSize ? halfSize : new Vec2(0, 0);
    }

    /** Returns a point representing the top left corner of the AABB */
    get topLeft(): Vec2 {
        return new Vec2(this.left, this.top)
    }

    /** Returns a point representing the top right corner of the AABB */
    get topRight(): Vec2 {
        return new Vec2(this.right, this.top)
    }

    /** Returns a point representing the bottom left corner of the AABB */
    get bottomLeft(): Vec2 {
        return new Vec2(this.left, this.bottom)
    }

    /** Returns a point representing the bottom right corner of the AABB */
    get bottomRight(): Vec2 {
        return new Vec2(this.right, this.bottom)
    }

    // @override
    getBoundingRect(): AABB {
        return this.clone();
    }

    // @override
    getBoundingCircle(): Circle {
        let r = Math.max(this.hw, this.hh)
        return new Circle(this.center.clone(), r);
    }

    // @deprecated
    getHalfSize(): Vec2 {
        return this.halfSize;
    }

    // @deprecated
    setHalfSize(halfSize: Vec2): void {
        this.halfSize = halfSize;
    }

    // TODO - move these all to the Shape class
    /**
     * A simple boolean check of whether this AABB contains a point
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    containsPoint(point: Vec2): boolean {
        return point.x >= this.x - this.hw && point.x <= this.x + this.hw
            && point.y >= this.y - this.hh && point.y <= this.y + this.hh
    }
    
    /**
     * A simple boolean check of whether this AABB contains a point
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    intersectPoint(point: Vec2): boolean {
        let dx = point.x - this.x;
        let px = this.hw - Math.abs(dx);
        
        if(px <= 0){
            return false;
        }

        let dy = point.y - this.y;
        let py = this.hh - Math.abs(dy);

        if(py <= 0){
            return false;
        }

        return true;
    }

    /**
     * A boolean check of whether this AABB contains a point with soft left and top boundaries.
     * In other words, if the top left is (0, 0), the point (0, 0) is not in the AABB
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    containsPointSoft(point: Vec2): boolean {
        return point.x > this.x - this.hw && point.x <= this.x + this.hw
            && point.y > this.y - this.hh && point.y <= this.y + this.hh
    }


    /**
     * Returns the data from the intersection of this AABB with a line segment from a point in a direction
     * @param point The point that the line segment starts from
     * @param delta The direction and distance of the segment
     * @param padding Pads the AABB to make it wider for the intersection test
     * @returns The Hit object representing the intersection, or null if there was no intersection
     */
    intersectSegment(point: Vec2, delta: Vec2, padding?: Vec2): Hit {
        let paddingX = padding ? padding.x : 0;
        let paddingY = padding ? padding.y : 0;

        let scaleX = 1/delta.x;
        let scaleY = 1/delta.y;

        let signX = MathUtils.sign(scaleX);
        let signY = MathUtils.sign(scaleY);

        let tnearx = scaleX*(this.x - signX*(this.hw + paddingX) - point.x);
        let tneary = scaleY*(this.y - signY*(this.hh + paddingY) - point.y);
        let tfarx = scaleX*(this.x + signX*(this.hw + paddingX) - point.x);
        let tfary = scaleY*(this.y + signY*(this.hh + paddingY) - point.y);
        
        if(tnearx > tfary || tneary > tfarx){
            // We aren't colliding - we clear one axis before intersecting another
            return null;
        }

        let tnear = Math.max(tnearx, tneary);

        // Double check for NaNs
        if(tnearx !== tnearx){
            tnear = tneary;
        } else if (tneary !== tneary){
            tnear = tnearx;
        }

        let tfar = Math.min(tfarx, tfary);

        if(tnear === -Infinity){
            return null;
        }

        if(tnear >= 1 || tfar <= 0){
            return null;
        }

        // We are colliding
        let hit = new Hit();
        hit.time = MathUtils.clamp01(tnear);
        hit.nearTimes.x = tnearx;
        hit.nearTimes.y = tneary;

        if(tnearx > tneary){
            // We hit on the left or right size
            hit.normal.x = -signX;
            hit.normal.y = 0;
        } else if(Math.abs(tnearx - tneary) < 0.0001){
            // We hit on the corner
            hit.normal.x = -signX;
            hit.normal.y = -signY;
            hit.normal.normalize();
        } else {
            // We hit on the top or bottom
            hit.normal.x = 0;
            hit.normal.y = -signY;
        }

        hit.delta.x = (1.0 - hit.time) * -delta.x;
        hit.delta.y = (1.0 - hit.time) * -delta.y;
        hit.pos.x = point.x + delta.x * hit.time;
        hit.pos.y = point.y + delta.y * hit.time;

        return hit;
    }

    // @override
    overlaps(other: Shape): boolean {
        if(other instanceof AABB){
            return this.overlapsAABB(other);
        }
        throw "Overlap not defined between these shapes."
    }

    /**
     * A simple boolean check of whether this AABB overlaps another
     * @param other The other AABB to check against
     * @returns True if this AABB overlaps the other, false otherwise
     */
    protected overlapsAABB(other: AABB): boolean {
        let dx = other.x - this.x;
        let px = this.hw + other.hw - Math.abs(dx);
        
        if(px <= 0){
            return false;
        }

        let dy = other.y - this.y;
        let py = this.hh + other.hh - Math.abs(dy);

        if(py <= 0){
            return false;
        }

        return true;
    }

    /**
     * Determines whether these AABBs are JUST touching - not overlapping.
     * Vec2.x is -1 if the other is to the left, 1 if to the right.
     * Likewise, Vec2.y is -1 if the other is on top, 1 if on bottom.
     * @param other The other AABB to check
     * @returns The collision sides stored in a Vec2 if the AABBs are touching, null otherwise
     */
    touchesAABB(other: AABB): Vec2 {
        let dx = other.x - this.x;
        let px = this.hw + other.hw - Math.abs(dx);

        let dy = other.y - this.y;
        let py = this.hh + other.hh - Math.abs(dy);

        // If one axis is just touching and the other is overlapping, true
        if((px === 0 && py >= 0) || (py === 0 && px >= 0)){
            let ret = new Vec2();

            if(px === 0){
                ret.x = other.x < this.x ? -1 : 1;
            }
            
            if(py === 0){
                ret.y = other.y < this.y ? -1 : 1;
            }

            return ret;
        } else {
            return null;
        }
    }

    /**
     * Determines whether these AABBs are JUST touching - not overlapping.
     * Also, if they are only touching corners, they are considered not touching.
     * Vec2.x is -1 if the other is to the left, 1 if to the right.
     * Likewise, Vec2.y is -1 if the other is on top, 1 if on bottom.
     * @param other The other AABB to check
     * @returns The side of the touch, stored as a Vec2, or null if there is no touch
     */
    touchesAABBWithoutCorners(other: AABB): Vec2 {
        let dx = other.x - this.x;
        let px = this.hw + other.hw - Math.abs(dx);

        let dy = other.y - this.y;
        let py = this.hh + other.hh - Math.abs(dy);

        // If one axis is touching, and the other is strictly overlapping
        if((px === 0 && py > 0) || (py === 0 && px > 0)){
            let ret = new Vec2();

            if(px === 0){
                ret.x = other.x < this.x ? -1 : 1;
            } else {
                ret.y = other.y < this.y ? -1 : 1;
            }

            return ret;

        } else {
            return null;
        }
    }

    /**
     * Calculates the area of the overlap between this AABB and another
     * @param other The other AABB
     * @returns The area of the overlap between the AABBs
     */
    overlapArea(other: AABB): number {
        let leftx = Math.max(this.x - this.hw, other.x - other.hw);
        let rightx = Math.min(this.x + this.hw, other.x + other.hw);
        let dx = rightx - leftx;

        let lefty = Math.max(this.y - this.hh, other.y - other.hh);
        let righty = Math.min(this.y + this.hh, other.y + other.hh);
        let dy = righty - lefty;

        if(dx < 0 || dy < 0) return 0;
        
        return dx*dy;
    }

    /**
     * Moves and resizes this rect from its current position to the position specified
     * @param velocity The movement of the rect from its position
     * @param fromPosition A position specified to be the starting point of sweeping
     * @param halfSize The halfSize of the sweeping rect 
     */
    sweep(velocity: Vec2, fromPosition?: Vec2, halfSize?: Vec2): void {
        if(!fromPosition){
            fromPosition = this.center;
        }

        if(!halfSize){
            halfSize = this.halfSize;
        }

        let centerX = fromPosition.x + velocity.x/2;
        let centerY = fromPosition.y + velocity.y/2;

        let minX = Math.min(fromPosition.x - halfSize.x, fromPosition.x + velocity.x - halfSize.x);
        let minY = Math.min(fromPosition.y - halfSize.y, fromPosition.y + velocity.y - halfSize.y);

        this.center.set(centerX, centerY);
        this.halfSize.set(centerX - minX, centerY - minY);
    }
    
    // @override
    clone(): AABB {
        return new AABB(this.center.clone(), this.halfSize.clone());
    }

    /**
     * Converts this AABB to a string format
     * @returns (center: (x, y), halfSize: (x, y))
     */
    toString(): string {
        return "(center: " + this.center.toString() + ", half-size: " + this.halfSize.toString() + ")"
    }
}
import Vec2 from "../Vec2";
import AABB from "./AABB";
import Shape from "./Shape";

/**
 * A Circle
 */
export default class Circle extends Shape {
	private _center: Vec2;
	radius: number;
	
	/**
	 * Creates a new Circle
	 * @param center The center of the circle
	 * @param radius The radius of the circle
	 */
	constructor(center: Vec2, radius: number) {
		super();
        this._center = center ? center : new Vec2(0, 0);
        this.radius = radius ? radius : 0;
	}

	get center(): Vec2 {
		return this._center;
	}

	set center(center: Vec2) {
		this._center = center;
	}

	get halfSize(): Vec2 {
		return new Vec2(this.radius, this.radius);
	}

	get r(): number {
		return this.radius;
	}

	set r(radius: number) {
		this.radius = radius;
	}

	// @override
	/**
     * A simple boolean check of whether this AABB contains a point
     * @param point The point to check
     * @returns A boolean representing whether this AABB contains the specified point
     */
    containsPoint(point: Vec2): boolean {
        return this.center.distanceSqTo(point) <= this.radius*this.radius;
    }

	// @override
	getBoundingRect(): AABB {
		return new AABB(this._center.clone(), new Vec2(this.radius, this.radius));
	}

	// @override
	getBoundingCircle(): Circle {
		return this.clone();
	}

	// @override
	overlaps(other: Shape): boolean {
		throw new Error("Method not implemented.");
	}

	// @override
	clone(): Circle {
		return new Circle(this._center.clone(), this.radius);
	}

	toString(): string {
		return "(center: " + this.center.toString() + ", radius: " + this.radius + ")";
	}
}
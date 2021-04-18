import MathUtils from "../Utils/MathUtils";

/**
 * A two-dimensional vector (x, y)
 */
export default class Vec2 {

	// Store x and y in an array
	/** The array that stores the actual vector values x and y */
	private vec: Float32Array;

	/**	
	 * When this vector changes its value, do something
	 */
	private onChange: Function = () => {};

	/**
	 * Creates a new Vec2
	 * @param x The x value of the vector
	 * @param y The y value of the vector
	 */
	constructor(x: number = 0, y: number = 0) {
		this.vec = new Float32Array(2);
		this.vec[0] = x;
		this.vec[1] = y;
	}

	// Expose x and y with getters and setters
	get x() {
		return this.vec[0];
	}

	set x(x: number) {
		this.vec[0] = x;

		if(this.onChange){
			this.onChange();
		}
	}

	get y() {
		return this.vec[1];
	}

	set y(y: number) {
		this.vec[1] = y;

		if(this.onChange){
			this.onChange();
		}
	}

	static get ZERO() {
		return new Vec2(0, 0);
	}

	static readonly ZERO_STATIC = new Vec2(0, 0);

	static get INF() {
		return new Vec2(Infinity, Infinity);
	}

	static get UP() {
		return new Vec2(0, -1);
	}

	static get DOWN() {
		return new Vec2(0, 1);
	}

	static get LEFT() {
		return new Vec2(-1, 0);
	}

	static get RIGHT() {
		return new Vec2(1, 0);
	}

	/**
	 * The squared magnitude of the vector. This tends to be faster, so use it in situations where taking the
	 * square root doesn't matter, like for comparing distances.
	 * @returns The squared magnitude of the vector
	 */
	magSq(): number {
		return this.x*this.x + this.y*this.y;
	}

	/**
	 * The magnitude of the vector.
	 * @returns The magnitude of the vector.
	 */
	mag(): number {
		return Math.sqrt(this.magSq());
	}

	/**
	 * Divdes x and y by the magnitude to obtain the unit vector in the direction of this vector.
	 * @returns This vector as a unit vector.
	 */
	normalize(): Vec2 {
		if(this.x === 0 && this.y === 0) return this;
		let mag = this.mag();
		this.x /= mag;
		this.y /= mag;
		return this;
	}

	/**
	 * Works like normalize(), but returns a new Vec2
	 * @returns A new vector that is the unit vector for this one
	 */
	normalized(): Vec2 {
		if(this.isZero()){
			return this;
		}
		
		let mag = this.mag();
		return new Vec2(this.x/mag, this.y/mag);
	}

	/**
	 * Sets the x and y elements of this vector to zero.
	 * @returns This vector, with x and y set to zero.
	 */
	zero(): Vec2 {
		return this.set(0, 0);
	}

	/**
	 * Sets the vector's x and y based on the angle provided. Goes counter clockwise.
	 * @param angle The angle in radians
	 * @param radius The magnitude of the vector at the specified angle
	 * @returns This vector.
	 */
	setToAngle(angle: number, radius: number = 1): Vec2 {
		this.x = MathUtils.floorToPlace(Math.cos(angle)*radius, 5);
		this.y = MathUtils.floorToPlace(-Math.sin(angle)*radius, 5);
		return this;
	}

	/**
	 * Returns a vector that point from this vector to another one
	 * @param other The vector to point to
	 * @returns A new Vec2 that points from this vector to the one provided
	 */
	vecTo(other: Vec2): Vec2 {
		return new Vec2(other.x - this.x, other.y - this.y);
	}
	
	/**
	 * Returns a vector containing the direction from this vector to another
	 * @param other The vector to point to
	 * @returns A new Vec2 that points from this vector to the one provided. This new Vec2 will be a unit vector.
	 */
	dirTo(other: Vec2): Vec2 {
		return this.vecTo(other).normalize();
	}

	/**
	 * Keeps the vector's direction, but sets its magnitude to be the provided magnitude
	 * @param magnitude The magnitude the vector should be
	 * @returns This vector with its magnitude set to the new magnitude
	 */
	scaleTo(magnitude: number): Vec2 {
		return this.normalize().scale(magnitude);
	}

	/**
	 * Scales x and y by the number provided, or if two number are provided, scales them individually.
	 * @param factor The scaling factor for the vector, or for only the x-component if yFactor is provided
	 * @param yFactor The scaling factor for the y-component of the vector
	 * @returns This vector after scaling
	 */
	scale(factor: number, yFactor: number = null): Vec2 {
		if(yFactor !== null){
			this.x *= factor;
			this.y *= yFactor;
			return this;
		}
		this.x *= factor;
		this.y *= factor;
		return this;
	}

	/**
	 * Returns a scaled version of this vector without modifying it.
	 * @param factor The scaling factor for the vector, or for only the x-component if yFactor is provided
	 * @param yFactor The scaling factor for the y-component of the vector
	 * @returns A new vector that has the values of this vector after scaling
	 */
	scaled(factor: number, yFactor: number = null): Vec2 {
		return this.clone().scale(factor, yFactor);
	}

	/**
	 * Rotates the vector counter-clockwise by the angle amount specified
	 * @param angle The angle to rotate by in radians
	 * @returns This vector after rotation.
	 */
	rotateCCW(angle: number): Vec2 {
		let cs = Math.cos(angle);
		let sn = Math.sin(angle);
		let tempX = this.x*cs - this.y*sn;
		let tempY = this.x*sn + this.y*cs;
		this.x = tempX;
		this.y = tempY;
		return this;
	}

	/**
	 * Sets the vectors coordinates to be the ones provided
	 * @param x The new x value for this vector
	 * @param y The new y value for this vector
	 * @returns This vector
	 */
	set(x: number, y: number): Vec2 {
		this.x = x;
		this.y = y;
		return this;
	}

	/**
	 * Copies the values of the other Vec2 into this one.
	 * @param other The Vec2 to copy
	 * @returns This vector with its values set to the vector provided
	 */
	copy(other: Vec2): Vec2 {
		return this.set(other.x, other.y);
	}

	/**
	 * Adds this vector the another vector
	 * @param other The Vec2 to add to this one
	 * @returns This vector after adding the one provided
	 */
	add(other: Vec2): Vec2 {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	/**
	 * Increments the fields of this vector. Both are incremented with a, if only a is provided.
	 * @param a The first number to increment by
	 * @param b The second number to increment by
	 * @returnss This vector after incrementing
	 */
	inc(a: number, b?: number): Vec2 {
		if(b === undefined){
			this.x += a;
			this.y += a;
		} else {
			this.x += a;
			this.y += b;
		}
		return this;
	}

	/**
	 * Subtracts another vector from this vector
	 * @param other The Vec2 to subtract from this one
	 * @returns This vector after subtracting the one provided
	 */
	sub(other: Vec2): Vec2 {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	/**
	 * Multiplies this vector with another vector element-wise. In other words, this.x *= other.x and this.y *= other.y
	 * @param other The Vec2 to multiply this one by
	 * @returns This vector after multiplying its components by this one
	 */
	mult(other: Vec2): Vec2 {
		this.x *= other.x;
		this.y *= other.y;
		return this;
	}

	/**
	 * Divides this vector with another vector element-wise. In other words, this.x /= other.x and this.y /= other.y
	 * @param other The vector to divide this one by
	 * @returns This vector after division
	 */
	div(other: Vec2): Vec2 {
		if(other.x === 0 || other.y === 0) throw "Divide by zero error";
		this.x /= other.x;
		this.y /= other.y;
		return this;
	}

	/**
	 * Does an element wise remainder operation on this vector. this.x %= other.x and this.y %= other.y
	 * @param other The other vector
	 * @returns this vector
	 */
	remainder(other: Vec2): Vec2 {
		this.x = this.x % other.x;
		this.y = this.y % other.y;
		return this;
	}

	/**
	 * Returns the squared distance between this vector and another vector
	 * @param other The vector to compute distance squared to
	 * @returns The squared distance between this vector and the one provided
	 */
	distanceSqTo(other: Vec2): number {
		return (this.x - other.x)*(this.x - other.x) + (this.y - other.y)*(this.y - other.y);
	}

	/**
	 * Returns the distance between this vector and another vector
	 * @param other The vector to compute distance to
	 * @returns The distance between this vector and the one provided
	 */
	distanceTo(other: Vec2): number {
		return Math.sqrt(this.distanceSqTo(other));
	}

	/**
	 * Returns the dot product of this vector and another
	 * @param other The vector to compute the dot product with
	 * @returns The dot product of this vector and the one provided.
	 */
	dot(other: Vec2): number {
		return this.x*other.x + this.y*other.y;
	}

	/**
	 * Returns the angle counter-clockwise in radians from this vector to another vector
	 * @param other The vector to compute the angle to
	 * @returns The angle, rotating CCW, from this vector to the other vector
	 */
	angleToCCW(other: Vec2): number {
		let dot = this.dot(other);
		let det = this.x*other.y - this.y*other.x;
		let angle = -Math.atan2(det, dot);

		if(angle < 0){
			angle += 2*Math.PI;
		}

		return angle;
	}

	/**
	 * Returns a string representation of this vector rounded to 1 decimal point
	 * @returns This vector as a string
	 */
	toString(): string {
		return this.toFixed();
	}

	/**
	 * Returns a string representation of this vector rounded to the specified number of decimal points
	 * @param numDecimalPoints The number of decimal points to create a string to
	 * @returns This vector as a string
	 */
	toFixed(numDecimalPoints: number = 1): string {
		return "(" + this.x.toFixed(numDecimalPoints) + ", " + this.y.toFixed(numDecimalPoints) + ")";
	}

	/**
	 * Returns a new vector with the same coordinates as this one.
	 * @returns A new Vec2 with the same values as this one
	 */
	clone(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	/**
	 * Returns true if this vector and other have the EXACT same x and y (not assured to be safe for floats)
	 * @param other The vector to check against
	 * @returns A boolean representing the equality of the two vectors
	 */
	strictEquals(other: Vec2): boolean {
		return this.x === other.x && this.y === other.y;
	}

	/**
	 * Returns true if this vector and other have the same x and y
	 * @param other The vector to check against
	 * @returns A boolean representing the equality of the two vectors
	 */
	equals(other: Vec2): boolean {
		let xEq = Math.abs(this.x - other.x) < 0.0000001;
		let yEq = Math.abs(this.y - other.y) < 0.0000001;

		return xEq && yEq;
	}

	/**
	 * Returns true if this vector is the zero vector exactly (not assured to be safe for floats).
	 * @returns A boolean representing the equality of this vector and the zero vector
	 */
	strictIsZero(): boolean {
		return this.x === 0 && this.y === 0;
	}

	/**
	 * Returns true if this x and y for this vector are both zero.
	 * @returns A boolean representing the equality of this vector and the zero vector
	 */
	isZero(): boolean {
		return Math.abs(this.x) < 0.0000001 && Math.abs(this.y) < 0.0000001;
	}
	
	/**
	 * Sets the function that is called whenever this vector is changed.
	 * @param f The function to be called
	 */
	setOnChange(f: Function): void {
		this.onChange = f;
	}

	toArray(): Float32Array {
		return this.vec;
	}

	/**
	 * Performs linear interpolation between two vectors
	 * @param a The first vector
	 * @param b The second vector
	 * @param t The time of the lerp, with 0 being vector A, and 1 being vector B
	 * @returns A new Vec2 representing the lerp between vector a and b.
	 */
	static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
		return new Vec2(MathUtils.lerp(a.x, b.x, t), MathUtils.lerp(a.y, b.y, t));
	}
}
import Vec2 from "./Vec2";

/** A 4x4 matrix0 */
export default class Mat4x4 {
	private mat: Float32Array;

	constructor(){
		this.mat = new Float32Array([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]);
	}

	// Static members
	static get IDENTITY(): Mat4x4 {
		return new Mat4x4().identity();
	}

	static get ZERO(): Mat4x4 {
		return new Mat4x4().zero();
	}

	// Accessors
	set _00(x: number) {
		this.mat[0] = x;
	}

	set(col: number, row: number, value: number): Mat4x4 {
		if(col < 0 || col > 3 || row < 0 || row > 3){
			throw `Error - index (${col}, ${row}) is out of bounds for Mat4x4`
		}
		this.mat[row*4 + col] = value;

		return this;
	}

	get(col: number, row: number): number {
		return this.mat[row*4 + col];
	}

	setAll(...items: Array<number>): Mat4x4 {
		this.mat.set(items);
		return this;
	}

	identity(): Mat4x4 {
		return this.setAll(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		)
	}

	zero(): Mat4x4 {
		return this.setAll(
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		);
	}

	/**
	 * Makes this Mat4x4 a rotation matrix of the specified number of radians ccw
	 * @param zRadians The number of radians to rotate
	 * @returns this Mat4x4
	 */
	rotate(zRadians: number): Mat4x4 {
		return this.setAll(
			Math.cos(zRadians), -Math.sin(zRadians), 	0, 0,
			Math.sin(zRadians), Math.cos(zRadians), 	0, 0,
			0, 					0, 						1, 0,
			0, 					0, 						0, 1
		);
	}

	/**
	 * Turns this Mat4x4 into a translation matrix of the specified translation
	 * @param translation The translation in x and y
	 * @returns this Mat4x4
	 */
	translate(translation: Vec2 | Float32Array): Mat4x4 {
		// If translation is a vec, get its array
		if(translation instanceof Vec2){
			translation = translation.toArray();
		}

		return this.setAll(
			1, 0, 0, translation[0],
			0, 1, 0, translation[1],
			0, 0, 1, 0,
			0, 0, 0, 1
		);
	}

	scale(scale: Vec2 | Float32Array | number): Mat4x4 {
		// Make sure scale is a float32Array
		if(scale instanceof Vec2){
			scale = scale.toArray();
		} else if(!(scale instanceof Float32Array)){
			scale = new Float32Array([scale, scale]);
		}

		return this.setAll(
			scale[0], 0, 		0, 0,
			0, 		  scale[1], 0, 0,
			0, 		  0,		1, 0,
			0, 		  0,		0, 1
		);
	}

	/**
	 * Returns a new Mat4x4 that represents the right side multiplication THIS x OTHER
	 * @param other The other Mat4x4 to multiply by
	 * @returns a new Mat4x4 containing the product of these two Mat4x4s
	 */
	mult(other: Mat4x4, out?: Mat4x4): Mat4x4 {
		let temp = new Float32Array(16);

		for(let i = 0; i < 4; i++){
			for(let j = 0; j < 4; j++){
				let value = 0;
				for(let k = 0; k < 4; k++){
					value += this.get(k, i) * other.get(j, k);
				}
				temp[j*4 + i]  = value;
			}
		}

		if(out !== undefined){
			return out.setAll(...temp);
		} else {
			return new Mat4x4().setAll(...temp);
		}
	}

	/**
	 * Multiplies all given matricies in order. e.g. MULT(A, B, C) -> A*B*C
	 * @param mats A list of Mat4x4s to multiply in order
	 * @returns A new Mat4x4 holding the result of the operation
	 */
	static MULT(...mats: Array<Mat4x4>): Mat4x4 {
		// Create a new array
		let temp = Mat4x4.IDENTITY;

		// Multiply by every array in order, in place
		for(let i = 0; i < mats.length; i++){
			temp.mult(mats[i], temp);
		}

		return temp;
	}

	toArray(): Float32Array {
		return this.mat;
	}

	toString(): string {
		return  `|${this.mat[0].toFixed(2)}, ${this.mat[1].toFixed(2)}, ${this.mat[2].toFixed(2)}, ${this.mat[3].toFixed(2)}|\n` + 
				`|${this.mat[4].toFixed(2)}, ${this.mat[5].toFixed(2)}, ${this.mat[6].toFixed(2)}, ${this.mat[7].toFixed(2)}|\n` +
				`|${this.mat[8].toFixed(2)}, ${this.mat[9].toFixed(2)}, ${this.mat[10].toFixed(2)}, ${this.mat[11].toFixed(2)}|\n` +
				`|${this.mat[12].toFixed(2)}, ${this.mat[13].toFixed(2)}, ${this.mat[14].toFixed(2)}, ${this.mat[15].toFixed(2)}|`;
	}
}
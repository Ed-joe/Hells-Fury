import MathUtils from "./MathUtils";

// TODO: This should be moved to the datatypes folder
/**
 * A Color util class that keeps track of colors like a vector, but can be converted into a string format
 */
export default class Color {
	/** The red value */
	public r: number;
	/** The green value */
	public g: number;
	/** The blue value */
	public b: number;
	/** The alpha value */
	public a: number;

	/**
	 * Creates a new color
	 * @param r Red
	 * @param g Green
	 * @param b Blue
	 * @param a Alpha
	 */
	constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
	}

	/**	
	 * Transparent color
	 * @returns rgba(0, 0, 0, 0)
	 */
	static get TRANSPARENT(): Color {
		return new Color(0, 0, 0, 0);
	}
	
	/**	
	 * Red color
	 * @returns rgb(255, 0, 0)
	 */
	static get RED(): Color {
		return new Color(255, 0, 0, 1);
	}

	/**	
	 * Green color
	 * @returns rgb(0, 255, 0)
	 */
	static get GREEN(): Color {
		return new Color(0, 255, 0, 1);
	}

	/**	
	 * Blue color
	 * @returns rgb(0, 0, 255)
	 */
	static get BLUE(): Color {
		return new Color(0, 0, 255, 1);
	}

	/**	
	 * Yellow color
	 * @returns rgb(255, 255, 0)
	 */
	static get YELLOW(): Color {
		return new Color(255, 255, 0, 1);
	}

	/**	
	 * Magenta color
	 * @returns rgb(255, 0, 255)
	 */
	static get MAGENTA(): Color {
		return new Color(255, 0, 255, 1);
	}

	/**	
	 * Cyan color
	 * @returns rgb(0, 255, 255)
	 */
	static get CYAN(): Color {
		return new Color(0, 255, 255, 1);
	}

	/**	
	 * White color
	 * @returns rgb(255, 255, 255)
	 */
	static get WHITE(): Color {
		return new Color(255, 255, 255, 1);
	} 

	/**	
	 * Black color
	 * @returns rgb(0, 0, 0)
	 */
	static get BLACK(): Color {
		return new Color(0, 0, 0, 1);
	}

	/**	
	 * Orange color
	 * @returns rgb(255, 100, 0)
	 */
	static get ORANGE(): Color {
		return new Color(255, 100, 0, 1);
	}

	/**
	 * Sets the color to the values provided
	 * @param r Red
	 * @param g Green
	 * @param b Blue
	 * @param a Alpha
	 */
	set(r: number, g: number, b: number, a: number = 1): void {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	/**
	 * Returns a new color slightly lighter than the current color
	 * @returns A new lighter Color
	 */
	lighten(): Color {
		return new Color(MathUtils.clamp(this.r + 40, 0, 255), MathUtils.clamp(this.g + 40, 0, 255), MathUtils.clamp(this.b + 40, 0, 255), MathUtils.clamp(this.a + 10, 0, 255));
	}

	/**
	 * Returns a new color slightly darker than the current color
	 * @returns A new darker Color
	 */
	darken(): Color {
		return new Color(MathUtils.clamp(this.r - 40, 0, 255), MathUtils.clamp(this.g - 40, 0, 255), MathUtils.clamp(this.b - 40, 0, 255), MathUtils.clamp(this.a + 10, 0, 255));
	}
	
	/**
	 * Returns this color as an array
	 * @returns [r, g, b, a]
	 */
	toArray(): [number, number, number, number] {
		return [this.r, this.g, this.b, this.a];
	}
	
	/**
	 * Returns the color as a string of the form #RRGGBB
	 * @returns #RRGGBB
	 */
	toString(): string {
		return "#" + MathUtils.toHex(this.r, 2) + MathUtils.toHex(this.g, 2) + MathUtils.toHex(this.b, 2);
	}

	/**
	 * Returns the color as a string of the form rgb(r, g, b)
	 * @returns rgb(r, g, b)
	 */
	toStringRGB(): string {
		return "rgb(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ")";
	}

	/**
	 * Returns the color as a string of the form rgba(r, g, b, a)
	 * @returns rgba(r, g, b, a)
	 */
	toStringRGBA(): string {
		if(this.a === 0){
			return this.toStringRGB();
		}
		return "rgba(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ", " + this.a.toString() +")"
	}

	/**
	 * Turns this color into a float32Array and changes color range to [0.0, 1.0]
	 * @returns a Float32Array containing the color
	 */
	toWebGL(): Float32Array {
		return new Float32Array([
			this.r/255,
			this.g/255,
			this.b/255,
			this.a
		]);
	}

	static fromStringHex(str: string): Color {
		let i = 0;
		if(str.charAt(0) == "#") i+= 1;
		let r = MathUtils.fromHex(str.substring(i, i+2));
		let g = MathUtils.fromHex(str.substring(i+2, i+4));
		let b = MathUtils.fromHex(str.substring(i+4, i+6));
		return new Color(r, g, b);
	}
}
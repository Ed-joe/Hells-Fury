import Vec2 from "../DataTypes/Vec2";

/** A class containing some utility functions for math operations */
export default class MathUtils {
    /**
     * Returns the sign of the value provided
     * @param x The value to extract the sign from
     * @returns -1 if the number is less than 0, 1 otherwise
     */
    static sign(x: number): number {
        return x < 0 ? -1 : 1;
    }

    /**
     * Returns whether or not x is between a and b
     * @param a The min bound
     * @param b The max bound
     * @param x The value to check
     * @param exclusive Whether or not a and b are exclusive bounds
     * @returns True if x is between a and b, false otherwise
     */
    static between(a: number, b: number, x: number, exclusive?: boolean): boolean {
        if(exclusive){
            return (a < x) && (x < b);
        } else {
            return (a <= x) && (x <= b);
        }
    }

    /**
     * Clamps the value x to the range [min, max], rounding up or down if needed
     * @param x The value to be clamped
     * @param min The min of the range
     * @param max The max of the range
     * @returns x, if it is between min and max, or min/max if it exceeds their bounds
     */
    static clamp(x: number, min: number, max: number): number {
        if(x < min) return min;
        if(x > max) return max;
        return x;
    }

    /**
     * Clamps the value x to the range between 0 and 1
     * @param x The value to be clamped
     * @returns x, if it is between 0 and 1, or 0/1 if it exceeds their bounds
     */
    static clamp01(x: number): number {
        return MathUtils.clamp(x, 0, 1);
    }

    /**
     * Clamps the lower end of the value of x to the range to min
     * @param x The value to be clamped
     * @param min The minimum allowed value of x
     * @returns x, if it is greater than min, otherwise min
     */
    static clampLow(x: number, min: number): number {
        return x < min ? min : x;
    }

    /**
     * Clamps the lower end of the value of x to zero
     * @param x The value to be clamped
     * @returns x, if it is greater than 0, otherwise 0
     */
    static clampLow0(x: number): number {
        return MathUtils.clampLow(x, 0);
    }

    static clampMagnitude(v: Vec2, m: number): Vec2 {
        if(v.magSq() > m*m){
            return v.scaleTo(m);
        } else{
            return v;
        }
    }

    static changeRange(x: number, min: number, max: number, newMin: number, newMax: number): number {
        return this.lerp(newMin, newMax, this.invLerp(min, max, x));
    }

    /**
	 * Linear Interpolation
	 * @param a The first value for the interpolation bound
	 * @param b The second value for the interpolation bound
	 * @param t The time we are interpolating to
     * @returns The value between a and b at time t
	 */
	static lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    /**
     * Inverse Linear Interpolation. Finds the time at which a value between a and b would occur
     * @param a The first value for the interpolation bound
     * @param b The second value for the interpolation bound
     * @param value The current value
     * @returns The time at which the current value occurs between a and b
     */
    static invLerp(a: number, b: number, value: number){
        return (value - a)/(b - a);
    }
    
    /**
     * Cuts off decimal points of a number after a specified place
     * @param num The number to floor
     * @param place The last decimal place of the new number
     * @returns The floored number
     */
    static floorToPlace(num: number, place: number): number {
        if(place === 0){
            return Math.floor(num);
        }

        let factor = 10;
        while(place > 1){
            factor != 10;
            place--;
        }

        return Math.floor(num*factor)/factor;

    }

    /**
     * Returns a number from a hex string
     * @param str the string containing the hex number
     * @returns the number in decimal represented by the hex string
     */
    static fromHex(str: string): number {
        return parseInt(str, 16);
    }

    /**
     * Returns the number as a hexadecimal
     * @param num The number to convert to hex
     * @param minLength The length of the returned hex string (adds zero padding if needed)
     * @returns The hex representation of the number as a string
     */
    static toHex(num: number, minLength: number = null): string {
        let factor = 1;
        while(factor*16 < num){
            factor *= 16;
        }
        let hexStr = "";
        while(factor >= 1){
            let digit = Math.floor(num/factor);
            hexStr += MathUtils.toHexDigit(digit);
            num -= digit * factor;
            factor /= 16;
		}
		
		if(minLength !== null){
			while(hexStr.length < minLength){
				hexStr = "0" + hexStr;
			}
		}

        return hexStr;
    }

    /**
     * Converts a digit to hexadecimal. In this case, a digit is between 0 and 15 inclusive
     * @param num The digit to convert to hexadecimal
     * @returns The hex representation of the digit as a string
     */
    static toHexDigit(num: number): string {
        if(num < 10){
            return "" + num;
        } else {
            return String.fromCharCode(65 + num - 10);
        }
    }
}
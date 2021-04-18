import MathUtils from "./MathUtils";
import Color from "./Color";
import Perlin from "./Rand/Perlin";
import Vec2 from "../DataTypes/Vec2";

class Noise {
    p: Perlin = new Perlin();

    perlin(x: number, y: number, z?: number): number {
        return this.p.perlin(x, y, z);
    }
}

/** A class that has some random generator utils */
export default class RandUtils {
    /**
     * Generates a random integer in the specified range
     * @param min The min of the range (inclusive)
     * @param max The max of the range (exclusive)
     * @returns A random int in the range [min, max)
     */
	static randInt(min: number, max: number): number {
        return Math.floor(Math.random()*(max - min) + min);
    }

    /**
     * Generates a random float in the specified range
     * @param min The min of the range (inclusive)
     * @param max The max of the range (exclusive)
     * @returns A random float in the range [min, max)
     */
	static randFloat(min: number, max: number): number {
        return Math.random()*(max - min) + min;
    }
    
    /**
     * Generates a random hexadecimal number in the specified range
     * @param min The min of the range (inclusive)
     * @param max The max of the range (exclusive)
     * @returns a random hex number in the range [min, max) as a string
     */
    static randHex(min: number, max: number): string {
        return MathUtils.toHex(RandUtils.randInt(min, max));
    }

    /**
     * Generates a random color
     * @returns A random Color
     */
	static randColor(): Color {
        let r = RandUtils.randInt(0, 256);
        let g = RandUtils.randInt(0, 256);
        let b = RandUtils.randInt(0, 256);
        return new Color(r, g, b);
    }

    static randVec(minX: number, maxX: number, minY: number, maxY: number): Vec2 {
        return new Vec2(this.randFloat(minX, maxX), this.randFloat(minY, maxY));
    }

    /** A noise generator */
    static noise: Noise = new Noise();

}
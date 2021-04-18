import MathUtils from "../MathUtils";

const permutation = [ 151,160,137,91,90,15,
	131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
];

/**
 * A noise generator
 */
export default class Perlin {

    private p: Int16Array;
    private repeat: number;

	constructor(){
		this.p = new Int16Array(512);
		for(let i = 0; i < 512; i++){
			this.p[i] = permutation[i%256];
		}
		this.repeat = -1;
	}

    /**
     * Returns a random perlin noise value
     * @param x An input value
     * @param y An input value
     * @param z An input value
	 * @returns A noise value
     */
	perlin(x: number, y: number, z: number = 0): number {
		if(this.repeat > 0) {
			x = x%this.repeat;
			y = y%this.repeat;
			z = z%this.repeat;
		}

		// Get the position of the unit cube of (x, y, z)
		let xi = Math.floor(x) & 255;
		let yi = Math.floor(y) & 255;
		let zi = Math.floor(z) & 255;
		// Get the position of (x, y, z) in that unit cube
		let xf = x - Math.floor(x);
		let yf = y - Math.floor(y);
		let zf = z - Math.floor(z);

		// Use the fade function to relax the coordinates towards a whole value
		let u = this.fade(xf);
		let v = this.fade(yf);
		let w = this.fade(zf);

		// Perlin noise hash function
		let aaa = this.p[this.p[this.p[    xi ]+    yi ]+    zi ];
		let aba = this.p[this.p[this.p[    xi ]+this.inc(yi)]+    zi ];
		let aab = this.p[this.p[this.p[    xi ]+    yi ]+this.inc(zi)];
		let abb = this.p[this.p[this.p[    xi ]+this.inc(yi)]+this.inc(zi)];
		let baa = this.p[this.p[this.p[this.inc(xi)]+    yi ]+    zi ];
		let bba = this.p[this.p[this.p[this.inc(xi)]+this.inc(yi)]+    zi ];
		let bab = this.p[this.p[this.p[this.inc(xi)]+    yi ]+this.inc(zi)];
		let bbb = this.p[this.p[this.p[this.inc(xi)]+this.inc(yi)]+this.inc(zi)];

		// Calculate the value of the perlin noies
    	let x1 = MathUtils.lerp(this.grad (aaa, xf  , yf  , zf), this.grad (baa, xf-1, yf  , zf), u);
    	let x2 = MathUtils.lerp(this.grad (aba, xf  , yf-1, zf), this.grad (bba, xf-1, yf-1, zf), u);
    	let y1 = MathUtils.lerp(x1, x2, v);

    	x1 = MathUtils.lerp(this.grad (aab, xf  , yf  , zf-1), this.grad (bab, xf-1, yf  , zf-1), u);
    	x2 = MathUtils.lerp(this.grad (abb, xf  , yf-1, zf-1), this.grad (bbb, xf-1, yf-1, zf-1), u);
		let y2 = MathUtils.lerp (x1, x2, v);
		
		return (MathUtils.lerp(y1, y2, w) + 1)/2;
	}

	grad(hash: number, x: number, y: number, z: number){
		switch(hash & 0xF)
		{
			case 0x0: return  x + y;
			case 0x1: return -x + y;
			case 0x2: return  x - y;
			case 0x3: return -x - y;
			case 0x4: return  x + z;
			case 0x5: return -x + z;
			case 0x6: return  x - z;
			case 0x7: return -x - z;
			case 0x8: return  y + z;
			case 0x9: return -y + z;
			case 0xA: return  y - z;
			case 0xB: return -y - z;
			case 0xC: return  y + x;
			case 0xD: return -y + z;
			case 0xE: return  y - x;
			case 0xF: return -y - z;
			default: return 0; // never happens
		}
	}

	/**
	 * Safe increment that doesn't go beyond the repeat value
	 * @param num The number to increment
	 */
	inc(num: number){
		num++;
		if(this.repeat > 0){
			num %= this.repeat;
		}
		return num;
	}

	/**
	 * The fade function 6t^5 - 15t^4 + 10t^3
	 * @param t The value we are applying the fade to
	 */
	fade(t: number){
		return t*t*t*(t*(t*6 - 15) + 10);
	}
}
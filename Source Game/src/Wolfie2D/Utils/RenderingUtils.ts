import Vec2 from "../DataTypes/Vec2";
import Color from "./Color";
import MathUtils from "./MathUtils";

export default class RenderingUtils {
	static toWebGLCoords(point: Vec2, origin: Vec2, worldSize: Vec2): Float32Array {
		return new Float32Array([
			MathUtils.changeRange(point.x, origin.x, origin.x + worldSize.x, -1, 1),
			MathUtils.changeRange(point.y, origin.y, origin.y + worldSize.y, 1, -1)
		]);
	}

	static toWebGLScale(size: Vec2, worldSize: Vec2): Float32Array {
		return new Float32Array([
			2*size.x/worldSize.x,
			2*size.y/worldSize.y,
		]);
	}

	static toWebGLColor(color: Color): Float32Array {
		return new Float32Array([
			MathUtils.changeRange(color.r, 0, 255, 0, 1),
			MathUtils.changeRange(color.g, 0, 255, 0, 1),
			MathUtils.changeRange(color.b, 0, 255, 0, 1),
			color.a
		]);
	}
}
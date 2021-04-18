import Mat4x4 from "../../../DataTypes/Mat4x4";
import Vec2 from "../../../DataTypes/Vec2";
import Debug from "../../../Debug/Debug";
import AnimatedSprite from "../../../Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../Nodes/Sprites/Sprite";
import ResourceManager from "../../../ResourceManager/ResourceManager";
import QuadShaderType from "./QuadShaderType";

/** A shader for sprites and animated sprites */
export default class SpriteShaderType extends QuadShaderType {
	constructor(programKey: string){
		super(programKey);
		this.resourceManager = ResourceManager.getInstance();
	}

	initBufferObject(): void {
		this.bufferObjectKey = "sprite";
		this.resourceManager.createBuffer(this.bufferObjectKey);
	}

	render(gl: WebGLRenderingContext, options: Record<string, any>): void {
		const program = this.resourceManager.getShaderProgram(this.programKey);
		const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);
		const texture = this.resourceManager.getTexture(options.imageKey);

		gl.useProgram(program);

		const vertexData = this.getVertices(options.size.x, options.size.y, options.scale);

		const FSIZE = vertexData.BYTES_PER_ELEMENT;

		// Bind the buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

		// Attributes
		const a_Position = gl.getAttribLocation(program, "a_Position");
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * FSIZE, 0 * FSIZE);
		gl.enableVertexAttribArray(a_Position);

		const a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
		gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 4 * FSIZE, 2*FSIZE);
		gl.enableVertexAttribArray(a_TexCoord);

		// Uniforms
		// Get transformation matrix
		// We want a square for our rendering space, so get the maximum dimension of our quad
		let maxDimension = Math.max(options.size.x, options.size.y);

		// The size of the rendering space will be a square with this maximum dimension
		let size = new Vec2(maxDimension, maxDimension).scale(2/options.worldSize.x, 2/options.worldSize.y);

		// Center our translations around (0, 0)
		const translateX = (options.position.x - options.origin.x - options.worldSize.x/2)/maxDimension;
		const translateY = -(options.position.y - options.origin.y - options.worldSize.y/2)/maxDimension;

		// Create our transformation matrix
		this.translation.translate(new Float32Array([translateX, translateY]));
		this.scale.scale(size);
		this.rotation.rotate(options.rotation);
		let transformation = Mat4x4.MULT(this.translation, this.scale, this.rotation);

		// Pass the translation matrix to our shader
		const u_Transform = gl.getUniformLocation(program, "u_Transform");
		gl.uniformMatrix4fv(u_Transform, false, transformation.toArray());

		// Set up our sampler with our assigned texture unit
		const u_Sampler = gl.getUniformLocation(program, "u_Sampler");
		gl.uniform1i(u_Sampler, texture);

		// Pass in texShift
		const u_texShift = gl.getUniformLocation(program, "u_texShift");
		gl.uniform2fv(u_texShift, options.texShift);

		// Pass in texScale
		const u_texScale = gl.getUniformLocation(program, "u_texScale");
		gl.uniform2fv(u_texScale, options.texScale);

		// Draw the quad
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	/**
	 * The rendering space always has to be a square, so make sure its square w.r.t to the largest dimension
	 * @param w The width of the quad in pixels
	 * @param h The height of the quad in pixels
	 * @returns An array of the vertices of the quad
	 */
	getVertices(w: number, h: number, scale: Float32Array): Float32Array {
		let x, y;

		if(h > w){
			y = 0.5;
			x = w/(2*h);
		} else {
			x = 0.5;
			y = h/(2*w);
		}

		// Scale the rendering space if needed
		x *= scale[0];
		y *= scale[1];

		return new Float32Array([
			-x,  y, 0.0, 0.0,
			-x, -y, 0.0, 1.0,
			 x,  y, 1.0, 0.0,
			 x, -y, 1.0, 1.0
		]);
	}

	getOptions(sprite: Sprite): Record<string, any> {
		let texShift;
		let texScale;

		if(sprite instanceof AnimatedSprite){
			let animationIndex = sprite.animation.getIndexAndAdvanceAnimation();
			let offset = sprite.getAnimationOffset(animationIndex);
			texShift = new Float32Array([offset.x / (sprite.cols * sprite.size.x), offset.y / (sprite.rows * sprite.size.y)]);
			texScale = new Float32Array([1/(sprite.cols), 1/(sprite.rows)]);
		} else {
			texShift = new Float32Array([0, 0]);
			texScale = new Float32Array([1, 1]);
		}

		let options: Record<string, any> = {
			position: sprite.position,
			rotation: sprite.rotation,
			size: sprite.size,
			scale: sprite.scale.toArray(),
			imageKey: sprite.imageId,
			texShift,
			texScale
		}

		return options;
	}
}
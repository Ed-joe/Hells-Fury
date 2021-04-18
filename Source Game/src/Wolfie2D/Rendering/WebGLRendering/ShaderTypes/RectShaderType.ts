import Mat4x4 from "../../../DataTypes/Mat4x4";
import Vec2 from "../../../DataTypes/Vec2";
import Rect from "../../../Nodes/Graphics/Rect";
import ResourceManager from "../../../ResourceManager/ResourceManager";
import QuadShaderType from "./QuadShaderType";

export default class RectShaderType extends QuadShaderType {

	constructor(programKey: string){
		super(programKey);
		this.resourceManager = ResourceManager.getInstance();
	}

	initBufferObject(): void {
		this.bufferObjectKey = "rect";
		this.resourceManager.createBuffer(this.bufferObjectKey);
	}

	render(gl: WebGLRenderingContext, options: Record<string, any>): void {
		const color = options.color.toWebGL();

		const program = this.resourceManager.getShaderProgram(this.programKey);
		const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);

		gl.useProgram(program);

		const vertexData = this.getVertices(options.size.x, options.size.y);

		const FSIZE = vertexData.BYTES_PER_ELEMENT;

		// Bind the buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

		// Attributes
		const a_Position = gl.getAttribLocation(program, "a_Position");
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 2 * FSIZE, 0 * FSIZE);
		gl.enableVertexAttribArray(a_Position);

		// Uniforms
		const u_Color = gl.getUniformLocation(program, "u_Color");
		gl.uniform4fv(u_Color, color);

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

		// Draw the quad
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}


	/*
		So as it turns out, WebGL has an issue with non-square quads.
		It doesn't like when you don't have a 1-1 scale, and rotations are entirely messed up if this is not the case.
		To solve this, I used the scale of the LARGEST dimension of the quad to make a square, then adjusted the vertex coordinates inside of that.
		A diagram of the solution follows.

		There is a bounding square for the quad with dimensions hxh (in this case, since height is the largest dimension).
		The offset in the vertical direction is therefore 0.5, as it is normally.
		However, the offset in the horizontal direction is not so straightforward, but isn't conceptually hard.
		All we really have to do is a range change from [0, height/2] to [0, 0.5], where our value is t = width/2, and 0 <= t <= height/2.

		So now we have our rect, in a space scaled with respect to the largest dimension.
		Rotations work as you would expect, even for long rectangles.

					0.5
			__ __ __ __ __ __ __
			|	|88888888888|	|
			|	|88888888888|	|
			|	|88888888888|	|
		-0.5|_ _|88888888888|_ _|0.5
			|	|88888888888|	|
			|	|88888888888|	|
			|	|88888888888|	|
	  		|___|88888888888|___|
			  		-0.5

		The getVertices function below does as described, and converts the range
	*/
	/**
	 * The rendering space always has to be a square, so make sure its square w.r.t to the largest dimension
	 * @param w The width of the quad in pixels
	 * @param h The height of the quad in pixels
	 * @returns An array of the vertices of the quad
	 */
	getVertices(w: number, h: number): Float32Array {
		let x, y;

		if(h > w){
			y = 0.5;
			x = w/(2*h);
		} else {
			x = 0.5;
			y = h/(2*w);
		}

		return new Float32Array([
			-x,  y,
			-x, -y,
			 x,  y,
			 x, -y
		]);
	}

	getOptions(rect: Rect): Record<string, any> {
		let options: Record<string, any> = {
			position: rect.position,
			color: rect.color,
			size: rect.size,
			rotation: rect.rotation
		}

		return options;
	}
}
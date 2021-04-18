import Mat4x4 from "../../../DataTypes/Mat4x4";
import Vec2 from "../../../DataTypes/Vec2";
import Debug from "../../../Debug/Debug";
import Rect from "../../../Nodes/Graphics/Rect";
import Label from "../../../Nodes/UIElements/Label";
import ResourceManager from "../../../ResourceManager/ResourceManager";
import QuadShaderType from "./QuadShaderType";

export default class LabelShaderType extends QuadShaderType {

	constructor(programKey: string){
		super(programKey);
		this.resourceManager = ResourceManager.getInstance();
	}

	initBufferObject(): void {
		this.bufferObjectKey = "label";
		this.resourceManager.createBuffer(this.bufferObjectKey);
	}

	render(gl: WebGLRenderingContext, options: Record<string, any>): void {
		const backgroundColor = options.backgroundColor.toWebGL();
		const borderColor = options.borderColor.toWebGL();

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
		const u_BackgroundColor = gl.getUniformLocation(program, "u_BackgroundColor");
		gl.uniform4fv(u_BackgroundColor, backgroundColor);

        const u_BorderColor = gl.getUniformLocation(program, "u_BorderColor");
		gl.uniform4fv(u_BorderColor, borderColor);

        const u_MaxSize = gl.getUniformLocation(program, "u_MaxSize");
        gl.uniform2f(u_MaxSize, -vertexData[0], vertexData[1]);

		// Get transformation matrix
		// We want a square for our rendering space, so get the maximum dimension of our quad
		let maxDimension = Math.max(options.size.x, options.size.y);

        const u_BorderWidth = gl.getUniformLocation(program, "u_BorderWidth");
		gl.uniform1f(u_BorderWidth, options.borderWidth/maxDimension);

        const u_BorderRadius = gl.getUniformLocation(program, "u_BorderRadius");
		gl.uniform1f(u_BorderRadius, options.borderRadius/maxDimension);

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

	getOptions(rect: Label): Record<string, any> {
		let options: Record<string, any> = {
			position: rect.position,
			backgroundColor: rect.calculateBackgroundColor(),
            borderColor: rect.calculateBorderColor(),
            borderWidth: rect.borderWidth,
            borderRadius: rect.borderRadius,
			size: rect.size,
			rotation: rect.rotation
		}

		return options;
	}
}
import Debug from "../../../Debug/Debug";
import Point from "../../../Nodes/Graphics/Point";
import ResourceManager from "../../../ResourceManager/ResourceManager";
import RenderingUtils from "../../../Utils/RenderingUtils";
import ShaderType from "../ShaderType";

export default class PointShaderType extends ShaderType {

	protected bufferObjectKey: string;

	constructor(programKey: string){
		super(programKey);
	}

	initBufferObject(): void {
		this.bufferObjectKey = "point";
		this.resourceManager.createBuffer(this.bufferObjectKey);
	}

	render(gl: WebGLRenderingContext, options: Record<string, any>): void {
		let position = RenderingUtils.toWebGLCoords(options.position, options.origin, options.worldSize);
		let color = RenderingUtils.toWebGLColor(options.color);

		const program = this.resourceManager.getShaderProgram(this.programKey);
		const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);

		gl.useProgram(program);

		const vertexData = position;

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

		const u_PointSize = gl.getUniformLocation(program, "u_PointSize");
		gl.uniform1f(u_PointSize, options.pointSize);

		gl.drawArrays(gl.POINTS, 0, 1);
	}

	getOptions(point: Point): Record<string, any> {
		let options: Record<string, any> = {
			position: point.position,
			color: point.color,
			pointSize: point.size,
		}

		return options;
	}
}
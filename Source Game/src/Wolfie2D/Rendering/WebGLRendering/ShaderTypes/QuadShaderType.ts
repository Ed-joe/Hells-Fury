import Mat4x4 from "../../../DataTypes/Mat4x4";
import ShaderType from "../ShaderType";

/** Represents any WebGL objects that have a quad mesh (i.e. a rectangular game object composed of only two triangles) */
export default abstract class QuadShaderType extends ShaderType {
	/** The key to the buffer object for this shader */
	protected bufferObjectKey: string;

	/** The scale matric */
	protected scale: Mat4x4;

	/** The rotation matrix */
	protected rotation: Mat4x4;

	/** The translation matrix */
	protected translation: Mat4x4;

	constructor(programKey: string){
		super(programKey);

		this.scale = Mat4x4.IDENTITY;
		this.rotation = Mat4x4.IDENTITY;
		this.translation = Mat4x4.IDENTITY;
	}
}
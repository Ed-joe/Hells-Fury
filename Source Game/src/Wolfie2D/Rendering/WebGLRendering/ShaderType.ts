import Map from "../../DataTypes/Map";
import CanvasNode from "../../Nodes/CanvasNode";
import ResourceManager from "../../ResourceManager/ResourceManager";

/**
 * A wrapper class for WebGL shaders.
 * This class is a singleton, and there is only one for each shader type.
 * All objects that use this shader type will refer to and modify this same type.
 */
export default abstract class ShaderType {
	/** The name of this shader */
	protected name: string;

	/** The key to the WebGLProgram in the ResourceManager */
	protected programKey: string;

	/** A reference to the resource manager */
	protected resourceManager: ResourceManager;

	constructor(programKey: string){
		this.programKey = programKey;
		this.resourceManager = ResourceManager.getInstance();
	}

	/**
	 * Initializes any buffer objects associated with this shader type.
	 * @param gl The WebGL rendering context
	 */
	abstract initBufferObject(): void;

	/**
	 * Loads any uniforms
	 * @param gl The WebGL rendering context
	 * @param options Information about the object we're currently rendering
	 */
	abstract render(gl: WebGLRenderingContext, options: Record<string, any>): void;

	/**
	 * Extracts the options from the CanvasNode and gives them to the render function
	 * @param node The node to get options from
	 * @returns An object containing the options that should be passed to the render function
	 */
	getOptions(node: CanvasNode): Record<string, any> {return {};}
}
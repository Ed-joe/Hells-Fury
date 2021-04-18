import Map from "../../DataTypes/Map";
import ShaderType from "../../Rendering/WebGLRendering/ShaderType";
import LabelShaderType from "../../Rendering/WebGLRendering/ShaderTypes/LabelShaderType";
import PointShaderType from "../../Rendering/WebGLRendering/ShaderTypes/PointShaderType";
import RectShaderType from "../../Rendering/WebGLRendering/ShaderTypes/RectShaderType";
import SpriteShaderType from "../../Rendering/WebGLRendering/ShaderTypes/SpriteShaderType";
import ResourceManager from "../../ResourceManager/ResourceManager";
import Registry from "./Registry";

/**
 * A registry that handles shaders
 */
export default class ShaderRegistry extends Registry<ShaderType> {

	// Shader names
	public static POINT_SHADER = "point";
	public static RECT_SHADER = "rect";
	public static SPRITE_SHADER = "sprite";
	public static LABEL_SHADER = "label";

	private registryItems: Array<ShaderRegistryItem> = new Array();

	/**
	 * Preloads all built-in shaders
	 */
	public preload(){
		// Get the resourceManager and queue all built-in shaders for preloading
		const rm = ResourceManager.getInstance();

		// Queue a load for the point shader
		this.registerAndPreloadItem(ShaderRegistry.POINT_SHADER, PointShaderType, "builtin/shaders/point.vshader", "builtin/shaders/point.fshader");

		// Queue a load for the rect shader
		this.registerAndPreloadItem(ShaderRegistry.RECT_SHADER, RectShaderType, "builtin/shaders/rect.vshader", "builtin/shaders/rect.fshader");

		// Queue a load for the sprite shader
		this.registerAndPreloadItem(ShaderRegistry.SPRITE_SHADER, SpriteShaderType, "builtin/shaders/sprite.vshader", "builtin/shaders/sprite.fshader");
	
		// Queue a load for the label shader
		this.registerAndPreloadItem(ShaderRegistry.LABEL_SHADER, LabelShaderType, "builtin/shaders/label.vshader", "builtin/shaders/label.fshader");

		// Queue a load for any preloaded items
		for(let item of this.registryItems){
			const shader = new item.constr(item.key);
			shader.initBufferObject();
			this.add(item.key, shader);

			// Load if desired
			if(item.preload !== undefined){
				rm.shader(item.key, item.preload.vshaderLocation, item.preload.fshaderLocation);
			}
		}
	}

	/**
	 * Registers a shader in the registry and loads it before the game begins
	 * @param key The key you wish to assign to the shader
	 * @param constr The constructor of the ShaderType
	 * @param vshaderLocation The location of the vertex shader
	 * @param fshaderLocation the location of the fragment shader
	 */
	public registerAndPreloadItem(key: string, constr: new (programKey: string) => ShaderType, vshaderLocation: string, fshaderLocation: string): void {
		let shaderPreload = new ShaderPreload();
		shaderPreload.vshaderLocation = vshaderLocation;
		shaderPreload.fshaderLocation = fshaderLocation;

		let registryItem = new ShaderRegistryItem();
		registryItem.key = key;
		registryItem.constr = constr;
		registryItem.preload = shaderPreload;

		this.registryItems.push(registryItem);
	}

	/**
	 * Registers a shader in the registry. NOTE: If you use this, you MUST load the shader before use.
	 * If you wish to preload the shader, use registerAndPreloadItem()
	 * @param key The key you wish to assign to the shader
	 * @param constr The constructor of the ShaderType
	 */
	public registerItem(key: string, constr: new (programKey: string) => ShaderType): void {
		let registryItem = new ShaderRegistryItem();
		registryItem.key = key;
		registryItem.constr = constr;

		this.registryItems.push(registryItem);
	}
}

class ShaderRegistryItem {
	key: string;
	constr: new (programKey: string) => ShaderType;
	preload: ShaderPreload;
}

class ShaderPreload {
	vshaderLocation: string;
	fshaderLocation: string;
}
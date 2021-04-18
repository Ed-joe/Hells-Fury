import Map from "../DataTypes/Map";
import Registry from "./Registries/Registry";
import ShaderRegistry from "./Registries/ShaderRegistry";

/**
 * The Registry is the system's way of converting classes and types into string
 * representations for use elsewhere in the application.
 * It allows classes to be accessed without explicitly using constructors in code,
 * and for resources to be loaded at Game creation time.
 */
export default class RegistryManager {

	public static shaders = new ShaderRegistry();

	/** Additional custom registries to add to the registry manager */
	protected static registries: Map<Registry<any>> = new Map();

	static preload(){
		this.shaders.preload();

		this.registries.forEach((key: string) => this.registries.get(key).preload());
	}

	static addCustomRegistry(name: string, registry: Registry<any>){
		this.registries.add(name, registry);
	}

	static getRegistry(key: string){
		return this.registries.get(key);
	}
}
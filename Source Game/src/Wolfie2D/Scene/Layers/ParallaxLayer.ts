import Layer from "../Layer";
import Vec2 from "../../DataTypes/Vec2";
import Scene from "../Scene";

/**
 * An extension of a Layer that has a parallax value.
 */
export default class ParallaxLayer extends Layer {
	/** The value of the parallax of the Layer */
	parallax: Vec2;
	
	/**
	 * Creates a new ParallaxLayer.
	 * Use addParallaxLayer() in @reference[Scene] to add a layer of this type to your game.
	 * @param scene The Scene to add this ParallaxLayer to
	 * @param name The name of the ParallaxLayer
	 * @param parallax The parallax level
	 */
	constructor(scene: Scene, name: string, parallax: Vec2){
		super(scene, name);
		this.parallax = parallax;
	}
}
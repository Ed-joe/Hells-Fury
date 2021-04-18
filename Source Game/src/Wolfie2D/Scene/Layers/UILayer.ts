import Vec2 from "../../DataTypes/Vec2";
import Scene from "../Scene";
import ParallaxLayer from "./ParallaxLayer";

/**
 * A Layer strictly to be used for managing UIElements.
 * This is intended to be a Layer that always stays in the same place,
 * and thus renders things like a HUD or an inventory without taking into consideration the \reference[Viewport] scroll.
 */
export default class UILayer extends ParallaxLayer {
	/**
	 * Creates a new UILayer.
	 * Use addUILayer() in @reference[Scene] to add a layer of this type to your game.
	 * @param scene The Scene to add this UILayer to
	 * @param name The name of the UILayer
	 */
	constructor(scene: Scene, name: string){
		super(scene, name, Vec2.ZERO);
	}
}
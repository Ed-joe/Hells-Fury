import Scene from "../Scene";
import CanvasNodeFactory from "./CanvasNodeFactory";
import TilemapFactory from "./TilemapFactory";
import Tilemap from "../../Nodes/Tilemap";
import { UIElementType } from "../../Nodes/UIElements/UIElementTypes";
import UIElement from "../../Nodes/UIElement";
import Sprite from "../../Nodes/Sprites/Sprite";
import { GraphicType } from "../../Nodes/Graphics/GraphicTypes";
import Graphic from "../../Nodes/Graphic";
import AnimatedSprite from "../../Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../DataTypes/Vec2";
import Layer from "../Layer";

/**
 * The manager of all factories used for adding @reference[GameNode]s to the @reference[Scene].
 */
export default class FactoryManager {

    // Constructors are called here to allow assignment of their functions to functions in this class
    private canvasNodeFactory: CanvasNodeFactory = new CanvasNodeFactory();
    private tilemapFactory: TilemapFactory = new TilemapFactory();

    constructor(scene: Scene, tilemaps: Array<Tilemap>){
        this.canvasNodeFactory.init(scene);
        this.tilemapFactory.init(scene, tilemaps);
    }

    // Expose all of the factories through the factory manager
    /**
	 * Adds an instance of a UIElement to the current scene - i.e. any class that extends UIElement
	 * @param type The type of UIElement to add
	 * @param layerName The layer to add the UIElement to
	 * @param options Any additional arguments to feed to the constructor
	 * @returns A new UIElement
	 */
    uiElement(type: string | UIElementType, layerName: string, options?: Record<string, any>): UIElement {
        return this.canvasNodeFactory.addUIElement(type, layerName, options);
    }

    /**
	 * Adds a sprite to the current scene
	 * @param key The key of the image the sprite will represent
	 * @param layerName The layer on which to add the sprite
	 * @returns A new Sprite
	 */
	sprite(key: string, layerName: string): Sprite {
        return this.canvasNodeFactory.addSprite(key, layerName);
    }

    /**
	 * Adds an AnimatedSprite to the current scene
	 * @param key The key of the image the sprite will represent
	 * @param layerName The layer on which to add the sprite
	 * @returns A new AnimatedSprite
	 */
	animatedSprite(key: string, layerName: string): AnimatedSprite {
        return this.canvasNodeFactory.addAnimatedSprite(key, layerName);
    }

    /**
	 * Adds a new graphic element to the current Scene
	 * @param type The type of graphic to add
	 * @param layerName The layer on which to add the graphic
	 * @param options Any additional arguments to send to the graphic constructor
	 * @returns A new Graphic
	 */
	graphic(type: GraphicType | string, layerName: string, options?: Record<string, any>): Graphic {
        return this.canvasNodeFactory.addGraphic(type, layerName, options);
    }

    /**
     * Adds a tilemap to the scene
     * @param key The key of the loaded tilemap to load
     * @param constr The constructor of the desired tilemap
     * @param args Additional arguments to send to the tilemap constructor
     * @returns An array of Layers, each of which contains a layer of the tilemap as its own Tilemap instance.
     */
	tilemap(key: string, scale?: Vec2): Array<Layer> {
        return this.tilemapFactory.add(key, scale);
    }
}
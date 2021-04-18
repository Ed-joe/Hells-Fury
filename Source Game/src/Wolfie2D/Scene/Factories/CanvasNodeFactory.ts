import Scene from "../Scene";
import UIElement from "../../Nodes/UIElement";
import Graphic from "../../Nodes/Graphic";
import Sprite from "../../Nodes/Sprites/Sprite";
import AnimatedSprite from "../../Nodes/Sprites/AnimatedSprite";
import { GraphicType } from "../../Nodes/Graphics/GraphicTypes";
import { UIElementType } from "../../Nodes/UIElements/UIElementTypes";
import Point from "../../Nodes/Graphics/Point";
import Vec2 from "../../DataTypes/Vec2";
import Button from "../../Nodes/UIElements/Button";
import Label from "../../Nodes/UIElements/Label";
import Slider from "../../Nodes/UIElements/Slider";
import TextInput from "../../Nodes/UIElements/TextInput";
import Rect from "../../Nodes/Graphics/Rect";
import ResourceManager from "../../ResourceManager/ResourceManager";
import Line from "../../Nodes/Graphics/Line";

// @ignorePage

/**
 * A factory that abstracts adding @reference[CanvasNode]s to the @reference[Scene].
 * Access methods in this factory through Scene.add.[methodName]().
 */
export default class CanvasNodeFactory {
	protected scene: Scene;
	protected resourceManager: ResourceManager;

	init(scene: Scene): void {
		this.scene = scene;
		this.resourceManager = ResourceManager.getInstance();
	}

	/**
	 * Adds an instance of a UIElement to the current scene - i.e. any class that extends UIElement
	 * @param type The type of UIElement to add
	 * @param layerName The layer to add the UIElement to
	 * @param options Any additional arguments to feed to the constructor
	 * @returns A new UIElement
	 */
	addUIElement = (type: string | UIElementType, layerName: string, options?: Record<string, any>): UIElement => {
		// Get the layer
		let layer = this.scene.getLayer(layerName);

		let instance: UIElement;

		switch(type){
			case UIElementType.BUTTON:
				instance = this.buildButton(options);
			break;
			case UIElementType.LABEL:
				instance = this.buildLabel(options);
			break;
			case UIElementType.SLIDER:
				instance = this.buildSlider(options);
			break;
			case UIElementType.TEXT_INPUT:
				instance = this.buildTextInput(options);
			break;
			default:
				throw `UIElementType '${type}' does not exist, or is registered incorrectly.`
		}

		instance.setScene(this.scene);
		instance.id = this.scene.generateId();
		this.scene.getSceneGraph().addNode(instance);

		// Add instance to layer
		layer.addNode(instance)

		return instance;
	}

	/**
	 * Adds a sprite to the current scene
	 * @param key The key of the image the sprite will represent
	 * @param layerName The layer on which to add the sprite
	 * @returns A new Sprite
	 */
	addSprite = (key: string, layerName: string): Sprite => {
		let layer = this.scene.getLayer(layerName);

		let instance = new Sprite(key);

		// Add instance to scene
		instance.setScene(this.scene);
		instance.id = this.scene.generateId();

		if(!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))){
			this.scene.getSceneGraph().addNode(instance);
		}
		
		// Add instance to layer
		layer.addNode(instance);

		return instance;
	}

	/**
	 * Adds an AnimatedSprite to the current scene
	 * @param key The key of the image the sprite will represent
	 * @param layerName The layer on which to add the sprite
	 * @returns A new AnimatedSprite
	 */
	addAnimatedSprite = (key: string, layerName: string): AnimatedSprite => {
		let layer = this.scene.getLayer(layerName);
		let spritesheet = this.resourceManager.getSpritesheet(key);
		let instance = new AnimatedSprite(spritesheet);

		// Add instance fo scene
		instance.setScene(this.scene);
		instance.id = this.scene.generateId();
		
		if(!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))){
			this.scene.getSceneGraph().addNode(instance);
		}

		// Add instance to layer
		layer.addNode(instance);

		return instance;
	}

	/**
	 * Adds a new graphic element to the current Scene
	 * @param type The type of graphic to add
	 * @param layerName The layer on which to add the graphic
	 * @param options Any additional arguments to send to the graphic constructor
	 * @returns A new Graphic
	 */
	addGraphic = (type: GraphicType | string, layerName: string, options?: Record<string, any>): Graphic => {
		// Get the layer
		let layer = this.scene.getLayer(layerName);

		let instance: Graphic;

		switch(type){
			case GraphicType.POINT:
				instance = this.buildPoint(options);
				break;
			case GraphicType.LINE:
				instance = this.buildLine(options);
				break;
			case GraphicType.RECT:
				instance = this.buildRect(options);
				break;
			default:
				throw `GraphicType '${type}' does not exist, or is registered incorrectly.`
		}

		// Add instance to scene
		instance.setScene(this.scene);
		instance.id = this.scene.generateId();

		if(!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))){
			this.scene.getSceneGraph().addNode(instance);
		}

		// Add instance to layer
		layer.addNode(instance);

		return instance;
	}

	/* ---------- BUILDERS ---------- */

	buildButton(options?: Record<string, any>): Button {
		this.checkIfPropExists("Button", options, "position", Vec2, "Vec2");
		this.checkIfPropExists("Button", options, "text", "string");

		return new Button(options.position, options.text);
	}

	buildLabel(options?: Record<string, any>): Label {
		this.checkIfPropExists("Label", options, "position", Vec2, "Vec2");
		this.checkIfPropExists("Label", options, "text", "string");

		return new Label(options.position, options.text)
	}

	buildSlider(options: Record<string, any>): Slider {
		this.checkIfPropExists("Slider", options, "position", Vec2, "Vec2");

		let initValue = 0;
		if(options.value !== undefined){
			initValue = options.value;
		}

		return new Slider(options.position, initValue);
	}

	buildTextInput(options: Record<string, any>): TextInput {
		this.checkIfPropExists("TextInput", options, "position", Vec2, "Vec2");

		return new TextInput(options.position);
	}

	buildPoint(options?: Record<string, any>): Point {
		this.checkIfPropExists("Point", options, "position", Vec2, "Vec2");

		return new Point(options.position);
	}

	buildLine(options?: Record<string, any>): Point {
		this.checkIfPropExists("Line", options, "start", Vec2, "Vec2");
		this.checkIfPropExists("Line", options, "end", Vec2, "Vec2");

		return new Line(options.start, options.end);
	}

	buildRect(options?: Record<string, any>): Rect {
		this.checkIfPropExists("Rect", options, "position", Vec2, "Vec2");
		this.checkIfPropExists("Rect", options, "size", Vec2, "Vec2");

		return new Rect(options.position, options.size);
	}

	/* ---------- ERROR HANDLING ---------- */

	checkIfPropExists<T>(objectName: string, options: Record<string, any>, prop: string, type: (new (...args: any) => T) | string, typeName?: string){
		if(!options || options[prop] === undefined){
			// Check that the options object has the property
			throw `${objectName} object requires argument ${prop} of type ${typeName}, but none was provided.`;
		} else {
			// Check that the property has the correct type
			if((typeof type) === "string"){
				if(!(typeof options[prop] === type)){
					throw `${objectName} object requires argument ${prop} of type ${type}, but provided ${prop} was not of type ${type}.`;
				}
			} else if(type instanceof Function){
				// If type is a constructor, check against that
				if(!(options[prop] instanceof type)){
					throw `${objectName} object requires argument ${prop} of type ${typeName}, but provided ${prop} was not of type ${typeName}.`;
				}
			} else {
				throw `${objectName} object requires argument ${prop} of type ${typeName}, but provided ${prop} was not of type ${typeName}.`;
			}
		}
	}
}
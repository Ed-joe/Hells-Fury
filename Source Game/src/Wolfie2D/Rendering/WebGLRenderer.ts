import Graph from "../DataTypes/Graphs/Graph";
import Map from "../DataTypes/Map";
import Vec2 from "../DataTypes/Vec2";
import Debug from "../Debug/Debug";
import CanvasNode from "../Nodes/CanvasNode";
import Graphic from "../Nodes/Graphic";
import { GraphicType } from "../Nodes/Graphics/GraphicTypes";
import Point from "../Nodes/Graphics/Point";
import Rect from "../Nodes/Graphics/Rect";
import AnimatedSprite from "../Nodes/Sprites/AnimatedSprite";
import Sprite from "../Nodes/Sprites/Sprite";
import Tilemap from "../Nodes/Tilemap";
import UIElement from "../Nodes/UIElement";
import Label from "../Nodes/UIElements/Label";
import ShaderRegistry from "../Registry/Registries/ShaderRegistry";
import RegistryManager from "../Registry/RegistryManager";
import ResourceManager from "../ResourceManager/ResourceManager";
import ParallaxLayer from "../Scene/Layers/ParallaxLayer";
import UILayer from "../Scene/Layers/UILayer";
import Color from "../Utils/Color";
import RenderingUtils from "../Utils/RenderingUtils";
import RenderingManager from "./RenderingManager";
import ShaderType from "./WebGLRendering/ShaderType";

export default class WebGLRenderer extends RenderingManager {

	protected origin: Vec2;
	protected zoom: number;
	protected worldSize: Vec2;

	protected gl: WebGLRenderingContext;
	protected textCtx: CanvasRenderingContext2D;

	initializeCanvas(canvas: HTMLCanvasElement, width: number, height: number): WebGLRenderingContext {
		canvas.width = width;
        canvas.height = height;

		this.worldSize = Vec2.ZERO;
		this.worldSize.x = width;
		this.worldSize.y = height;

		// Get the WebGL context
        this.gl = canvas.getContext("webgl");

		this.gl.viewport(0, 0, canvas.width, canvas.height);

		this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.CULL_FACE);

		// Tell the resource manager we're using WebGL
		ResourceManager.getInstance().useWebGL(true, this.gl);

		// Show the text canvas and get its context
		let textCanvas = <HTMLCanvasElement>document.getElementById("text-canvas");
		textCanvas.hidden = false;
		this.textCtx = textCanvas.getContext("2d");

		// Size the text canvas to be the same as the game canvas
		textCanvas.height = height;
		textCanvas.width = width;

        return this.gl;
	}

	render(visibleSet: CanvasNode[], tilemaps: Tilemap[], uiLayers: Map<UILayer>): void {
		for(let node of visibleSet){
			this.renderNode(node);
		}

		uiLayers.forEach(key => {
			if(!uiLayers.get(key).isHidden())
				uiLayers.get(key).getItems().forEach(node => this.renderNode(<CanvasNode>node))
		});
	}

	clear(color: Color): void {
		this.gl.clearColor(color.r, color.g, color.b, color.a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.textCtx.clearRect(0, 0, this.worldSize.x, this.worldSize.y);
	}

	protected renderNode(node: CanvasNode): void {
		// Calculate the origin of the viewport according to this sprite
        this.origin = this.scene.getViewTranslation(node);

        // Get the zoom level of the scene
        this.zoom = this.scene.getViewScale();
		
		if(node.hasCustomShader){
			// If the node has a custom shader, render using that
			this.renderCustom(node);
		} else if(node instanceof Graphic){
			this.renderGraphic(node);
		} else if(node instanceof Sprite){
			if(node instanceof AnimatedSprite){
				this.renderAnimatedSprite(node);
			} else {
				this.renderSprite(node);
			}
		} else if(node instanceof UIElement){
			this.renderUIElement(node);
		}
	}

	protected renderSprite(sprite: Sprite): void {
		let shader = RegistryManager.shaders.get(ShaderRegistry.SPRITE_SHADER);
		let options = this.addOptions(shader.getOptions(sprite), sprite);
		shader.render(this.gl, options);
	}

	protected renderAnimatedSprite(sprite: AnimatedSprite): void {
		let shader = RegistryManager.shaders.get(ShaderRegistry.SPRITE_SHADER);
		let options = this.addOptions(shader.getOptions(sprite), sprite);
		shader.render(this.gl, options);
	}

	protected renderGraphic(graphic: Graphic): void {

		if(graphic instanceof Point){
			let shader = RegistryManager.shaders.get(ShaderRegistry.POINT_SHADER);
			let options = this.addOptions(shader.getOptions(graphic), graphic);
			shader.render(this.gl, options);
		} else if(graphic instanceof Rect) {
			let shader = RegistryManager.shaders.get(ShaderRegistry.RECT_SHADER);
			let options = this.addOptions(shader.getOptions(graphic), graphic);
			shader.render(this.gl, options);
		} 
	}

	protected renderTilemap(tilemap: Tilemap): void {
		throw new Error("Method not implemented.");
	}

	protected renderUIElement(uiElement: UIElement): void {
		if(uiElement instanceof Label){
			let shader = RegistryManager.shaders.get(ShaderRegistry.LABEL_SHADER);
			let options = this.addOptions(shader.getOptions(uiElement), uiElement);
			shader.render(this.gl, options);

			this.textCtx.setTransform(1, 0, 0, 1, (uiElement.position.x - this.origin.x)*this.zoom, (uiElement.position.y - this.origin.y)*this.zoom);
			this.textCtx.rotate(-uiElement.rotation);
			let globalAlpha = this.textCtx.globalAlpha;
			this.textCtx.globalAlpha = uiElement.alpha;

			// Render text
			this.textCtx.font = uiElement.getFontString();
			let offset = uiElement.calculateTextOffset(this.textCtx);
			this.textCtx.fillStyle = uiElement.calculateTextColor();
			this.textCtx.globalAlpha = uiElement.textColor.a;
			this.textCtx.fillText(uiElement.text, offset.x - uiElement.size.x/2, offset.y - uiElement.size.y/2);

			this.textCtx.globalAlpha = globalAlpha;
        	this.textCtx.setTransform(1, 0, 0, 1, 0, 0);
		}
	}

	protected renderCustom(node: CanvasNode): void {
		let shader = RegistryManager.shaders.get(node.customShaderKey);
		let options = this.addOptions(shader.getOptions(node), node);
		shader.render(this.gl, options);
	}

	protected addOptions(options: Record<string, any>, node: CanvasNode): Record<string, any> {
		// Give the shader access to the world size
		options.worldSize = this.worldSize;

		// Adjust the origin position to the parallax
		let layer = node.getLayer();
		let parallax = new Vec2(1, 1);
		if(layer instanceof ParallaxLayer){
			parallax = (<ParallaxLayer>layer).parallax;
		}

		options.origin = this.origin.clone().mult(parallax);

		return options;
	}

}
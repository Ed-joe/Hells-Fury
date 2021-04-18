import Map from "../DataTypes/Map";
import CanvasNode from "../Nodes/CanvasNode";
import Graphic from "../Nodes/Graphic";
import Point from "../Nodes/Graphics/Point";
import Rect from "../Nodes/Graphics/Rect";
import Sprite from "../Nodes/Sprites/Sprite";
import Tilemap from "../Nodes/Tilemap";
import OrthogonalTilemap from "../Nodes/Tilemaps/OrthogonalTilemap";
import UIElement from "../Nodes/UIElement";
import UILayer from "../Scene/Layers/UILayer";
import Scene from "../Scene/Scene";
import GraphicRenderer from "./CanvasRendering/GraphicRenderer";
import RenderingManager from "./RenderingManager"
import TilemapRenderer from "./CanvasRendering/TilemapRenderer";
import UIElementRenderer from "./CanvasRendering/UIElementRenderer";
import Label from "../Nodes/UIElements/Label";
import Button from "../Nodes/UIElements/Button";
import Slider from "../Nodes/UIElements/Slider";
import TextInput from "../Nodes/UIElements/TextInput";
import AnimatedSprite from "../Nodes/Sprites/AnimatedSprite";
import Vec2 from "../DataTypes/Vec2";
import Color from "../Utils/Color";
import Line from "../Nodes/Graphics/Line";
import Debug from "../Debug/Debug";

/**
 * An implementation of the RenderingManager class using CanvasRenderingContext2D.
 */
export default class CanvasRenderer extends RenderingManager {
    protected ctx: CanvasRenderingContext2D;
    protected graphicRenderer: GraphicRenderer;
    protected tilemapRenderer: TilemapRenderer;
    protected uiElementRenderer: UIElementRenderer;

    protected origin: Vec2;
    protected zoom: number;

    protected worldSize: Vec2;

    constructor(){
        super();
    }

    // @override
    setScene(scene: Scene){
        this.scene = scene;
        this.graphicRenderer.setScene(scene);
        this.tilemapRenderer.setScene(scene);
        this.uiElementRenderer.setScene(scene);
    }

    // @override
    initializeCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
        canvas.width = width;
        canvas.height = height;

        this.worldSize = new Vec2(width, height);

        this.ctx = canvas.getContext("2d");

        this.graphicRenderer = new GraphicRenderer(this.ctx);
        this.tilemapRenderer = new TilemapRenderer(this.ctx);
        this.uiElementRenderer = new UIElementRenderer(this.ctx)

        // For crisp pixel art
        this.ctx.imageSmoothingEnabled = false;

        return this.ctx;
    }

    // @override
    render(visibleSet: CanvasNode[], tilemaps: Tilemap[], uiLayers: Map<UILayer>): void {
        // Sort by depth, then by visible set by y-value
        visibleSet.sort((a, b) => {
            if(a.getLayer().getDepth() === b.getLayer().getDepth()){
                return (a.boundary.bottom) - (b.boundary.bottom);
            } else {
                return a.getLayer().getDepth() - b.getLayer().getDepth();
            }
        });

        let tilemapIndex = 0;
        let tilemapLength = tilemaps.length;

        let visibleSetIndex = 0;
        let visibleSetLength = visibleSet.length;

        while(tilemapIndex < tilemapLength || visibleSetIndex < visibleSetLength){
            // Check conditions where we've already reached the edge of one list
            if(tilemapIndex >= tilemapLength){
                // Only render the remaining visible set
                let node = visibleSet[visibleSetIndex++];
                if(node.visible){
                    this.renderNode(node);
                }
                continue;
            }

            if(visibleSetIndex >= visibleSetLength){
                // Only render tilemaps
                this.renderTilemap(tilemaps[tilemapIndex++]);
                continue;
            }

            // Render whichever is further down
            if(tilemaps[tilemapIndex].getLayer().getDepth() <= visibleSet[visibleSetIndex].getLayer().getDepth()){
                this.renderTilemap(tilemaps[tilemapIndex++]);
            } else {
                let node = visibleSet[visibleSetIndex++];
                if(node.visible){
                    this.renderNode(node);
                }
            }
        }

        // Render the uiLayers on top of everything else
        let sortedUILayers = new Array<UILayer>();

        uiLayers.forEach(key => sortedUILayers.push(uiLayers.get(key)));

        sortedUILayers = sortedUILayers.sort((ui1, ui2) => ui1.getDepth() - ui2.getDepth());

        sortedUILayers.forEach(uiLayer => {
			if(!uiLayer.isHidden())
				uiLayer.getItems().forEach(node => {
                    if((<CanvasNode>node).visible){
                        this.renderNode(<CanvasNode>node)
                    }
                })
		});
    }

    /**
     * Renders a specified CanvasNode
     * @param node The CanvasNode to render
     */
    protected renderNode(node: CanvasNode): void {
        // Calculate the origin of the viewport according to this sprite
        this.origin = this.scene.getViewTranslation(node);

        // Get the zoom level of the scene
        this.zoom = this.scene.getViewScale();
        
        // Move the canvas to the position of the node and rotate
        let xScale = 1;
        let yScale = 1;
        
        if(node instanceof Sprite){
            xScale = node.invertX ? -1 : 1;
            yScale = node.invertY ? -1 : 1;
        }

        this.ctx.setTransform(xScale, 0, 0, yScale, (node.position.x - this.origin.x)*this.zoom, (node.position.y - this.origin.y)*this.zoom);
        this.ctx.rotate(-node.rotation);
        let globalAlpha = this.ctx.globalAlpha;
        if(node instanceof Rect){
            Debug.log("node" + node.id, "Node" + node.id + " Alpha: " + node.alpha);
        }
        this.ctx.globalAlpha = node.alpha;
        
        if(node instanceof AnimatedSprite){
            this.renderAnimatedSprite(<AnimatedSprite>node);
        } else if(node instanceof Sprite){
            this.renderSprite(<Sprite>node);
        } else if(node instanceof Graphic){
            this.renderGraphic(<Graphic>node);
        } else if(node instanceof UIElement){
            this.renderUIElement(<UIElement>node);
        }

        this.ctx.globalAlpha = globalAlpha;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // @override
    protected renderSprite(sprite: Sprite): void {
        // Get the image from the resource manager
        let image = this.resourceManager.getImage(sprite.imageId);

        /*
            Coordinates in the space of the image:
                image crop start -> x, y
                image crop size  -> w, h
            Coordinates in the space of the world
                image draw start -> x, y
                image draw size  -> w, h
        */
        this.ctx.drawImage(image,
            sprite.imageOffset.x, sprite.imageOffset.y,
            sprite.size.x, sprite.size.y,
            (-sprite.size.x*sprite.scale.x/2)*this.zoom, (-sprite.size.y*sprite.scale.y/2)*this.zoom,
            sprite.size.x * sprite.scale.x*this.zoom, sprite.size.y * sprite.scale.y*this.zoom);
    }

    // @override
    protected renderAnimatedSprite(sprite: AnimatedSprite): void {
        // Get the image from the resource manager
        let image = this.resourceManager.getImage(sprite.imageId);

        let animationIndex = sprite.animation.getIndexAndAdvanceAnimation();

        let animationOffset = sprite.getAnimationOffset(animationIndex);

        /*
            Coordinates in the space of the image:
                image crop start -> x, y
                image crop size  -> w, h
            Coordinates in the space of the world (given we moved)
                image draw start -> -w/2, -h/2
                image draw size  -> w, h
        */
        this.ctx.drawImage(image,
            sprite.imageOffset.x + animationOffset.x, sprite.imageOffset.y + animationOffset.y,
            sprite.size.x, sprite.size.y,
            (-sprite.size.x*sprite.scale.x/2)*this.zoom, (-sprite.size.y*sprite.scale.y/2)*this.zoom,
            sprite.size.x * sprite.scale.x*this.zoom, sprite.size.y * sprite.scale.y*this.zoom);
    }

    // @override
    protected renderGraphic(graphic: Graphic): void {
        if(graphic instanceof Point){
            this.graphicRenderer.renderPoint(<Point>graphic, this.zoom);
        } else if(graphic instanceof Line){
            this.graphicRenderer.renderLine(<Line>graphic, this.origin, this.zoom);
        } else if(graphic instanceof Rect){
            this.graphicRenderer.renderRect(<Rect>graphic, this.zoom);
        }
    }

    // @override
    protected renderTilemap(tilemap: Tilemap): void {
        if(tilemap instanceof OrthogonalTilemap){
            this.tilemapRenderer.renderOrthogonalTilemap(<OrthogonalTilemap>tilemap);
        }
    }

    // @override
    protected renderUIElement(uiElement: UIElement): void {
        if(uiElement instanceof Label){
            this.uiElementRenderer.renderLabel(uiElement);
        } else if(uiElement instanceof Button){
            this.uiElementRenderer.renderButton(uiElement);
        } else if(uiElement instanceof Slider){
            this.uiElementRenderer.renderSlider(uiElement);
        } else if(uiElement instanceof TextInput){
            this.uiElementRenderer.renderTextInput(uiElement);
        }
    }

    clear(clearColor: Color): void {
        this.ctx.clearRect(0, 0, this.worldSize.x, this.worldSize.y);
        this.ctx.fillStyle = clearColor.toString();
        this.ctx.fillRect(0, 0, this.worldSize.x, this.worldSize.y);
    }
}
import Map from "../DataTypes/Map";
import CanvasNode from "../Nodes/CanvasNode";
import Graphic from "../Nodes/Graphic";
import AnimatedSprite from "../Nodes/Sprites/AnimatedSprite";
import Sprite from "../Nodes/Sprites/Sprite";
import Tilemap from "../Nodes/Tilemap";
import UIElement from "../Nodes/UIElement";
import ResourceManager from "../ResourceManager/ResourceManager";
import UILayer from "../Scene/Layers/UILayer";
import Scene from "../Scene/Scene";
import Color from "../Utils/Color";

/**
 * An abstract framework to put all rendering in once place in the application
 */
export default abstract class RenderingManager {
    /** The ResourceManager */
    protected resourceManager: ResourceManager;

    /** The scene currently being rendered */
    protected scene: Scene;

    constructor(){
        this.resourceManager = ResourceManager.getInstance();
    }

    /**
     * Sets the scene currently being rendered
     * @param scene The current Scene
     */
    setScene(scene: Scene): void {
        this.scene = scene;
    }

    /**
     * Initialize the canvas for the game
     * @param canvas The canvas element
     * @param width The desired width of the canvas
     * @param height The desired height of the canvas
     * @returns The rendering context of the canvas
     */
    abstract initializeCanvas(canvas: HTMLCanvasElement, width: number, height: number): any;

    /**
     * Renders the visible set of CanvasNodes and visible portions of tilemaps, as well as any UIElement in UILayers
     * @param visibleSet The visible set of CanvasNodes
     * @param tilemaps The tilemaps used in the application
     * @param uiLayers The user interface layers
     */
    abstract render(visibleSet: Array<CanvasNode>, tilemaps: Array<Tilemap>, uiLayers: Map<UILayer>): void;

    /** Clears the canvas */
    abstract clear(color: Color): void;

    /**
     * Renders a sprite
     * @param sprite The sprite to render
     */
    protected abstract renderSprite(sprite: Sprite): void;

    /**
     * Renders an animated sprite
     * @param sprite The animated sprite to render
     */
    protected abstract renderAnimatedSprite(sprite: AnimatedSprite): void;

    /**
     * Renders a graphic
     * @param graphic The graphic to render
     */
    protected abstract renderGraphic(graphic: Graphic): void;

    /**
     * Renders a tilemap
     * @param tilemap The tilemap to render
     */
    protected abstract renderTilemap(tilemap: Tilemap): void;


    /**
     * Renders a UIElement
     * @param uiElement The UIElement to render
     */
    protected abstract renderUIElement(uiElement: UIElement): void;
}
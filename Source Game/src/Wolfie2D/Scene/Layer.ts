import Scene from "./Scene";
import MathUtils from "../Utils/MathUtils";
import GameNode from "../Nodes/GameNode";


/**
 * A layer in the scene. Layers are used for sorting @reference[GameNode]s by depth.
 */
export default class Layer {
    /** The scene this layer belongs to */
    protected scene: Scene;

    /** The name of this layer */
    protected name: string;

    /** Whether this layer is paused or not */
    protected paused: boolean;

    /** Whether this layer is hidden from being rendered or not */
    protected hidden: boolean;

    /** The global alpha level of this layer */
    protected alpha: number;

    /** An array of the GameNodes that belong to this layer */
    protected items: Array<GameNode>;

    /** Whether or not this layer should be ysorted */
    protected ySort: boolean;

    /** The depth of this layer compared to other layers */
    protected depth: number;

    /**
     * Creates a new layer. To do this in a game, use the addLayer() method in @refrence[Scene]
     * @param scene The scene to add the layer to
     * @param name The name of the layer
     */
    constructor(scene: Scene, name: string){
        this.scene = scene;
        this.name = name;
        this.paused = false;
        this.hidden = false;
        this.alpha = 1;
        this.items = new Array();
        this.ySort = false;
        this.depth = 0;
    }

    /**
     * Retreives the name of the layer
     * @returns The name of the layer
     */
    getName(): string {
        return this.name;
    }

    /**
     * Pauses/Unpauses the layer. Affects all elements in this layer
     * @param pauseValue True if the layer should be paused, false if not
     */
    setPaused(pauseValue: boolean): void {
        this.paused = pauseValue;
    }
    
    /**
     * Returns whether or not the layer is paused
     */
    isPaused(): boolean {
        return this.paused;
    }

    /**
     * Sets the opacity of the layer
     * @param alpha The new opacity value in the range [0, 1]
     */
    setAlpha(alpha: number): void {
        this.alpha = MathUtils.clamp(alpha, 0, 1);
    }

    /**
     * Gets the opacity of the layer
     * @returns The opacity
     */
    getAlpha(): number {
        return this.alpha;
    }

    /**
     * Sets the layer's hidden value. If hidden, a layer will not be rendered, but will still update
     * @param hidden The hidden value of the layer
     */
    setHidden(hidden: boolean): void {
        this.hidden = hidden;
    }

    /**
     * Returns the hideen value of the lyaer
     * @returns True if the scene is hidden, false otherwise
     */
    isHidden(): boolean {
        return this.hidden;
    }

    /** Pauses this scene and hides it */
    disable(): void {
        this.paused = true;
        this.hidden = true;
    }

    /** Unpauses this layer and makes it visible */
    enable(): void {
        this.paused = false;
        this.hidden = false;
    }

    /**
     * Sets whether or not the scene will ySort automatically.
     * ySorting means that CanvasNodes on this layer will have their depth sorted depending on their y-value.
     * This means that if an object is "higher" in the scene, it will sort behind objects that are "lower".
     * This is useful for 3/4 view games, or similar situations, where you sometimes want to be in front of objects,
     * and other times want to be behind the same objects.
     * @param ySort True if ySorting should be active, false if not
     */
    setYSort(ySort: boolean): void {
        this.ySort = ySort;
    }

    /**
     * Gets the ySort status of the scene
     * @returns True if ySorting is occurring, false otherwise
     */
    getYSort(): boolean {
        return this.ySort;
    }

    /**
     * Sets the depth of the layer compared to other layers. A larger number means the layer will be closer to the screen.
     * @param depth The depth of the layer.
     */
    setDepth(depth: number): void {
        this.depth = depth;
    }

    /**
     * Retrieves the depth of the layer.
     * @returns The depth
     */
    getDepth(): number {
        return this.depth;
    }

    /**
     * Adds a node to this layer
     * @param node The node to add to this layer.
     */
    addNode(node: GameNode): void {
        this.items.push(node);
        node.setLayer(this);
    }

    /**
     * Removes a node from this layer
     * @param node The node to remove
     * @returns true if the node was removed, false otherwise
     */
    removeNode(node: GameNode): void {
        // Find and remove the node
        let index = this.items.indexOf(node);

        if(index !== -1){
            this.items.splice(index, 1);
            node.setLayer(undefined);
        }
    }

    /**
     * Retreives all GameNodes from this layer
     * @returns an Array that contains all of the GameNodes in this layer.
     */
    getItems(): Array<GameNode> {
        return this.items;
    }
}
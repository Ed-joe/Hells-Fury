import Layer from "./Layer";
import Viewport from "../SceneGraph/Viewport";
import Vec2 from "../DataTypes/Vec2";
import SceneGraph from "../SceneGraph/SceneGraph";
import PhysicsManager from "../Physics/PhysicsManager";
import BasicPhysicsManager from "../Physics/BasicPhysicsManager";
import SceneGraphArray from "../SceneGraph/SceneGraphArray";
import FactoryManager from "./Factories/FactoryManager";
import Tilemap from "../Nodes/Tilemap";
import ResourceManager from "../ResourceManager/ResourceManager";
import Game from "../Loop/Game";
import SceneManager from "./SceneManager";
import Receiver from "../Events/Receiver";
import Emitter from "../Events/Emitter";
import Updateable from "../DataTypes/Interfaces/Updateable";
import NavigationManager from "../Pathfinding/NavigationManager";
import AIManager from "../AI/AIManager";
import Map from "../DataTypes/Map";
import ParallaxLayer from "./Layers/ParallaxLayer";
import UILayer from "./Layers/UILayer";
import CanvasNode from "../Nodes/CanvasNode";
import GameNode from "../Nodes/GameNode";
import SceneOptions from "./SceneOptions";
import RenderingManager from "../Rendering/RenderingManager";
import Debug from "../Debug/Debug";
import TimerManager from "../Timing/TimerManager";
import TweenManager from "../Rendering/Animations/TweenManager";

/**
 * Scenes are the main container in the game engine.
 * Your main scene is the current level or menu of the game, and will contain all of the GameNodes needed.
 * Scenes provide an easy way to load assets, add assets to the game world, and unload assets,
 * and have lifecycle methods exposed for these functions.
 */
export default class Scene implements Updateable {
    /** The size of the game world. */
    protected worldSize: Vec2;

    /** The viewport. */
    protected viewport: Viewport;

    /** A flag that represents whether this scene is running or not. */
    protected running: boolean;

    /** The manager of this scene. */
    protected sceneManager: SceneManager;

    /** The receiver for this scene. */
    protected receiver: Receiver;

    /** The emitter for this scene. */
    protected emitter: Emitter;

    /** This list of tilemaps in this scene. */
    protected tilemaps: Array<Tilemap>;

    /** A map from layer names to the layers themselves */
    protected layers: Map<Layer>;

    /** A map from parallax layer names to the parallax layers themselves */
    protected parallaxLayers: Map<ParallaxLayer>;

    /** A map from uiLayer names to the uiLayers themselves */
    protected uiLayers: Map<UILayer>;

    /** The scene graph of the Scene*/
    protected sceneGraph: SceneGraph;

    /** The physics manager of the Scene */
    protected physicsManager: PhysicsManager;
    
    /** The navigation manager of the Scene */
    protected navManager: NavigationManager;

    /** The AI manager of the Scene */
    protected aiManager: AIManager;

    /** The renderingManager of the scene */
    protected renderingManager: RenderingManager;

    /** An interface that allows the adding of different nodes to the scene */
    public add: FactoryManager;

    /** An interface that allows the loading of different files for use in the scene. An alias for resourceManager */
    public load: ResourceManager;

    /** An interface that allows the loading and unloading of different files for use in the scene */
    public resourceManager: ResourceManager;

    /** The configuration options for this scene */
    public sceneOptions: SceneOptions;

    /**
     * Creates a new Scene. To add a new Scene in your game, use changeToScene() in @reference[SceneManager]
     * @param viewport The viewport of the game
     * @param sceneManager The SceneManager that owns this Scene
     * @param renderingManager The RenderingManager that will handle this Scene's rendering
     * @param game The instance of the Game
     * @param options The options for Scene initialization
     */
    constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>){
        this.sceneOptions = SceneOptions.parse(options === undefined ? {} : options);

        this.worldSize = new Vec2(500, 500);
        this.viewport = viewport;
        this.viewport.setBounds(0, 0, 2560, 1280);
        this.running = false;
        this.sceneManager = sceneManager;
        this.receiver = new Receiver();
        this.emitter = new Emitter();

        this.tilemaps = new Array();
        this.sceneGraph = new SceneGraphArray(this.viewport, this);

        this.layers = new Map();
        this.uiLayers = new Map();
        this.parallaxLayers = new Map();

        this.physicsManager = new BasicPhysicsManager(this.sceneOptions.physics);
        this.navManager = new NavigationManager();
        this.aiManager = new AIManager();
        this.renderingManager = renderingManager;

        this.add = new FactoryManager(this, this.tilemaps);

        this.load = ResourceManager.getInstance()
        this.resourceManager = this.load;

        // Get the timer manager and clear any existing timers
        TimerManager.getInstance().clearTimers();
    }

    /** A lifecycle method that gets called immediately after a new scene is created, before anything else. */
    initScene(init: Record<string, any>): void {}

    /** A lifecycle method that gets called when a new scene is created. Load all files you wish to access in the scene here. */
    loadScene(): void {}

    /** A lifecycle method called strictly after loadScene(). Create any game objects you wish to use in the scene here. */
    startScene(): void {}

    /**
     * A lifecycle method called every frame of the game. This is where you can dynamically do things like add in new enemies
     * @param delta The time this frame represents
     */
    updateScene(deltaT: number): void {}

    /** A lifecycle method that gets called on scene destruction. Specify which files you no longer need for garbage collection. */
    unloadScene(): void {}

    update(deltaT: number): void {
        this.updateScene(deltaT);

        // Do time updates
        TimerManager.getInstance().update(deltaT);

        // Do all AI updates
        this.aiManager.update(deltaT);

        // Update all physics objects
        this.physicsManager.update(deltaT);

        // Update all canvas objects
        this.sceneGraph.update(deltaT);

        // Update all tilemaps
        this.tilemaps.forEach(tilemap => {
            if(!tilemap.getLayer().isPaused()){
                tilemap.update(deltaT);
            } 
        });
        
        // Update all tweens
        TweenManager.getInstance().update(deltaT);

        // Update viewport
        this.viewport.update(deltaT);
    }

    /**
     * Collects renderable sets and coordinates with the RenderingManager to draw the Scene
     */
    render(): void {
        // Get the visible set of nodes
        let visibleSet = this.sceneGraph.getVisibleSet();

        // Add parallax layer items to the visible set (we're rendering them all for now)
        this.parallaxLayers.forEach(key => {
            let pLayer = this.parallaxLayers.get(key);
            for(let node of pLayer.getItems()){
                if(node instanceof CanvasNode){
                    visibleSet.push(node);
                }
            }
        });

        // Send the visible set, tilemaps, and uiLayers to the renderer
        this.renderingManager.render(visibleSet, this.tilemaps, this.uiLayers);

        let nodes = this.sceneGraph.getAllNodes();
        this.tilemaps.forEach(tilemap => tilemap.visible ? nodes.push(tilemap) : 0);
        Debug.setNodes(nodes);
    }

    /**
     * Sets the scene as running or not
     * @param running True if the Scene should be running, false if not
     */
    setRunning(running: boolean): void {
        this.running = running;
    }

    /**
     * Returns whether or not the Scene is running
     * @returns True if the scene is running, false otherwise
     */
    isRunning(): boolean {
        return this.running;
    }

    /**
     * Removes a node from this Scene
     * @param node The node to remove
     */
    remove(node: GameNode): void {
        // Remove from the scene graph
        if(node instanceof CanvasNode){
            this.sceneGraph.removeNode(node);
        }

    }

    /** Destroys this scene and all nodes in it */
    destroy(): void {
        for(let node of this.sceneGraph.getAllNodes()){
            node.destroy();
        }

        for(let tilemap of this.tilemaps){
            tilemap.destroy();
        }

        this.receiver.destroy();

        delete this.sceneGraph;
        delete this.physicsManager;
        delete this.navManager;
        delete this.aiManager;
        delete this.receiver;
    }

    /**
     * Adds a new layer to the scene and returns it
     * @param name The name of the new layer
     * @param depth The depth of the layer
     * @returns The newly created Layer
     */
    addLayer(name: string, depth?: number): Layer {
        if(this.layers.has(name) || this.parallaxLayers.has(name) || this.uiLayers.has(name)){
            throw `Layer with name ${name} already exists`;
        }

        let layer = new Layer(this, name);

        this.layers.add(name, layer);

        if(depth){
            layer.setDepth(depth);
        }

        return layer;
    }

    /**
     * Adds a new parallax layer to this scene and returns it
     * @param name The name of the parallax layer
     * @param parallax The parallax level
     * @param depth The depth of the layer
     * @returns The newly created ParallaxLayer
     */
    addParallaxLayer(name: string, parallax: Vec2, depth?: number): ParallaxLayer {
        if(this.layers.has(name) || this.parallaxLayers.has(name) || this.uiLayers.has(name)){
            throw `Layer with name ${name} already exists`;
        }

        let layer = new ParallaxLayer(this, name, parallax);

        this.parallaxLayers.add(name, layer);

        if(depth){
            layer.setDepth(depth);
        }

        return layer;
    }

    /**
     * Adds a new UILayer to the scene
     * @param name The name of the new UIlayer
     * @returns The newly created UILayer
     */
    addUILayer(name: string): UILayer {
        if(this.layers.has(name) || this.parallaxLayers.has(name) || this.uiLayers.has(name)){
            throw `Layer with name ${name} already exists`;
        }

        let layer = new UILayer(this, name);

        this.uiLayers.add(name, layer);

        return layer;
    }

    /**
     * Gets a layer from the scene by name if it exists.
     * This can be a Layer or any of its subclasses
     * @param name The name of the layer
     * @returns The Layer found with that name
     */
    getLayer(name: string): Layer {
        if(this.layers.has(name)){
            return this.layers.get(name);
        } else if(this.parallaxLayers.has(name)){
            return this.parallaxLayers.get(name);
        } else if(this.uiLayers.has(name)){
            return this.uiLayers.get(name);
        } else {
            throw `Requested layer ${name} does not exist.`;
        }
    }

    /**
     * Returns true if this layer is a ParallaxLayer
     * @param name The name of the layer
     * @returns True if this layer is a ParallaxLayer
     */
    isParallaxLayer(name: string): boolean {
        return this.parallaxLayers.has(name);
    }

    /**
     * Returns true if this layer is a UILayer
     * @param name The name of the layer
     * @returns True if this layer is ParallaxLayer
     */
    isUILayer(name: string): boolean {
        return this.uiLayers.has(name);
    }    

    /**
     * Returns the translation of this node with respect to camera space (due to the viewport moving).
     * This value is affected by the parallax level of the @reference[Layer] the node is on.
     * @param node The node to check the viewport with respect to
     * @returns A Vec2 containing the translation of viewport with respect to this node.
     */
    getViewTranslation(node: GameNode): Vec2 {
        let layer = node.getLayer();

        if(layer instanceof ParallaxLayer || layer instanceof UILayer){
            return this.viewport.getOrigin().mult(layer.parallax);
        } else {
            return this.viewport.getOrigin();
        }
	}

    /**
     * Returns the scale level of the view
     * @returns The zoom level of the viewport
    */
	getViewScale(): number {
		return this.viewport.getZoomLevel();
	}

    /**
     * Returns the Viewport associated with this scene
     * @returns The current Viewport
     */
    getViewport(): Viewport {
        return this.viewport;
    }

    /**
     * Gets the world size of this Scene
     * @returns The world size in a Vec2
     */
    getWorldSize(): Vec2 {
        return this.worldSize;
    }

    /**
     * Gets the SceneGraph associated with this Scene
     * @returns The SceneGraph
     */
    getSceneGraph(): SceneGraph {
        return this.sceneGraph;
    }

    /**
     * Gets the PhysicsManager associated with this Scene
     * @returns The PhysicsManager
     */
    getPhysicsManager(): PhysicsManager {
        return this.physicsManager;
    }

    /**
     * Gets the NavigationManager associated with this Scene
     * @returns The NavigationManager
     */
    getNavigationManager(): NavigationManager {
        return this.navManager;
    }

    /**
     * Gets the AIManager associated with this Scene
     * @returns The AIManager
     */
    getAIManager(): AIManager {
        return this.aiManager;
    }

    /**
     * Generates an ID for a GameNode
     * @returns The new ID
     */
    generateId(): number {
        return this.sceneManager.generateId();
    }

    /**
     * Retrieves a Tilemap in this Scene
     * @param name The name of the Tilemap
     * @returns The Tilemap, if one this name exists, otherwise null
     */
    getTilemap(name: string): Tilemap {
        for(let tilemap of this .tilemaps){
            if(tilemap.name === name){
                return tilemap;
            }
        }

        return null;
    }
}
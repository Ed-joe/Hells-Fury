import EventQueue from "../Events/EventQueue";
import Input from "../Input/Input";
import InputHandler from "../Input/InputHandler";
import Recorder from "../Playback/Recorder";
import Debug from "../Debug/Debug";
import ResourceManager from "../ResourceManager/ResourceManager";
import Viewport from "../SceneGraph/Viewport";
import SceneManager from "../Scene/SceneManager";
import AudioManager from "../Sound/AudioManager";
import Stats from "../Debug/Stats";
import RenderingManager from "../Rendering/RenderingManager";
import CanvasRenderer from "../Rendering/CanvasRenderer";
import Color from "../Utils/Color";
import GameOptions from "./GameOptions";
import GameLoop from "./GameLoop";
import FixedUpdateGameLoop from "./FixedUpdateGameLoop";
import EnvironmentInitializer from "./EnvironmentInitializer";
import Vec2 from "../DataTypes/Vec2";
import RegistryManager from "../Registry/RegistryManager";
import WebGLRenderer from "../Rendering/WebGLRenderer";
import Scene from "../Scene/Scene";

/**
 * The main loop of the game engine.
 * Handles the update order, and initializes all subsystems.
 * The Game manages the update cycle, and requests animation frames to render to the browser.
 */
export default class Game {
    gameOptions: GameOptions;
    private showDebug: boolean;
    private showStats: boolean;

    // The game loop
    private loop: GameLoop;

    // Game canvas and its width and height
    readonly GAME_CANVAS: HTMLCanvasElement;
    readonly DEBUG_CANVAS: HTMLCanvasElement;
	readonly WIDTH: number;
    readonly HEIGHT: number;
    private viewport: Viewport;
    private ctx: CanvasRenderingContext2D | WebGLRenderingContext;
    private clearColor: Color;
    
    // All of the necessary subsystems that need to run here
	private eventQueue: EventQueue;
	private inputHandler: InputHandler;
	private recorder: Recorder;
    private resourceManager: ResourceManager;
    private sceneManager: SceneManager;
    private audioManager: AudioManager;
    private renderingManager: RenderingManager;

    /**
     * Creates a new Game
     * @param options The options for Game initialization
     */
    constructor(options?: Record<string, any>){
        // Before anything else, build the environment
        EnvironmentInitializer.setup();

        // Typecast the config object to a GameConfig object
        this.gameOptions = GameOptions.parse(options);

        this.showDebug = this.gameOptions.showDebug;
        this.showStats = this.gameOptions.showStats;

        // Create an instance of a game loop
        this.loop = new FixedUpdateGameLoop();

        // Get the game canvas and give it a background color
        this.GAME_CANVAS = <HTMLCanvasElement>document.getElementById("game-canvas");
        this.DEBUG_CANVAS = <HTMLCanvasElement>document.getElementById("debug-canvas");
    
        // Give the canvas a size and get the rendering context
        this.WIDTH = this.gameOptions.canvasSize.x;
        this.HEIGHT = this.gameOptions.canvasSize.y;

        // This step MUST happen before the resource manager does anything
        if(this.gameOptions.useWebGL){
            this.renderingManager = new WebGLRenderer();
        } else {
            this.renderingManager = new CanvasRenderer();
        }
        this.initializeGameWindow();
        this.ctx = this.renderingManager.initializeCanvas(this.GAME_CANVAS, this.WIDTH, this.HEIGHT);
        this.clearColor = new Color(this.gameOptions.clearColor.r, this.gameOptions.clearColor.g, this.gameOptions.clearColor.b);

        // Initialize debugging and stats
        Debug.initializeDebugCanvas(this.DEBUG_CANVAS, this.WIDTH, this.HEIGHT);
        Stats.initStats();

        if(this.gameOptions.showStats) {
            // Find the stats output and make it no longer hidden
            document.getElementById("stats").hidden = false;
        }

        // Size the viewport to the game canvas
        const canvasSize = new Vec2(this.WIDTH, this.HEIGHT);
        this.viewport = new Viewport(canvasSize, this.gameOptions.zoomLevel);

        // Initialize all necessary game subsystems
        this.eventQueue = EventQueue.getInstance();
        this.inputHandler = new InputHandler(this.GAME_CANVAS);
        Input.initialize(this.viewport, this.gameOptions.inputs);
        this.recorder = new Recorder();
        this.resourceManager = ResourceManager.getInstance();
        this.sceneManager = new SceneManager(this.viewport, this.renderingManager);
        this.audioManager = AudioManager.getInstance();
    }

    /**
     * Set up the game window that holds the canvases
     */
    private initializeGameWindow(): void {
        const gameWindow = document.getElementById("game-window");
        
        // Set the height of the game window
        gameWindow.style.width = this.WIDTH + "px";
        gameWindow.style.height = this.HEIGHT + "px";
    }

    /**
     * Retreives the SceneManager from the Game
     * @returns The SceneManager
     */
    getSceneManager(): SceneManager {
        return this.sceneManager;
    }

    /**
     * Starts the game
     */
    start(InitialScene: new (...args: any) => Scene, options: Record<string, any>): void {
        // Set the update function of the loop
        this.loop.doUpdate = (deltaT: number) => this.update(deltaT);

        // Set the render function of the loop
        this.loop.doRender = () => this.render();

        // Preload registry items
        RegistryManager.preload();

        // Load the items with the resource manager
        this.resourceManager.loadResourcesFromQueue(() => {
            // When we're done loading, start the loop
            console.log("Finished Preload - loading first scene");
            this.sceneManager.changeToScene(InitialScene, options);
            this.loop.start();
        });
    }

    /**
     * Updates all necessary subsystems of the game. Defers scene updates to the sceneManager
     * @param deltaT The time sine the last update
     */
    update(deltaT: number): void {
        try{
            // Handle all events that happened since the start of the last loop
            this.eventQueue.update(deltaT);

            // Update the input data structures so game objects can see the input
            Input.update(deltaT);

            // Update the recording of the game
            this.recorder.update(deltaT);

            // Update all scenes
            this.sceneManager.update(deltaT);

            // Update all sounds
            this.audioManager.update(deltaT);
            
            // Load or unload any resources if needed
            this.resourceManager.update(deltaT);
        } catch(e){
            this.loop.pause();
            console.warn("Uncaught Error in Update - Crashing gracefully");
            console.error(e);
        }
    }

    /**
     * Clears the canvas and defers scene rendering to the sceneManager. Renders the debug canvas
     */
    render(): void {
        try{
            // Clear the canvases
            Debug.clearCanvas();

            this.renderingManager.clear(this.clearColor);

            this.sceneManager.render();

            // Hacky debug mode
            if(Input.isKeyJustPressed("g")){
                this.showDebug = !this.showDebug;
            }

            // Debug render
            if(this.showDebug){
                Debug.render();
            }

            if(this.showStats){
                Stats.render();
            }
        } catch(e){
            this.loop.pause();
            console.warn("Uncaught Error in Render - Crashing gracefully");
            console.error(e);
        }
    }
}
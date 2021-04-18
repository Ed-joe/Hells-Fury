import Scene from "./Scene";
import ResourceManager from "../ResourceManager/ResourceManager";
import Viewport from "../SceneGraph/Viewport";
import RenderingManager from "../Rendering/RenderingManager";
import MemoryUtils from "../Utils/MemoryUtils";

/**
 * The SceneManager acts as an interface to create Scenes, and handles the lifecycle methods of Scenes.
 * It gives Scenes access to information they need from the @reference[Game] class while keeping a layer of separation.
 */
export default class SceneManager {
	/** The current Scene of the game */
	protected currentScene: Scene;

	/** The Viewport of the game */
	protected viewport: Viewport;

	/** A reference to the ResourceManager */
	protected resourceManager: ResourceManager;

	/** A counter to keep track of game ids */
	protected idCounter: number;

	/** The RenderingManager of the game */
	protected renderingManager: RenderingManager;

	/** For consistency, only change scenes at the beginning of the update cycle */
	protected pendingScene: Scene;
	protected pendingSceneInit: Record<string, any>;

	/**
	 * Creates a new SceneManager
	 * @param viewport The Viewport of the game
	 * @param game The Game instance
	 * @param renderingManager The RenderingManager of the game
	 */
	constructor(viewport: Viewport, renderingManager: RenderingManager){
		this.resourceManager = ResourceManager.getInstance();
		this.viewport = viewport;
		this.renderingManager = renderingManager;
		this.idCounter = 0;
		this.pendingScene = null;
	}

	/**
	 * Add a scene as the main scene.
	 * Use this method if you've created a subclass of Scene, and you want to add it as the main Scene.
	 * @param constr The constructor of the scene to add
	 * @param init An object to pass to the init function of the new scene
	 */
	public changeToScene<T extends Scene>(constr: new (...args: any) => T, init?: Record<string, any>, options?: Record<string, any>): void {
		console.log("Creating the new scene - change is pending until next update");
		this.pendingScene = new constr(this.viewport, this, this.renderingManager, options);
		this.pendingSceneInit = init;
	}

	protected doSceneChange(){
		console.log("Performing scene change");
		this.viewport.setCenter(this.viewport.getHalfSize().x, this.viewport.getHalfSize().y);
		
		if(this.currentScene){
			console.log("Unloading old scene")
			this.currentScene.unloadScene();

			console.log("Destroying old scene");
			this.currentScene.destroy();
		}

		console.log("Unloading old resources...");
		this.resourceManager.unloadAllResources();

		// Make the pending scene the current one
		this.currentScene = this.pendingScene;

		// Make the pending scene null
		this.pendingScene = null;

		// Init the scene
		this.currentScene.initScene(this.pendingSceneInit);

		// Enqueue all scene asset loads
		this.currentScene.loadScene();

		// Load all assets
		console.log("Starting Scene Load");
		this.resourceManager.loadResourcesFromQueue(() => {
			console.log("Starting Scene");
			this.currentScene.startScene();
			this.currentScene.setRunning(true);
		});

		this.renderingManager.setScene(this.currentScene);
	}
	
	/**
	 * Generates a unique ID
	 * @returns A new ID
	 */
	public generateId(): number {
		return this.idCounter++;
	}

	/**
	 * Renders the current Scene
	 */
	public render(): void {
		if(this.currentScene){
			this.currentScene.render();
		}
	}

	/**
	 * Updates the current Scene
	 * @param deltaT The timestep of the Scene
	 */
	public update(deltaT: number){
		if(this.pendingScene !== null){
			this.doSceneChange();
		}

		if(this.currentScene && this.currentScene.isRunning()){
			this.currentScene.update(deltaT);
		}
	}
}
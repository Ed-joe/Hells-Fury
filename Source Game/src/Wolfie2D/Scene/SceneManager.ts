import Scene from "./Scene";
import ResourceManager from "../ResourceManager/ResourceManager";
import Viewport from "../SceneGraph/Viewport";
import RenderingManager from "../Rendering/RenderingManager";

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
	}

	/**
	 * Add a scene as the main scene.
	 * Use this method if you've created a subclass of Scene, and you want to add it as the main Scene.
	 * @param constr The constructor of the scene to add
	 * @param init An object to pass to the init function of the new scene
	 */
	public addScene<T extends Scene>(constr: new (...args: any) => T, init?: Record<string, any>, options?: Record<string, any>): void {
		let scene = new constr(this.viewport, this, this.renderingManager, options);
		this.currentScene = scene;

		scene.initScene(init);

		// Enqueue all scene asset loads
		scene.loadScene();

		// Load all assets
		console.log("Starting Scene Load");
		this.resourceManager.loadResourcesFromQueue(() => {
			console.log("Starting Scene");
			scene.startScene();
			scene.setRunning(true);
		});

		this.renderingManager.setScene(scene);
	}

	/**
	 * Change from the current scene to this new scene.
	 * Use this method if you've created a subclass of Scene, and you want to add it as the main Scene.
	 * @param constr The constructor of the scene to change to
	 * @param init An object to pass to the init function of the new scene
	 */
	public changeScene<T extends Scene>(constr: new (...args: any) => T, init?: Record<string, any>, options?: Record<string, any>): void {
		this.viewport.setCenter(this.viewport.getHalfSize().x, this.viewport.getHalfSize().y);

		this.addScene(constr, init, options);
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
		this.currentScene.render();
	}

	/**
	 * Updates the current Scene
	 * @param deltaT The timestep of the Scene
	 */
	public update(deltaT: number){
		if(this.currentScene.isRunning()){
			this.currentScene.update(deltaT);
		}
	}
}
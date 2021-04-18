import NullFunc from "../DataTypes/Functions/NullFunc";

/**
 * The main game loop of the game. Keeps track of fps and handles scheduling of updates and rendering.
 * This class is left abstract, so that a subclass can handle exactly how the loop is scheduled.
 * For an example of different types of game loop scheduling, check out @link(Game Programming Patterns)(https://gameprogrammingpatterns.com/game-loop.html)
 */
export default abstract class GameLoop {

	/** The function to call when an update occurs */
	protected _doUpdate: Function = NullFunc;

	set doUpdate(update: Function){
		this._doUpdate = update;
	}

	/** The function to call when a render occurs */
	protected _doRender: Function = NullFunc;


	set doRender(render: Function){
		this._doRender = render;
	}
	
	/**
	 * Retrieves the current FPS of the game
	 */
	abstract getFPS(): number;

	/**
     * Starts up the game loop
     */
	abstract start(): void;

	/**
	 * Pauses the game loop, usually for an error condition.
	 */
	abstract pause(): void;

	/**
	 * Resumes the game loop.
	 */
	abstract resume(): void;

	/**
	 * Runs the first frame of the game. No update occurs here, only a render.
	 * This is needed to initialize delta time values
	 * @param timestamp The timestamp of the frame. This is received from the browser
	 */
	protected abstract doFirstFrame(timestamp: number): void;

	/**
	 * Run before any updates or the render of a frame.
	 * @param timestamp The timestamp of the frame. This is received from the browser
	 */
	protected abstract startFrame(timestamp: number): void;

	/**
	 * The core of the frame, where any necessary updates occur, and where a render happens
	 * @param timestamp The timestamp of the frame. This is received from the browser
	 */
	protected abstract doFrame(timestamp: number): void;

	/**
	 * Wraps up the frame
	 * @param panic Whether or not the update cycle panicked. This happens when too many updates try to happen in a single frame
	 */
	protected abstract finishFrame(panic: boolean): void;
}
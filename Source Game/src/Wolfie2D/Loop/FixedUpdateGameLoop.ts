import GameLoop from "./GameLoop";
import Debug from "../Debug/Debug";
import Stats from "../Debug/Stats";

/**
 * A game loop with a fixed update time and a variable render time.
 * Every frame, the game updates until all time since the last frame has been processed.
 * If too much time has passed, such as if the last update was too slow, 
 * or if the browser was put into the background, the loop will panic and discard time.
 * A render happens at the end of every frame. This happens as fast as possible unless specified.
 * A loop of this type allows for deterministic behavior - No matter what the frame rate is, the update should behave the same, 
 * as it is occuring in a fixed interval.
 */
export default class FixedUpdateGameLoop extends GameLoop {

	/** The max allowed update fps.*/
    private maxUpdateFPS: number;
    
    /** The timestep for each update. This is the deltaT passed to update calls. */
	private updateTimestep: number;

    /** The amount of time we are yet to simulate. */
    private frameDelta: number;

    /** The time when the last frame was drawn. */
    private lastFrameTime: number;
    
    /** The minimum time we want to wait between game frames. */
    private minFrameDelay: number;

	/** The current frame of the game. */
	private frame: number;

	/** The actual fps of the game. */
    private fps: number;
    
    /** The time between fps measurement updates. */
    private fpsUpdateInterval: number;

    /** The time of the last fps update. */
    private lastFpsUpdate: number;

    /** The number of frames since the last fps update was done. */
    private framesSinceLastFpsUpdate: number;

    /** The status of whether or not the game loop has started. */
    private started: boolean;

    /** The status of whether or not the game loop is paused */
    private paused: boolean;
    
    /** The status of whether or not the game loop is currently running. */
    private running: boolean;

    /** The number of update steps this iteration of the game loop. */
    private numUpdateSteps: number;

	constructor() {
		super();
        this.maxUpdateFPS = 60;
        this.updateTimestep = Math.floor(1000/this.maxUpdateFPS);
        this.frameDelta = 0;
        this.lastFrameTime = 0;
        this.minFrameDelay = 0;
        this.frame = 0;
        this.fps = this.maxUpdateFPS;   // Initialize the fps to the max allowed fps
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = 0;
        this.framesSinceLastFpsUpdate = 0;
        this.started = false;
        this.paused = false;
        this.running = false;
        this.numUpdateSteps = 0;
	}

	getFPS(): number {
		return 0;
	}

	/**
     * Updates the frame count and sum of time for the framerate of the game
     * @param timestep The current time in ms
     */
    protected updateFPS(timestamp: number): void {
        this.fps = 0.9 * this.framesSinceLastFpsUpdate * 1000 / (timestamp - this.lastFpsUpdate) +(1 - 0.9) * this.fps;
        this.lastFpsUpdate = timestamp;
        this.framesSinceLastFpsUpdate = 0;

        Debug.log("fps", "FPS: " + this.fps.toFixed(1));
        Stats.updateFPS(this.fps);
    }

	    /**
     * Changes the maximum allowed physics framerate of the game
     * @param initMax The max framerate
     */
    setMaxUpdateFPS(initMax: number): void {
        this.maxUpdateFPS = initMax;
        this.updateTimestep = Math.floor(1000/this.maxUpdateFPS);
    }

    /**
     * Sets the maximum rendering framerate
     * @param maxFPS The max framerate
     */
    setMaxFPS(maxFPS: number): void {
        this.minFrameDelay = 1000/maxFPS;
	}
	
	/**
	 * This function is called when the game loop panics, i.e. it tries to process too much time in an entire frame.
	 * This will reset the amount of time back to zero.
	 * @returns The amount of time we are discarding from processing.
	 */
	resetFrameDelta() : number {
        let oldFrameDelta = this.frameDelta;
        this.frameDelta = 0;
        return oldFrameDelta;
    }

	/**
     * Starts up the game loop and calls the first requestAnimationFrame
     */
	start(): void {
        if(!this.started){
            this.started = true;

            window.requestAnimationFrame((timestamp) => this.doFirstFrame(timestamp));
        }
    }

    pause(): void {
        this.paused = true;
    }

    resume(): void {
        this.paused = false;
    }

	/**
     * The first game frame - initializes the first frame time and begins the render
     * @param timestamp The current time in ms
     */
    protected doFirstFrame(timestamp: number): void  {
        this.running = true;

        this._doRender();

        this.lastFrameTime = timestamp;
        this.lastFpsUpdate = timestamp;
        this.framesSinceLastFpsUpdate = 0;

        window.requestAnimationFrame((t) => this.doFrame(t));
    }

	/**
	 * Handles any processing that needs to be done at the start of the frame
	 * @param timestamp The time of the frame in ms
	 */
	protected startFrame(timestamp: number): void {
		// Update the amount of time we need our update to process
		this.frameDelta += timestamp - this.lastFrameTime;

		// Set the new time of the last frame
        this.lastFrameTime = timestamp;

        // Update the estimate of the framerate
        if(timestamp > this.lastFpsUpdate + this.fpsUpdateInterval){
            this.updateFPS(timestamp);
        }

		// Increment the number of frames
        this.frame++;
        this.framesSinceLastFpsUpdate++;
	}

	/**
     * The main loop of the game. Updates until the current time is reached. Renders once
     * @param timestamp The current time in ms
     */
    protected doFrame = (timestamp: number): void => {
        // If a pause was executed, stop doing the loop.
        if(this.paused){ 
            return;
        }

        // Request animation frame to prepare for another update or render
        window.requestAnimationFrame((t) => this.doFrame(t));

        // If we are trying to render too soon, do nothing.
        if(timestamp < this.lastFrameTime + this.minFrameDelay){
            return;
		}
		
		// A frame is actually happening
		this.startFrame(timestamp);

		// Update while there is still time to make up. If we do too many update steps, panic and exit the loop.
		this.numUpdateSteps = 0;
		let panic = false;

        while(this.frameDelta >= this.updateTimestep){
			// Do an update
			this._doUpdate(this.updateTimestep/1000);
			
			// Remove the update step time from the time we have to process
            this.frameDelta -= this.updateTimestep;

			// Increment steps and check if we've done too many
            this.numUpdateSteps++;
            if(this.numUpdateSteps > 100){
                panic = true;
                break;
            }
        }

        // Updates are done, render
        this._doRender();

        // Wrap up the frame
        this.finishFrame(panic);
    }

	/**
	 * Wraps up the frame and handles the panic state if there is one
	 * @param panic Whether or not the loop panicked
	 */
	protected finishFrame(panic: boolean): void {
		if(panic) {
            var discardedTime = Math.round(this.resetFrameDelta());
            console.warn('Main loop panicked, probably because the browser tab was put in the background. Discarding ' + discardedTime + 'ms');
        }
	}

}
import Receiver from "../Events/Receiver";
import Map from "../DataTypes/Map";
import Vec2 from "../DataTypes/Vec2";
import EventQueue from "../Events/EventQueue";
import Viewport from "../SceneGraph/Viewport";
import GameEvent from "../Events/GameEvent";
import { GameEventType } from "../Events/GameEventType";

/**
 * Receives input events from the @reference[EventQueue] and allows for easy access of information about input by other systems
 */
export default class Input {
	private static mousePressed: boolean;
	private static mouseJustPressed: boolean;

	private static keyJustPressed: Map<boolean>;
	private static keyPressed: Map<boolean>;

	private static mousePosition: Vec2;
	private static mousePressPosition: Vec2;

	private static scrollDirection: number;
	private static justScrolled: boolean;

	private static eventQueue: EventQueue;
	private static receiver: Receiver;
	private static viewport: Viewport;

	private static keyMap: Map<Array<string>>;

	private static keysDisabled: boolean;
	private static mouseDisabled: boolean;

	/**
	 * Initializes the Input object
	 * @param viewport A reference to the viewport of the game
	 */
	static initialize(viewport: Viewport, keyMap: Array<Record<string, any>>){
		Input.viewport = viewport;
		Input.mousePressed = false;
		Input.mouseJustPressed = false;
		Input.receiver = new Receiver();
		Input.keyJustPressed = new Map<boolean>();
		Input.keyPressed = new Map<boolean>();
		Input.mousePosition = new Vec2(0, 0);
		Input.mousePressPosition = new Vec2(0, 0);
		Input.scrollDirection = 0;
		Input.justScrolled = false;
		Input.keysDisabled = false;
		Input.mouseDisabled = false;

		// Initialize the keymap
		Input.keyMap = new Map();

		// Add all keys to the keymap
		for(let entry in keyMap){
			let name = keyMap[entry].name;
			let keys = keyMap[entry].keys;
			Input.keyMap.add(name, keys);
		}

		Input.eventQueue = EventQueue.getInstance();
		// Subscribe to all input events
		Input.eventQueue.subscribe(Input.receiver, [GameEventType.MOUSE_DOWN, GameEventType.MOUSE_UP, GameEventType.MOUSE_MOVE,
			 GameEventType.KEY_DOWN, GameEventType.KEY_UP, GameEventType.CANVAS_BLUR, GameEventType.WHEEL_UP, GameEventType.WHEEL_DOWN]);
	}

	static update(deltaT: number): void {
		// Reset the justPressed values to false
		Input.mouseJustPressed = false;
		Input.keyJustPressed.forEach((key: string) => Input.keyJustPressed.set(key, false));
		Input.justScrolled = false;
		Input.scrollDirection = 0;

		while(Input.receiver.hasNextEvent()){			
			let event = Input.receiver.getNextEvent();
			
			// Handle each event type
			if(event.type === GameEventType.MOUSE_DOWN){
				Input.mouseJustPressed = true;
				Input.mousePressed = true;
				Input.mousePressPosition = event.data.get("position");	
			}

			if(event.type === GameEventType.MOUSE_UP){
				Input.mousePressed = false;
			}

			if(event.type === GameEventType.MOUSE_MOVE){
				Input.mousePosition = event.data.get("position");
			}

			if(event.type === GameEventType.KEY_DOWN){
				let key = event.data.get("key");
				// Handle space bar
				if(key === " "){
					key = "space";
				}
				if(!Input.keyPressed.get(key)){
					Input.keyJustPressed.set(key, true);
					Input.keyPressed.set(key, true);
				}
			}

			if(event.type === GameEventType.KEY_UP){
				let key = event.data.get("key");
				// Handle space bar
				if(key === " "){
					key = "space";
				}
				Input.keyPressed.set(key, false);
			}

			if(event.type === GameEventType.CANVAS_BLUR){
				Input.clearKeyPresses()
			}

			if(event.type === GameEventType.WHEEL_UP){
				Input.scrollDirection = -1;
				Input.justScrolled = true;
			} else if(event.type === GameEventType.WHEEL_DOWN){
				Input.scrollDirection = 1;
				Input.justScrolled = true;
			}
		}
	}

	private static clearKeyPresses(): void {
		Input.keyJustPressed.forEach((key: string) => Input.keyJustPressed.set(key, false));
		Input.keyPressed.forEach((key: string) => Input.keyPressed.set(key, false));
	}

	/**
	 * Returns whether or not a key was newly pressed Input frame.
	 * If the key is still pressed from last frame and wasn't re-pressed, Input will return false.
	 * @param key The key
	 * @returns True if the key was just pressed, false otherwise
	 */
	static isKeyJustPressed(key: string): boolean {
		if(Input.keysDisabled) return false;

		if(Input.keyJustPressed.has(key)){
			return Input.keyJustPressed.get(key)
		} else {
			return false;
		}
	}

	/**
	 * Returns an array of all of the keys that are newly pressed Input frame.
	 * If a key is still pressed from last frame and wasn't re-pressed, it will not be in Input list.
	 * @returns An array of all of the newly pressed keys.
	 */
	static getKeysJustPressed(): Array<string> {
		if(Input.keysDisabled) return [];

		let keys = Array<string>();
		Input.keyJustPressed.forEach(key => {
			if(Input.keyJustPressed.get(key)){
				keys.push(key);
			}
		});
		return keys;
	}

	/**
	 * Returns whether or not a key is being pressed.
	 * @param key The key
	 * @returns True if the key is currently pressed, false otherwise
	 */
	static isKeyPressed(key: string): boolean {
		if(Input.keysDisabled) return false;

		if(Input.keyPressed.has(key)){
			return Input.keyPressed.get(key)
		} else {
			return false;
		}
	}

	/**
	 * Changes the binding of an input name to keys
	 * @param inputName The name of the input
	 * @param keys The corresponding keys
	 */
	static changeKeyBinding(inputName: string, keys: Array<string>): void {
		Input.keyMap.set(inputName, keys);
	}

	/**
	 * Clears all key bindings
	 */
	static clearAllKeyBindings(): void {
		Input.keyMap.clear();
	}

	/**
	 * Returns whether or not an input was just pressed this frame
	 * @param inputName The name of the input
	 * @returns True if the input was just pressed, false otherwise
	 */
	static isJustPressed(inputName: string): boolean {
		if(Input.keysDisabled) return false;

		if(Input.keyMap.has(inputName)){
			const keys = Input.keyMap.get(inputName);
			let justPressed = false;

			for(let key of keys){
				justPressed = justPressed || Input.isKeyJustPressed(key);
			}

			return justPressed;
		} else {
			return false;
		}	
	}

	/**
	 * Returns whether or not an input is currently pressed
	 * @param inputName The name of the input
	 * @returns True if the input is pressed, false otherwise
	 */
	static isPressed(inputName: string): boolean {
		if(Input.keysDisabled) return false;

		if(Input.keyMap.has(inputName)){
			const keys = Input.keyMap.get(inputName);
			let pressed = false;

			for(let key of keys){
				pressed = pressed || Input.isKeyPressed(key);
			}

			return pressed;
		} else {
			return false;
		}
	}

	/**
	 * Returns whether or not the mouse was newly pressed Input frame
	 * @returns True if the mouse was just pressed, false otherwise
	 */
	static isMouseJustPressed(): boolean {
		return Input.mouseJustPressed && !Input.mouseDisabled;
	}

	/**
	 * Returns whether or not the mouse is currently pressed
	 * @returns True if the mouse is currently pressed, false otherwise
	 */
	static isMousePressed(): boolean {
		return Input.mousePressed && !Input.mouseDisabled;
	}

	/**
	 * Returns whether the user scrolled or not
	 * @returns True if the user just scrolled Input frame, false otherwise
	 */
	static didJustScroll(): boolean {
		return Input.justScrolled && !Input.mouseDisabled;
	}

	/**
	 * Gets the direction of the scroll
	 * @returns -1 if the user scrolled up, 1 if they scrolled down
	 */
	static getScrollDirection(): number {
		return Input.scrollDirection;
	}

	/**
	 * Gets the position of the player's mouse
	 * @returns The mouse position stored as a Vec2
	 */
	static getMousePosition(): Vec2 {
		return Input.mousePosition.scaled(1/this.viewport.getZoomLevel());
	}

	/**
	 * Gets the position of the player's mouse in the game world,
	 * taking into consideration the scrolling of the viewport
	 * @returns The mouse position stored as a Vec2
	 */
	static getGlobalMousePosition(): Vec2 {
		return Input.mousePosition.clone().scale(1/this.viewport.getZoomLevel()).add(Input.viewport.getOrigin());
	}

	/**
	 * Gets the position of the last mouse press
	 * @returns The mouse position stored as a Vec2
	 */
	static getMousePressPosition(): Vec2 {
		return Input.mousePressPosition;
	}

	/**
	 * Gets the position of the last mouse press in the game world,
	 * taking into consideration the scrolling of the viewport
	 * @returns The mouse position stored as a Vec2
	 */
	static getGlobalMousePressPosition(): Vec2 {
		return Input.mousePressPosition.clone().add(Input.viewport.getOrigin());
	}

	/**
	 * Disables all keypress and mouse click inputs
	 */
	static disableInput(): void {
		Input.keysDisabled = true;
		Input.mouseDisabled = true;
	}

	/**
	 * Enables all keypress and mouse click inputs
	 */
	static enableInput(): void {
		Input.keysDisabled = false;
		Input.mouseDisabled = false;
	}
}
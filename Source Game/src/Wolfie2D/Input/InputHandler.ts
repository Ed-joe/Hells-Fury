import EventQueue from "../Events/EventQueue";
import Vec2 from "../DataTypes/Vec2";
import GameEvent from "../Events/GameEvent";
import { GameEventType } from "../Events/GameEventType";

/**
 * Handles communication with the web browser to receive asynchronous events and send them to the @reference[EventQueue]
 */
export default class InputHandler {
	private eventQueue: EventQueue;
     
    /**
     * Creates a new InputHandler
     * @param canvas The game canvas
     */
    constructor(canvas: HTMLCanvasElement){
		this.eventQueue = EventQueue.getInstance();
		
        canvas.onmousedown = (event) => this.handleMouseDown(event, canvas);
        canvas.onmouseup = (event) => this.handleMouseUp(event, canvas);
        canvas.oncontextmenu = this.handleContextMenu;
        canvas.onmousemove = (event) => this.handleMouseMove(event, canvas);
        document.onkeydown = this.handleKeyDown;
        document.onkeyup = this.handleKeyUp;
        document.onblur = this.handleBlur;
        document.oncontextmenu = this.handleBlur;
        document.onwheel = this.handleWheel;
    }

    private handleMouseDown = (event: MouseEvent, canvas: HTMLCanvasElement): void => {
		let pos = this.getMousePosition(event, canvas);
        let gameEvent = new GameEvent(GameEventType.MOUSE_DOWN, {position: pos});
        this.eventQueue.addEvent(gameEvent);
    }

    private handleMouseUp = (event: MouseEvent, canvas: HTMLCanvasElement): void => {
        let pos = this.getMousePosition(event, canvas);
        let gameEvent = new GameEvent(GameEventType.MOUSE_UP, {position: pos});
        this.eventQueue.addEvent(gameEvent);
    }

    private handleMouseMove = (event: MouseEvent, canvas: HTMLCanvasElement): void => {
        let pos = this.getMousePosition(event, canvas);
        let gameEvent = new GameEvent(GameEventType.MOUSE_MOVE, {position: pos});
        this.eventQueue.addEvent(gameEvent);
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        let key = this.getKey(event);
        let gameEvent = new GameEvent(GameEventType.KEY_DOWN, {key: key});
        this.eventQueue.addEvent(gameEvent);
    }

    private handleKeyUp = (event: KeyboardEvent): void => {
        let key = this.getKey(event);
        let gameEvent = new GameEvent(GameEventType.KEY_UP, {key: key});
        this.eventQueue.addEvent(gameEvent);
    }

    private handleBlur = (event: Event): void => {
        let gameEvent = new GameEvent(GameEventType.CANVAS_BLUR, {});
        this.eventQueue.addEvent(gameEvent);
    }

    private handleContextMenu = (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();
    }

    private handleWheel = (event: WheelEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        
        let gameEvent: GameEvent;
        if(event.deltaY < 0){
            gameEvent = new GameEvent(GameEventType.WHEEL_UP, {});
        } else {
            gameEvent = new GameEvent(GameEventType.WHEEL_DOWN, {});
        }
        this.eventQueue.addEvent(gameEvent);
    }

    private getKey(keyEvent: KeyboardEvent){
        return keyEvent.key.toLowerCase();
    }

    private getMousePosition(mouseEvent: MouseEvent, canvas: HTMLCanvasElement): Vec2 {
        let rect = canvas.getBoundingClientRect();
        let x = mouseEvent.clientX - rect.left;
        let y = mouseEvent.clientY - rect.top;
        return new Vec2(x, y);
    }
}
import Map from "../DataTypes/Map";
import EventQueue from "./EventQueue";
import GameEvent from "./GameEvent";

/**
 * An event emitter object other systems can use to hook into the EventQueue.
 * Provides an easy interface for firing off events.
 */
export default class Emitter {
	/** A reference to the EventQueue */
	private eventQueue: EventQueue;

	/** Creates a new Emitter */
	constructor(){
		this.eventQueue = EventQueue.getInstance();
	}

	/**
	 * Emit and event of type eventType with the data packet data
	 * @param eventType The name of the event to fire off
	 * @param data A @reference[Map] or record containing any data about the event
	 */
	fireEvent(eventType: string, data: Map<any> | Record<string, any> = null): void {
		this.eventQueue.addEvent(new GameEvent(eventType, data));
	}
}
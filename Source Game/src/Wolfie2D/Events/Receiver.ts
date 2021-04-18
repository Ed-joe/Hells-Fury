import Queue from "../DataTypes/Queue";
import EventQueue from "./EventQueue";
import GameEvent from "./GameEvent";

/**
 * Receives subscribed events from the EventQueue.
 */
export default class Receiver {
	/** The maximum number of events this Receiver can hold at one time */
	readonly MAX_SIZE: number;

	/** The inbox of the Receiver */
	private q: Queue<GameEvent>;

	/** Creates a new Receiver */
	constructor(){
		this.MAX_SIZE = 100;
        this.q = new Queue(this.MAX_SIZE);
	}

	destroy(){
		EventQueue.getInstance().unsubscribe(this);
	}
	
	/**
	 * Adds these types of events to this receiver's queue every update.
	 * @param eventTypes The types of events this receiver will be subscribed to
	 */
	subscribe(eventTypes: string | Array<string>): void {
		EventQueue.getInstance().subscribe(this, eventTypes);
		this.q.clear();
	}

	/**
	 * Adds an event to the queue of this reciever. This is used by the @reference[EventQueue] to distribute events
	 * @param event The event to receive
	 */
	receive(event: GameEvent): void {
		try{
		this.q.enqueue(event);
		} catch(e){
			console.warn("Receiver overflow for event " + event.toString());
			throw e;
		}
	}

	/**
	 * Retrieves the next event from the receiver's queue
	 * @returns The next GameEvent
	 */
	getNextEvent(): GameEvent {
		return this.q.dequeue();
	}

	/**
	 * Looks at the next event in the receiver's queue, but doesn't remove it from the queue
	 * @returns The next GameEvent
	 */
	peekNextEvent(): GameEvent {
		return this.q.peekNext()
	}

	/**
	 * Returns true if the receiver has any events in its queue
	 * @returns True if the receiver has another event, false otherwise
	 */
	hasNextEvent(): boolean {
		return this.q.hasItems();
	}

	/**
	 * Ignore all events this frame
	 */
	ignoreEvents(): void {
		this.q.clear();
	}
}
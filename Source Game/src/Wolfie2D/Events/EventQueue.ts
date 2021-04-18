import Queue from "../DataTypes/Queue";
import Map from "../DataTypes/Map";
import GameEvent from "./GameEvent";
import Receiver from "./Receiver";
import { GameEventType } from "./GameEventType";

/**
 * The main event system of the game engine.
 * Events are sent to the EventQueue, which handles distribution to any systems that are listening for those events.
 * This allows for handling of input without having classes directly hook into javascript event handles, 
 * and allows otherwise separate classes to communicate with each other cleanly, such as a Player object 
 * requesting a sound be played by the audio system.
 * 
 * The distribution of @reference[GameEvent]s happens as follows:
 * 
 * Events are recieved throughout a frame and are queued up by the EventQueue.
 * At the beginning of the next frame, events are sent out to any receivers that are hooked into the event type.
 * @reference[Receiver]s are then free to process events as they see fit.
 * 
 * Overall, the EventQueue can be considered as something similar to an email server,
 * and the @reference[Receiver]s can be considered as the client inboxes.
 * 
 * See @link(Game Programming Patterns)(https://gameprogrammingpatterns.com/event-queue.html) for more discussion on EventQueues
 */
export default class EventQueue {
    private static instance: EventQueue = null;
    
    /** The maximum number of events visible */
    private readonly MAX_SIZE: number;
    
    /** The actual queue of events */
    private q: Queue<GameEvent>;
    
    /** The map of receivers registered for an event name */
	private receivers: Map<Array<Receiver>>;

    private constructor(){
        this.MAX_SIZE = 100;
        this.q = new Queue<GameEvent>(this.MAX_SIZE);
        this.receivers = new Map<Array<Receiver>>();
	}
    
    /** Retrieves the instance of the Singleton EventQueue */
	static getInstance(): EventQueue {
		if(this.instance === null){
			this.instance = new EventQueue();
		}
		
		return this.instance;
	}

    /** Adds an event to the EventQueue.
     * This is exposed to the rest of the game engine through the @reference[Emitter] class */
    addEvent(event: GameEvent): void {
        this.q.enqueue(event);
    }

    /**
     * Associates a receiver with a type of event. Every time this event appears in the future,
     * it will be given to the receiver (and any others watching that type).
     * This is exposed to the rest of the game engine through the @reference[Receiver] class
     * @param receiver The event receiver
     * @param type The type or types of events to subscribe to
     */
    subscribe(receiver: Receiver, type: string | Array<string>): void {
        if(type instanceof Array){
            // If it is an array, subscribe to all event types
            for(let t of type){
                this.addListener(receiver, t);
            }
        } else {
            this.addListener(receiver, type);
        }
	}

    /**
     * Unsubscribes the specified receiver from all events, or from whatever events are provided
     * @param receiver The receiver to unsubscribe
     * @param keys The events to unsubscribe from. If none are provided, unsubscribe from all
     */
    unsubscribe(receiver: Receiver, ...events: Array<string>): void {
        this.receivers.forEach(eventName => {
            // If keys were provided, only continue if this key is one of them
            if(events.length > 0 && events.indexOf(eventName) === -1) return;

            // Find the index of our receiver for this key
            let index = this.receivers.get(eventName).indexOf(receiver);

            // If an index was found, remove the receiver
            if(index !== -1){
                this.receivers.get(eventName).splice(index, 1);
            }
        });
    }

    // Associate the receiver and the type
	private addListener(receiver: Receiver, type: string): void {
		if(this.receivers.has(type)){
			this.receivers.get(type).push(receiver);
		} else {
			this.receivers.add(type, [receiver]);
		}
	}
    
    update(deltaT: number): void {
        while(this.q.hasItems()){
            // Retrieve each event
			let event = this.q.dequeue();
            
            // If a receiver has this event type, send it the event
            if(this.receivers.has(event.type)){
                for(let receiver of this.receivers.get(event.type)){
                    receiver.receive(event);
                }
			}
            
            // If a receiver is subscribed to all events, send it the event
            if(this.receivers.has(GameEventType.ALL)){
                for(let receiver of this.receivers.get(GameEventType.ALL)){
                    receiver.receive(event);
                }
            }
        }
    }
}
import Queue from "../DataTypes/Queue";
import Receiver from "../Events/Receiver";
import GameEvent from "../Events/GameEvent";
import EventQueue from "../Events/EventQueue";
import { GameEventType } from "../Events/GameEventType";

// @ignorePage

export default class Recorder {
	private receiver: Receiver;
	private log: Queue<LogItem>;
	private recording: boolean;
	private eventQueue: EventQueue;
	private frame: number;
	private playing: boolean;

	constructor(){
		this.receiver = new Receiver();
		this.log = new Queue(1000);
		this.recording = false;
		this.playing = false;
		this.frame = 0;

		this.eventQueue = EventQueue.getInstance();
		this.eventQueue.subscribe(this.receiver, "all");
	}

	update(deltaT: number): void {
		if(this.recording){
			this.frame += 1;
		}

		if(this.playing){
			// If playing, ignore events, just feed the record to the event queue
			this.receiver.ignoreEvents();

			/*
				While there is a next item, and while it should occur in this frame,
				send the event. i.e., while current_frame * current_delta_t is greater
				than recorded_frame * recorded_delta_t
			*/
			while(this.log.hasItems()
					&& this.log.peekNext().frame * this.log.peekNext().delta < this.frame * deltaT){
				let event = this.log.dequeue().event;
				console.log(event);
				this.eventQueue.addEvent(event);
			}

			if(!this.log.hasItems()){
				this.playing = false;
			}

			this.frame += 1;
		} else {
			// If not playing, handle events
			while(this.receiver.hasNextEvent()){
				let event = this.receiver.getNextEvent();

				if(event.type === GameEventType.STOP_RECORDING){
					this.recording = false;
				}

				if(this.recording){
					this.log.enqueue(new LogItem(this.frame, deltaT, event));
				}

				if(event.type === GameEventType.START_RECORDING){
					this.log.clear();
					this.recording = true;
					this.frame = 0
				}

				if(event.type === GameEventType.PLAY_RECORDING){
					this.frame = 0;
					this.recording = false;
					this.playing = true;
				}
			}
		}
	}
}

class LogItem {
	frame: number;
	delta: number;
	event: GameEvent;

	constructor(frame: number, deltaT: number, event: GameEvent){
		this.frame = frame;
		this.delta = deltaT;
		this.event = event;
	}
}
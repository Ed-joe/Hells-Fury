import Map from "../DataTypes/Map"

/**
 * A representation of an in-game event that is passed through the @reference[EventQueue]
 */
export default class GameEvent {
    /** The type of the event */
    public type: string;
    /** The data contained by the event */
    public data: Map<any>;
    /** The time of the event in ms */
	public time: number;

    /**
     * Creates a new GameEvent.
     * This is handled implicitly through the @reference[Emitter] class
     * @param type The type of the GameEvent
     * @param data The data contained by the GameEvent
     */
    constructor(type: string, data: Map<any> | Record<string, any> = null) {
        // Parse the game event data
        if (data === null) {
            this.data = new Map<any>();
        } else if (!(data instanceof Map)){
            // data is a raw object, unpack
            this.data = new Map<any>();
            for(let key in data){
                this.data.add(key, data[key]);
            }
        } else {
            this.data = data;
        }

        this.type = type;
        this.time = Date.now();
    }

    /**
     * Checks the type of the GameEvent
     * @param type The type to check
     * @returns True if the GameEvent is the specified type, false otherwise.
     */
    isType(type: string): boolean {
        return this.type === type;
    }

    /**
     * Returns this GameEvent as a string
     * @returns The string representation of the GameEvent
     */
    toString(): string {
        return this.type + ": @" + this.time;
    }
}
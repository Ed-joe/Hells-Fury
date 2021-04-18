import Stack from "../Stack";
import State from "./State";
import Map from "../Map";
import GameEvent from "../../Events/GameEvent";
import Receiver from "../../Events/Receiver";
import Emitter from "../../Events/Emitter";
import Updateable from "../Interfaces/Updateable";

/**
 * An implementation of a Push Down Automata State machine. States can also be hierarchical
 * for more flexibility, as described in @link(Game Programming Patterns)(https://gameprogrammingpatterns.com/state.html).
 */
export default class StateMachine implements Updateable {
    /** A stack of the current states */
    protected stack: Stack<State>;
    /** A mape of state keys to actual state instances */
    protected stateMap: Map<State>;
    /** The current state */
    protected currentState: State;
    /** An event receiver */
    protected receiver: Receiver;
    /** An event emitter */
    protected emitter: Emitter;
    /** A boolean representing whether or not this StateMachine is currently active */
    protected active: boolean;
    /** A boolean representing whether or not this StateMachine should emit an event on state change */
    protected emitEventOnStateChange: boolean;
    /** The name of the event to be emitted on state change */
    protected stateChangeEventName: string;

    /**
     * Creates a new StateMachine
     */
    constructor(){
        this.stack = new Stack();
        this.stateMap = new Map();
        this.receiver = new Receiver();
        this.emitter = new Emitter();
        this.emitEventOnStateChange = false;
    }

    /**
     * Sets the activity state of this state machine
     * @param flag True if you want to set this machine running, false otherwise
     */
    setActive(flag: boolean): void {
        this.active = flag;
    }

    /**
     * Makes this state machine emit an event any time its state changes
     * @param stateChangeEventName The name of the event to emit
     */
    setEmitEventOnStateChange(stateChangeEventName: string): void {
        this.emitEventOnStateChange = true;
        this.stateChangeEventName = stateChangeEventName;
    }

    /**
     * Stops this state machine from emitting events on state change.
     */
    cancelEmitEventOnStateChange(): void {
        this.emitEventOnStateChange = false;
    }
    
    /**
     * Initializes this state machine with an initial state and sets it running
     * @param initialState The name of initial state of the state machine
     */
    initialize(initialState: string, options: Record<string, any> = {}): void {
        this.stack.push(this.stateMap.get(initialState));
        this.currentState = this.stack.peek();
        this.currentState.onEnter(options);
        this.setActive(true);
    }

    /**
     * Adds a state to this state machine
     * @param stateName The name of the state to add
     * @param state The state to add
     */
    addState(stateName: string, state: State): void {
        this.stateMap.add(stateName, state);
    }

    /**
     * Changes the state of this state machine to the provided string
     * @param state The string name of the state to change to
     */
    changeState(state: string): void {
        // Exit the current state
        let options = this.currentState.onExit();

        // Make sure the correct state is at the top of the stack
        if(state === "previous"){
            // Pop the current state off the stack
            this.stack.pop();
        } else {
            // Retrieve the new state from the statemap and put it at the top of the stack
            this.stack.pop();
            this.stack.push(this.stateMap.get(state));
        }

        // Retreive the new state from the stack
        this.currentState = this.stack.peek();

        // Emit an event if turned on
        if(this.emitEventOnStateChange){
            this.emitter.fireEvent(this.stateChangeEventName, {state: this.currentState});
        }

        // Enter the new state
        this.currentState.onEnter(options);
    }

    /**
     * Handles input. This happens at the very beginning of this state machine's update cycle.
     * @param event The game event to process
     */
    handleEvent(event: GameEvent): void {
        if(this.active){
            this.currentState.handleInput(event);
        }
    }

    // @implemented
    update(deltaT: number): void {
        // Distribute events
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
        }

        // Delegate the update to the current state
        this.currentState.update(deltaT);
    }
}
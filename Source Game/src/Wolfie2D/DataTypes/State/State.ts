import Emitter from "../../Events/Emitter";
import GameEvent from "../../Events/GameEvent";
import Updateable from "../Interfaces/Updateable";
import StateMachine from "./StateMachine";

/**
 * An abstract implementation of a state for a @reference[StateMachine].
 * This class should be extended to allow for custom state behaviors.
 */
export default abstract class State implements Updateable {
    /** The StateMachine that uses this State */
    protected parent: StateMachine;

    /** An event emitter */
    protected emitter: Emitter;

    /**
     * Constructs a new State
     * @param parent The parent StateMachine of this state
     */
    constructor(parent: StateMachine) {
        this.parent = parent;
        this.emitter = new Emitter();
    }

    /**
     * A method that is called when this state is entered. Use this to initialize any variables before updates occur.
     * @param options Information to pass to this state
     */
    abstract onEnter(options: Record<string, any>): void;

    /**
     * A lifecycle method that handles an input event, such as taking damage.
     * @param event The GameEvent to process
     */
    abstract handleInput(event: GameEvent): void;

    // @implemented
    abstract update(deltaT: number): void;

    /**
     * Tells the state machine that this state has ended, and makes it transition to the new state specified
     * @param stateName The name of the state to transition to
     */
    protected finished(stateName: string): void {
        this.parent.changeState(stateName);
    }

    /**
     * A lifecycle method is called when the state is ending.
     * @returns info to pass to the next state
     */
    abstract onExit(): Record<string, any>;
}
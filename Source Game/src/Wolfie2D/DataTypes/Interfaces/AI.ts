import GameEvent from "../../Events/GameEvent";
import GameNode from "../../Nodes/GameNode";
import Actor from "./Actor";
import Updateable from "./Updateable";

/**
 * Defines a controller for a bot or a human. Must be able to update
 */
export default interface AI extends Updateable {
    /** Initializes the AI with the actor and any additional config */
    initializeAI(owner: GameNode, options: Record<string, any>): void;

    /** Activates this AI from a stopped state and allows variables to be passed in */
    activate(options: Record<string, any>): void;

    /** Handles events from the Actor */
    handleEvent(event: GameEvent): void;
}
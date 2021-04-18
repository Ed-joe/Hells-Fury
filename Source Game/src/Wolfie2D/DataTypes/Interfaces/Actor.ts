import NavigationPath from "../../Pathfinding/NavigationPath";
import AI from "./AI";

/**
 * A game object that has an AI and can perform its own actions every update cycle
 */
export default interface Actor {
    /** The AI of the actor */
    ai: AI;

    /** The activity status of the actor */
    aiActive: boolean;

    /** The path that navigation will follow */
    path: NavigationPath;

    /** A flag representing whether or not the actor is currently pathfinding */
    pathfinding: boolean;

    /**
     * Adds an AI to this Actor.
     * @param ai The name of the AI, or the actual AI, to add to the Actor.
     * @param options The options to give to the AI for initialization.
     */
    addAI<T extends AI>(ai: string | (new () => T), options: Record<string, any>): void;

    /**
     * Sets the AI to start/stop for this Actor.
     * @param active The new active status of the AI.
     * @param options An object that allows options to be pased to the activated AI
     */
    setAIActive(active: boolean, options: Record<string, any>): void;

    /**
     * Moves this GameNode along a path
     * @param speed The speed to move with
     * @param path The path we're moving along
     */
    moveOnPath(speed: number, path: NavigationPath): void;
}
import AI from "../DataTypes/Interfaces/AI";
import GameEvent from "../Events/GameEvent";
import GameNode from "../Nodes/GameNode";

export default abstract class ControllerAI implements AI {
    /** The owner of this controller */
    owner: GameNode;

    /** Removes the instance of the owner of this AI */
    destroy(): void {
        delete this.owner;
    }

    abstract initializeAI(owner: GameNode, options: Record<string, any>): void; 

    abstract activate(options: Record<string, any>): void;

    abstract handleEvent(event: GameEvent): void;

    abstract update(deltaT: number): void;
}
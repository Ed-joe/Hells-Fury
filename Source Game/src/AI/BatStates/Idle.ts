import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import BatAI, { EnemyStates } from "../BatAI";
import EnemyState from "./EnemyState";

export default class Idle extends EnemyState {
    private startPosition: Vec2;

    private awayFromStartPosition: boolean;

    private retObj: Record<string, any>;
    
    constructor(parent: BatAI, owner: GameNode){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {

    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null){
            this.finished(EnemyStates.ATTACKING);
        }
    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}
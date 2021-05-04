import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import BatAI, { EnemyStates } from "../BatAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class Idle extends EnemyState {
    private startPosition: Vec2;

    private awayFromStartPosition: boolean;

    constructor(parent: BatAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("IDLE", true);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null && this.owner.position.distanceTo(this.parent.getPlayerPosition()) < 200){
            this.finished(EnemyStates.ATTACKING);
        }
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {};
    }

}
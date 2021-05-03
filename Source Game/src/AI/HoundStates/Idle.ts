import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import HoundAI, { EnemyStates } from "../HoundAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class Idle extends EnemyState {
    private startPosition: Vec2;

    private awayFromStartPosition: boolean;

    constructor(parent: HoundAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("IDLE", true);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null && this.parent.getPlayerPosition() !== undefined && this.owner.position.distanceTo(this.parent.getPlayerPosition()) <= 32 * 10){
            if(this.owner.position.distanceTo(this.parent.getPlayerPosition()) > 32 * 6) {
                this.finished(EnemyStates.TELEPORT_START);
            } else {
                this.finished(EnemyStates.RUN);
            }
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
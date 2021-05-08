import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import HoundAI, { EnemyStates } from "../HoundAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Damage extends EnemyState {
    private startPosition: Vec2;

    private awayFromStartPosition: boolean;

    constructor(parent: HoundAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "hound_damage", loop: false, holdReference: false})
        this.owner.animation.play("DAMAGE", false);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        this.owner.move(this.owner.position.dirTo(this.parent.getPlayerPosition()).scale(-1));
        if(!this.owner.animation.isPlaying("DAMAGE")) {
            let playerPos = this.parent.getPlayerPosition();
            if(playerPos !== null && this.owner.position.distanceTo(playerPos) <= 32 * 8){
                if(this.owner.position.distanceTo(this.parent.getPlayerPosition()) > 32 * 6) {
                    this.finished(EnemyStates.TELEPORT_START);
                } else {
                    this.finished(EnemyStates.RUN);
                }
            } else {
                this.finished(EnemyStates.DEFAULT);
            }
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
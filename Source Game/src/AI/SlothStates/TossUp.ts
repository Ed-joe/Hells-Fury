import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import SlothAI, { BossStates } from "../SlothAI";

export default class TossUp extends BossState {
    constructor(parent: SlothAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("THROW", false);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(!this.owner.animation.isPlaying("THROW")){
            this.finished(BossStates.MOVING_SHADOW);
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
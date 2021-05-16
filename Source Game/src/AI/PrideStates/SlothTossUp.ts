import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class SlothTossUp extends BossState {
    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "sloth_throw", loop: false, holdReference: false});
        this.owner.animation.play("SLOTH_THROW", false);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(!this.owner.animation.isPlaying("SLOTH_THROW")){
            this.finished(BossStates.SLOTH_MOVING_SHADOW);
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {previous: BossStates.SLOTH_TOSS_UP};
    }

}
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import WrathAI, { BossStates } from "../WrathAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class AttackUp extends BossState {
    constructor(parent: WrathAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "wrath_attack", loop: false, holdReference: false});
        this.owner.animation.play("SLASH_UP", false);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("SLASH_UP")) {
            this.finished(BossStates.RUN_UP);
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {previous: BossStates.RUN_UP};
    }

}
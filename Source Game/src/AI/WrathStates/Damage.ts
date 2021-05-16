import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import WrathAI, { BossStates } from "../WrathAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Damage extends BossState {
    private previous: BossStates;

    constructor(parent: WrathAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "wrath_damage", loop: false, holdReference: false});
        this.owner.animation.play("DAMAGE", false);
        this.previous = options.previous;

    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("DAMAGE")) {
            this.finished(this.previous);
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
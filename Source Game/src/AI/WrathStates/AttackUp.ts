import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import WrathAI, { BossStates } from "../WrathAI";

export default class AttackUp extends BossState {
    constructor(parent: WrathAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("SLASH_UP", false);
        this.parent.slice.use(this.owner, "enemies", Vec2.ZERO);
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
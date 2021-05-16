import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";

export default class WrathRunUp extends BossState {
    private speed: Vec2;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("WRATH_WALK_UP", true);
        this.speed = new Vec2(0, -5);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if (this.owner.position.y < 168) {
            this.finished(BossStates.WRATH_CHARGE_DOWN);
        }
        this.owner.move(this.speed);
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.WRATH_RUN_UP};
    }

}
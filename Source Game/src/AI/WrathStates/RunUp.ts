import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import WrathAI, { BossStates } from "../WrathAI";

export default class RunUp extends BossState {
    private speed: Vec2;

    constructor(parent: WrathAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("WALK_UP", true);
        this.speed = new Vec2(0, -5);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if (this.owner.position.y < 200) {
            this.finished(BossStates.CHARGE_DOWN);
        }
        this.owner.move(this.speed);
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.RUN_UP};
    }

}
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";

export default class WrathRunDown extends BossState {
    private speed: Vec2;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("WRATH_WALK_DOWN", true);
        this.speed = new Vec2(0, 5);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        super.update(deltaT);

        if (this.owner.position.y > 932) {
            this.finished(BossStates.WRATH_CHARGE_UP);
        }
        this.owner.move(this.speed);
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.WRATH_RUN_DOWN};
    }

}
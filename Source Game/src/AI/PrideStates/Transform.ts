import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Timer from "../../Wolfie2D/Timing/Timer";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";

export default class Transform extends BossState {
    private previous: BossStates;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.removePhysics();
        this.owner.addPhysics(new AABB(Vec2.ZERO, new Vec2(1, 1)), new Vec2(500, 500));
        this.owner.setGroup("wall");
        (<AnimatedSprite> this.owner).animation.play("TRANSFORM", false);
        this.previous = options.previous;
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("TRANSFORM")) {
            let valid_next = [];
            if (![BossStates.ENVY_WALK].includes(this.previous)) {
                valid_next.push(BossStates.ENVY_TRANSFORM);
            }
            if (![BossStates.GLUTTONY_IDLE].includes(this.previous)) {
                valid_next.push(BossStates.GLUTTONY_TRANSFORM);
            }
            if (![BossStates.GREED_IDLE].includes(this.previous)) {
                valid_next.push(BossStates.GREED_TRANSFORM);
            }
            if (![BossStates.LUST_ATTACK].includes(this.previous)) {
                valid_next.push(BossStates.LUST_TRANSFORM);
            }
            if (![BossStates.SLOTH_WALK].includes(this.previous)) {
                valid_next.push(BossStates.SLOTH_TRANSFORM);
            }
            if (![BossStates.WRATH_RUN_DOWN, BossStates.WRATH_RUN_UP].includes(this.previous)) {
                valid_next.push(BossStates.WRATH_TRANSFORM);
            }
            this.finished(valid_next[Math.floor(Math.random() * valid_next.length)]);
        }
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.TRANSFORM};
    }

}
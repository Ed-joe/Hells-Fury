import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Timer from "../../Wolfie2D/Timing/Timer";
import { Game_Events } from "../../GameSystems/game_enums";

export default class GluttonyTransform extends BossState {
    private previous: BossStates;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        super.onEnter(options);
        (<AnimatedSprite> this.owner).animation.play("GLUTTONY_TFORM", false);
        this.previous = options.previous;
        this.owner.position = new Vec2(1040, 656);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("GLUTTONY_TFORM")) {
            this.finished(BossStates.GLUTTONY_IDLE);
        }
    }

    onExit(): Record<string, any> {
        this.owner.removePhysics();
        this.owner.addPhysics(this.parent.gluttony_hitbox, this.parent.gluttony_hitbox_offset);
        this.owner.setGroup("enemy");
        this.owner.setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.GLUTTONY_TRANSFORM};
    }

}
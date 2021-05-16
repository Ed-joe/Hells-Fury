import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Timer from "../../Wolfie2D/Timing/Timer";
import { Game_Events } from "../../GameSystems/game_enums";

export default class EnvyTransform extends BossState {
    private previous: BossStates;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        super.onEnter(options);
        (<AnimatedSprite> this.owner).animation.play("ENVY_TFORM", false);
        this.previous = options.previous;
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("ENVY_TFORM")) {
            this.finished(BossStates.ENVY_WALK);
        }
    }

    onExit(): Record<string, any> {
        this.owner.removePhysics();
        this.owner.addPhysics(this.parent.envy_hitbox, this.parent.envy_hitbox_offset);
        this.owner.setGroup("enemy");
        this.owner.setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.ENVY_TRANSFORM};
    }

}
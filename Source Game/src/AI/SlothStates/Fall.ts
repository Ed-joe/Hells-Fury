import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import SlothAI, { BossStates } from "../SlothAI";
import { Game_Events } from "../../GameSystems/game_enums";

export default class Fall extends BossState {
    constructor(parent: SlothAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("CATCH", false);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(!this.owner.animation.isPlaying("CATCH")){
            this.finished(BossStates.WALK);
        }
    }

    onExit(): Record<string, any> {
        console.log("physics back");
        this.owner.removePhysics();
        this.owner.addPhysics(this.parent.hitbox);
        this.owner.setGroup("enemy");
        this.owner.setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
        this.owner.animation.stop();
        return {};
    }

}
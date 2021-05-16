import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import SlothAI, { BossStates } from "../SlothAI";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";

export default class MovingShadow extends BossState {
    constructor(parent: SlothAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        console.log("no physics");
        this.owner.removePhysics();
        this.owner.addPhysics(new AABB(Vec2.ZERO, new Vec2(1, 1)), new Vec2(500, 500));
        this.owner.setGroup("wall");
        this.owner.animation.play("SHADOW", true);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        let player_pos = this.parent.player.position;
        if (this.owner.position.distanceTo(player_pos) < 16) {
            this.finished(BossStates.FALL);
        }
        this.owner.move(this.owner.position.dirTo(player_pos).normalize().scale(6));
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import GluttonyAI, { BossStates } from "../GluttonyAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Damage extends BossState {
    constructor(parent: GluttonyAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "gluttony_damage", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("DAMAGE", false);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(!(<AnimatedSprite> this.owner).animation.isPlaying("DAMAGE")) {
            this.finished(BossStates.DEFAULT);
        }
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {"timer": 25};
    }

}
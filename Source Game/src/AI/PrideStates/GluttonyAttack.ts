import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Weapon from "../../GameSystems/Weapon";
import { Game_Events } from "../../GameSystems/game_enums";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class GluttonyAttack extends BossState {
    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "gluttony_charge", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("GLUTTONY_ATTACK", false, Game_Events.GLUT_ATTACK);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        
    }

    onExit(): Record<string, any> {
        return {previous: BossStates.GLUTTONY_ATTACK};
    }

}
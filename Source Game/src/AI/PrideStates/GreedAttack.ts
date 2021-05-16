import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import { Game_Events } from "../../GameSystems/game_enums";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class GreedAttack extends BossState {
    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("GREED_ATTACK", false, Game_Events.GREED_ATTACK);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
    }

    onExit(): Record<string, any> {
        return {previous: BossStates.GREED_ATTACK};
    }

}
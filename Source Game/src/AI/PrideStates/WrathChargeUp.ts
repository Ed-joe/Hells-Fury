import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import { Game_Events } from "../../GameSystems/game_enums";

export default class WrathChargeUp extends BossState {
    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("WRATH_CHARGE_UP", false, Game_Events.PRIDE_WRATH_ATTACK_UP);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("WRATH_CHARGE_UP")) {
            this.finished(BossStates.WRATH_ATTACK_UP)
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {previous: BossStates.WRATH_CHARGE_UP};
    }

}
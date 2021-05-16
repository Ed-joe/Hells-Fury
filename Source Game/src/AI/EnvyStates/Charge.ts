import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import EnvyAI, { BossStates } from "../EnvyAI";
import { Game_Events } from "../../GameSystems/game_enums";

export default class Charge extends BossState {
    constructor(parent: EnvyAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("CHARGE", false);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("CHARGE")) {
            this.finished(BossStates.ATTACKING)
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
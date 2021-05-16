import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import { Game_Events } from "../../GameSystems/game_enums";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class EnvyCharge extends BossState {
    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "envy_charge", loop: false, holdReference: false});
        this.owner.animation.play("ENVY_CHARGE", false, Game_Events.ENVY_PUNCH);

        // update rotation for attacking
        this.parent.punch_direction = this.owner.position.dirTo(this.parent.player.position);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("ENVY_CHARGE")) {
            this.finished(BossStates.ENVY_ATTACK)
        }
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {previous: BossStates.ENVY_CHARGE};
    }

}
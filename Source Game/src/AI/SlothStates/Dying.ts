import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import SlothAI, { BossStates } from "../SlothAI";
import { Game_Events } from "../../GameSystems/game_enums";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Dying extends BossState {
    constructor(parent: SlothAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "sloth_death", loop: false, holdReference: false});
        this.owner.animation.play("DYING", false, Game_Events.BOSS_DIED);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
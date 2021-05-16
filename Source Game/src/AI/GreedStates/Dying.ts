import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import GreedAI, { BossStates } from "../GreedAI";
import { Game_Events } from "../../GameSystems/game_enums"
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Damage extends BossState {

    // The return object for this state
    retObj: Record<string, any>;

    constructor(parent: GreedAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "greed_death", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("DYING", false, Game_Events.BOSS_DIED);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {};
    }

}
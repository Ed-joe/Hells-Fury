import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import GreedAI, { BossStates } from "../GreedAI";
import { Game_Events } from "../../GameSystems/game_enums";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Attack extends BossState {
    // Timers for managing this state
    pollTimer: Timer;
    exitTimer: Timer;

    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: GreedAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "greed_attack", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("ATTACK", false, Game_Events.GREED_ATTACK);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
    }

    onExit(): Record<string, any> {
        return {};
    }

}
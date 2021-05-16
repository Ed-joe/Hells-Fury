import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import GluttonyAI, { BossStates } from "../GluttonyAI";
import Weapon from "../../GameSystems/Weapon";
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

    constructor(parent: GluttonyAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "gluttony_charge", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("ATTACK", false, Game_Events.GLUT_ATTACK);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        
    }

    onExit(): Record<string, any> {
        return {};
    }

}
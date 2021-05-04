import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import LustAI, { BossStates } from "../LustAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import { Game_Events } from "../../GameSystems/game_enums"

export default class Damage extends BossState {

    // The return object for this state
    retObj: Record<string, any>;

    constructor(parent: LustAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.parent.handleEvent(new GameEvent("LustDeath", {}));
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "lust_death", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("DYING", false, Game_Events.BOSS_DIED);
        // Reset the return object
        this.retObj = {};
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return this.retObj;
    }

}
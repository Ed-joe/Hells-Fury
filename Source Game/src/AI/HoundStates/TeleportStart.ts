import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import HoundAI, { EnemyStates } from "../HoundAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { Game_Events } from "../../GameSystems/game_enums";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";

export default class TeleportStart extends EnemyState {
    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: HoundAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("SINK", false, Game_Events.HELLHOUND_TP_START);
        this.lastPlayerPos = this.parent.player.position;
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(!this.owner.animation.isPlaying("SINK")) {
            this.finished(EnemyStates.TELEPORT_END);
        }
    }

    onExit(): Record<string, any> {
        this.owner.removePhysics();
        this.owner.addPhysics(new AABB(Vec2.ZERO, new Vec2(1, 1)), new Vec2(500, 500));
        this.owner.setGroup("wall");
        this.owner.position = new Vec2(this.lastPlayerPos.x, this.lastPlayerPos.y);
        return {}
    }

}
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import HoundAI, { EnemyStates } from "../HoundAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { Game_Events } from "../../GameSystems/game_enums";

export default class TeleportStart extends EnemyState {
    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: HoundAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("ATTACK", true);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        // update last player position
        if(this.parent.getPlayerPosition() !== null && this.parent.getPlayerPosition() !== undefined) {
            this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
        } else {
            this.finished(EnemyStates.DEFAULT);
        }

        // if can't see player go idle
        if(this.lastPlayerPos === null) {
            this.finished(EnemyStates.DEFAULT);
        } else if (this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 10) {
            this.finished(EnemyStates.DEFAULT);
        }

        // flip if player on left of hound
        this.owner.invertX = this.lastPlayerPos.x < this.owner.position.x;

        // if player is too far, run/teleport
        if(this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 6) {
            this.finished(EnemyStates.TELEPORT_START);
        } else if(this.owner.position.distanceTo(this.lastPlayerPos) > 32 * 1) {
            this.finished(EnemyStates.RUN);
        }
    }

    onExit(): Record<string, any> {
        return {}
    }
}
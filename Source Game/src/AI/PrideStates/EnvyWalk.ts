import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Weapon from "../../GameSystems/Weapon";
import { Game_Events } from "../../GameSystems/game_enums";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class EnvyWalk extends BossState {
    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("ENVY_WALK", true);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        super.update(deltaT);

        if(this.parent.getPlayerPosition() !== null && this.owner.position.distanceTo(this.parent.getPlayerPosition()) < 64){
            this.finished(BossStates.ENVY_CHARGE);
        }
        if(this.parent.getPlayerPosition() !== null){
            this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
            // Player is visible, restart the exitTimer
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(4));
            if(this.owner._velocity.x < 0) {
                this.owner.invertX = true;
            }
            else {
                this.owner.invertX = false;
            }
        }
    }

    onExit(): Record<string, any> {
        return {previous: BossStates.ENVY_WALK};
    }

}
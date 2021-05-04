import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import LustAI, { BossStates } from "../LustAI";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Attack extends BossState {

    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: LustAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null){
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "lust_move", loop: false, holdReference: false})
            this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
            // Player is visible, restart the exitTimer
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(3.5));
            if(Math.abs(this.owner._velocity.x) > Math.abs(this.owner._velocity.y)) {
                this.owner.animation.playIfNotAlready("WALK_RL", true);
                if(this.owner._velocity.x < 0) {
                    this.owner.invertX = true;
                }
                else {
                    this.owner.invertX = false;
                }
            }
            else {
                if(this.owner._velocity.y > 0) {
                    this.owner.animation.playIfNotAlready("WALK_DOWN", true);
                }
                else {
                    this.owner.animation.playIfNotAlready("WALK_UP", true);
                }
            }
        }
    }

    onExit(): Record<string, any> {
        return {}
    }

}
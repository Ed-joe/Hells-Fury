import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import PrideAI, { BossStates } from "../PrideAI";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class LustAttack extends BossState {

    // The last known position of the player
    lastPlayerPos: Vec2;

    soundTimer: Timer;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);

        this. soundTimer = new Timer(3000);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "lust_move", loop: false, holdReference: false});
        this.soundTimer.start();
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        super.update(deltaT);

        this.lastPlayerPos = new Vec2(this.parent.player.position.x, this.parent.player.position.y);

        if(this.soundTimer.isStopped()) {
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "lust_move", loop: false, holdReference: false});
            this.soundTimer.start();
        }
        if(this.lastPlayerPos !== null){
            // Player is visible, restart the exitTimer
            this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(2));
            if(Math.abs(this.owner._velocity.x) > Math.abs(this.owner._velocity.y)) {
                this.owner.animation.playIfNotAlready("LUST_WALK_RL", true);
                if(this.owner._velocity.x < 0) {
                    this.owner.invertX = true;
                }
                else {
                    this.owner.invertX = false;
                }
            }
            else {
                if(this.owner._velocity.y > 0) {
                    this.owner.animation.playIfNotAlready("LUST_WALK_DOWN", true);
                }
                else {
                    this.owner.animation.playIfNotAlready("LUST_WALK_UP", true);
                }
            }
        }
    }

    onExit(): Record<string, any> {
        return {previous: BossStates.LUST_ATTACK};
    }

}
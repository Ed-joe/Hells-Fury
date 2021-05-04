import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import LustAI, { BossStates } from "../LustAI";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class Attack extends BossState {
    // Timers for managing this state
    exitTimer: Timer;

    resetTimer: Timer;

    // The last known position of the player
    lastPlayerPos: Vec2;
    
    //Done Moving
    doneMoving: boolean;

    constructor(parent: LustAI, owner: AnimatedSprite){
        super(parent, owner);

        // Regularly update the player location
        this.exitTimer = new Timer(1000);
        this.resetTimer = new Timer(2000);
    }

    onEnter(options: Record<string, any>): void {
        this.resetTimer.start();
        this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null){
            this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
            // Player is visible, restart the exitTimer
            this.exitTimer.start();
            if(!this.doneMoving){
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
                if(this.resetTimer.isStopped()) {
                    this.finished(BossStates.DEFAULT);
                }
                if(this.owner.position.distanceTo(this.lastPlayerPos) < 5) {
                    this.doneMoving = true;
                }
                this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(3.5));
            }
            else {
                this.resetTimer.start();
                this.doneMoving = false;
            }
        }

        if(this.exitTimer.isStopped()){
            // We haven't seen the player in a while, go check out where we last saw them, if possible
                this.finished(BossStates.DEFAULT);
        }
    }

    onExit(): Record<string, any> {
        return {}
    }

}
import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BatAI, { EnemyStates } from "../BatAI";
import EnemyState from "./EnemyState";

export default class Attack extends EnemyState {
    // Timers for managing this state
    exitTimer: Timer;

    resetTimer: Timer;

    // The last known position of the player
    lastPlayerPos: Vec2;
    
    //Done Moving
    doneMoving: boolean;

    constructor(parent: BatAI, owner: AnimatedSprite){
        super(parent, owner);

        // Regularly update the player location
        this.exitTimer = new Timer(1000);
        this.resetTimer = new Timer(2000);
    }

    onEnter(options: Record<string, any>): void {
        this.resetTimer.start();
        (<AnimatedSprite> this.owner).animation.play("ATTACK", true);
        this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null){
            // Player is visible, restart the exitTimer
            this.exitTimer.start();
            if(!this.doneMoving){
                this.owner.invertX = this.owner._velocity.x < 0;
                if(this.resetTimer.isStopped()) {
                    this.finished(EnemyStates.DEFAULT);
                }
                if(this.owner.position.distanceTo(this.lastPlayerPos) < 5) {
                    this.doneMoving = true;
                }
                this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(3));
            }
            else {
                this.resetTimer.start();
                this.doneMoving = false;
                this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
            }
        }

        if(this.exitTimer.isStopped()){
            // We haven't seen the player in a while, go check out where we last saw them, if possible
                this.finished(EnemyStates.DEFAULT);
        }
    }

    onExit(): Record<string, any> {
        return {}
    }

}
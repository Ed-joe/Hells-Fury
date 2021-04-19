import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BatAI, { EnemyStates } from "../BatAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class Attack extends EnemyState {
    // Timers for managing this state
    exitTimer: Timer;

    // The last known position of the player
    lastPlayerPos: Vec2;

    // The return object for this state
    retObj: Record<string, any>;

    //Done Moving
    doneMoving: boolean;

    constructor(parent: BatAI, owner: GameNode){
        super(parent, owner);

        // Regularly update the player location
        this.exitTimer = new Timer(1000);
    }

    onEnter(options: Record<string, any>): void {
        console.log("BATTACK");
        (<AnimatedSprite> this.owner).animation.play("ATTACK", true);
        this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
        // Reset the return object
        this.retObj = {};
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null){
            // Player is visible, restart the exitTimer
            this.exitTimer.start();
            if(!this.doneMoving){
                // this.isDashing = true;
                if(this.owner.position.distanceTo(this.lastPlayerPos) < 5) {
                    this.doneMoving = true;
                }
                this.owner.move(this.owner.position.dirTo(this.lastPlayerPos).scale(3.5));
            }
            else {
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
        return this.retObj;
    }

}
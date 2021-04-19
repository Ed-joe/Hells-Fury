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
    pollTimer: Timer;
    exitTimer: Timer;

    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    // The return object for this state
    retObj: Record<string, any>;

    constructor(parent: BatAI, owner: GameNode){
        super(parent, owner);

        // Regularly update the player location
        this.pollTimer = new Timer(100);

        this.exitTimer = new Timer(1000);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("IDLE", true);
        this.lastPlayerPos = this.parent.getPlayerPosition();
        // Reset the return object
        this.retObj = {};
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(this.pollTimer.isStopped()){
            // Restart the timer
            this.pollTimer.start();

            this.playerPos = this.parent.getPlayerPosition();

            if(this.playerPos !== null){
                // If we see a new player position, update the last position
                this.lastPlayerPos = this.playerPos;
            }
        }

        if(this.playerPos !== null){
            // Player is visible, restart the exitTimer
            this.exitTimer.start();

            // Face player
            let dir = this.playerPos.clone().sub(this.owner.position).normalize();
            dir.rotateCCW(Math.PI / 4 * Math.random() - Math.PI/8);
            this.owner.rotation = Vec2.UP.angleToCCW(dir);
        }

        if(this.exitTimer.isStopped()){
            // We haven't seen the player in a while, go check out where we last saw them, if possible
            if(this.lastPlayerPos !== null){

            } else {
                this.finished(EnemyStates.IDLE);
            }
        }
    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}
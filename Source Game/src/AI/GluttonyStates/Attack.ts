import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import GluttonyAI, { BossStates } from "../GluttonyAI";
import Weapon from "../../GameSystems/Weapon";
import { Game_Events } from "../../GameSystems/game_enums";

export default class Attack extends BossState {
    // Timers for managing this state
    pollTimer: Timer;
    exitTimer: Timer;

    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    // The return object for this state
    retObj: Record<string, any>;

    smash: Weapon;

    constructor(parent: GluttonyAI, owner: GameNode){
        super(parent, owner);

        // Regularly update the player location
        this.pollTimer = new Timer(100);

        this.exitTimer = new Timer(1000);
    }

    onEnter(options: Record<string, any>): void {
        console.log("Attack state enter");
        this.exitTimer.start();
        this.smash = this.parent.slam;
        (<AnimatedSprite> this.owner).animation.play("ATTACK", false, Game_Events.GLUT_ATTACK);
        this.lastPlayerPos = this.parent.getPlayerPosition();
        // Reset the return object
        this.retObj = {};
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {

        if(this.parent.slam != undefined) {
            this.smash = this.parent.slam;
        }

        if(this.parent.getPlayerPosition() !== null && this.owner.position.distanceTo(this.parent.getPlayerPosition()) < 180){
            // Player is nearby, restart the exitTimer
            this.exitTimer.start();
        }

        if(this.exitTimer.isStopped()){
            this.finished(BossStates.DEFAULT);
        }
    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}
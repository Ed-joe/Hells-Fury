import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import Coin_EnemyAI, { EnemyStates } from "../Coin_EnemyAI";
import EnemyState from "./EnemyState";
import Game from "../../Wolfie2D/Loop/Game";
import { Game_Events } from "../../GameSystems/game_enums";

export default class Attack extends EnemyState {
    // Timers for managing this state
    deleteTimer: Timer;

    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: Coin_EnemyAI, owner: AnimatedSprite){
        super(parent, owner);

        // Regularly update the player location
        this.deleteTimer= new Timer(15000);
    }

    onEnter(options: Record<string, any>): void {
        this.deleteTimer.start();
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {        
        if(Math.abs(this.parent.start_velocity.x) > 0) {
            this.parent.start_velocity.x -= this.parent.start_velocity.normalized().scale(this.parent.speed * deltaT).x / 15;
        }
        if(Math.abs(this.parent.start_velocity.y) > 0) {
            this.parent.start_velocity.y -= this.parent.start_velocity.normalized().scale(this.parent.speed * deltaT).y / 15;
        }
        console.log()
        if(this.parent.start_velocity.mag() < .05 && this.deleteTimer.isStopped()){
            this.owner.destroy();
        }
        this.owner.move(this.parent.start_velocity);
    }

    onExit(): Record<string, any> {
        return {}
    }

}
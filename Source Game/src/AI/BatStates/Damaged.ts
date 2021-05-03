import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import OrthogonalTilemap from "./../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "./../../Wolfie2D/Timing/Timer";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import BatAI, { EnemyStates } from "../BatAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Damaged extends EnemyState {

    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: BatAI, owner: GameNode){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "bat_damage", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("DAMAGE", false);
        this.lastPlayerPos = this.parent.getPlayerPosition();
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(!(<AnimatedSprite> this.owner).animation.isPlaying("DAMAGE")) {
            this.finished(EnemyStates.DEFAULT);
        }
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {};
    }

}
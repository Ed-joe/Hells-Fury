import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import HoundAI, { EnemyStates } from "../HoundAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { Game_Events } from "../../GameSystems/game_enums";

export default class TeleportEnd extends EnemyState {
    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: HoundAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        console.log("hound end tp");
        this.owner.animation.play("EMERGE", false, Game_Events.HELLHOUND_TP_START);
        this.lastPlayerPos = new Vec2(this.parent.getPlayerPosition().x, this.parent.getPlayerPosition().y);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(!this.owner.animation.isPlaying("EMERGE")) {
            this.finished(EnemyStates.ATTACK);
        }
    }

    onExit(): Record<string, any> {
        return {}
    }

}
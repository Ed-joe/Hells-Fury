import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import EnvyAI, { BossStates } from "../EnvyAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Attack extends BossState {
    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: EnvyAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "envy_attack", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("ATTACK", false);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        
    }

    onExit(): Record<string, any> {
        return {};
    }

}
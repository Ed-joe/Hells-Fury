import AABB from "./../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class EnvyAttack extends BossState {
    // The last known position of the player
    lastPlayerPos: Vec2;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "envy_attack", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("ENVY_PUNCH", false);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if (!this.owner.animation.isPlaying("ENVY_PUNCH")) {
            this.finished(BossStates.ENVY_WALK);
        }
    }

    onExit(): Record<string, any> {
        return {previous: BossStates.ENVY_WALK};
    }

}
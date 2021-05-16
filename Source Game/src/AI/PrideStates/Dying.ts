import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Timer from "../../Wolfie2D/Timing/Timer";
import { Game_Events } from "../../GameSystems/game_enums";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class Dying extends BossState {
    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "pride_death", loop: false, holdReference: false});
        (<AnimatedSprite> this.owner).animation.play("DYING", false, Game_Events.BOSS_DIED);
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.DYING};
    }

}
import { Game_Events } from "../../GameSystems/game_enums";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class Dying extends PlayerState {
    owner: AnimatedSprite;

    onEnter(options: Record<string, any>): void {
        // console.log("enter damage");
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "zara_death", loop: false, holdReference: false})
        this.owner.animation.play("DYING", false, Game_Events.GAME_OVER);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        
    }

    onExit(): Record<string, any> {
        // console.log("exit damage");
        this.owner.animation.stop();
        return {};
    }
}
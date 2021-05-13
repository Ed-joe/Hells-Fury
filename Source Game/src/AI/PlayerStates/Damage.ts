import { Game_Events } from "../../GameSystems/game_enums";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class Damage extends PlayerState {
    owner: AnimatedSprite;

    onEnter(options: Record<string, any>): void {
        // console.log("enter damage");
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "zara_damage", loop: false, holdReference: false})
        this.owner.animation.play("DAMAGE", false, Game_Events.IFRAMES_OVER);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        if(!this.owner.frozen) {
            // have player face mouse
            let mouse_position = Input.getGlobalMousePosition();
            if(mouse_position.x < this.owner.position.x) {
                this.owner.invertX = true;
            } else {
                this.owner.invertX = false;
            }

            // punch attack
            if(Input.isMouseJustPressed()) { 
                let attack_success;
                if (this.parent.player_damage === 1) {
                    attack_success = this.parent.fists[0].use(this.owner, "player", this.parent.attack_direction);
                } else if (this.parent.player_damage === 2) {
                    attack_success = this.parent.fists[1].use(this.owner, "player", this.parent.attack_direction);
                } else {
                    attack_success = this.parent.fists[2].use(this.owner, "player", this.parent.attack_direction);
                }
                

                if(attack_success) {
                    this.finished(PlayerStates.ATTACK);
                }
            }

            // normal movement should continue during attacking state
            let dir = this.getInputDirection();

            if(this.parent.slippery) {
                // slippery movement
                if(dir.x !== 0) {this.parent.curr_velocity.x += dir.normalized().scale(this.parent.speed * deltaT).x / 20;}
                else {this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;}
                if(dir.y !== 0) {this.parent.curr_velocity.y += dir.normalized().scale(this.parent.speed * deltaT).y / 20;}
                else {this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;}

                if(this.parent.curr_velocity.mag() > 3) {
                    this.parent.curr_velocity = this.parent.curr_velocity.normalized().scale(3);
                }
            } else {
                // normal movement
                this.parent.curr_velocity = dir.normalized().scale(this.parent.speed * deltaT);
            }
        }

        super.update(deltaT);
    }

    onExit(): Record<string, any> {
        // console.log("exit damage");
        this.owner.animation.stop();
        return {};
    }
}
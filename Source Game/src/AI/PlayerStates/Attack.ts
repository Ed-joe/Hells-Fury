import { Game_Events } from "../../GameSystems/game_enums";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class Attack extends PlayerState {
    owner: AnimatedSprite;

    onEnter(options: Record<string, any>): void {
        // console.log("enter attack");
        this.owner.animation.play("ATTACK", false, Game_Events.ATTACK_OVER);
    }

    handleInput(event: GameEvent): void {
        if(event.type === Game_Events.ATTACK_OVER) {
            this.finished(PlayerStates.WALK);
        }
    }

    update(deltaT: number): void {
        if(!this.owner.frozen) {
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
        // console.log("exit attack");
        this.owner.animation.stop();
        return {};
    }
}
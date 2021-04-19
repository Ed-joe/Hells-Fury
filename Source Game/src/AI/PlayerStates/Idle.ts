import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState"
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";

export default class Idle extends PlayerState {
    onEnter(options: Record<string, any>): void {
        
        if(this.parent.slippery && (Math.abs(this.parent.curr_velocity.x) > 0 || Math.abs(this.parent.curr_velocity.y) > 0)) {
            console.log("play walk idle animation");
            this.owner.animation.play("WALK", true);
        } else {
            console.log("play idle idle animation");
            this.owner.animation.play("IDLE", true);
        }
        if(!this.parent.slippery) {this.parent.curr_velocity = Vec2.ZERO;}
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
        // have player face left or right
        let mouse_position = Input.getGlobalMousePosition();
        if(mouse_position.x < this.owner.position.x) {
            this.owner.invertX = true;
        } else {
            this.owner.invertX = false;
        }

        // go to new state if there is input
        if(Input.isMousePressed()) {
            this.finished(PlayerStates.ATTACK);
        }
        if(Input.isPressed("up") || Input.isPressed("down") || Input.isPressed("left") || Input.isPressed("right")) {
            this.finished(PlayerStates.WALK);
        }
        

        // update velocity based on slippery
        if(this.parent.slippery && (Math.abs(this.parent.curr_velocity.x) > 0 || Math.abs(this.parent.curr_velocity.y) > 0)) {
            // slide a bit
            this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;
            this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;

            if(Math.abs(this.parent.curr_velocity.x) < .05) {this.parent.curr_velocity.x = 0;}
            if(Math.abs(this.parent.curr_velocity.y) < .05) {this.parent.curr_velocity.y = 0;}
        } else {
            // play idle animation if not already playing it
            this.owner.animation.playIfNotAlready("IDLE", true);
        }

        super.update(deltaT);
    }

    onExit(): Record<string, any> {
        console.log("exit idle");
        this.owner.animation.stop();
        return {};
    }
}
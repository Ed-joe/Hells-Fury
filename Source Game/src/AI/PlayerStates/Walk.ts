import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState"

export default class Walk extends PlayerState {
    onEnter(options: Record<string, any>): void {
        console.log("play walk animation");
        this.owner.animation.play("WALK", true);
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
        
        let dir = this.getInputDirection();

        if(dir.isZero()) {
            this.finished(PlayerStates.IDLE);
        }

        if(this.parent.slippery) {
            // slippery movement
            if(dir.x !== 0) {this.parent.curr_velocity.x += dir.normalized().scale(this.parent.speed * deltaT).x / 20;}
            else {this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;}
            if(dir.y !== 0) {this.parent.curr_velocity.y += dir.normalized().scale(this.parent.speed * deltaT).y / 20;}
            else {this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;}

            this.owner.move(this.parent.curr_velocity);
        } else {
            // normal movement
            this.parent.curr_velocity = dir.normalized().scale(this.parent.speed * deltaT)
        }

        super.update(deltaT);
    }

    onExit(): Record<string, any> {
        console.log("exit walk");
        return {};
    }
}
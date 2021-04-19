import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState"

export default class Attack extends PlayerState {
    onEnter(options: Record<string, any>): void {
        console.log("play attack");
        this.owner.animation.play("ATTACK", false);
    }

    handleInput(event: GameEvent): void {}

    update(deltaT: number): void {
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
        console.log("exit attack");
        this.owner.animation.stop();
        return {};
    }
}
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { PlayerStates } from "../PlayerController";
import { Game_Events } from "../../GameSystems/game_enums"
import PlayerState from "./PlayerState";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2"

export default class Idle extends PlayerState{
    owner: AnimatedSprite;

    onEnter(options: Record<string, any>): void {
        console.log("enter idle");
        this.owner.animation.play("IDLE", true);
        // if not slippery velocity should be zero for this state
        if(!this.parent.slippery) {
            this.parent.curr_velocity = Vec2.ZERO;
        }
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

        // punch attack
        if(Input.isMouseJustPressed()) { 
            let attack_success = this.parent.fist.use(this.owner, "player", this.parent.attack_direction);

            if(attack_success) {
                this.finished(PlayerStates.ATTACK);
            }
        }

        let dir = this.getInputDirection();

        if(!dir.isZero()) {
            this.finished(PlayerStates.WALK);
        }

        if(this.parent.slippery) {
            // slide a bit
            if(Math.abs(this.parent.curr_velocity.x) > 0) {
                this.parent.curr_velocity.x -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).x / 40;
            }
            if(Math.abs(this.parent.curr_velocity.y) > 0) {
                this.parent.curr_velocity.y -= this.parent.curr_velocity.normalized().scale(this.parent.speed * deltaT).y / 40;
            }
            // make sure the player comes to a complete stop
            if(Math.abs(this.parent.curr_velocity.x) < .05) {this.parent.curr_velocity.x = 0;}
            if(Math.abs(this.parent.curr_velocity.y) < .05) {this.parent.curr_velocity.y = 0;}
        }
        super.update(deltaT);
    }

    onExit(): Record<string, any> {
        console.log("exit idle");
        this.owner.animation.stop();
        return {};
    }
}
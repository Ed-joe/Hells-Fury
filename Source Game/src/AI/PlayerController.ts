import AI from "../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../Wolfie2D/Timing/Timer";

export default class PlayerController implements AI {
    // fields from BattlerAI
    health: number;

    // player sprite
    owner: AnimatedSprite;

    // Movement
    private direction: Vec2;
    private curr_velocity: Vec2;
    private speed: number;

    // Attacking
    private attack_direction: Vec2;

    // unique level functionalities
    private slippery: boolean;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner
        this.direction = Vec2.ZERO;
        this.curr_velocity = Vec2.ZERO;         // for use with slippery movement
        this.attack_direction = Vec2.ZERO;
        this.speed = options.speed;
        this.health = 5;
        this.slippery = options.slippery !== undefined ? options.slippery : false;
    }

    activate(options: Record<string, any>): void {}

    handleEvent(event: GameEvent): void {}

    update(deltaT: number): void {
        // get the movement direction
        this.direction.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
        this.direction.y = (Input.isPressed("up") ? -1 : 0) + (Input.isPressed("down") ? 1 : 0);

        if(!this.direction.isZero()) {
            if(this.slippery) {
                // slippery movement
                if(this.direction.x !== 0) {this.curr_velocity.x += this.direction.normalized().scale(this.speed * deltaT).x / 20;}
                else {this.curr_velocity.x -= this.curr_velocity.normalized().scale(this.speed * deltaT).x / 40;}
                if(this.direction.y !== 0) {this.curr_velocity.y += this.direction.normalized().scale(this.speed * deltaT).y / 20;}
                else {this.curr_velocity.y -= this.curr_velocity.normalized().scale(this.speed * deltaT).y / 40;}

                this.owner.move(this.curr_velocity);
                this.owner.animation.playIfNotAlready("WALK", true);
            } else {
                // normal movement
                this.owner.move(this.direction.normalized().scale(this.speed * deltaT));
                this.owner.animation.playIfNotAlready("WALK", true);
            }
            
        } else {
            // Player is idle
            if(this.slippery && (Math.abs(this.curr_velocity.x) > 0 || Math.abs(this.curr_velocity.y) > 0)) {
                // slide a bit
                // console.log("slide cap up");

                this.curr_velocity.x -= this.curr_velocity.normalized().scale(this.speed * deltaT).x / 40;
                this.curr_velocity.y -= this.curr_velocity.normalized().scale(this.speed * deltaT).y / 40;

                if(Math.abs(this.curr_velocity.x) < .05) {this.curr_velocity.x = 0;}
                if(Math.abs(this.curr_velocity.y) < .05) {this.curr_velocity.y = 0;}

                this.owner.move(this.curr_velocity);
                this.owner.animation.playIfNotAlready("WALK", true);
            } else {
                this.owner.animation.playIfNotAlready("IDLE", true);
            }
        }

        // Get the unit vector in the attack direction
        this.attack_direction = this.owner.position.dirTo(Input.getGlobalMousePosition());

        // punch attack
        if(Input.isMouseJustPressed()) {
            // TODO PROJECT - implement punch attack here
            console.log("punch event");
        }

        // have player face left or right
        let mouse_position = Input.getGlobalMousePosition();
        if(mouse_position.x < this.owner.position.x) {
            this.owner.invertX = true;
        }

        
    }

    damage(damage: number): void {
        this.health -= damage;
        if(this.health <= 0) {
            console.log("Game Over");
        }
    }

    destroy() {
        delete this.owner;
    }
}
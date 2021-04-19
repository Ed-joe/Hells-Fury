import StateMachineAI from "../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import InputHandler from "../Wolfie2D/Input/InputHandler";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../Wolfie2D/Timing/Timer";
// import Idle from "./PlayerStates/Idle";
// import Walk from "./PlayerStates/Walk";
// import Attack from "./PlayerStates/Attack";
import AI from "../Wolfie2D/DataTypes/Interfaces/AI";
// import Damage from "./PlayerStates/Damage";

export enum PlayerStates {
    IDLE = "idle",
    WALK = "walk",
    ATTACK = "attack",
    DAMAGE = "damage"
}

export default class PlayerController implements AI {
    // fields from BattlerAI
    health: number;

    // player sprite
    owner: AnimatedSprite;

    // Movement
    direction: Vec2;
    curr_velocity: Vec2;
    speed: number;

    // Attacking
    attack_direction: Vec2;

    // unique level functionalities
    slippery: boolean;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner
        this.direction = Vec2.ZERO;
        this.curr_velocity = Vec2.ZERO;         // for use with slippery movement
        this.attack_direction = Vec2.ZERO;
        this.speed = options.speed;
        this.health = 5;
        this.slippery = options.slippery !== undefined ? options.slippery : false;

        // // add states
        // let idle = new Idle(this, this.owner);
        // this.addState(PlayerStates.IDLE, idle);
        // let walk = new Walk(this, this.owner);
        // this.addState(PlayerStates.WALK, walk);
        // let attack = new Attack(this, this.owner);
        // this.addState(PlayerStates.ATTACK, attack);
        // // let damage = new Damage(this, this.owner);
        // // this.addState(PlayerStates.DAMAGE, damage);

        // this.initialize(PlayerStates.IDLE);
    }

    // changeState(stateName: string): void {
    //     super.changeState(stateName);
    // }

    // update(deltaT: number): void {
    //     super.update(deltaT);
    // }

    activate(options: Record<string, any>): void {}

    handleEvent(event: GameEvent): void {}

    update(deltaT: number): void {
        // get the movement direction
        this.direction.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
        this.direction.y = (Input.isPressed("up") ? -1 : 0) + (Input.isPressed("down") ? 1 : 0);

        if(!this.direction.isZero() && !this.owner.animation.isPlaying("ATTACK")) {
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
            // no movement input
            if(this.slippery && (Math.abs(this.curr_velocity.x) > 0 || Math.abs(this.curr_velocity.y) > 0)) {
                // slide a bit
                this.curr_velocity.x -= this.curr_velocity.normalized().scale(this.speed * deltaT).x / 40;
                this.curr_velocity.y -= this.curr_velocity.normalized().scale(this.speed * deltaT).y / 40;

                if(Math.abs(this.curr_velocity.x) < .05) {this.curr_velocity.x = 0;}
                if(Math.abs(this.curr_velocity.y) < .05) {this.curr_velocity.y = 0;}

                this.owner.move(this.curr_velocity);
                if(!this.owner.animation.isPlaying("ATTACK")) {this.owner.animation.playIfNotAlready("WALK", true);}
            } else {
                // play idle animation
                if(!this.owner.animation.isPlaying("ATTACK")) {this.owner.animation.playIfNotAlready("IDLE", true);}
            }
        }

        // Get the unit vector in the attack direction
        this.attack_direction = this.owner.position.dirTo(Input.getGlobalMousePosition());

        // update rotation for attacking
        this.owner.attack_direction = Vec2.UP.angleToCCW(this.attack_direction);

        // punch attack
        if(!this.owner.animation.isPlaying("ATTACK") && Input.isMouseJustPressed()) {
            // TODO PROJECT - implement punch attack here
            console.log("punch event");
            this.owner.animation.play("ATTACK", false);
        }

        // have player face left or right
        if(!this.owner.animation.isPlaying("ATTACK")) {
            let mouse_position = Input.getGlobalMousePosition();
            if(mouse_position.x < this.owner.position.x) {
                this.owner.invertX = true;
            } else {
                this.owner.invertX = false;
            }
        }
    }

    destroy() {
        delete this.owner;
    }
}
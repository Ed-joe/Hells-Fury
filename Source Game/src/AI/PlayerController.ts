import StateMachineAI from "../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import InputHandler from "../Wolfie2D/Input/InputHandler";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../Wolfie2D/Timing/Timer";
import Item from "../GameSystems/Item";
import Weapon from "../GameSystems/Weapon";
import BattlerAI from "./BattlerAI";
import Emitter from "../Wolfie2D/Events/Emitter";
import { Game_Events } from "../GameSystems/game_enums"
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import Idle from "./PlayerStates/Idle";
import Walk from "./PlayerStates/Walk";
import Attack from "./PlayerStates/Attack";
import Damage from "./PlayerStates/Damage";
import Game from "../Wolfie2D/Loop/Game";

export enum PlayerStates {
    IDLE = "idle",
    WALK = "walk",
    ATTACK = "attack",
    DAMAGE = "damage"
}

export default class PlayerController extends StateMachineAI implements BattlerAI {
    // fields from BattlerAI
    health: number;
    health_sprites: Sprite[];

    // player sprite
    owner: AnimatedSprite;

    // fist item (for punching)
    fist: Weapon;

    // Movement
    direction: Vec2;
    curr_velocity: Vec2;
    speed: number;

    // Attacking
    attack_direction: Vec2;

    // coin count
    coins: number;

    // unique level functionalities
    slippery: boolean;

    // for i-frames
    invincible: boolean;
    invincible_cheat: boolean;

    // for emitting events
    emitter: Emitter;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner
        this.direction = Vec2.ZERO;
        this.curr_velocity = Vec2.ZERO;         // for use with slippery movement
        this.attack_direction = Vec2.ZERO;
        this.speed = options.speed;
        this.emitter = new Emitter();
        this.health_sprites = options.health_sprites;
        this.health = options.health;
        this.coins = options.coins;
        this.slippery = options.slippery !== undefined ? options.slippery : false;
        this.fist = options.fist;
        this.invincible_cheat = false;

        // initialize states
        this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
        this.addState(PlayerStates.WALK, new Walk(this, this.owner));
        this.addState(PlayerStates.DAMAGE, new Damage(this, this.owner));
        this.addState(PlayerStates.ATTACK, new Attack(this, this.owner));

        this.initialize(PlayerStates.IDLE);
    }

    changeState(stateName: string): void {
        super.changeState(stateName)
    }

    activate(options: Record<string, any>): void {}

    handleEvent(event: GameEvent): void {
        if(event.type === Game_Events.BAT_COLLISION) {
            // take 1 damage
            this.damage(1);
            this.invincible = true;
        }
        else if(event.type === Game_Events.BOSS_COLLISION) {
            // take 1 damage
            this.damage(1);
            this.invincible = true;
        }
        else if(event.type === Game_Events.IFRAMES_OVER) {
            this.invincible = false;
            this.changeState(PlayerStates.WALK);
        }
        else if(event.type === Game_Events.ATTACK_OVER) {
            this.changeState(PlayerStates.WALK);
        }
    }

    update(deltaT: number): void {
        super.update(deltaT);
    }

    // update(deltaT: number): void {
    //     if(Input.isJustPressed("invincible")) {
    //         this.invincible_cheat = !this.invincible_cheat;
    //         console.log("invincible: " + this.invincible_cheat);
    //     }

    //     if(!this.owner.frozen){
    //         // get the movement direction
    //         this.direction.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
    //         this.direction.y = (Input.isPressed("up") ? -1 : 0) + (Input.isPressed("down") ? 1 : 0);

    //         let dont_interrupt: boolean = this.owner.animation.isPlaying("ATTACK") || this.owner.animation.isPlaying("DAMAGE");

    //         if(!this.direction.isZero()) {
    //             if(this.slippery) {
    //                 // slippery movement
    //                 if(this.direction.x !== 0) {this.curr_velocity.x += this.direction.normalized().scale(this.speed * deltaT).x / 20;}
    //                 else {this.curr_velocity.x -= this.curr_velocity.normalized().scale(this.speed * deltaT).x / 40;}
    //                 if(this.direction.y !== 0) {this.curr_velocity.y += this.direction.normalized().scale(this.speed * deltaT).y / 20;}
    //                 else {this.curr_velocity.y -= this.curr_velocity.normalized().scale(this.speed * deltaT).y / 40;}

    //                 if(this.curr_velocity.mag() > 6) {
    //                     this.curr_velocity = this.curr_velocity.normalized().scale(6);
    //                 }

    //                 this.owner.move(this.curr_velocity);
    //             } else {
    //                 // normal movement
    //                 this.owner.move(this.direction.normalized().scale(this.speed * deltaT));
    //             }
    //             if (!dont_interrupt) {
    //                 this.owner.animation.playIfNotAlready("WALK", true);
    //             }
                
    //         } else {
    //             // no movement input
    //             if(this.slippery && (Math.abs(this.curr_velocity.x) > 0 || Math.abs(this.curr_velocity.y) > 0)) {
    //                 // slide a bit
    //                 this.curr_velocity.x -= this.curr_velocity.normalized().scale(this.speed * deltaT).x / 40;
    //                 this.curr_velocity.y -= this.curr_velocity.normalized().scale(this.speed * deltaT).y / 40;

    //                 if(Math.abs(this.curr_velocity.x) < .05) {this.curr_velocity.x = 0;}
    //                 if(Math.abs(this.curr_velocity.y) < .05) {this.curr_velocity.y = 0;}

    //                 this.owner.move(this.curr_velocity);
    //                 if(!dont_interrupt) {this.owner.animation.playIfNotAlready("IDLE", true);}
    //             } else {
    //                 // play idle animation
    //                 if(!dont_interrupt) {this.owner.animation.playIfNotAlready("IDLE", true);}
    //             }
    //         }

    //         // Get the unit vector in the attack direction
    //         this.attack_direction = this.owner.position.dirTo(Input.getGlobalMousePosition());

    //         // update rotation for attacking
    //         this.owner.attack_direction = Vec2.UP.angleToCCW(this.attack_direction);

    //         // punch attack
    //         if(!this.owner.animation.isPlaying("ATTACK") && Input.isMouseJustPressed()) {
                
    //             let attack_success = this.fist.use(this.owner, "player", this.attack_direction);

    //             if(attack_success) {
    //                 this.owner.animation.play("ATTACK", false, Game_Events.IFRAMES_OVER);
    //             }
    //         }

    //         // have player face left or right
    //         if(!this.owner.animation.isPlaying("ATTACK")) {
    //             let mouse_position = Input.getGlobalMousePosition();
    //             if(mouse_position.x < this.owner.position.x) {
    //                 this.owner.invertX = true;
    //             } else {
    //                 this.owner.invertX = false;
    //             }
    //         }
    //     }
        
    //     if(Input.isJustPressed("pause")){
    //         if(this.owner.getScene().getLayer("Pause").isHidden()){
    //             this.emitter.fireEvent(Game_Events.ON_PAUSE);
    //         }else{
    //             this.emitter.fireEvent(Game_Events.ON_UNPAUSE);
    //         }
    //     }
    // }

    damage(damage: number): void {
        if(!this.invincible && !this.invincible_cheat) {
            this.health -= damage;
            
            if(this.health <= 0){
                this.emitter.fireEvent(Game_Events.GAME_OVER, {});
            } else {
                this.changeState(PlayerStates.DAMAGE);
                this.health_sprites[this.health_sprites.length - 1].getLayer().removeNode(this.health_sprites[this.health_sprites.length - 1]);
                this.health_sprites.splice(this.health_sprites.length - 1, 1);
                // this.owner.animation.play("DAMAGE", false, Game_Events.IFRAMES_OVER);
                this.invincible = true;
            }
        }
    }

    destroy() {
        delete this.owner;
    }
}
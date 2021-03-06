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
import Dying from "./PlayerStates/Dying";
import Game from "../Wolfie2D/Loop/Game";
import Debug from "../Wolfie2D/Debug/Debug";
import Label from "../Wolfie2D/Nodes/UIElements/Label";

export enum PlayerStates {
    IDLE = "idle",
    WALK = "walk",
    ATTACK = "attack",
    DAMAGE = "damage",
    DYING = "dying"
}

export default class PlayerController extends StateMachineAI implements BattlerAI {
    // fields from BattlerAI
    health: number;
    health_sprites: Sprite[];

    player_damage: number;

    // player sprite
    owner: AnimatedSprite;

    // fist items (for punching)
    fists: Weapon[];

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
    invincible_cheat_label: Label;

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
        this.fists = options.fists;
        this.invincible_cheat = false;
        this.invincible = false;
        this.player_damage = options.damage;
        this.invincible_cheat_label = options.invincible_cheat_label;

        // initialize states
        this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
        this.addState(PlayerStates.WALK, new Walk(this, this.owner));
        this.addState(PlayerStates.DAMAGE, new Damage(this, this.owner));
        this.addState(PlayerStates.ATTACK, new Attack(this, this.owner));
        this.addState(PlayerStates.DYING, new Dying(this, this.owner));

        this.initialize(PlayerStates.IDLE);
    }

    changeState(stateName: string): void {
        super.changeState(stateName)
    }

    activate(options: Record<string, any>): void {}

    handleEvent(event: GameEvent): void {
        if(event.type === Game_Events.ENEMY_COLLISION) {
            // take 1 damage
            this.damage(1);
        }
        else if(event.type === Game_Events.BOSS_COLLISION) {
            // take 1 damage
            this.damage(1);
        }
        else if(event.type === Game_Events.IFRAMES_OVER) {
            this.invincible = false;
            this.changeState(PlayerStates.WALK);
        }
        else if(event.type === Game_Events.ATTACK_OVER) {
            this.changeState(PlayerStates.WALK);
        }
        else if(event.type === Game_Events.GET_COIN) {
            if(event.data.get("coin_hurt") === "true"){
                this.damage(1);
            }
            this.coins++;
        }else if(event.type === Game_Events.BOUGHT_HEART){
            this.health++;
            this.coins -= 5;
        } else if(event.type === Game_Events.BOUGHT_DAMAGE) {
            this.player_damage++;
        }
    }

    update(deltaT: number): void {
        Debug.log("Position:", Math.round(this.owner.position.x) + ", " + Math.round(this.owner.position.y));
        super.update(deltaT);
    }

    damage(damage: number): void {
        if(!this.invincible && !this.invincible_cheat) {
            this.health -= damage;
            this.invincible = true;
            
            if(this.health <= 0){
                if (this.currentState !== this.stateMap.get(PlayerStates.DYING)) {
                    this.health_sprites[this.health_sprites.length - 1].getLayer().removeNode(this.health_sprites[this.health_sprites.length - 1]);
                    this.health_sprites.splice(this.health_sprites.length - 1, 1);
                    this.changeState(PlayerStates.DYING);
                }
            } else {
                this.changeState(PlayerStates.DAMAGE);
                this.health_sprites[this.health_sprites.length - 1].getLayer().removeNode(this.health_sprites[this.health_sprites.length - 1]);
                this.health_sprites.splice(this.health_sprites.length - 1, 1);
            }
        }
    }

    destroy() {
        delete this.owner;
    }
}
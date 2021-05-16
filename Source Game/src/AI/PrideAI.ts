import StateMachineAI from "./../Wolfie2D/AI/StateMachineAI";
import AABB from "./../Wolfie2D/DataTypes/Shapes/AABB";
import State from "./../Wolfie2D/DataTypes/State/State";
import Vec2 from "./../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../Wolfie2D/Events/GameEvent";
import GameNode from "./../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "./../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "./../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import BattlerAI from "./BattlerAI";
import { Game_Events } from "../GameSystems/game_enums";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import Weapon from "../GameSystems/Weapon";



export default class PrideAI extends StateMachineAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    speed: number = 20;

    /** A reference to the player object */
    player: GameNode;

    pride_hitbox: AABB;
    pride_hitbox_offset: Vec2;
    envy_hitbox: AABB;
    envy_hitbox_offset: Vec2;
    gluttony_hitbox: AABB;
    gluttony_hitbox_offset: Vec2;
    greed_hitbox: AABB;
    greed_hitbox_offset: Vec2;
    lust_hitbox: AABB;
    lust_hitbox_offset: Vec2;
    sloth_hitbox: AABB;
    sloth_hitbox_offset: Vec2;
    wrath_hitbox: AABB;
    wrath_hitbox_offset: Vec2;

    punch: Weapon;
    punch_direction: Vec2;

    slam: Weapon;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        // this.addState(BossStates.DEFAULT, new Idle(this, owner));
        

        this.health = options.health;

        this.player = options.player;

        // this.hitbox = options.hitbox;
        // this.hitbox_offset = options.hitbox_offset;

        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
    }

    activate(options: Record<string, any>): void {
    }

    damage(damage: number): void {
        this.health -= damage;
        
        if(this.health <= 0){
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if(this.currentState !== this.stateMap.get(BossStates.DYING)) {
                this.changeState(BossStates.DYING);
            }
        }
        else {
            this.changeState(BossStates.DAMAGE);
        }
    }

    handleEvent(event: GameEvent): void {
        if (event.type === Game_Events.ENVY_PUNCH) {
            this.punch.use(this.owner, "enemies", this.owner.position.dirTo(this.player.position));
        } else if(event.type === Game_Events.GLUT_ATTACK) {
            this.slam.use(this.owner, "enemies", Vec2.ZERO);
            this.changeState(BossStates.GLUTTONY_IDLE);
        } else if(event.type === Game_Events.GREED_ATTACK) {
            this.changeState(BossStates.GREED_IDLE);
        }
    }

    getPlayerPosition(): Vec2 {
        let pos = this.player.position;

        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);

        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);

        // Get the wall tilemap
        let walls = <OrthogonalTilemap>this.owner.getScene().getLayer("Wall").getItems()[0];

        let minIndex = walls.getColRowAt(new Vec2(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2(maxX, maxY));

        let tileSize = walls.getTileSize();

        for(let col = minIndex.x; col <= maxIndex.x; col++){
            for(let row = minIndex.y; row <= maxIndex.y; row++){
                if(walls.isTileCollidable(col, row)){
                    // Get the position of this tile
                    let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);

                    // Create a collider for this tile
                    let collider = new AABB(tilePos, tileSize.scaled(1/2));

                    let hit = collider.intersectSegment(start, delta, Vec2.ZERO);

                    if(hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)){
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }

        return pos;
    }


    // State machine defers updates and event handling to its children
    // Check super classes for details
}

export enum BossStates {
    DEFAULT = "default",
    DAMAGE = "damage",
    DYING = "dying",
    TRANSFORM = "transform",
    ENVY_TRANSFORM = "envyTransform",
    ENVY_ATTACK = "envyAttack",
    ENVY_CHARGE = "envyCharge",
    ENVY_WALK = "envyWalk",
    GLUTTONY_TRANSFORM = "gluttonyTransform",
    GLUTTONY_ATTACK = "gluttonyAttack",
    GLUTTONY_IDLE = "gluttonyIdle",
    GREED_TRANSFORM = "greedTransform",
    GREED_ATTACK = "greedAttack",
    GREED_IDLE = "greedIdle",
    LUST_TRANSFORM = "lustTransform",
    LUST_ATTACK = "lustAttack",
    SLOTH_TRANSFORM = "slothTransform",
    SLOTH_FALL = "slothFall",
    SLOTH_MOVING_SHADOW = "slothMovingShadow",
    SLOTH_TOSS_UP = "slothTossUp",
    SLOTH_WALK = "slothWalk",
    WRATH_TRANSFORM = "wrathTransform",
    WRATH_ATTACK_DOWN = "wrathAttackDown",
    WRATH_ATTACK_UP = "wrathAttackUp",
    WRATH_CHARGE_DOWN = "wrathChargeDown",
    WRATH_CHARGE_UP = "wrathChargeUp",
    WRATH_RUN_DOWN = "wrathRunDown",
    WRATH_RUN_UP = "wrathRunUp"
}
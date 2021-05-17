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
import Weapon from "../GameSystems/Weapon";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import AttackDown from "./WrathStates/AttackDown";
import AttackUp from "./WrathStates/AttackUp";
import ChargeDown from "./WrathStates/ChargeDown";
import ChargeUp from "./WrathStates/ChargeUp";
import Damage from "./WrathStates/Damage";
import Idle from "./WrathStates/Idle";
import RunDown from "./WrathStates/RunDown";
import RunUp from "./WrathStates/RunUp";
import Dying from "./WrathStates/Dying";


export default class WrathAI extends StateMachineAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    speed: number = 20;

    /** A reference to the player object */
    player: GameNode;

    slice: Weapon;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.slice = options.slice;
        this.addState(BossStates.DEFAULT, new Idle(this, owner));
        this.addState(BossStates.DAMAGE, new Damage(this, owner));
        this.addState(BossStates.ATTACK_DOWN, new AttackDown(this, owner));
        this.addState(BossStates.ATTACK_UP, new AttackUp(this, owner));
        this.addState(BossStates.CHARGE_DOWN, new ChargeDown(this, owner));
        this.addState(BossStates.CHARGE_UP, new ChargeUp(this, owner));
        this.addState(BossStates.RUN_DOWN, new RunDown(this, owner));
        this.addState(BossStates.RUN_UP, new RunUp(this, owner));
        this.addState(BossStates.DYING, new Dying(this, owner));

        this.health = options.health;

        this.player = options.player;

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
                this.owner.removePhysics();
                this.owner.addPhysics(new AABB(Vec2.ZERO, new Vec2(1, 1)), new Vec2(500, 500));
                this.owner.setGroup("wall");
                this.changeState(BossStates.DYING);
            }
        }
        else {
            this.changeState(BossStates.DAMAGE);
        }
    }

    handleEvent(event: GameEvent): void {
        if(event.type === Game_Events.WRATH_ATTACK_UP) {
            this.slice.use(this.owner, "enemies", Vec2.UP);
            this.changeState(BossStates.ATTACK_UP);
        } else if (event.type === Game_Events.WRATH_ATTACK_DOWN) {
            this.slice.use(this.owner, "enemies", Vec2.DOWN);
            this.changeState(BossStates.ATTACK_DOWN);
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
    ATTACK_UP = "attack_up",
    ATTACK_DOWN = "attack_down",
    CHARGE_UP = "charge_up",
    CHARGE_DOWN = "charge_down",
    RUN_UP = "run_up",
    RUN_DOWN = "run_down",
    DYING = "dying"
}
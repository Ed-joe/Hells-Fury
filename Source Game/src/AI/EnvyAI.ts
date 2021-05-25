import StateMachineAI from "./../Wolfie2D/AI/StateMachineAI";
import AABB from "./../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "./../Wolfie2D/DataTypes/Vec2";
import GameNode from "./../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "./../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "./../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import BattlerAI from "./BattlerAI";
import Dying from "./EnvyStates/Dying";
import Idle from "./EnvyStates/Idle";
import Attack from "./EnvyStates/Attack";
import Damaged from "./EnvyStates/Damage"
import Walk from "./EnvyStates/Walk";
import Charge from "./EnvyStates/Charge";
import Weapon from "../GameSystems/Weapon";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { Game_Events } from "../GameSystems/game_enums";

export default class EnvyAI extends StateMachineAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The amount of health this entity has */
    health: number;
    starting_health: number;

    /** The default movement speed of this AI */
    speed: number = 20;

    /** A reference to the player object */
    player: GameNode;

    punch: Weapon;
    punch_direction: Vec2;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.addState(BossStates.DEFAULT, new Idle(this, owner));
        this.addState(BossStates.WALKING, new Walk(this, owner));
        this.addState(BossStates.CHARGING, new Charge(this, owner));
        this.addState(BossStates.DYING, new Dying(this, owner));
        this.addState(BossStates.DAMAGED, new Damaged(this, owner));
        this.addState(BossStates.ATTACKING, new Attack(this, owner));
        this.health = options.health;
        this.starting_health = options.health;

        this.player = options.player;

        this.punch = options.punch;
        this.punch_direction = Vec2.ZERO;

        // Initialize to the default state
        this.initialize(BossStates.DEFAULT);
    }

    handleEvent(event: GameEvent): void {
        if (event.type === Game_Events.ENVY_PUNCH) {
            this.punch.use(this.owner, "enemies", this.owner.position.dirTo(this.player.position));
        }
    }

    activate(options: Record<string, any>): void {
    }

    damage(damage: number): void {
        this.emitter.fireEvent(Game_Events.BOSS_DAMAGE, {damage: damage, total_health: this.starting_health});
        this.health -= damage;
    
        if(this.health <= 0){
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            if(this.currentState !== this.stateMap.get(BossStates.DYING)){
                this.owner.removePhysics();
                this.owner.addPhysics(new AABB(Vec2.ZERO, new Vec2(1, 1)), new Vec2(500, 500));
                this.owner.setGroup("wall");
                this.changeState(BossStates.DYING);
            }
        }else{
            this.changeState(BossStates.DAMAGED);
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
                let tile_val = walls.getTileAtRowCol(new Vec2(col, row));
                if(tile_val === 18 || tile_val === 19 || tile_val === 44 || tile_val === 45){
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
    DAMAGED = "damaged",
    PREVIOUS = "previous",
    DYING = "dying",
    ATTACKING = "attacking",
    WALKING = "WALKING",
    CHARGING = "CHARGING"
}